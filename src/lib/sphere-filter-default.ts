import type { Sphere } from "@/types";

/** Всегда одна выбранная «цель» (сфера); при пустом списке — пустая строка. */
export function resolveSphereFilterId(
  spheres: Sphere[],
  current: string | null | undefined
): string {
  if (spheres.length === 0) return "";
  if (current && spheres.some((s) => s.id === current)) return current;
  return spheres[0].id;
}
