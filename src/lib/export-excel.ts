import ExcelJS from "exceljs";
import type { AppState, CycleTask, Goal, Sphere, WeekData, XpLedgerEntry } from "@/types";
import { RACES, normalizeRace } from "@/lib/rpg/catalog";
import { computeCharacterStats } from "@/lib/rpg/character-stats";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";
import { rankTitle, xpProgressInLevel } from "@/lib/gamification";
import { computeCycleOverview } from "@/lib/stats/cycle-overview";
import { counterProgress, isGoalComplete, metricProgressPercent } from "@/lib/goals";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF059669" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

const TITLE_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  size: 14,
  color: { argb: "FF065F46" },
};

const SUBTITLE_FONT: Partial<ExcelJS.Font> = {
  size: 10,
  color: { argb: "FF64748B" },
};

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF047857" } },
    };
  });
  row.height = 22;
}

function addTableSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  columnWidths: number[]
) {
  const sheet = workbook.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.addRow(headers);
  styleHeaderRow(sheet.getRow(1));
  for (const r of rows) {
    sheet.addRow(
      r.map((v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === "boolean") return v ? "Да" : "Нет";
        return v;
      })
    );
  }
  headers.forEach((_, i) => {
    sheet.getColumn(i + 1).width = columnWidths[i] ?? 14;
  });
  if (rows.length > 0) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: rows.length + 1, column: headers.length },
    };
  }
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.alignment = { vertical: "top", wrapText: true };
    });
  });
  return sheet;
}

function sphereName(spheres: Sphere[], id: string): string {
  return spheres.find((s) => s.id === id)?.name ?? "—";
}

function legacyGoalProgress(goal: Goal): string {
  if (goal.type === "counter") {
    const current = counterProgress(goal);
    return `${current} / ${goal.targetCount ?? 0}`;
  }
  if (goal.type === "metric") {
    const p = metricProgressPercent(goal);
    return `${Math.round(p)}%`;
  }
  return goal.done || goal.completed ? "Готово" : "В процессе";
}

function buildOverviewSheet(workbook: ExcelJS.Workbook, state: AppState) {
  const sheet = workbook.addWorksheet("Обзор", {
    properties: { defaultColWidth: 18 },
  });
  const xp = xpProgressInLevel(state.profile.xp);
  const character = normalizeCharacter(state.character);
  const stats = computeCharacterStats(xp.level, character, state.seasonFlame?.value ?? 100);
  const overview = computeCycleOverview(state.cycleTasks, state.weeks, state.activeWeek);
  const race = RACES[normalizeRace(character.race)];

  const exportedAt = new Date().toLocaleString("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
  });

  sheet.mergeCells("A1:D1");
  const title = sheet.getCell("A1");
  title.value = "12 недель — резервная копия";
  title.font = TITLE_FONT;
  title.alignment = { vertical: "middle" };

  sheet.mergeCells("A2:D2");
  sheet.getCell("A2").value =
    "Сохраните файл на диск или в облако. JSON в настройках — полный импорт обратно в приложение.";
  sheet.getCell("A2").font = SUBTITLE_FONT;
  sheet.getCell("A2").alignment = { wrapText: true };

  const pairs: [string, string | number][] = [
    ["Дата выгрузки", exportedAt],
    ["Имя", state.profile.name || "—"],
    ["Старт цикла", state.cycleStartDate],
    ["Текущая неделя", `${state.activeWeek} из 12 (день ${state.activeDay})`],
    ["Уровень / звание", `${xp.level} · ${rankTitle(xp.level)}`],
    ["Опыт (XP)", state.profile.xp],
    ["Серия (streak)", state.profile.streak],
    ["Здоровье %", Math.round(state.seasonFlame?.value ?? 100)],
    ["Здоровье / сила (герой)", `${stats.health} / ${stats.strength}`],
    ["Облик", race.name],
    ["Монеты", character.coins],
    ["Задач выполнено", `${overview.doneTasks} из ${overview.totalTasks} (${overview.taskPercent}%)`],
    ["Недель закрыто", overview.closedWeeks],
    ["Версия данных", state.version],
  ];

  let row = 4;
  for (const [label, value] of pairs) {
    sheet.getCell(`A${row}`).value = label;
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`B${row}`).value = value;
    row++;
  }

  sheet.getColumn(1).width = 28;
  sheet.getColumn(2).width = 42;
}

function buildSpheresSheet(workbook: ExcelJS.Workbook, spheres: Sphere[]) {
  addTableSheet(
    workbook,
    "Направления",
    [
      "Направление",
      "Описание цели",
      "Старт",
      "Сейчас",
      "Цель",
      "Прогресс %",
    ],
    spheres.map((s) => {
      const hasNums =
        s.startValue != null && s.targetValue != null && s.currentValue != null;
      let progress = "";
      if (hasNums && s.targetValue !== s.startValue) {
        const pct =
          ((s.currentValue! - s.startValue!) / (s.targetValue! - s.startValue!)) * 100;
        progress = `${Math.round(Math.min(100, Math.max(0, pct)))}%`;
      }
      return [
        s.name,
        s.description ?? "",
        s.startValue ?? "",
        s.currentValue ?? "",
        s.targetValue ?? "",
        progress,
      ];
    }),
    [22, 48, 10, 10, 10, 12]
  );
}

function buildTasksSheet(workbook: ExcelJS.Workbook, state: AppState) {
  const sorted = [...state.cycleTasks].sort(
    (a, b) => a.week - b.week || a.sphereId.localeCompare(b.sphereId)
  );
  addTableSheet(
    workbook,
    "Задачи",
    ["Неделя", "Направление", "Задача", "Выполнено"],
    sorted.map((t: CycleTask) => [
      t.week,
      sphereName(state.spheres, t.sphereId),
      t.title,
      t.done,
    ]),
    [8, 22, 52, 12]
  );
}

function buildWeeksSheet(workbook: ExcelJS.Workbook, weeks: WeekData[]) {
  addTableSheet(
    workbook,
    "12 недель",
    [
      "Неделя",
      "Закрыта",
      "Бонус недели",
      "Оценка",
      "Краткая заметка",
      "Победы",
      "Сложности",
    ],
    weeks.map((w) => [
      w.number,
      w.closed,
      w.bonusAwarded ?? false,
      w.reflection?.rating ?? "",
      w.reflection?.note ?? "",
      w.reflection?.wins ?? "",
      w.reflection?.struggles ?? "",
    ]),
    [8, 10, 14, 10, 36, 28, 28]
  );
}

function buildXpSheet(workbook: ExcelJS.Workbook, ledger: XpLedgerEntry[]) {
  const sorted = [...(ledger ?? [])].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
  addTableSheet(
    workbook,
    "Журнал XP",
    ["Дата", "XP", "Описание", "ID источника"],
    sorted.map((e) => [
      new Date(e.at).toLocaleString("ru-RU"),
      e.amount,
      e.label,
      e.sourceId ?? "",
    ]),
    [20, 8, 40, 28]
  );
}

function buildLegacyGoalsSheet(
  workbook: ExcelJS.Workbook,
  goals: Goal[],
  spheres: Sphere[]
) {
  if (goals.length === 0) return;
  addTableSheet(
    workbook,
    "Архив целей",
    ["Направление", "Цель", "Тип", "Прогресс", "Завершена"],
    goals.map((g) => [
      sphereName(spheres, g.sphereId),
      g.title,
      g.type,
      legacyGoalProgress(g),
      isGoalComplete(g),
    ]),
    [22, 36, 12, 16, 12]
  );
}

const RESTORE_SHEET = "_restore";
const RESTORE_CHUNK = 28000;

function buildRestoreSheet(workbook: ExcelJS.Workbook, state: AppState) {
  const sheet = workbook.addWorksheet(RESTORE_SHEET, { state: "veryHidden" });
  const json = JSON.stringify(state);
  const parts: string[] = [];
  for (let i = 0; i < json.length; i += RESTORE_CHUNK) {
    parts.push(json.slice(i, i + RESTORE_CHUNK));
  }
  sheet.getCell(1, 1).value = parts.length;
  parts.forEach((part, index) => {
    sheet.getCell(index + 2, 1).value = part;
  });
}

function readRestoreJson(sheet: ExcelJS.Worksheet): string {
  const first = sheet.getCell(1, 1).value;
  if (typeof first === "string" && first.trimStart().startsWith("{")) {
    return first;
  }
  const count = typeof first === "number" ? first : Number(first);
  if (!Number.isFinite(count) || count < 1) {
    throw new Error("INVALID_RESTORE_PAYLOAD");
  }
  let json = "";
  for (let row = 2; row < count + 2; row++) {
    const part = sheet.getCell(row, 1).value;
    if (typeof part !== "string") {
      throw new Error("INVALID_RESTORE_PAYLOAD");
    }
    json += part;
  }
  return json;
}

export async function parseAppStateFromExcel(file: File): Promise<AppState> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet(RESTORE_SHEET);
  if (!sheet) {
    throw new Error("NO_RESTORE_SHEET");
  }
  const json = readRestoreJson(sheet);
  if (!json.trim()) {
    throw new Error("INVALID_RESTORE_PAYLOAD");
  }
  return JSON.parse(json) as AppState;
}

export async function downloadAppStateExcel(state: AppState): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "12 недель";
  workbook.created = new Date();
  workbook.modified = new Date();

  buildOverviewSheet(workbook, state);
  buildSpheresSheet(workbook, state.spheres);
  buildTasksSheet(workbook, state);
  buildWeeksSheet(workbook, state.weeks);
  buildXpSheet(workbook, state.profile.xpLedger ?? []);
  buildLegacyGoalsSheet(workbook, state.goals, state.spheres);
  buildRestoreSheet(workbook, state);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `12-nedel-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
