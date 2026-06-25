-- ============================================================================
-- Broller — broyler-yetishtirish texnikasi marketplace (single-vendor)
-- Supabase / PostgreSQL sxemasi  —  jadval va ustun nomlari o'zbekcha
-- Auth: telefon + parol (Supabase Auth, auth.users)
-- Ishga tushirish: Supabase Dashboard → SQL Editor → bu faylni run qiling.
-- Eslatma: identifikatorlar apostrofsiz ASCII'da (o' → o, masalan toliq_ism).
-- ============================================================================

-- Kerakli kengaytma (Supabase'da odatda yoqilgan)
create extension if not exists pgcrypto;

-- ──────────────────────────────────────────────────────────────────────────
-- ENUM turlari
-- ──────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.foydalanuvchi_roli as enum ('xaridor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mahsulot_holati as enum ('yangi', 'ishlatilgan', 'tamirlangan');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mahsulot_status as enum ('qoralama', 'faol', 'tugagan', 'arxivlangan');
exception when duplicate_object then null; end $$;

-- ──────────────────────────────────────────────────────────────────────────
-- Umumiy: yangilangan_vaqt ni avtomatik yangilash
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.vaqtni_yangilash()
returns trigger language plpgsql as $$
begin
  new.yangilangan_vaqt := now();
  return new;
end $$;

-- ──────────────────────────────────────────────────────────────────────────
-- 1) FOYDALANUVCHILAR — auth.users bilan 1:1 (telefon Supabase Auth'da)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.foydalanuvchilar (
  id               uuid primary key references auth.users(id) on delete cascade,
  toliq_ism        text not null default '',
  telefon          text unique,                 -- E.164: +998901234567
  email            text,                        -- ixtiyoriy (chek/aloqa uchun)
  rol              public.foydalanuvchi_roli not null default 'xaridor',
  avatar_url       text,
  viloyat          text,                        -- yetkazib berish uchun
  manzil           text,                        -- yetkazib berish manzili
  yaratilgan_vaqt  timestamptz not null default now(),
  yangilangan_vaqt timestamptz not null default now()
);

create index if not exists foydalanuvchilar_rol_idx     on public.foydalanuvchilar (rol);
create index if not exists foydalanuvchilar_telefon_idx on public.foydalanuvchilar (telefon);

-- ──────────────────────────────────────────────────────────────────────────
-- 2) KATEGORIYALAR — ierarxik (ota_id orqali subkategoriyalar)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.kategoriyalar (
  id               uuid primary key default gen_random_uuid(),
  nomi             text not null,
  slug             text not null unique,
  tavsif           text,
  ota_id           uuid references public.kategoriyalar(id) on delete set null,
  ikona            text,
  tartib           integer not null default 0,
  faol             boolean not null default true,
  yaratilgan_vaqt  timestamptz not null default now(),
  yangilangan_vaqt timestamptz not null default now()
);

create index if not exists kategoriyalar_ota_idx  on public.kategoriyalar (ota_id);
create index if not exists kategoriyalar_slug_idx on public.kategoriyalar (slug);

-- ──────────────────────────────────────────────────────────────────────────
-- 3) MAHSULOTLAR — texnika (single-vendor: sotuvchi = Broller)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.mahsulotlar (
  id               uuid primary key default gen_random_uuid(),
  kategoriya_id    uuid references public.kategoriyalar(id) on delete set null,
  nomi             text not null,
  slug             text not null unique,
  tavsif           text,
  brend            text,
  model            text,
  artikul          text unique,                 -- SKU
  narxi            numeric(12,2) not null default 0 check (narxi >= 0),
  chegirma_narxi   numeric(12,2) check (chegirma_narxi >= 0 and chegirma_narxi <= narxi),
  valyuta          text not null default 'UZS',
  holati           public.mahsulot_holati not null default 'yangi',
  status           public.mahsulot_status not null default 'faol',
  ombor_soni       integer not null default 0 check (ombor_soni >= 0),
  kafolat_oylari   integer not null default 0 check (kafolat_oylari >= 0),
  -- moslashuvchan texnik xususiyatlar: {"quvvat_kw":7.5,"kuchlanish":380,...}
  xususiyatlar     jsonb not null default '{}'::jsonb,
  asosiy_rasm      text,
  tavsiya_etilgan  boolean not null default false,
  korishlar_soni   integer not null default 0,
  yaratilgan_vaqt  timestamptz not null default now(),
  yangilangan_vaqt timestamptz not null default now(),
  -- to'liq-matnli qidiruv (nom + brend + model + tavsif)
  qidiruv_vektori  tsvector generated always as (
    to_tsvector('simple',
      coalesce(nomi,'') || ' ' || coalesce(brend,'') || ' ' ||
      coalesce(model,'') || ' ' || coalesce(tavsif,''))
  ) stored
);

create index if not exists mahsulotlar_kategoriya_idx on public.mahsulotlar (kategoriya_id);
create index if not exists mahsulotlar_status_idx     on public.mahsulotlar (status);
create index if not exists mahsulotlar_tavsiya_idx    on public.mahsulotlar (tavsiya_etilgan);
create index if not exists mahsulotlar_yaratilgan_idx on public.mahsulotlar (yaratilgan_vaqt desc);
create index if not exists mahsulotlar_qidiruv_idx    on public.mahsulotlar using gin (qidiruv_vektori);
create index if not exists mahsulotlar_xususiyat_idx  on public.mahsulotlar using gin (xususiyatlar);

-- ──────────────────────────────────────────────────────────────────────────
-- 4) MAHSULOT_RASMLARI — galereya
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.mahsulot_rasmlari (
  id              uuid primary key default gen_random_uuid(),
  mahsulot_id     uuid not null references public.mahsulotlar(id) on delete cascade,
  rasm_url        text not null,
  alt_matn        text,
  tartib          integer not null default 0,
  yaratilgan_vaqt timestamptz not null default now()
);

create index if not exists mahsulot_rasmlari_mahsulot_idx on public.mahsulot_rasmlari (mahsulot_id);

-- ──────────────────────────────────────────────────────────────────────────
-- yangilangan_vaqt triggerlari
-- ──────────────────────────────────────────────────────────────────────────
drop trigger if exists foydalanuvchilar_vaqt on public.foydalanuvchilar;
create trigger foydalanuvchilar_vaqt before update on public.foydalanuvchilar
  for each row execute function public.vaqtni_yangilash();

drop trigger if exists kategoriyalar_vaqt on public.kategoriyalar;
create trigger kategoriyalar_vaqt before update on public.kategoriyalar
  for each row execute function public.vaqtni_yangilash();

drop trigger if exists mahsulotlar_vaqt on public.mahsulotlar;
create trigger mahsulotlar_vaqt before update on public.mahsulotlar
  for each row execute function public.vaqtni_yangilash();

-- ──────────────────────────────────────────────────────────────────────────
-- Admin tekshiruvi (RLS rekursiyasidan qochish uchun security definer)
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.admin_mi()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.foydalanuvchilar
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- ──────────────────────────────────────────────────────────────────────────
-- Signup'da avtomatik profil yaratish (auth.users → foydalanuvchilar)
-- toliq_ism signup options.data orqali keladi
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.yangi_foydalanuvchi()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.foydalanuvchilar (id, toliq_ism, telefon, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.phone,
    new.email
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists auth_user_yaratilganda on auth.users;
create trigger auth_user_yaratilganda
  after insert on auth.users
  for each row execute function public.yangi_foydalanuvchi();

-- Oddiy foydalanuvchi o'z rolini o'zgartira olmasligi uchun himoya
create or replace function public.rolni_himoyalash()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.rol is distinct from old.rol and not public.admin_mi() then
    new.rol := old.rol;
  end if;
  return new;
end $$;

drop trigger if exists rolni_himoyalash on public.foydalanuvchilar;
create trigger rolni_himoyalash before update on public.foydalanuvchilar
  for each row execute function public.rolni_himoyalash();

-- ──────────────────────────────────────────────────────────────────────────
-- RLS (Row Level Security)
-- ──────────────────────────────────────────────────────────────────────────
alter table public.foydalanuvchilar  enable row level security;
alter table public.kategoriyalar     enable row level security;
alter table public.mahsulotlar       enable row level security;
alter table public.mahsulot_rasmlari enable row level security;

-- foydalanuvchilar: o'zinikini ko'rish/tahrirlash; admin hammasini
drop policy if exists "foydalanuvchilar_korish" on public.foydalanuvchilar;
create policy "foydalanuvchilar_korish" on public.foydalanuvchilar
  for select using (auth.uid() = id or public.admin_mi());

drop policy if exists "foydalanuvchilar_tahrir" on public.foydalanuvchilar;
create policy "foydalanuvchilar_tahrir" on public.foydalanuvchilar
  for update using (auth.uid() = id or public.admin_mi())
  with check (auth.uid() = id or public.admin_mi());

-- kategoriyalar: hamma o'qiydi; faqat admin yozadi
drop policy if exists "kategoriyalar_korish" on public.kategoriyalar;
create policy "kategoriyalar_korish" on public.kategoriyalar
  for select using (true);

drop policy if exists "kategoriyalar_admin" on public.kategoriyalar;
create policy "kategoriyalar_admin" on public.kategoriyalar
  for all using (public.admin_mi()) with check (public.admin_mi());

-- mahsulotlar: faol mahsulotni hamma ko'radi; admin hammasini; faqat admin yozadi
drop policy if exists "mahsulotlar_korish" on public.mahsulotlar;
create policy "mahsulotlar_korish" on public.mahsulotlar
  for select using (status = 'faol' or public.admin_mi());

drop policy if exists "mahsulotlar_admin" on public.mahsulotlar;
create policy "mahsulotlar_admin" on public.mahsulotlar
  for all using (public.admin_mi()) with check (public.admin_mi());

-- mahsulot_rasmlari: faol mahsulot rasmlarini hamma ko'radi; faqat admin yozadi
drop policy if exists "mahsulot_rasmlari_korish" on public.mahsulot_rasmlari;
create policy "mahsulot_rasmlari_korish" on public.mahsulot_rasmlari
  for select using (
    exists (
      select 1 from public.mahsulotlar m
      where m.id = mahsulot_id and (m.status = 'faol' or public.admin_mi())
    )
  );

drop policy if exists "mahsulot_rasmlari_admin" on public.mahsulot_rasmlari;
create policy "mahsulot_rasmlari_admin" on public.mahsulot_rasmlari
  for all using (public.admin_mi()) with check (public.admin_mi());

-- ──────────────────────────────────────────────────────────────────────────
-- Grantlar (kirish RLS orqali boshqariladi)
-- ──────────────────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select on public.kategoriyalar, public.mahsulotlar, public.mahsulot_rasmlari to anon, authenticated;
grant select, update on public.foydalanuvchilar to authenticated;
grant insert, update, delete on public.kategoriyalar, public.mahsulotlar, public.mahsulot_rasmlari to authenticated;
