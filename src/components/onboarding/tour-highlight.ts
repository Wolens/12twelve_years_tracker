type Listener = (nav: string | null) => void;

let currentNav: string | null = null;
const listeners = new Set<Listener>();

export function setTourNav(nav: string | null) {
  currentNav = nav;
  listeners.forEach((l) => l(nav));
}

export function subscribeTourNav(listener: Listener) {
  listeners.add(listener);
  listener(currentNav);
  return () => {
    listeners.delete(listener);
  };
}
