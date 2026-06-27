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
        <header className="mb-7">
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
        </header>

        <ProfileForm profil={profil as XaridorProfil} />
      </main>

      <Footer />
    </div>
  );
}
