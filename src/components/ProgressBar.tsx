interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ current, total, color, className = "" }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color ?? "var(--color-lc)" }}
      />
    </div>
  );
}
