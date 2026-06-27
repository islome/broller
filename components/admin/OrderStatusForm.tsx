"use client";

import { useActionState } from "react";
import {
  buyurtmaHolatYangilash,
  type HolatNatija,
} from "@/app/admin/orders/actions";
import { BUYURTMA_HOLATLARI } from "@/lib/buyurtma";

const boshHolat: HolatNatija = { error: null };

export default function OrderStatusForm({
  id,
  holat,
}: {
  id: string;
  holat: string;
}) {
  const action = buyurtmaHolatYangilash.bind(null, id);
  const [state, formAction, pending] = useActionState(action, boshHolat);

  return (
    <form action={formAction} className="space-y-3">
      <select
        name="holat"
        defaultValue={holat}
        className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900"
      >
        {BUYURTMA_HOLATLARI.map((h) => (
          <option key={h.value} value={h.value}>
            {h.t}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        Holatni saqlash
      </button>

      {state.error && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      {state.ok && !state.error && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          Holat yangilandi ✓
        </p>
      )}
    </form>
  );
}
