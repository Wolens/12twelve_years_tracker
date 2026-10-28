export function CycleRadial({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  const r = 70;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;

  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-[200px] w-full max-w-[200px]" aria-hidden>
      <circle cx="100" cy="100" r={r} fill="none" className="stroke-foreground/10" strokeWidth="20" />
      <circle
        cx="100"
        cy="100"
        r={r}
        fill="none"
        stroke="#34d399"
        strokeWidth="20"
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 100 100)"
      />
    </svg>
  );
}
