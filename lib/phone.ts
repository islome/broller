/**
 * O'zbek telefon raqamini E.164 formatiga keltiradi.
 * "+998 90 123 45 67" / "901234567" / "998901234567" → "+998901234567"
 */
export function toE164(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("998")) d = d.slice(3);
  return "+998" + d;
}

/** Milliy qism 9 xonali bo'lishini tekshiradi. */
export function isValidUzPhone(input: string): boolean {
  const d = input.replace(/\D/g, "");
  const milliy = d.startsWith("998") ? d.slice(3) : d;
  return milliy.length === 9;
}
