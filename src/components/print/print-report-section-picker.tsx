"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_PRINT_REPORT_SECTIONS,
  PRINT_REPORT_SECTION_LABELS,
  PRINT_REPORT_SECTION_ORDER,
  type PrintReportSectionId,
  type PrintReportSections,
} from "@/lib/stats/print-report-data";

type Props = {
  value: PrintReportSections;
  onChange: (next: PrintReportSections) => void;
  hasLegacyGoals: boolean;
};

export function PrintReportSectionPicker({ value, onChange, hasLegacyGoals }: Props) {
  const toggle = (id: PrintReportSectionId, checked: boolean) => {
    onChange({ ...value, [id]: checked });
  };

  const ids = PRINT_REPORT_SECTION_ORDER.filter(
    (id) => id !== "legacyGoals" || hasLegacyGoals
  );

  const allOn = ids.every((id) => value[id]);
  const setAll = (on: boolean) => {
    const next = { ...value };
    for (const id of ids) next[id] = on;
    onChange(next);
  };

  return (
    <div className="no-print game-surface space-y-4 p-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Что включить в PDF</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Отметь блоки для печати. Ниже — предпросмотр с тем же составом.
        </p>
      </div>
      <ul className="space-y-3">
        {ids.map((id) => {
          const { title, hint } = PRINT_REPORT_SECTION_LABELS[id];
          const inputId = `print-section-${id}`;
          return (
            <li key={id} className="flex items-start gap-3">
              <Checkbox
                id={inputId}
                checked={value[id]}
                onCheckedChange={(c) => toggle(id, c === true)}
              />
              <div className="min-w-0">
                <Label htmlFor={inputId} className="cursor-pointer font-medium leading-snug">
                  {title}
                </Label>
                {hint && (
                  <p className="text-xs text-muted-foreground">{hint}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => setAll(true)}
          disabled={allOn}
        >
          Выбрать всё
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onChange({ ...DEFAULT_PRINT_REPORT_SECTIONS })}
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}
