/** Пустая строка → undefined; иначе число (дробное через точку или запятую). */
export function parseOptionalMetricNumber(
  raw: string
): { ok: true; value: number | undefined } | { ok: false } {
  const t = raw.trim();
  if (!t) return { ok: true, value: undefined };
  const n = Number(t.replace(",", "."));
  if (!Number.isFinite(n)) return { ok: false };
  return { ok: true, value: n };
}

export function formatMetricNumber(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "";
  return String(value);
}
