"use client";

import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from "./toast";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} open>
          <div className="grid gap-1">
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
