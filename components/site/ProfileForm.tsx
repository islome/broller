"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export type XaridorProfil = {
  id: string;
  toliq_ism: string | null;
  telefon: string | null;
  rol: "xaridor";
  avatar_url: string | null;
  viloyat: string | null;
  manzil: string | null;
  yaratilgan_vaqt: string | null;
};

const VILOYATLAR = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Buxoro",
  "Farg'ona",
  "Jizzax",
  "Xorazm",
  "Namangan",
  "Navoiy",
  "Qashqadaryo",
  "Qoraqalpog'iston",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
];

const inp =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900 placeholder:text-zinc-400";

function bor(qiymat: string | null | undefined) {
  return Boolean(qiymat?.trim());
}

function sanaFormat(qiymat: string | null | undefined) {
  if (!qiymat) return null;

  const sana = new Date(qiymat);
  if (Number.isNaN(sana.getTime())) return null;

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(sana);
}

export default function ProfileForm({ profil }: { profil: XaridorProfil }) {
  const router = useRouter();
  const [saqlangan, setSaqlangan] = useState({
    toliqIsm: profil.toliq_ism ?? "",
    telefon: profil.telefon ?? "",
    viloyat: profil.viloyat ?? "",
    manzil: profil.manzil ?? "",
    avatarUrl: profil.avatar_url ?? "",
    yaratilgan_vaqt: profil.yaratilgan_vaqt ?? "",
  });
  const [toliqIsm, setToliqIsm] = useState(saqlangan.toliqIsm);
  const [telefon, setTelefon] = useState(saqlangan.telefon);
  const [viloyat, setViloyat] = useState(saqlangan.viloyat);
  const [manzil, setManzil] = useState(saqlangan.manzil);
  const [avatarUrl, setAvatarUrl] = useState(saqlangan.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tahrir, setTahrir] = useState(false);
  const [xabar, setXabar] = useState<string | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const yetishmayotgan = useMemo(() => {
    const items = [
      ["To'liq ism", toliqIsm],
      ["Avatar", avatarUrl || previewUrl],
      ["Telefon", telefon],
      ["Viloyat", viloyat],
      ["Manzil", manzil],
    ];
    return items.filter(([, qiymat]) => !bor(qiymat)).map(([label]) => label);
  }, [avatarUrl, manzil, previewUrl, telefon, toliqIsm, viloyat]);

  function avatarTanlash(file: File | undefined) {
    if (!file) return;
    setXato(null);

    if (!file.type.startsWith("image/")) {
      setXato("Avatar uchun rasm faylini tanlang.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setXato("Avatar rasmi 2 MB dan oshmasin.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function saqlash(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaqlanmoqda(true);
    setXabar(null);
    setXato(null);

    try {
      const supabase = createSupabaseBrowser();
      let yangiAvatarUrl = avatarUrl || null;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${profil.id}/avatar-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, {
            cacheControl: "3600",
            contentType: avatarFile.type,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        yangiAvatarUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from("foydalanuvchilar")
        .update({
          toliq_ism: toliqIsm.trim(),
          telefon: telefon.trim() || null,
          avatar_url: yangiAvatarUrl,
          viloyat: viloyat || null,
          manzil: manzil.trim() || null,
        })
        .eq("id", profil.id);

      if (error) throw error;

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSaqlangan({
        toliqIsm: toliqIsm.trim(),
        telefon: telefon.trim(),
        viloyat,
        manzil: manzil.trim(),
        avatarUrl: yangiAvatarUrl ?? "",
        yaratilgan_vaqt: saqlangan.yaratilgan_vaqt,
      });
      setAvatarUrl(yangiAvatarUrl ?? "");
      setAvatarFile(null);
      setPreviewUrl(null);
      setTahrir(false);
      setXabar("Profil ma'lumotlari saqlandi.");
      router.refresh();
    } catch (err) {
      setXato(
        err instanceof Error
          ? err.message
          : "Profilni saqlashda xatolik yuz berdi.",
      );
    } finally {
      setSaqlanmoqda(false);
    }
  }

  const avatarSrc = previewUrl || avatarUrl;
  const azoBolganSana = sanaFormat(saqlangan.yaratilgan_vaqt);

  function bekorQilish() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setToliqIsm(saqlangan.toliqIsm);
    setTelefon(saqlangan.telefon);
    setViloyat(saqlangan.viloyat);
    setManzil(saqlangan.manzil);
    setAvatarUrl(saqlangan.avatarUrl);
    setAvatarFile(null);
    setPreviewUrl(null);
    setXato(null);
    setXabar(null);
    setTahrir(false);
  }

  return (
    <form onSubmit={saqlash} className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt={toliqIsm || "Profil rasmi"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-zinc-400">
                {(toliqIsm.trim()[0] || "X").toUpperCase()}
              </span>
            )}
          </div>

          <h2 className="mt-4 text-lg font-bold text-zinc-900">
            {toliqIsm || "Xaridor"}
          </h2>
          <span className="mt-2 w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
            Xaridor
          </span>

          {tahrir ? (
            <>
              <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800">
                Rasm yuklash
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => avatarTanlash(e.target.files?.[0])}
                />
              </label>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                JPG, PNG yoki WebP. Maksimum 2 MB.
              </p>
            </>
          ) : (
            <div className="mt-5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-700 ring-1 ring-zinc-200">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                    A&apos;zo bo&apos;lgan sana
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {azoBolganSana ?? "Sana topilmadi"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {yetishmayotgan.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
                !
              </span>
              <div>
                <h2 className="text-sm font-semibold text-amber-950">
                  Profilni to&apos;ldiring
                </h2>
                <p className="mt-1 text-sm leading-5 text-amber-800">
                  Quyidagi ma&apos;lumotlar hali kiritilmagan:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {yetishmayotgan.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 border-b border-zinc-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {tahrir ? "Ma'lumotlarni tahrirlash" : "Ma'lumotlar"}
            </h2>
            {!tahrir && (
              <p className="mt-1 text-sm text-zinc-500">
                Profil ma&apos;lumotlaringiz ko&apos;rish rejimida.
              </p>
            )}
          </div>
          {!tahrir && (
            <button
              type="button"
              onClick={() => {
                setXabar(null);
                setXato(null);
                setTahrir(true);
              }}
              className="w-fit rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              Tahrirlash
            </button>
          )}
        </div>

        {xato && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {xato}
          </div>
        )}
        {xabar && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {xabar}
          </div>
        )}

        {tahrir ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="To'liq ism" missing={!bor(toliqIsm)}>
                <input
                  value={toliqIsm}
                  onChange={(e) => setToliqIsm(e.target.value)}
                  placeholder="Ism familiyangiz"
                  className={inp}
                />
              </Field>

              <Field label="Telefon" missing={!bor(telefon)}>
                <input
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="+998901234567"
                  className={inp}
                />
              </Field>

              <Field label="Viloyat" missing={!bor(viloyat)}>
                <select
                  value={viloyat}
                  onChange={(e) => setViloyat(e.target.value)}
                  className={inp}
                >
                  <option className="text-zinc-500" value="">
                    Viloyatni tanlang
                  </option>
                  {VILOYATLAR.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Manzil" missing={!bor(manzil)}>
                  <textarea
                    value={manzil}
                    onChange={(e) => setManzil(e.target.value)}
                    rows={3}
                    placeholder="Tuman, ko'cha, uy yoki mo'ljal"
                    className={inp}
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={bekorQilish}
                disabled={saqlanmoqda}
                className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={saqlanmoqda}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
              >
                {saqlanmoqda && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="animate-spin"
                  >
                    <circle
                      style={{ opacity: 0.25 }}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      style={{ opacity: 0.75 }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                )}
                {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="To'liq ism" value={toliqIsm} />
            <Info label="Telefon" value={telefon} mono />
            <Info label="Viloyat" value={viloyat} />
            <Info label="Rol" value="Xaridor" />
            <div className="sm:col-span-2">
              <Info label="Manzil" value={manzil} />
            </div>
          </div>
        )}
      </section>
    </form>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  const empty = !bor(value);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5">
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          {label}
        </p>
        {empty && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            To&apos;ldiring
          </span>
        )}
      </div>
      <p
        className={`mt-1.5 text-sm font-medium ${
          empty ? "text-zinc-400" : "text-zinc-900"
        } ${mono ? "tabular-nums" : ""}`}
      >
        {empty ? "Kiritilmagan" : value}
      </p>
    </div>
  );
}

function Field({
  label,
  missing,
  children,
}: {
  label: string;
  missing?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-zinc-700">
        {label}
        {missing && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            To&apos;ldiring
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
