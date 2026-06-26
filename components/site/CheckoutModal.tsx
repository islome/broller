"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/site/StoreProvider";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { formatNarx } from "@/lib/format";
import { isValidUzPhone } from "@/lib/phone";

const TELEGRAM = "justislombek";
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

function telegramHavola(text: string) {
  return `https://t.me/share/url?url=${encodeURIComponent(
    "https://broller.uz",
  )}&text=${encodeURIComponent(text)}`;
}

export default function CheckoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { savat, savatTozala } = useStore();

  const [yetkazib, setYetkazib] = useState(true); // true = yetkazib berish, false = olib ketish
  const [tolov, setTolov] = useState<"naqd" | "karta">("naqd");
  const [ism, setIsm] = useState("");
  const [tel, setTel] = useState("");
  const [viloyat, setViloyat] = useState("");
  const [manzil, setManzil] = useState("");
  const [izoh, setIzoh] = useState("");
  const [xato, setXato] = useState("");

  const [yuborildi, setYuborildi] = useState(false);
  const [matn, setMatn] = useState("");
  const [nusxa, setNusxa] = useState(false);

  const valyuta = savat[0]?.mahsulot.valyuta ?? "UZS";
  const jami = savat.reduce(
    (s, q) => s + birlikNarx(q.mahsulot) * q.soni,
    0,
  );

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

  function buyurtmaMatni() {
    const qatorlar = savat
      .map(
        (q) =>
          `• ${q.mahsulot.nomi} × ${q.soni} — ${formatNarx(birlikNarx(q.mahsulot), q.mahsulot.valyuta)}`,
      )
      .join("\n");
    return [
      "🛒 Yangi buyurtma — Broller",
      "",
      `👤 Mijoz: ${ism.trim()}`,
      `📞 Telefon: ${tel.trim()}`,
      `🚚 Usul: ${yetkazib ? "Yetkazib berish" : "Olib ketish"}`,
      ...(yetkazib ? [`📍 Manzil: ${viloyat}, ${manzil.trim()}`] : []),
      `💳 To'lov: ${tolov === "naqd" ? "Naqd pul" : "Karta"}`,
      ...(izoh.trim() ? [`📝 Izoh: ${izoh.trim()}`] : []),
      "",
      "Mahsulotlar:",
      qatorlar,
      "———",
      `Jami: ${formatNarx(jami, valyuta)}`,
    ].join("\n");
  }

  function yuborish() {
    setXato("");
    if (!ism.trim()) return setXato("Ism familiyangizni kiriting.");
    if (!isValidUzPhone(tel)) return setXato("Telefon raqamni to'g'ri kiriting.");
    if (yetkazib && (!viloyat || !manzil.trim()))
      return setXato("Yetkazib berish uchun viloyat va manzilni kiriting.");

    setMatn(buyurtmaMatni());
    setYuborildi(true);
    savatTozala();
  }

  async function nusxala() {
    try {
      await navigator.clipboard.writeText(matn);
      setNusxa(true);
      setTimeout(() => setNusxa(false), 1500);
    } catch {
      /* clipboard mavjud emas */
    }
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
            {yuborildi ? "Buyurtma tayyor" : "Buyurtmani rasmiylashtirish"}
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

        {yuborildi ? (
          <div className="px-6 py-6">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <h3 className="mt-3 text-base font-bold text-zinc-900">
                Buyurtmangiz tayyorlandi!
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Tasdiqlash uchun buyurtmani Telegram orqali bizga yuboring.
              </p>
            </div>

            <pre className="mt-4 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-700">
              {matn}
            </pre>

            <div className="mt-4 flex flex-col gap-2">
              <a
                href={telegramHavola(matn)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-zinc-800"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.94 4.36 18.9 19.2c-.23 1.02-.84 1.27-1.7.79l-4.7-3.46-2.27 2.18c-.25.25-.46.46-.94.46l.34-4.78L18.6 5.6c.38-.34-.08-.53-.59-.19L6.5 12.66l-4.66-1.46c-1.01-.32-1.03-1.01.21-1.5l18.2-7.02c.85-.31 1.59.2 1.31 1.68z" />
                </svg>
                Telegram orqali yuborish
              </a>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={nusxala}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
                >
                  {nusxa ? "Nusxalandi ✓" : "Matnni nusxalash"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100"
                >
                  Yopish
                </button>
              </div>
              <p className="mt-1 text-center text-xs text-zinc-400">
                Telegram: @{TELEGRAM}
              </p>
            </div>
          </div>
        ) : (
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
              disabled={savat.length === 0}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              Buyurtmani tasdiqlash
            </button>
          </div>
        )}
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
