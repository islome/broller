import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ProfileForm, { type XaridorProfil } from "@/components/site/ProfileForm";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata = {
  title: "Profil — Broller",
};

export default async function ProfilePage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile");

  const { data: profil } = await supabase
    .from("foydalanuvchilar")
    .select("id,toliq_ism,telefon,rol,avatar_url,viloyat,manzil,yaratilgan_vaqt")
    .eq("id", user.id)
    .single();

  if (!profil) redirect("/login?redirect=/profile");
  if (profil.rol === "admin") redirect("/admin");

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Xaridor profili
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              Shaxsiy ma&apos;lumotlar
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Buyurtma va yetkazib berish uchun kerakli ma&apos;lumotlarni shu
              yerda yangilab boring.
            </p>
          </div>
          <Link
            href="/profile/orders"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 no-underline transition-colors hover:bg-zinc-100"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Buyurtmalarim
          </Link>
        </header>

        <ProfileForm profil={profil as XaridorProfil} />
      </main>

      <Footer />
    </div>
  );
}
