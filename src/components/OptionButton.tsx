import type { OptionKey } from "../data/types";

export type OptionStatus = "idle" | "correct" | "incorrect" | "disabled" | "reveal-correct";

interface OptionButtonProps {
  optionKey: OptionKey;
  text: string;
  status: OptionStatus;
  onSelect: () => void;
}

const statusClasses: Record<OptionStatus, string> = {
  idle:
    "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800",
  correct:
    "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  incorrect: "border-red-500 bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-200",
  disabled: "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600",
  "reveal-correct":
    "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200",
};

export function OptionButton({ optionKey, text, status, onSelect }: OptionButtonProps) {
  const clickable = status === "idle";
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onSelect}
      aria-pressed={status === "correct" || status === "incorrect"}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${statusClasses[status]} ${
        clickable ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
          status === "correct" || status === "reveal-correct"
            ? "border-emerald-500 bg-emerald-500 text-white"
            : status === "incorrect"
              ? "border-red-500 bg-red-500 text-white"
              : "border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400"
        }`}
      >
        {optionKey}
      </span>
      <span className="pt-0.5 text-sm leading-relaxed sm:text-base">{text}</span>
    </button>
  );
}
