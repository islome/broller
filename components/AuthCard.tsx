"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { toE164, isValidUzPhone, phoneToEmail } from "@/lib/phone";

type Mode = "login" | "signup";

export default function AuthCard({
  initialMode = "login",
}: {
  initialMode?: Mode;
}) {
  const paneRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(initialMode);

  // shared
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // login
  const [remember, setRemember] = useState(false);

  // signup
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fading, setFading] = useState(false);
  const [vis, setVis] = useState(false);
  const [paneH, setPaneH] = useState<number | undefined>(undefined);

  const isSignup = mode === "signup";

  // Sahifa ochilganda forma yumshoq paydo bo'lishi uchun
  useEffect(() => {
    const t = setTimeout(() => setVis(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Login ↔ signup almashganda kartochka balandligini silliq animatsiya qilish
  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const update = () => setPaneH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function switchMode(next: Mode) {
    if (fading || mode === next) return;
    setFading(true);
    setError("");
    setTimeout(() => {
      setMode(next);
      setError("");
      setSuccess("");
      setFading(false);
      // URL ni almashtirish (sahifa qayta yuklanmaydi)
      window.history.replaceState(
        null,
        "",
        next === "signup" ? "/register" : "/login",
      );
    }, 190);
  }

  // Parol kuchini hisoblash
  function pwStrength(p: string): { level: number; label: string; color: string } {
    if (!p) return { level: 0, label: "", color: "" };
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    if (s <= 1) return { level: 1, label: "Zaif", color: "#ef4444" };
    if (s === 2) return { level: 2, label: "O'rtacha", color: "#f59e0b" };
    if (s === 3) return { level: 3, label: "Yaxshi", color: "#3b82f6" };
    return { level: 4, label: "Kuchli", color: "#10b981" };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const supabase = createSupabaseBrowser();

    if (mode === "login") {
      if (!phone.trim()) {
        setError("Telefon raqamingizni kiriting");
        return;
      }
      if (!isValidUzPhone(phone)) {
        setError("Telefon raqamni to'liq kiriting: +998 XX XXX XX XX");
        return;
      }
      if (!password) {
        setError("Parolni kiriting");
        return;
      }

      setLoading(true);
      const { error: xato } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(phone),
        password,
      });
      if (xato) {
        setError(authXato(xato.message));
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      if (!name.trim()) {
        setError("Ism familiyangizni kiriting");
        return;
      }
      if (!isValidUzPhone(phone)) {
        setError("Telefon raqamni to'liq kiriting: +998 XX XXX XX XX");
        return;
      }
      if (password.length < 6) {
        setError("Parol kamida 6 ta belgi bo'lishi kerak");
        return;
      }
      if (password !== confirmPassword) {
        setError("Parollar mos kelmadi");
        return;
      }

      setLoading(true);
      const { data, error: xato } = await supabase.auth.signUp({
        email: phoneToEmail(phone),
        password,
        options: { data: { full_name: name.trim(), phone: toE164(phone) } },
      });
      if (xato) {
        setError(authXato(xato.message));
        setLoading(false);
        return;
      }

      // Sessiya darrov qaytmasa, kirishga urinib ko'ramiz
      if (!data.session) {
        const { error: kirishXato } = await supabase.auth.signInWithPassword({
          email: phoneToEmail(phone),
          password,
        });
        if (kirishXato) {
          setLoading(false);
          setError(
            "Hisob yaratildi, lekin avtomatik kira olmadik. Supabase'da 'Confirm email' o'chirilganini tekshiring.",
          );
          return;
        }
      }
      router.push("/");
      router.refresh();
    }
  }

  const strength = pwStrength(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  return (
    <>
      <style>{`
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px #fafafa inset !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes authFieldUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .auth-stagger > * { animation: authFieldUp .42s cubic-bezier(.22,1,.36,1) both; }
        .auth-stagger > *:nth-child(1){animation-delay:.02s}
        .auth-stagger > *:nth-child(2){animation-delay:.07s}
        .auth-stagger > *:nth-child(3){animation-delay:.12s}
        .auth-stagger > *:nth-child(4){animation-delay:.17s}
        .auth-stagger > *:nth-child(5){animation-delay:.22s}
        @media (prefers-reduced-motion: reduce){ .auth-stagger > *{animation:none} }
      `}</style>

      <div className="font-sans min-h-screen w-full bg-white dark:bg-black lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        {/* ══ LEFT — chicken1.jpg showcase panel (desktop) ══ */}
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-14 text-white">
          <Image
            src="/chicken1.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 0px, 55vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/45 to-black/80" />

          {/* brand */}
          <Link
            href="/"
            className="relative z-10 flex items-center gap-2.5 no-underline w-fit"
          >
            <span className="text-2xl font-bold tracking-tight text-white">
              Broller
            </span>
          </Link>

          {/* headline */}
          <div className="relative z-10 my-8">
            <h1
              className="font-bold leading-[1.08] tracking-[-0.03em] mb-4"
              style={{ fontSize: "clamp(28px, 3vw, 42px)" }}
            >
              Broyler fermangiz uchun
              <br />
              zamonaviy texnika.
            </h1>
            <p className="text-zinc-200/90 text-base max-w-sm leading-relaxed">
              Broller — konditsioner, ventilyatsiya va parrandachilik
              uskunalarini topish va sotib olish uchun marketplace.
            </p>
          </div>

          {/* trust bullets */}
          <ul className="relative z-10 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-zinc-100/90">
            {[
              "Iqlim nazorati uskunalari",
              "Ishonchli yetkazib berish",
              "Kafolat va texnik xizmat",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg
                    width="9"
                    height="9"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </aside>

        {/* ══ RIGHT — form panel ══ */}
        <main className="relative flex items-center justify-center px-5 py-10 sm:px-8 min-h-screen lg:min-h-0">
          {/* mobile ambient background */}
          <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
            <Image
              src="/chicken1.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-10"
            />
          </div>

          <div
            className="relative w-full max-w-[420px]"
            style={{
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(22px)",
              transition:
                "opacity .6s ease, transform .6s cubic-bezier(.22,1,.36,1)",
            }}
          >
            {/* brand (mobile) */}
            <Link
              href="/"
              className="lg:hidden flex items-center justify-center gap-2.5 no-underline mb-7"
            >
              <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Broller
              </span>
            </Link>

            {/* card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] p-7 sm:p-8">
              {/* heading */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">
                  {isSignup ? "Hisob yarating" : "Xush kelibsiz"}
                </h2>
                <p className="text-sm text-zinc-400">
                  {isSignup
                    ? "Broyler texnikalari marketplace'iga qo'shiling"
                    : "Hisobingizga qaytib kiring"}
                </p>
              </div>

              {/* tab switcher with sliding pill */}
              <div className="relative grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-6">
                <span
                  className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white dark:bg-zinc-950 rounded-xl shadow-sm"
                  style={{
                    transform: isSignup ? "translateX(100%)" : "translateX(0)",
                    transition: "transform .34s cubic-bezier(.22,1,.36,1)",
                  }}
                />
                {(["login", "signup"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`relative z-10 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                      mode === m
                        ? "text-zinc-900 dark:text-white"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    {m === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
                  </button>
                ))}
              </div>

              {/* error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-3 mb-4">
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="shrink-0 mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span className="text-[13px] text-rose-700 dark:text-rose-300 leading-relaxed">
                    {error}
                  </span>
                </div>
              )}

              {/* success */}
              {success && (
                <div className="flex items-start gap-2.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-2xl px-4 py-3 mb-4">
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="shrink-0 mt-0.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[13px] text-green-700 dark:text-green-300 leading-relaxed">
                    {success}
                  </span>
                </div>
              )}

              {/* form — smooth crossfade + animated height */}
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    height: paneH,
                    transition: "height .4s cubic-bezier(.22,1,.36,1)",
                    overflow: "hidden",
                  }}
                >
                  <div ref={paneRef}>
                    <div
                      style={{
                        opacity: fading ? 0 : 1,
                        transform: fading
                          ? "translateY(10px) scale(0.99)"
                          : "translateY(0) scale(1)",
                        transition: "opacity .19s ease, transform .19s ease",
                      }}
                    >
                      <div key={mode} className="auth-stagger flex flex-col gap-3.5">
                        {isSignup ? (
                          <>
                            {/* Ism familiya */}
                            <div>
                              <label className={labelCls}>Ism familiya</label>
                              <div className="relative">
                                <span className={iconCls}>
                                  <UserIcon />
                                </span>
                                <input
                                  type="text"
                                  placeholder="Islombek Kamoliddinov"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  autoComplete="name"
                                  disabled={loading}
                                  required
                                  className={`${inputCls} pl-10`}
                                />
                              </div>
                            </div>

                            {/* Telefon raqam */}
                            <div>
                              <label className={labelCls}>Telefon raqam</label>
                              <div className="relative">
                                <span className={iconCls}>
                                  <PhoneIcon />
                                </span>
                                <input
                                  type="tel"
                                  placeholder="+998 90 123 45 67"
                                  value={phone}
                                  onChange={(e) =>
                                    setPhone(
                                      e.target.value.replace(/[^0-9+\s]/g, ""),
                                    )
                                  }
                                  autoComplete="tel"
                                  disabled={loading}
                                  required
                                  className={`${inputCls} pl-10`}
                                />
                              </div>
                            </div>

                            {/* Parol */}
                            <div>
                              <label className={labelCls}>Parol</label>
                              <div className="relative">
                                <span className={iconCls}>
                                  <LockIcon />
                                </span>
                                <input
                                  type={showPass ? "text" : "password"}
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  autoComplete="new-password"
                                  disabled={loading}
                                  required
                                  minLength={6}
                                  className={`${inputCls} pl-10 pr-11`}
                                />
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() => setShowPass((v) => !v)}
                                  className={toggleCls}
                                >
                                  {showPass ? <EyeOff /> : <Eye />}
                                </button>
                              </div>

                              {password.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((i) => (
                                      <div
                                        key={i}
                                        className="flex-1 h-[3px] rounded-full transition-colors duration-300"
                                        style={{
                                          background:
                                            i <= strength.level
                                              ? strength.color
                                              : "#e4e4e7",
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-xs text-zinc-400 mt-1.5">
                                    Parol kuchi:{" "}
                                    <span
                                      className="font-semibold"
                                      style={{ color: strength.color }}
                                    >
                                      {strength.label}
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Parolni tasdiqlash */}
                            <div>
                              <label className={labelCls}>
                                Parolni tasdiqlash
                              </label>
                              <div className="relative">
                                <span className={iconCls}>
                                  <LockIcon />
                                </span>
                                <input
                                  type={showConfirm ? "text" : "password"}
                                  placeholder="••••••••"
                                  value={confirmPassword}
                                  onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                  }
                                  autoComplete="new-password"
                                  disabled={loading}
                                  required
                                  className={`${inputCls} pl-10 pr-11`}
                                />
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() => setShowConfirm((v) => !v)}
                                  className={toggleCls}
                                >
                                  {showConfirm ? <EyeOff /> : <Eye />}
                                </button>
                              </div>
                              {confirmPassword.length > 0 && (
                                <p
                                  className={`text-xs mt-1.5 ${
                                    passwordsMatch
                                      ? "text-green-600"
                                      : "text-rose-500"
                                  }`}
                                >
                                  {passwordsMatch
                                    ? "Parollar mos keladi"
                                    : "Parollar mos kelmadi"}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Telefon raqam */}
                            <div>
                              <label className={labelCls}>Telefon raqam</label>
                              <div className="relative">
                                <span className={iconCls}>
                                  <PhoneIcon />
                                </span>
                                <input
                                  type="tel"
                                  placeholder="+998 90 123 45 67"
                                  value={phone}
                                  onChange={(e) =>
                                    setPhone(
                                      e.target.value.replace(/[^0-9+\s]/g, ""),
                                    )
                                  }
                                  autoComplete="tel"
                                  disabled={loading}
                                  required
                                  className={`${inputCls} pl-10`}
                                />
                              </div>
                            </div>

                            {/* Parol */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className={`${labelCls} mb-0`}>
                                  Parol
                                </label>
                                <Link
                                  href="/forgot-password"
                                  className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors no-underline"
                                >
                                  Parolni unutdingizmi?
                                </Link>
                              </div>
                              <div className="relative">
                                <span className={iconCls}>
                                  <LockIcon />
                                </span>
                                <input
                                  type={showPass ? "text" : "password"}
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  autoComplete="current-password"
                                  disabled={loading}
                                  required
                                  className={`${inputCls} pl-10 pr-11`}
                                />
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() => setShowPass((v) => !v)}
                                  className={toggleCls}
                                >
                                  {showPass ? <EyeOff /> : <Eye />}
                                </button>
                              </div>
                            </div>

                            {/* Meni eslab qol */}
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                disabled={loading}
                                className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 dark:accent-white"
                              />
                              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                Meni eslab qol
                              </span>
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full mt-5 flex items-center justify-center gap-2 bg-zinc-900 enabled:hover:bg-zinc-800 enabled:hover:-translate-y-0.5 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white dark:bg-white dark:text-black dark:enabled:hover:bg-zinc-200 font-bold text-[15px] py-3.5 rounded-2xl shadow-lg shadow-zinc-300/50 dark:shadow-none enabled:hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        style={{ animation: "spin .7s linear infinite" }}
                        fill="none"
                        viewBox="0 0 24 24"
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
                      {isSignup ? "Ro'yxatdan o'tilmoqda..." : "Kirilmoqda..."}
                    </>
                  ) : (
                    <>
                      {isSignup ? "Ro'yxatdan o'tish" : "Kirish"}
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                        className="group-enabled:group-hover:translate-x-0.5 transition-transform"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* switch mode */}
              <p className="text-center text-sm text-zinc-400 mt-5">
                {isSignup ? "Allaqachon hisobingiz bormi?" : "Hisobingiz yo'qmi?"}{" "}
                <button
                  type="button"
                  onClick={() => switchMode(isSignup ? "login" : "signup")}
                  className="text-zinc-900 dark:text-white font-semibold hover:underline transition-colors"
                >
                  {isSignup ? "Kirish" : "Ro'yxatdan o'ting"}
                </button>
              </p>
            </div>

            {/* back link */}
            <p className="text-center mt-5 text-sm">
              <Link
                href="/"
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors no-underline"
              >
                ← Bosh sahifaga qaytish
              </Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}

// ── auth xatolarini o'zbekchaga tarjima qilish ──
function authXato(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Telefon yoki parol noto'g'ri";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Bu telefon raqam allaqachon ro'yxatdan o'tgan";
  if (m.includes("phone") && m.includes("disabled"))
    return "Telefon orqali kirish o'chirilgan. Supabase → Authentication → Phone provayderini yoqing.";
  if (
    m.includes("signups not allowed") ||
    m.includes("signup is disabled") ||
    m.includes("signups are disabled")
  )
    return "Ro'yxatdan o'tish o'chirilgan. Supabase → Authentication → Email provayderini yoqing.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.";
  if (m.includes("email not confirmed"))
    return "Hisob hali tasdiqlanmagan. Supabase'da 'Confirm email' ni o'chiring.";
  if (m.includes("password")) return "Parol talabga javob bermaydi.";
  return msg;
}

// ── icons ──────────────────────────────────────
function UserIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function Eye() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── style helpers ──────────────────────────────
const labelCls =
  "block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5";

const iconCls =
  "absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400";

const toggleCls =
  "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1";

const inputCls =
  "w-full box-border bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-colors focus:border-zinc-900 dark:focus:border-zinc-100 focus:bg-white dark:focus:bg-zinc-900 placeholder:text-zinc-400 disabled:opacity-60";
