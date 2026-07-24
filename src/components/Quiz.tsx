import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getTestById } from "../data/tests";
import { AREAS } from "../data/areas";
import { useProgressStore } from "../store/progress";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import type { OptionKey } from "../data/types";

export function Quiz() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const test = testId ? getTestById(testId) : undefined;
  const progress = useProgressStore((s) => (testId ? s.tests[testId] : undefined));
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const completeTest = useProgressStore((s) => s.completeTest);
  const setCurrentIndex = useProgressStore((s) => s.setCurrentIndex);

  const [index, setIndexState] = useState(0);
  const [confirmingExit, setConfirmingExit] = useState(false);

  // Resume where the user left off whenever they land on a (possibly different) test.
  useEffect(() => {
    if (!testId) return;
    const saved = useProgressStore.getState().tests[testId]?.currentIndex ?? 0;
    const totalQuestions = getTestById(testId)?.questions.length ?? 1;
    setIndexState(Math.min(saved, Math.max(totalQuestions - 1, 0)));
    setConfirmingExit(false);
  }, [testId]);

  const question = test?.questions[index];
  const showContext = useMemo(() => {
    if (!test || !question?.context) return false;
    if (index === 0) return true;
    const prev = test.questions[index - 1];
    return prev.contextId !== question.contextId || !question.contextId;
  }, [test, question, index]);

  if (!test || !question) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-lg font-semibold">Test no encontrado.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 underline dark:text-blue-400">
          Volver al dashboard
        </Link>
      </div>
    );
  }

  const area = AREAS[test.area];
  const hasUnfinishedProgress =
    !!progress && !progress.completed && Object.keys(progress.answers).length > 0;

  function goTo(newIndex: number) {
    setIndexState(newIndex);
    if (test) setCurrentIndex(test.id, newIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAnswered(chosen: OptionKey, correct: boolean) {
    if (!test || !question) return;
    recordAttempt(test.id, question.id, chosen, correct);
  }

  function handleNext() {
    if (!test) return;
    if (index + 1 < test.questions.length) {
      goTo(index + 1);
    } else {
      completeTest(test);
      navigate(`/test/${test.id}/resultado`);
    }
  }

  function handlePrev() {
    if (index === 0) return;
    goTo(index - 1);
  }

  function handleExitClick() {
    if (hasUnfinishedProgress && !confirmingExit) {
      setConfirmingExit(true);
      return;
    }
    navigate("/");
  }

  return (
    <div className="min-h-screen pb-16">
      <header
        className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          {confirmingExit ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">¿Salir sin terminar?</span>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-lg bg-red-600 px-2.5 py-1 font-semibold text-white hover:bg-red-700"
              >
                Sí, salir
              </button>
              <button
                type="button"
                onClick={() => setConfirmingExit(false)}
                className="rounded-lg px-2.5 py-1 font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Seguir
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleExitClick}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              ← Salir
            </button>
          )}
          <span className="text-sm font-semibold" style={{ color: area.color }}>
            {test.title}
          </span>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-3">
          <ProgressBar current={index} total={test.questions.length} color={area.color} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6">
        <QuestionCard
          key={question.id}
          question={question}
          questionNumber={index + 1}
          totalQuestions={test.questions.length}
          showContext={showContext}
          areaColor={area.color}
          savedAnswer={progress?.answers[question.id]}
          onAnswered={handleAnswered}
          onNext={handleNext}
          onPrev={handlePrev}
          isFirst={index === 0}
          isLast={index + 1 === test.questions.length}
        />
      </main>
    </div>
  );
}
