import { createSupabaseServer } from "@/lib/supabase/server";
import UserAvatarPreview from "@/components/admin/UserAvatarPreview";

type Foydalanuvchi = {
  id: string;
  toliq_ism: string;
  telefon: string | null;
  email: string | null;
  avatar_url: string | null;
  viloyat: string | null;
  yaratilgan_vaqt: string;
};

function sana(s: string): string {
  const d = new Date(s);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export default async function AdminUsers() {
  const supabase = await createSupabaseServer();
  const { data, count } = await supabase
    .from("foydalanuvchilar")
    .select("id,toliq_ism,telefon,email,avatar_url,viloyat,yaratilgan_vaqt", {
      count: "exact",
    })
    .eq("rol", "xaridor")
    .order("yaratilgan_vaqt", { ascending: false });

  const userlar = (data ?? []) as Foydalanuvchi[];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Foydalanuvchilar
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Jami{" "}
          <span className="font-semibold text-zinc-900">{count ?? 0}</span> ta
          foydalanuvchi.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {userlar.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-zinc-500">
            Hozircha foydalanuvchilar yo&apos;q.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  <th className="px-5 py-3">Avatar</th>
                  <th className="px-5 py-3">Ism familiya</th>
                  <th className="px-5 py-3">Telefon</th>
                  <th className="px-5 py-3">Viloyat</th>
                  <th className="px-5 py-3">Ro&apos;yxatdan o&apos;tgan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {userlar.map((u) => (
                  <tr key={u.id} className="text-zinc-700">
                    <td className="w-8 h-12 px-5">
                      <UserAvatarPreview
                        avatarUrl={u.avatar_url}
                        name={u.toliq_ism}
                      />
                    </td>
                    <td className="px-5 py-3 font-medium text-zinc-900">
                      {u.toliq_ism || "—"}
                    </td>
                    <td className="px-5 py-3 tabular-nums">{u.telefon || "—"}</td>
                    <td className="px-5 py-3">{u.viloyat || "—"}</td>
                    <td className="px-5 py-3 text-zinc-500">
                      {sana(u.yaratilgan_vaqt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
