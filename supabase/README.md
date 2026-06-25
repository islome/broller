# Broller — Supabase

Broyler-yetishtirish texnikasi marketplace uchun ma'lumotlar bazasi.
**Auth:** telefon + parol · **Model:** single-vendor (faqat Broller sotadi).
Jadval va ustun nomlari o'zbekcha (apostrofsiz ASCII, masalan `toliq_ism`).

## Jadvallar

| Jadval | Vazifasi |
| --- | --- |
| `foydalanuvchilar` | `auth.users` bilan 1:1 profil (toliq_ism, telefon, rol, manzil). Signup'da avtomatik yaratiladi. |
| `kategoriyalar` | Texnika kategoriyalari (ierarxik — `ota_id`). |
| `mahsulotlar` | Mahsulotlar (brend, model, narxi, chegirma, holati, ombor_soni, kafolat, `xususiyatlar` JSONB, to'liq-matnli qidiruv). |
| `mahsulot_rasmlari` | Mahsulot galereyasi. |

### Enum qiymatlari
- `foydalanuvchi_roli`: `xaridor`, `admin`
- `mahsulot_holati`: `yangi`, `ishlatilgan`, `tamirlangan`
- `mahsulot_status`: `qoralama`, `faol`, `tugagan`, `arxivlangan`

## Ishga tushirish tartibi

1. Supabase Dashboard → **SQL Editor**
2. `schema.sql` ni run qiling (jadvallar, triggerlar, RLS).
3. `seed.sql` ni run qiling (namuna kategoriyalar va mahsulotlar).

## Telefon auth — muhim eslatma

Supabase'da telefon auth standart holatda **SMS OTP** talab qiladi (SMS provider kerak).
MVP uchun SMS'siz telefon + parol bilan boshlash:

- Dashboard → **Authentication → Providers → Phone** ni yoqing.
- **"Confirm phone"** ni o'chiring — shunda foydalanuvchi OTP'siz darrov kira oladi.
  (Eslatma: bunda telefon tasdiqlanmaydi — production'dan oldin Twilio/Vonage
  kabi SMS provider ulang.)
- Telefon **E.164** formatida bo'lishi shart: `+998901234567` (probelsiz).
  Register formasidagi `+998 90 123 45 67` → yuborishdan oldin probellar olib tashlanadi.

## Env (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # faqat serverda, hech qachon clientga chiqmasin
```

## Admin tayinlash

Telefon bilan ro'yxatdan o'tgach:

```sql
update public.foydalanuvchilar set rol = 'admin' where telefon = '+998901234567';
```
