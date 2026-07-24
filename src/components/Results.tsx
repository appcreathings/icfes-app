import { Link, useNavigate, useParams } from "react-router-dom";
import { getTestById } from "../data/tests";
import { AREAS } from "../data/areas";
import { useProgressStore } from "../store/progress";
import { motivationalMessage } from "../lib/scoring";
import { ScoreBadge } from "./ScoreBadge";

export function Results() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const test = testId ? getTestById(testId) : undefined;
  const progress = useProgressStore((s) => (testId ? s.tests[testId] : undefined));
  const resetTest = useProgressStore((s) => s.resetTest);

  if (!test || !progress) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-lg font-semibold">Aún no has completado este test.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 underline dark:text-blue-400">
          Volver al dashboard
        </Link>
      </div>
    );
  }

  const area = AREAS[test.area];
  const pct = progress.total > 0 ? Math.round((progress.firstTryCorrect / progress.total) * 100) : 0;
  const message = motivationalMessage(progress.areaScoreEstimate);

  function handleRetry() {
    if (!test) return;
    resetTest(test.id);
    navigate(`/test/${test.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: area.color }}>
        {area.label}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
        {test.title} · Resultados
      </h1>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Respondidas correctamente a la primera
        </p>
        <p className="mt-1 text-4xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-5xl">
          {progress.firstTryCorrect} / {progress.total}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{pct}% de aciertos</p>

        <div className="mx-auto mt-6 max-w-xs">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Puntaje ICFES estimado en {area.label} (0–100)
          </p>
          <p className="mt-2 text-5xl font-extrabold" style={{ color: area.color }}>
            {progress.areaScoreEstimate}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            *Aproximación motivacional, no es el cálculo oficial del Icfes.
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <ScoreBadge score={progress.areaScoreEstimate} size="lg" />
        </div>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{message.label}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleRetry}
          className="flex-1 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Repetir test
        </button>
        <Link
          to="/"
          className="flex-1 rounded-xl px-5 py-3 text-center font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: area.color }}
        >
          Volver al dashboard
        </Link>
      </div>

      <h2 className="mt-10 mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">
        Repaso pregunta por pregunta
      </h2>
      <ul className="flex flex-col gap-2">
        {test.questions.map((q, i) => {
          const ans = progress.answers[q.id];
          const correct = !!ans?.firstTryCorrect;
          return (
            <li
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {i + 1}
                  </span>
                  {q.stem.length > 140 ? `${q.stem.slice(0, 140)}…` : q.stem}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    correct
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                  }`}
                >
                  {correct ? "Correcta ✓" : "Fallada ✗"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Respuesta correcta: <strong>{q.answer}</strong> — {q.explanation}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
