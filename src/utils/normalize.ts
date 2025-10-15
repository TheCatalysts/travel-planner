export function normalizeString(s: string | undefined | null): string {
  if (!s) return '';
  return s
    .normalize('NFKD') // decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim();
}