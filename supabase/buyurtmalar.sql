-- ============================================================================
-- Broller — BUYURTMALAR (orders) migratsiyasi
-- ----------------------------------------------------------------------------
-- Bu fayl schema.sql dagi orders bo'limining aynan nusxasi. Agar checkout
-- "Could not find the function public.buyurtma_yaratish ... in the schema cache"
-- xatosini bersa, demak bu bo'lim live DB'ga hali qo'llanmagan.
-- Supabase Dashboard → SQL Editor → bu faylni run qiling.
-- Idempotent: qayta ishga tushirish xavfsiz (ma'lumot o'chmaydi).
-- Talab: schema.sql dagi mahsulotlar, foydalanuvchilar, admin_mi(),
-- vaqtni_yangilash() allaqachon mavjud bo'lishi kerak.
-- ============================================================================

do $$ begin
  create type public.buyurtma_holat as enum
    ('yangi', 'tasdiqlandi', 'jonatildi', 'yetkazildi', 'bekor_qilindi');
exception when duplicate_object then null; end $$;

-- ── Buyurtma sarlavhasi ─────────────────────────────────────────────────────
create table if not exists public.buyurtmalar (
  id               uuid primary key default gen_random_uuid(),
  raqam            bigint generated always as identity (start with 1001),
  -- foydalanuvchi o'chsa buyurtma tarixi qoladi (kontakt ma'lumotlari snapshot)
  foydalanuvchi_id uuid references public.foydalanuvchilar(id) on delete set null,
  holat            public.buyurtma_holat not null default 'yangi',
  yetkazish_usuli  text not null default 'yetkazib_berish'
                   check (yetkazish_usuli in ('yetkazib_berish','olib_ketish')),
  tolov_turi       text not null default 'naqd'
                   check (tolov_turi in ('naqd','karta')),
  mijoz_ism        text not null,
  telefon          text not null,
  viloyat          text,
  manzil           text,
  izoh             text,
  valyuta          text not null default 'UZS',
  jami             numeric(14,2) not null default 0 check (jami >= 0),
  yaratilgan_vaqt  timestamptz not null default now(),
  yangilangan_vaqt timestamptz not null default now()
);

create unique index if not exists buyurtmalar_raqam_idx        on public.buyurtmalar (raqam);
create index if not exists        buyurtmalar_foydalanuvchi_idx on public.buyurtmalar (foydalanuvchi_id);
create index if not exists        buyurtmalar_holat_idx         on public.buyurtmalar (holat);
create index if not exists        buyurtmalar_yaratilgan_idx    on public.buyurtmalar (yaratilgan_vaqt desc);

-- ── Buyurtma elementlari (mahsulot snapshot bilan) ──────────────────────────
create table if not exists public.buyurtma_elementlari (
  id            uuid primary key default gen_random_uuid(),
  buyurtma_id   uuid not null references public.buyurtmalar(id) on delete cascade,
  -- mahsulot o'chsa ham qator qoladi (nomi/narxi snapshot)
  mahsulot_id   uuid references public.mahsulotlar(id) on delete set null,
  mahsulot_nomi text not null,
  mahsulot_slug text,
  asosiy_rasm   text,
  birlik_narx   numeric(12,2) not null check (birlik_narx >= 0),
  soni          integer not null check (soni > 0),
  valyuta       text not null default 'UZS'
);

create index if not exists buyurtma_elementlari_buyurtma_idx on public.buyurtma_elementlari (buyurtma_id);

-- yangilangan_vaqt trigger
drop trigger if exists buyurtmalar_vaqt on public.buyurtmalar;
create trigger buyurtmalar_vaqt before update on public.buyurtmalar
  for each row execute function public.vaqtni_yangilash();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.buyurtmalar          enable row level security;
alter table public.buyurtma_elementlari enable row level security;

-- buyurtmalar: o'zinikini ko'rish; admin hammasini
drop policy if exists "buyurtmalar_korish" on public.buyurtmalar;
create policy "buyurtmalar_korish" on public.buyurtmalar
  for select using (auth.uid() = foydalanuvchi_id or public.admin_mi());

-- foydalanuvchi faqat o'ziga buyurtma yarata oladi
drop policy if exists "buyurtmalar_yaratish" on public.buyurtmalar;
create policy "buyurtmalar_yaratish" on public.buyurtmalar
  for insert with check (auth.uid() = foydalanuvchi_id);

-- holatni faqat admin o'zgartiradi
drop policy if exists "buyurtmalar_admin_tahrir" on public.buyurtmalar;
create policy "buyurtmalar_admin_tahrir" on public.buyurtmalar
  for update using (public.admin_mi()) with check (public.admin_mi());

-- elementlar: buyurtma egasi yoki admin ko'radi
drop policy if exists "buyurtma_elementlari_korish" on public.buyurtma_elementlari;
create policy "buyurtma_elementlari_korish" on public.buyurtma_elementlari
  for select using (
    exists (
      select 1 from public.buyurtmalar b
      where b.id = buyurtma_id and (b.foydalanuvchi_id = auth.uid() or public.admin_mi())
    )
  );

-- elementlarni faqat o'z buyurtmasiga qo'sha oladi
drop policy if exists "buyurtma_elementlari_yaratish" on public.buyurtma_elementlari;
create policy "buyurtma_elementlari_yaratish" on public.buyurtma_elementlari
  for insert with check (
    exists (
      select 1 from public.buyurtmalar b
      where b.id = buyurtma_id and b.foydalanuvchi_id = auth.uid()
    )
  );

-- ── Grantlar ────────────────────────────────────────────────────────────────
grant select, insert, update on public.buyurtmalar          to authenticated;
grant select, insert         on public.buyurtma_elementlari to authenticated;

-- ── Atomik buyurtma yaratish (narxlar serverda DB'dan olinadi) ──────────────
-- p_elementlar: [{"mahsulot_id":"uuid","soni":2}, ...]
create or replace function public.buyurtma_yaratish(
  p_yetkazish  text,
  p_tolov      text,
  p_ism        text,
  p_telefon    text,
  p_viloyat    text,
  p_manzil     text,
  p_izoh       text,
  p_elementlar jsonb
)
returns table (id uuid, raqam bigint)
language plpgsql security definer set search_path = public as $$
declare
  v_uid      uuid := auth.uid();
  v_order_id uuid;
  v_raqam    bigint;
  v_jami     numeric(14,2) := 0;
  v_valyuta  text := 'UZS';
  v_narx     numeric(12,2);
  v_soni     integer;
  el         jsonb;
  m          record;
begin
  if v_uid is null then
    raise exception 'Buyurtma berish uchun tizimga kiring.';
  end if;
  if p_elementlar is null or jsonb_array_length(p_elementlar) = 0 then
    raise exception 'Savat bo''sh.';
  end if;

  insert into public.buyurtmalar
    (foydalanuvchi_id, yetkazish_usuli, tolov_turi, mijoz_ism, telefon, viloyat, manzil, izoh, valyuta, jami)
  values
    (v_uid,
     coalesce(nullif(p_yetkazish,''), 'yetkazib_berish'),
     coalesce(nullif(p_tolov,''), 'naqd'),
     p_ism, p_telefon, p_viloyat, p_manzil, nullif(p_izoh,''), 'UZS', 0)
  returning buyurtmalar.id, buyurtmalar.raqam into v_order_id, v_raqam;

  for el in select * from jsonb_array_elements(p_elementlar) loop
    v_soni := greatest(1, coalesce((el->>'soni')::int, 1));
    select * into m
      from public.mahsulotlar
      where mahsulotlar.id = (el->>'mahsulot_id')::uuid
        and status = 'faol';
    if not found then
      continue; -- mavjud bo'lmagan / faol bo'lmagan mahsulot — o'tkazib yuboriladi
    end if;

    v_narx := case
      when m.chegirma_narxi is not null and m.chegirma_narxi < m.narxi
      then m.chegirma_narxi else m.narxi end;

    insert into public.buyurtma_elementlari
      (buyurtma_id, mahsulot_id, mahsulot_nomi, mahsulot_slug, asosiy_rasm, birlik_narx, soni, valyuta)
    values
      (v_order_id, m.id, m.nomi, m.slug, m.asosiy_rasm, v_narx, v_soni, m.valyuta);

    v_jami    := v_jami + v_narx * v_soni;
    v_valyuta := m.valyuta;
  end loop;

  if not exists (select 1 from public.buyurtma_elementlari where buyurtma_id = v_order_id) then
    raise exception 'Buyurtmada mavjud mahsulot topilmadi.';
  end if;

  update public.buyurtmalar
    set jami = v_jami, valyuta = coalesce(v_valyuta, 'UZS')
    where buyurtmalar.id = v_order_id;

  return query select v_order_id, v_raqam;
end $$;

grant execute on function public.buyurtma_yaratish(text,text,text,text,text,text,text,jsonb) to authenticated;

-- ── Ombor boshqaruvi: tasdiqlanganda kamayadi, bekor qilinganda qaytadi ──────
-- "Band" holatlar: tasdiqlandi / jonatildi / yetkazildi.
-- "Bo'sh" holatlar: yangi / bekor_qilindi.
-- ombordan_yechilgan — ombordan ayirilgani (ikki marta ayirmaslik / qaytarish uchun).
alter table public.buyurtmalar
  add column if not exists ombordan_yechilgan boolean not null default false;

create or replace function public.buyurtma_ombor_boshqaruvi()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_band boolean;
  el     record;
begin
  -- holat o'zgarmagan bo'lsa — tegmaymiz
  if NEW.holat is not distinct from OLD.holat then
    return NEW;
  end if;

  v_band := NEW.holat in ('tasdiqlandi','jonatildi','yetkazildi');

  -- Band bo'lishi kerak, lekin hali ayirilmagan → ombordan ayiramiz
  if v_band and not OLD.ombordan_yechilgan then
    for el in
      select mahsulot_id, soni, mahsulot_nomi
        from public.buyurtma_elementlari
        where buyurtma_id = NEW.id and mahsulot_id is not null
    loop
      update public.mahsulotlar
        set ombor_soni = ombor_soni - el.soni
        where id = el.mahsulot_id and ombor_soni >= el.soni;
      if not found then
        raise exception 'Omborda "%" yetarli emas.', el.mahsulot_nomi;
      end if;
    end loop;
    NEW.ombordan_yechilgan := true;

  -- Band bo'lmasligi kerak, lekin ayirilgan edi → omborga qaytaramiz
  elsif (not v_band) and OLD.ombordan_yechilgan then
    for el in
      select mahsulot_id, soni
        from public.buyurtma_elementlari
        where buyurtma_id = NEW.id and mahsulot_id is not null
    loop
      update public.mahsulotlar
        set ombor_soni = ombor_soni + el.soni
        where id = el.mahsulot_id;
    end loop;
    NEW.ombordan_yechilgan := false;
  end if;

  return NEW;
end $$;

drop trigger if exists buyurtmalar_ombor on public.buyurtmalar;
create trigger buyurtmalar_ombor before update on public.buyurtmalar
  for each row execute function public.buyurtma_ombor_boshqaruvi();

-- ── Xaridor o'z buyurtmasini bekor qila oladi (faqat yangi/tasdiqlandi) ──────
-- (ombor trigger orqali avtomatik qaytadi)
create or replace function public.buyurtma_bekor_qil(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_holat public.buyurtma_holat;
  v_egasi uuid;
begin
  if v_uid is null then
    raise exception 'Tizimga kiring.';
  end if;

  select holat, foydalanuvchi_id into v_holat, v_egasi
    from public.buyurtmalar where id = p_id;
  if not found then
    raise exception 'Buyurtma topilmadi.';
  end if;
  if v_egasi is distinct from v_uid then
    raise exception 'Bu sizning buyurtmangiz emas.';
  end if;
  if v_holat not in ('yangi','tasdiqlandi') then
    raise exception 'Bu buyurtmani endi bekor qilib bo''lmaydi.';
  end if;

  update public.buyurtmalar set holat = 'bekor_qilindi' where id = p_id;
end $$;

grant execute on function public.buyurtma_bekor_qil(uuid) to authenticated;

-- Tekshirish: quyidagi natija bo'sh bo'lmasligi kerak (funksiya yaratilgan)
-- select proname from pg_proc where proname = 'buyurtma_yaratish';
