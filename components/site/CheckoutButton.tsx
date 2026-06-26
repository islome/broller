"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Checkout tugmasi — bosilganda foydalanuvchi ro'yxatdan o'tganini tekshiradi.
 * Agar kirmagan bo'lsa → /register (keyin shu sahifaga qaytadi),
 * aks holda → `target` (buyurtmani rasmiylashtirish).
 */
export default function CheckoutButton({
  target = "/#aloqa",
  redirectTo = "/cart",
  onBeforeCheckout,
  className,
  children,
}: {
  target?: string;
  /** Ro'yxatdan o'tgandan keyin qaytadigan sahifa */
  redirectTo?: string;
  /** Checkoutdan oldin bajariladi (masalan, mahsulotni savatga qo'shish) */
  onBeforeCheckout?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (loading) return;
    setLoading(true);
    onBeforeCheckout?.();

    const supabase = createSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/register?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }
    router.push(target);
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      aria-busy={loading}
      className={className}
    >
      {loading && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
