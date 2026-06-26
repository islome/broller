/** Matnni URL-slugga aylantiradi: "Broyler 7.5 kVt" → "broyler-7-5-kvt" */
export function slugify(matn: string): string {
  return matn
    .toLowerCase()
    .trim()
    .replace(/['’ʻ`]/g, "") // o' g' kabi apostroflarni olib tashlaymiz
    .replace(/[^a-z0-9\s-]/g, "") // faqat harf, raqam, probel va tire
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
