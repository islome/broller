/** Narxni o'zbekcha formatlaydi: 12500000 → "12 500 000 so'm" */
export function formatNarx(narx: number, valyuta = "UZS"): string {
  const son = Math.round(narx)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const birlik = valyuta === "UZS" ? "so'm" : valyuta;
  return `${son} ${birlik}`;
}

/** Sana + vaqtni o'zbekcha formatlaydi: "27.06.2026, 14:30" */
export function formatSana(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
