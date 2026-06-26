import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin — Broller",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profil = await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 lg:flex">
      <AdminNav ism={profil.toliq_ism} />
      <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
