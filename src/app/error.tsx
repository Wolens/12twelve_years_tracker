"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-xl font-semibold">Что-то пошло не так</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Попробуй обновить страницу. Если dev «сломался», перезапусти{" "}
        <code className="text-xs">npm run dev</code> или{" "}
        <code className="text-xs">npm run dev:clean</code>.
      </p>
      <Button type="button" onClick={() => reset()}>
        Повторить
      </Button>
    </div>
  );
}
