"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/site/StoreProvider";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { buyurtmaBer } from "@/app/cart/actions";
import { formatNarx } from "@/lib/format";
import { isValidUzPhone } from "@/lib/phone";

const VILOYATLAR = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Buxoro",
  "Farg'ona",
  "Jizzax",
  "Namangan",
  "Navoiy",
  "Qashqadaryo",
  "Qoraqalpog'iston",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
  "Xorazm",
];

function birlikNarx(m: { narxi: number; chegirma_narxi: number | null }): number {
  return m.chegirma_narxi && m.chegirma_narxi < m.narxi
    ? m.chegirma_narxi
    : m.narxi;
}

export default function CheckoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { savat, savatTozala } = useStore();

  const [yetkazib, setYetkazib] = useState(true); // true = yetkazib berish, false = olib ketish
  const [tolov, setTolov] = useState<"naqd" | "karta">("naqd");
  const [ism, setIsm] = useState("");
  const [tel, setTel] = useState("");
  const [viloyat, setViloyat] = useState("");
  const [manzil, setManzil] = useState("");
  const [izoh, setIzoh] = useState("");
  const [xato, setXato] = useState("");
  const [yuborilmoqda, setYuborilmoqda] = useState(false);

  const valyuta = savat[0]?.mahsulot.valyuta ?? "UZS";
  const jami = savat.reduce((s, q) => s + birlikNarx(q.mahsulot) * q.soni, 0);

  // Ochilganda: profildan ism/telefon, Esc va scroll-lock
  useEffect(() => {
    if (!open) return;
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setIsm((p) => p || u.user_metadata?.full_name || "");
      setTel((p) => p || u.user_metadata?.phone || u.phone || "");
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function yuborish() {
    setXato("");
    if (!ism.trim()) return setXato("Ism familiyangizni kiriting.");
    if (!isValidUzPhone(tel)) return setXato("Telefon raqamni to'g'ri kiriting.");
    if (yetkazib && (!viloyat || !manzil.trim()))
      return setXato("Yetkazib berish uchun viloyat va manzilni kiriting.");
    if (savat.length === 0) return setXato("Savat bo'sh.");

    setYuborilmoqda(true);
    const natija = await buyurtmaBer({
      yetkazish: yetkazib ? "yetkazib_berish" : "olib_ketish",
      tolov,
      ism: ism.trim(),
      telefon: tel.trim(),
      viloyat,
      manzil: manzil.trim(),
      izoh: izoh.trim(),
      elementlar: savat.map((q) => ({
        mahsulot_id: q.mahsulot.id,
        soni: q.soni,
      })),
    });

    if (!natija.ok) {
      setYuborilmoqda(false);
      setXato(natija.error);
      return;
    }

    savatTozala();
    onClose();
    router.push("/profile/orders");
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* sarlavha */}
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">
            Buyurtmani rasmiylashtirish
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {/* usul */}
          <Bolim label="Yetkazib berish usuli">
            <div className="grid grid-cols-2 gap-2">
              <Segment active={yetkazib} onClick={() => setYetkazib(true)}>
                Yetkazib berish
              </Segment>
              <Segment active={!yetkazib} onClick={() => setYetkazib(false)}>
                Olib ketish
              </Segment>
            </div>
          </Bolim>

          {/* to'lov */}
          <Bolim label="To'lov turi">
            <div className="grid grid-cols-2 gap-2">
              <Segment active={tolov === "naqd"} onClick={() => setTolov("naqd")}>
                Naqd pul
              </Segment>
              <Segment active={tolov === "karta"} onClick={() => setTolov("karta")}>
                Karta
              </Segment>
            </div>
          </Bolim>

          {/* aloqa */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Maydon label="Ism familiya">
              <input
                value={ism}
                onChange={(e) => setIsm(e.target.value)}
                placeholder="Islombek Kamoliddinov"
                className={inp}
              />
            </Maydon>
            <Maydon label="Telefon">
              <input
                value={tel}
                onChange={(e) => setTel(e.target.value.replace(/[^0-9+\s]/g, ""))}
                placeholder="+998 90 123 45 67"
                inputMode="tel"
                className={inp}
              />
            </Maydon>
          </div>

          {yetkazib && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Maydon label="Viloyat">
                <select
                  value={viloyat}
                  onChange={(e) => setViloyat(e.target.value)}
                  className={inp}
                >
                  <option value="">— tanlang —</option>
                  {VILOYATLAR.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Maydon>
              <Maydon label="Manzil">
                <input
                  value={manzil}
                  onChange={(e) => setManzil(e.target.value)}
                  placeholder="Ko'cha, uy, mo'ljal"
                  className={inp}
                />
              </Maydon>
            </div>
          )}

          <div className="mt-3">
            <Maydon label="Izoh (ixtiyoriy)">
              <textarea
                value={izoh}
                onChange={(e) => setIzoh(e.target.value)}
                rows={2}
                placeholder="Qo'shimcha izoh yoki yetkazish vaqti..."
                className={inp}
              />
            </Maydon>
          </div>

          {/* xulosa */}
          <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">
                Mahsulotlar ({savat.reduce((s, q) => s + q.soni, 0)})
              </span>
              <span className="font-medium text-zinc-900">
                {formatNarx(jami, valyuta)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2">
              <span className="text-sm font-semibold text-zinc-900">Jami</span>
              <span className="text-lg font-bold text-zinc-900">
                {formatNarx(jami, valyuta)}
              </span>
            </div>
          </div>

          {xato && (
            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              {xato}
            </p>
          )}

          <button
            type="button"
            onClick={yuborish}
            disabled={savat.length === 0 || yuborilmoqda}
            aria-busy={yuborilmoqda}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {yuborilmoqda && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {yuborilmoqda ? "Saqlanmoqda..." : "Buyurtmani tasdiqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inp =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900 placeholder:text-zinc-400";

function Bolim({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label}
      </span>
      {children}
    </div>
  );
}

function Maydon({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Segment({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-xl border-2 border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white"
          : "rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300"
      }
    >
      {children}
    </button>
  );
}
