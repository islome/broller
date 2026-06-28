"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { Kategoriya } from "@/lib/types";
import type { FormHolat } from "@/app/admin/products/actions";
import { slugify } from "@/lib/slug";
import ProductImagePicker from "@/components/admin/ProductImagePicker";

export type TahrirMahsulot = {
  nomi: string;
  slug: string;
  kategoriya_id: string | null;
  tavsif: string | null;
  brend: string | null;
  model: string | null;
  artikul: string | null;
  narxi: number;
  chegirma_narxi: number | null;
  valyuta: string;
  holati: string;
  status: string;
  ombor_soni: number;
  kafolat_oylari: number;
  asosiy_rasm: string | null;
  tavsiya_etilgan: boolean;
  xususiyatlar: Record<string, unknown>;
};

const boshHolat: FormHolat = { error: null };

export default function ProductForm({
  kategoriyalar,
  action,
  mahsulot,
  mavjudRasmlar = [],
}: {
  kategoriyalar: Kategoriya[];
  action: (prev: FormHolat, formData: FormData) => Promise<FormHolat>;
  mahsulot?: TahrirMahsulot;
  mavjudRasmlar?: string[];
}) {
  const [state, formAction, pending] = useActionState(action, boshHolat);

  const tahrir = Boolean(mahsulot);
  const [nomi, setNomi] = useState(mahsulot?.nomi ?? "");
  const [slug, setSlug] = useState(mahsulot?.slug ?? "");
  // tahrirda slug avtomatik qayta generatsiya qilinmasin
  const [slugTahrir, setSlugTahrir] = useState(tahrir);
  const slugQiymat = slugTahrir ? slug : slugify(nomi);

  const xususiyatlarMatn =
    mahsulot && Object.keys(mahsulot.xususiyatlar ?? {}).length
      ? JSON.stringify(mahsulot.xususiyatlar, null, 2)
      : "";

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <svg width="16" height="16" fill="none" stroke="#e11d48" strokeWidth="2" viewBox="0 0 24 24" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-rose-700">{state.error}</p>
        </div>
      )}

      {/* Asosiy */}
      <Card title="Asosiy ma'lumot">
        <Field label="Nomi" required>
          <input
            name="nomi"
            value={nomi}
            onChange={(e) => setNomi(e.target.value)}
            required
            placeholder="Broyler ferma konditsioneri 7.5 kVt"
            className={inp}
          />
        </Field>

        <Field label="Slug" hint="URL manzili. Nomidan avtomatik yaratiladi.">
          <input
            name="slug"
            value={slugQiymat}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTahrir(true);
            }}
            placeholder="broyler-konditsioner-7-5kvt"
            className={inp}
          />
        </Field>

        <Field label="Kategoriya">
          <select
            name="kategoriya_id"
            defaultValue={mahsulot?.kategoriya_id ?? ""}
            className={inp}
          >
            <option value="">— tanlanmagan —</option>
            {kategoriyalar.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nomi}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tavsif">
          <textarea
            name="tavsif"
            rows={3}
            defaultValue={mahsulot?.tavsif ?? ""}
            placeholder="Mahsulot haqida qisqacha..."
            className={inp}
          />
        </Field>
      </Card>

      {/* Rasmlar */}
      <Card title="Rasmlar">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            Mahsulot rasmlari
          </span>
          <ProductImagePicker defaultRasmlar={mavjudRasmlar} />
        </div>
      </Card>

      {/* Narx va ombor */}
      <Card title="Narx va ombor">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Narx (so'm)" required>
            <input name="narxi" type="number" min={0} step="1000" required defaultValue={mahsulot?.narxi ?? 0} className={inp} />
          </Field>
          <Field label="Chegirma narxi" hint="ixtiyoriy">
            <input name="chegirma_narxi" type="number" min={0} step="1000" defaultValue={mahsulot?.chegirma_narxi ?? ""} className={inp} />
          </Field>
          <Field label="Ombordagi soni">
            <input name="ombor_soni" type="number" min={0} step="1" defaultValue={mahsulot?.ombor_soni ?? 0} className={inp} />
          </Field>
          <Field label="Kafolat (oy)">
            <input name="kafolat_oylari" type="number" min={0} step="1" defaultValue={mahsulot?.kafolat_oylari ?? 0} className={inp} />
          </Field>
          <Field label="Valyuta">
            <input name="valyuta" defaultValue={mahsulot?.valyuta ?? "UZS"} className={inp} />
          </Field>
          <Field label="Holati">
            <select name="holati" defaultValue={mahsulot?.holati ?? "yangi"} className={inp}>
              <option value="yangi">Yangi</option>
              <option value="ishlatilgan">Ishlatilgan</option>
              <option value="tamirlangan">Ta&apos;mirlangan</option>
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={mahsulot?.status ?? "faol"} className={inp}>
              <option value="faol">Faol</option>
              <option value="qoralama">Qoralama</option>
              <option value="tugagan">Tugagan</option>
              <option value="arxivlangan">Arxivlangan</option>
            </select>
          </Field>
        </div>
      </Card>

      {/* Qo'shimcha */}
      <Card title="Qo'shimcha">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brend">
            <input name="brend" defaultValue={mahsulot?.brend ?? ""} placeholder="ClimaFarm" className={inp} />
          </Field>
          <Field label="Model">
            <input name="model" defaultValue={mahsulot?.model ?? ""} placeholder="CF-7500" className={inp} />
          </Field>
          <Field label="Artikul (SKU)">
            <input name="artikul" defaultValue={mahsulot?.artikul ?? ""} placeholder="CF-7500-AC" className={inp} />
          </Field>
        </div>

        <Field
          label="Texnik xususiyatlar (JSON)"
          hint='ixtiyoriy, masalan: {"quvvat_kw": 7.5, "kuchlanish": 380}'
        >
          <textarea
            name="xususiyatlar"
            rows={3}
            defaultValue={xususiyatlarMatn}
            placeholder='{"quvvat_kw": 7.5, "kuchlanish": 380}'
            className={`${inp} font-mono text-xs`}
          />
        </Field>

        <label className="mt-2 flex w-fit cursor-pointer items-center gap-2.5 select-none">
          <input
            type="checkbox"
            name="tavsiya_etilgan"
            defaultChecked={mahsulot?.tavsiya_etilgan ?? false}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
          />
          <span className="text-sm text-zinc-700">
            Tavsiya etilgan (bosh sahifada ko&apos;rsatiladi)
          </span>
        </label>
      </Card>

      {/* Harakatlar */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/admin/products"
          className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 no-underline transition-colors hover:bg-zinc-100"
        >
          Bekor qilish
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {pending
            ? "Saqlanmoqda..."
            : tahrir
              ? "O'zgarishlarni saqlash"
              : "Mahsulotni saqlash"}
        </button>
      </div>
    </form>
  );
}

const inp =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900 placeholder:text-zinc-400";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-400">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
        {hint && (
          <span className="ml-1.5 font-normal text-zinc-400">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}
