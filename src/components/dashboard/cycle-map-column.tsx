"use client";

import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import type { CycleTask, WeekData } from "@/types";
import { planDayLabel } from "@/lib/cycle-task-plan";
import { weekTacticalPercent } from "@/lib/week-momentum";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TASK_MIME = "application/x-cycle-task-id";

type ColumnProps = {
  week: number;
  weekData: WeekData | undefined;
  tasks: CycleTask[];
  activeWeek: number;
  accentColor: string;
  dragOver: boolean;
  onHeaderClick: () => void;
  onAdd: () => void;
  onEditTask: (task: CycleTask) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (task: CycleTask) => void;
  onDragOverColumn: (over: boolean) => void;
  onDropTask: (taskId: string) => void;
};

export function CycleMapColumn({
  week,
  weekData,
  tasks,
  activeWeek,
  accentColor,
  dragOver,
  onHeaderClick,
  onAdd,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onDragOverColumn,
  onDropTask,
}: ColumnProps) {
  const percent = weekTacticalPercent(tasks, week);
  const isCurrent = week === activeWeek;
  const closed = weekData?.bonusAwarded || weekData?.closed;

  return (
    <div
      className={cn(
        "game-surface flex w-[9.5rem] shrink-0 snap-center flex-col sm:w-[10.5rem]",
        dragOver && "ring-2 ring-primary/60"
      )}
      onDragEnter={(e) => {
        if (e.dataTransfer.types.includes(TASK_MIME)) onDragOverColumn(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        onDragOverColumn(false);
      }}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(TASK_MIME)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDragOverColumn(false);
        const id = e.dataTransfer.getData(TASK_MIME);
        if (id) onDropTask(id);
      }}
    >
      <button
        type="button"
        onClick={onHeaderClick}
        className={cn(
          "border-b border-white/10 px-2 py-2 text-left transition hover:bg-white/5",
          isCurrent && "bg-primary/10"
        )}
        style={isCurrent ? { borderBottomColor: `${accentColor}55` } : undefined}
      >
        <div className="flex items-baseline justify-between gap-1">
          <span className="font-display text-sm font-bold">Нед. {week}</span>
          <span className="text-[10px] tabular-nums text-muted-foreground">{percent}%</span>
        </div>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {isCurrent && (
            <span className="rounded bg-primary/20 px-1 py-px text-[9px] font-medium text-primary">
              сейчас
            </span>
          )}
          {closed && (
            <span className="rounded bg-white/10 px-1 py-px text-[9px] text-muted-foreground">
              закрыта
            </span>
          )}
        </div>
      </button>

      <div className="flex min-h-[8rem] flex-1 flex-col gap-1.5 p-1.5">
        {tasks.length === 0 && (
          <p className="px-1 py-2 text-center text-[10px] text-muted-foreground">Нет задач</p>
        )}
        {tasks.map((task) => {
          const day = planDayLabel(task.planDay);
          return (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(TASK_MIME, task.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              className={cn(
                "group relative cursor-grab rounded-md border border-white/10 bg-black/25 px-2 py-1.5 active:cursor-grabbing",
                task.done && "opacity-60"
              )}
              style={{ borderLeftWidth: 2, borderLeftColor: accentColor }}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => onEditTask(task)}
              >
                <p
                  className={cn(
                    "line-clamp-3 text-[11px] font-medium leading-snug",
                    task.done && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </p>
                {day && (
                  <span className="mt-0.5 inline-block text-[9px] text-muted-foreground">{day}</span>
                )}
              </button>
              <div className="absolute right-0.5 top-0.5 flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground"
                  aria-label="Перенести или удалить"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveTask(task);
                  }}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground"
                  aria-label="Удалить"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mx-1.5 mb-1.5 h-8 gap-1 text-[10px] uppercase tracking-wide"
        onClick={onAdd}
      >
        <Plus className="h-3.5 w-3.5" />
        Задача
      </Button>
    </div>
  );
}
