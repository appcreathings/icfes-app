import type { OptionKey } from "../data/types";
import { MarkdownText } from "./MarkdownText";

interface FeedbackProps {
  kind: "tip" | "explanation";
  text: string;
  optionRationale?: string;
  correctKey?: OptionKey;
}

export function Feedback({ kind, text, optionRationale, correctKey }: FeedbackProps) {
  const isTip = kind === "tip";
  return (
    <div
      role="status"
      className={`rounded-xl border p-4 ${
        isTip
          ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
          : "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
      }`}
    >
      <p
        className={`mb-1 text-xs font-bold uppercase tracking-wide ${
          isTip ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
        }`}
      >
        {isTip ? "💡 Tip para volver a intentar" : "✅ ¿Por qué es correcta?"}
      </p>
      <MarkdownText text={text} className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 sm:text-base" />
      {!isTip && optionRationale && (
        <MarkdownText
          text={optionRationale}
          className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
        />
      )}
      {!isTip && correctKey && (
        <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Respuesta correcta: {correctKey}
        </p>
      )}
    </div>
  );
}
