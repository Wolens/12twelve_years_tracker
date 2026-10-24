"use client";

import * as React from "react";

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
};

const listeners = new Set<(toasts: ToastMessage[]) => void>();
let memoryState: ToastMessage[] = [];

function dispatch(toasts: ToastMessage[]) {
  memoryState = toasts;
  listeners.forEach((l) => l(toasts));
}

export function toast({ title, description }: { title: string; description?: string }) {
  const id = String(Date.now());
  dispatch([...memoryState, { id, title, description }]);
  setTimeout(() => {
    dispatch(memoryState.filter((t) => t.id !== id));
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>(memoryState);
  React.useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);
  return { toasts };
}
