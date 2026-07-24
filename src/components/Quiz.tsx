import { useMemo, useState } from "react";
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
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const completeTest = useProgressStore((s) => s.completeTest);

  const [index, setIndex] = useState(0);

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

  function handleAnswered(chosen: OptionKey, correct: boolean) {
    if (!test || !question) return;
    recordAttempt(test.id, question.id, chosen, correct);
  }

  function handleNext() {
    if (!test) return;
    if (index + 1 < test.questions.length) {
      setIndex(index + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      completeTest(test);
      navigate(`/test/${test.id}/resultado`);
    }
  }

  function handlePrev() {
    if (index === 0) return;
    setIndex(index - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen pb-16">
      <header
        className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ← Salir
          </Link>
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
