import { motivationalMessage } from "../lib/scoring";

interface ScoreBadgeProps {
  score: number; // 0-100 scale
  size?: "sm" | "lg";
}

export function ScoreBadge({ score, size = "sm" }: ScoreBadgeProps) {
  const { emoji, tone } = motivationalMessage(score);
  const toneClasses: Record<string, string> = {
    excellent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    good: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    ok: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    "keep-going": "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };
  const sizeClasses = size === "lg" ? "px-4 py-1.5 text-base" : "px-2.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${toneClasses[tone]} ${sizeClasses}`}
    >
      <span aria-hidden>{emoji}</span>
      {score}
    </span>
  );
}
