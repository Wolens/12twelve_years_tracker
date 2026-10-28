"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WeekControls } from "@/components/dashboard/week-controls";
import { CharacterPortrait } from "@/components/hero/character-portrait";
import { orphanSphereIds, stateNeedsRepair } from "@/lib/app-state-health";
import { SoundPresetPicker } from "@/components/settings/sound-preset-picker";

export default function SettingsPage() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const spheres = useAppStore((s) => s.spheres);
  const setTheme = useAppStore((s) => s.setTheme);
  const resetCycle = useAppStore((s) => s.resetCycle);
  const loadDemoData = useAppStore((s) => s.loadDemoData);
  const restartTour = useAppStore((s) => s.restartTour);
  const exportState = useAppStore((s) => s.exportState);
  const importState = useAppStore((s) => s.importState);
  const repairStateFromLedger = useAppStore((s) => s.repairStateFromLedger);
  const goals = useAppStore((s) => s.goals);
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const needsRepair = stateNeedsRepair({ goals, spheres, cycleTasks });
  const orphanCount = orphanSphereIds({ goals, spheres, cycleTasks }).length;
  const fileRef = useRef<HTMLInputElement>(null);
  const excelFileRef = useRef<HTMLInputElement>(null);
  const [excelBusy, setExcelBusy] = useState(false);

  const exportJson = () => {
    const data = exportState();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `12-weeks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Экспорт готов" });
  };

  const exportExcel = async () => {
    setExcelBusy(true);
    try {
      const { downloadAppStateExcel } = await import("@/lib/export-excel");
      await downloadAppStateExcel(exportState());
      toast({ title: "Excel готов" });
    } catch {
      toast({ title: "Не удалось создать Excel", description: "Попробуй ещё раз или экспорт JSON." });
    } finally {
      setExcelBusy(false);
    }
  };

  const onImportExcel = async (file: File) => {
    setExcelBusy(true);
    try {
      const { parseAppStateFromExcel } = await import("@/lib/export-excel");
      const data = await parseAppStateFromExcel(file);
      importState(data);
      toast({ title: "Импорт из Excel успешен" });
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      if (code === "NO_RESTORE_SHEET") {
        toast({
          title: "Не удалось импортировать",
          description: "Нужен файл, выгруженный из этого приложения (Экспорт в Excel).",
        });
      } else {
        toast({ title: "Ошибка импорта Excel", description: "Файл повреждён или устарел." });
      }
    } finally {
      setExcelBusy(false);
      if (excelFileRef.current) excelFileRef.current.value = "";
    }
  };

  const onImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        importState(data);
        toast({ title: "Импорт успешен" });
      } catch {
        toast({ title: "Ошибка импорта", description: "Неверный JSON" });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 px-4 pt-4 pb-8">
      <h1 className="font-display text-2xl font-bold">Настройки</h1>
      <Link
        href="/profile"
        className="game-surface flex items-center gap-3 px-3 py-3 text-sm font-medium"
      >
        <CharacterPortrait size="sm" />
        Профиль
      </Link>
      <WeekControls />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Тема и звук</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-3">
            <Label className="text-foreground">Светлая тема</Label>
            <Switch
              checked={theme === "light"}
              onCheckedChange={(c) => setTheme(c ? "light" : "dark")}
              aria-label="Светлая тема"
            />
          </div>
          <SoundPresetPicker />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Данные</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {needsRepair && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
              <p className="font-medium text-amber-100">
                Найдены цели без сферы ({orphanCount})
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Так бывает после повторного «Начать игру». Восстановим сферы, недели и
                галочки из журнала XP.
              </p>
              <Button
                className="mt-3 w-full"
                onClick={() => {
                  repairStateFromLedger();
                  toast({ title: "Данные восстановлены" });
                }}
              >
                Восстановить прогресс
              </Button>
            </div>
          )}
          <Button variant="secondary" className="w-full" onClick={loadDemoData}>
            Заполнить примером
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              restartTour();
              router.push("/", { scroll: false });
            }}
          >
            Показать подсказки
          </Button>
          <Button variant="outline" className="w-full" onClick={exportJson}>
            Экспорт JSON (полный бэкап)
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={excelBusy}
            onClick={() => void exportExcel()}
          >
            {excelBusy ? "Готовим Excel…" : "Экспорт в Excel"}
          </Button>
          <input
            ref={excelFileRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImportExcel(f);
            }}
          />
          <Button
            variant="outline"
            className="w-full"
            disabled={excelBusy}
            onClick={() => excelFileRef.current?.click()}
          >
            Импорт Excel
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
            }}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileRef.current?.click()}
          >
            Импорт JSON
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              if (confirm("Сбросить прогресс цикла? Цели останутся.")) resetCycle();
            }}
          >
            Сбросить цикл
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Отчёт</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/print-report">
            <Button className="w-full">PDF-отчёт (печать)</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
