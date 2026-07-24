import { useMemo } from "react";
import { TESTS } from "../data/tests";
import { AREA_ORDER, AREAS, type AreaId } from "../data/areas";
import { useProgressStore } from "../store/progress";
import { estimateGlobalScore, motivationalMessage } from "../lib/scoring";
import { TestCard } from "./TestCard";
import { ResetButton } from "./ResetButton";
import { ProgressBar } from "./ProgressBar";

export function Dashboard() {
  const tests = useProgressStore((s) => s.tests);

  const areaAverages = useMemo(() => {
    const byArea: Record<AreaId, number[]> = {
      "lectura-critica": [],
      matematicas: [],
      sociales: [],
      ciencias: [],
      ingles: [],
    };
    for (const test of TESTS) {
      const progress = tests[test.id];
      if (progress?.completed) {
        byArea[test.area].push(progress.areaScoreEstimate);
      }
    }
    const averages: Partial<Record<AreaId, number>> = {};
    for (const area of AREA_ORDER) {
      const scores = byArea[area];
      if (scores.length > 0) {
        averages[area] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    }
    return averages;
  }, [tests]);

  const { score: globalScore, areasCounted } = estimateGlobalScore(areaAverages);
  const completedCount = Object.values(tests).filter((t) => t.completed).length;

  const testsByArea = useMemo(() => {
    const map: Record<AreaId, typeof TESTS> = {
      "lectura-critica": [],
      matematicas: [],
      sociales: [],
      ciencias: [],
      ingles: [],
    };
    for (const test of TESTS) map[test.area].push(test);
    return map;
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-3xl">
          Práctica Saber 11 · Icfes 2026
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {completedCount} de {TESTS.length} tests completados · {TESTS.reduce((a, t) => a + t.questions.length, 0)}{" "}
          preguntas disponibles
        </p>
      </header>

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Nota global estimada
            </p>
            <p className="mt-1 text-5xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-6xl">
              {globalScore ?? "—"}
              <span className="text-2xl font-semibold text-slate-400"> / 500</span>
            </p>
            {globalScore !== null ? (
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                {motivationalMessage(globalScore / 5).emoji} {motivationalMessage(globalScore / 5).label}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Completa al menos un test para ver tu nota estimada.
              </p>
            )}
            <p className="mt-2 max-w-sm text-xs text-slate-400 dark:text-slate-500">
              *Aproximación motivacional basada en tus aciertos a la primera; no es el cálculo oficial del Icfes
              (que usa TRI).
              {areasCounted.length > 0 && areasCounted.length < AREA_ORDER.length && (
                <> Calculada con {areasCounted.length} de 5 áreas practicadas.</>
              )}
            </p>
          </div>

          <div className="mt-6 grid w-full max-w-xs grid-cols-1 gap-3 sm:mt-0">
            {AREA_ORDER.map((areaId) => {
              const area = AREAS[areaId];
              const score = areaAverages[areaId];
              return (
                <div key={areaId} className="text-left">
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                    <span style={{ color: area.color }}>{area.shortLabel}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {score !== undefined ? score : "pendiente"}
                    </span>
                  </div>
                  <ProgressBar current={score ?? 0} total={100} color={area.color} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {AREA_ORDER.map((areaId) => {
        const area = AREAS[areaId];
        const areaTests = testsByArea[areaId];
        if (areaTests.length === 0) return null;
        return (
          <section key={areaId} className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: area.color }} />
              {area.label}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {areaTests.map((test) => (
                <TestCard key={test.id} test={test} progress={tests[test.id]} />
              ))}
            </div>
          </section>
        );
      })}

      <footer className="mt-10 flex justify-center border-t border-slate-200 pt-6 dark:border-slate-800">
        <ResetButton />
      </footer>
    </div>
  );
}
