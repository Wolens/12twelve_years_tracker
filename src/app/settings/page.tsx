"use client";

import { useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { SphereFilterBar } from "@/components/spheres/sphere-filter-bar";
import { SphereEditDialog } from "@/components/spheres/sphere-edit-dialog";
import { SphereAddDialog } from "@/components/spheres/sphere-add-dialog";
import { WeekControls } from "@/components/dashboard/week-controls";

export default function SettingsPage() {
  const theme = useAppStore((s) => s.theme);
  const spheres = useAppStore((s) => s.spheres);
  const deleteSphere = useAppStore((s) => s.deleteSphere);
  const setTheme = useAppStore((s) => s.setTheme);
  const resetCycle = useAppStore((s) => s.resetCycle);
  const loadDemoData = useAppStore((s) => s.loadDemoData);
  const exportState = useAppStore((s) => s.exportState);
  const importState = useAppStore((s) => s.importState);
  const fileRef = useRef<HTMLInputElement>(null);

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
      <SphereFilterBar />
      <WeekControls />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Сферы жизни</CardTitle>
          <SphereAddDialog />
        </CardHeader>
        <CardContent className="space-y-3">
          {spheres.length === 0 && (
            <p className="text-sm text-muted-foreground">Нет сфер — добавьте первую.</p>
          )}
          {spheres.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-3"
              style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}
            >
              <span className="text-sm">{s.icon} {s.name}</span>
              <div className="flex gap-2">
                <SphereEditDialog sphere={s} />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        `Удалить сферу «${s.name}»? Все цели в этой сфере тоже будут удалены.`
                      )
                    ) {
                      deleteSphere(s.id);
                    }
                  }}
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Тема</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-3">
          <Label className="text-foreground">Светлая тема</Label>
          <Switch
            checked={theme === "light"}
            onCheckedChange={(c) => setTheme(c ? "light" : "dark")}
            aria-label="Светлая тема"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Данные</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="secondary" className="w-full" onClick={loadDemoData}>
            Заполнить примером
          </Button>
          <Button variant="outline" className="w-full" onClick={exportJson}>
            Экспорт JSON
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
