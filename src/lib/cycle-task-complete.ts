import { useAppStore } from "@/store/useAppStore";
import { previewTaskCompletionRewards } from "@/lib/rpg/task-rewards";
import type { TaskRewardFlashPayload } from "@/components/today/task-reward-flash";

/** Отметить задачу выполненной один раз; false, если уже была done. */
export function markCycleTaskDoneIfPending(taskId: string): boolean {
  const before = useAppStore.getState().cycleTasks.find((t) => t.id === taskId);
  if (!before || before.done) return false;
  useAppStore.getState().toggleCycleTask(taskId);
  const after = useAppStore.getState().cycleTasks.find((t) => t.id === taskId);
  return Boolean(after?.done);
}

export function buildTaskRewardFlash(taskId: string, title: string): TaskRewardFlashPayload | null {
  if (!markCycleTaskDoneIfPending(taskId)) return null;
  const level = useAppStore.getState().profile.level;
  const preview = previewTaskCompletionRewards(level, null, 100);
  return {
    taskId,
    title,
    xp: preview.xp,
    coins: preview.coins,
  };
}
