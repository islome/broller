-- ============================================================================
-- Broller — namuna ma'lumotlar (kategoriyalar + mahsulotlar + rasmlar)
-- schema.sql dan KEYIN ishga tushiring (SQL Editor → run).
-- Rasm sifatida vaqtincha /public dagi mavjud rasmlar ishlatilgan.
-- ============================================================================

-- ── Kategoriyalar ──────────────────────────────────────────────────────────
insert into public.kategoriyalar (nomi, slug, tavsif, tartib) values
  ('Iqlim nazorati',    'iqlim-nazorati',    'Konditsioner va harorat nazorati tizimlari', 1),
  ('Ventilyatsiya',     'ventilyatsiya',     'Ferma fanlari va havo almashinuvi',          2),
  ('Isitish tizimlari', 'isitish-tizimlari', 'Gaz va elektr isitgichlar',                  3),
  ('Oziqlantirish',     'oziqlantirish',     'Avtomatik oziqlantirish liniyalari',         4),
  ('Suv ta''minoti',    'suv-taminoti',      'Niplel ichimlik va suv tizimlari',           5),
  ('Inkubatorlar',      'inkubatorlar',      'Tuxum inkubatsiya uskunalari',               6)
on conflict (slug) do nothing;

-- ── Mahsulotlar ────────────────────────────────────────────────────────────
insert into public.mahsulotlar
  (kategoriya_id, nomi, slug, tavsif, brend, model, artikul, narxi, valyuta,
   holati, status, ombor_soni, kafolat_oylari, xususiyatlar, asosiy_rasm, tavsiya_etilgan)
values
  ((select id from public.kategoriyalar where slug = 'iqlim-nazorati'),
   'Broyler ferma konditsioneri 7.5 kVt', 'broyler-konditsioner-7-5kvt',
   'Katta hajmli broyler fermalari uchun sanoat konditsioneri. Avtomatik harorat nazorati.',
   'ClimaFarm', 'CF-7500', 'CF-7500-AC', 12500000, 'UZS',
   'yangi', 'faol', 8, 24,
   '{"quvvat_kw":7.5,"kuchlanish":380,"maydon_m2":120,"shovqin_db":48,"energiya_klassi":"A"}'::jsonb,
   '/farm1.jpg', true),

  ((select id from public.kategoriyalar where slug = 'ventilyatsiya'),
   'Sanoat ventilyatsiya fani 50 sm', 'sanoat-ventilyatsiya-fani-50sm',
   'Yuqori unumdorlikdagi devor fani. Ferma havosini samarali almashtiradi.',
   'AirPro', 'AP-50', 'AP-50-FAN', 3200000, 'UZS',
   'yangi', 'faol', 25, 12,
   '{"havo_oqimi_m3h":13000,"diametr_sm":50,"kuchlanish":220,"quvvat_vt":550}'::jsonb,
   '/farm2.jpg', true),

  ((select id from public.kategoriyalar where slug = 'isitish-tizimlari'),
   'Infraqizil gaz isitgich 30 kVt', 'infraqizil-gaz-isitgich-30kvt',
   'Jo''jalar uchun samarali infraqizil isitish. Gaz bilan ishlaydi.',
   'HeatMax', 'HM-30G', 'HM-30G-HEAT', 4800000, 'UZS',
   'yangi', 'faol', 15, 12,
   '{"quvvat_kw":30,"yoqilgi":"gaz","maydon_m2":150,"yoqish":"avtomatik"}'::jsonb,
   '/chicken2.jpg', false),

  ((select id from public.kategoriyalar where slug = 'oziqlantirish'),
   'Avtomatik oziqlantirish liniyasi', 'avtomatik-oziqlantirish-liniyasi',
   'To''liq avtomatlashtirilgan oziqlantirish tizimi, 5000 boshgacha.',
   'FeedLine', 'FL-5000', 'FL-5000-FEED', 22000000, 'UZS',
   'yangi', 'faol', 4, 36,
   '{"sigim_bosh":5000,"tur":"avtomatik","tarelka_soni":120}'::jsonb,
   '/chicken1.jpg', true),

  ((select id from public.kategoriyalar where slug = 'suv-taminoti'),
   'Niplel ichimlik tizimi (100 m)', 'niplel-ichimlik-tizimi-100m',
   'Gigiyenik niplel suv liniyasi, bosim regulyatori bilan.',
   'AquaBird', 'AB-100', 'AB-100-WATER', 5600000, 'UZS',
   'yangi', 'faol', 10, 18,
   '{"uzunlik_m":100,"niplel_soni":160,"bosim_regulyatori":true}'::jsonb,
   '/farm1.jpg', false)
on conflict (slug) do nothing;

-- ── Mahsulot rasmlari (galereya) ───────────────────────────────────────────
insert into public.mahsulot_rasmlari (mahsulot_id, rasm_url, alt_matn, tartib)
values
  ((select id from public.mahsulotlar where slug = 'broyler-konditsioner-7-5kvt'), '/farm1.jpg',     'Broyler konditsioneri', 0),
  ((select id from public.mahsulotlar where slug = 'broyler-konditsioner-7-5kvt'), '/farm2.jpg',     'Konditsioner o''rnatilgan ferma', 1),
  ((select id from public.mahsulotlar where slug = 'sanoat-ventilyatsiya-fani-50sm'), '/farm2.jpg',  'Ventilyatsiya fani', 0),
  ((select id from public.mahsulotlar where slug = 'infraqizil-gaz-isitgich-30kvt'), '/chicken2.jpg','Infraqizil isitgich', 0),
  ((select id from public.mahsulotlar where slug = 'avtomatik-oziqlantirish-liniyasi'), '/chicken1.jpg','Oziqlantirish liniyasi', 0),
  ((select id from public.mahsulotlar where slug = 'niplel-ichimlik-tizimi-100m'), '/farm1.jpg',     'Niplel suv tizimi', 0);

-- ── Admin tayinlash ────────────────────────────────────────────────────────
-- Avval ilovada telefon raqamingiz bilan ro'yxatdan o'ting, so'ng:
-- update public.foydalanuvchilar set rol = 'admin' where telefon = '+998901234567';
