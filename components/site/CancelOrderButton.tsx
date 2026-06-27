"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buyurtmaBekorQil } from "@/app/profile/orders/actions";

export default function CancelOrderButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [xato, setXato] = useState("");

  function bekor() {
    if (pending) return;
    if (!window.confirm("Buyurtmani bekor qilmoqchimisiz?")) return;
    setXato("");
    startTransition(async () => {
      const r = await buyurtmaBekorQil(id);
      if (!r.ok) {
        setXato(r.error ?? "Xatolik yuz berdi.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={bekor}
        disabled={pending}
        aria-busy={pending}
        className="text-xs font-medium text-zinc-400 transition-colors hover:text-rose-600 disabled:opacity-50"
      >
        {pending ? "Bekor qilinmoqda..." : "Buyurtmani bekor qilish"}
      </button>
      {xato && <p className="mt-1 text-xs text-rose-600">{xato}</p>}
    </div>
  );
}
