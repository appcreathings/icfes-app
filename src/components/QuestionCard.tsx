import { useEffect, useState } from "react";
import type { OptionKey, Question } from "../data/types";
import { OptionButton, type OptionStatus } from "./OptionButton";
import { Feedback } from "./Feedback";
import { MarkdownText } from "./MarkdownText";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  showContext: boolean;
  areaColor: string;
  onAnswered: (chosen: OptionKey, correct: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  showContext,
  areaColor,
  onAnswered,
  onNext,
  onPrev,
  isFirst,
  isLast,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState<OptionKey[]>([]);
  const [solved, setSolved] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  // Reset local state when the question changes
  useEffect(() => {
    setSelected(null);
    setWrongAttempts([]);
    setSolved(false);
    setImageExpanded(false);
  }, [question.id]);

  // Allow closing the expanded image with Escape
  useEffect(() => {
    if (!imageExpanded) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setImageExpanded(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageExpanded]);

  function handleSelect(key: OptionKey) {
    if (solved) return;
    const correct = key === question.answer;
    setSelected(key);
    onAnswered(key, correct);
    if (correct) {
      setSolved(true);
    } else {
      setWrongAttempts((prev) => (prev.includes(key) ? prev : [...prev, key]));
    }
  }

  function statusFor(key: OptionKey): OptionStatus {
    if (solved) {
      if (key === question.answer) return "correct";
      if (wrongAttempts.includes(key)) return "incorrect";
      return "disabled";
    }
    if (wrongAttempts.includes(key)) return "incorrect";
    return "idle";
  }

  const lastWrongKey = wrongAttempts[wrongAttempts.length - 1];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
        <span>
          Pregunta {questionNumber} de {totalQuestions}
        </span>
        {question.difficulty && (
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Dificultad {question.difficulty}
          </span>
        )}
      </div>

      {showContext && question.context && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <MarkdownText text={question.context} />
        </div>
      )}

      {question.image && (
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setImageExpanded(true)}
            className="block w-full cursor-zoom-in"
            aria-label="Ampliar imagen"
          >
            <img
              src={`/images/${question.image}`}
              alt={question.imageAlt ?? "Figura de la pregunta"}
              className="max-h-[420px] w-full object-contain"
            />
          </button>
        </div>
      )}

      {imageExpanded && question.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImageExpanded(false)}
        >
          <button
            type="button"
            onClick={() => setImageExpanded(false)}
            aria-label="Cerrar imagen"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white hover:bg-white/20"
          >
            ×
          </button>
          <img
            src={`/images/${question.image}`}
            alt={question.imageAlt ?? "Figura de la pregunta"}
            className="max-h-full max-w-full cursor-zoom-out object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <MarkdownText
        text={question.stem}
        className="mb-4 text-base font-semibold leading-loose text-slate-900 dark:text-slate-100 sm:text-lg sm:leading-loose"
      />

      <div className="flex flex-col gap-3">
        {question.options.map((opt) => (
          <OptionButton
            key={opt.key}
            optionKey={opt.key}
            text={opt.text}
            status={statusFor(opt.key)}
            onSelect={() => handleSelect(opt.key)}
          />
        ))}
      </div>

      {selected && !solved && (
        <div className="mt-4">
          <Feedback kind="tip" text={question.tip} />
        </div>
      )}

      {solved && (
        <div className="mt-4">
          <Feedback
            kind="explanation"
            text={question.explanation}
            optionRationale={lastWrongKey ? question.optionRationales?.[lastWrongKey] : undefined}
          />
        </div>
      )}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
        {!isFirst && (
          <button
            type="button"
            onClick={onPrev}
            className="w-full rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
          >
            ← Pregunta anterior
          </button>
        )}

        {solved && (
          <button
            type="button"
            onClick={onNext}
            className="w-full rounded-xl px-5 py-3 text-center font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            style={{ backgroundColor: areaColor }}
          >
            {isLast ? "Ver resultados" : "Siguiente pregunta →"}
          </button>
        )}
      </div>
    </div>
  );
}
