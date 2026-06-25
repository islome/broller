/** Narxni o'zbekcha formatlaydi: 12500000 → "12 500 000 so'm" */
export function formatNarx(narx: number, valyuta = "UZS"): string {
  const son = Math.round(narx)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const birlik = valyuta === "UZS" ? "so'm" : valyuta;
  return `${son} ${birlik}`;
}
