import { Link } from "react-router-dom";
import type { TestDef } from "../data/types";
import { AREAS } from "../data/areas";
import type { TestProgress } from "../store/progress";
import { ScoreBadge } from "./ScoreBadge";
import { ProgressBar } from "./ProgressBar";

interface TestCardProps {
  test: TestDef;
  progress?: TestProgress;
}

export function TestCard({ test, progress }: TestCardProps) {
  const area = AREAS[test.area];
  const answeredCount = progress ? Object.keys(progress.answers).length : 0;
  const status = progress?.completed ? "completed" : answeredCount > 0 ? "in-progress" : "not-started";

  const statusLabel = {
    completed: "Completado",
    "in-progress": "En progreso",
    "not-started": "No iniciado",
  }[status];

  const statusClasses = {
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    "in-progress": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    "not-started": "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  }[status];

  const target = status === "completed" ? `/test/${test.id}/resultado` : `/test/${test.id}`;
  const cta = status === "completed" ? "Ver resultados" : status === "in-progress" ? "Continuar" : "Empezar";

  return (
    <Link
      to={target}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: area.color }}>
            {area.shortLabel}
          </p>
          <h3 className="mt-0.5 font-bold text-slate-900 dark:text-slate-100">{test.title}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses}`}>
          {statusLabel}
        </span>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">{test.questions.length} preguntas</p>

      {status === "in-progress" && (
        <ProgressBar current={answeredCount} total={test.questions.length} color={area.color} />
      )}

      <div className="mt-1 flex items-center justify-between">
        {status === "completed" && progress ? (
          <div className="flex items-center gap-2">
            <ScoreBadge score={progress.areaScoreEstimate} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {progress.firstTryCorrect}/{progress.total} a la primera
            </span>
          </div>
        ) : (
          <span />
        )}
        <span
          className="text-sm font-semibold transition-colors group-hover:underline"
          style={{ color: area.color }}
        >
          {cta} →
        </span>
      </div>
    </Link>
  );
}
