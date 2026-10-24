type Listener = (href: string | null) => void;

let pending: string | null = null;
const listeners = new Set<Listener>();

export function setNavPending(href: string | null) {
  pending = href;
  listeners.forEach((l) => l(href));
}

export function subscribeNavPending(listener: Listener) {
  listeners.add(listener);
  listener(pending);
  return () => {
    listeners.delete(listener);
  };
}
