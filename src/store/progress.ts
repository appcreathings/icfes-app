import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { OptionKey, TestDef } from "../data/types";
import { estimateAreaScore } from "../lib/scoring";

export interface QuestionAnswerState {
  firstTryCorrect: boolean;
  attempts: number;
  chosen: OptionKey; // last chosen option (the correct one, once solved)
}

export interface TestProgress {
  answers: Record<string, QuestionAnswerState>;
  completed: boolean;
  firstTryCorrect: number;
  total: number;
  areaScoreEstimate: number;
  completedAt?: string;
  updatedAt: string;
}

interface ProgressState {
  tests: Record<string, TestProgress>;
  /** Registers an answer attempt for a question within a test. */
  recordAttempt: (testId: string, questionId: string, chosen: OptionKey, isCorrect: boolean) => void;
  /** Finalizes a test: recomputes aggregate stats and marks it completed. */
  completeTest: (test: TestDef) => void;
  /** Returns progress for a given test id, if any. */
  getTestProgress: (testId: string) => TestProgress | undefined;
  resetAll: () => void;
  resetTest: (testId: string) => void;
}

const STORAGE_KEY = "icfes-progress-v1";

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      tests: {},

      recordAttempt: (testId, questionId, chosen, isCorrect) => {
        set((state) => {
          const existing = state.tests[testId];
          const answers = { ...(existing?.answers ?? {}) };
          const prev = answers[questionId];

          if (prev?.firstTryCorrect) {
            // Already solved correctly on first try previously; nothing to change.
            return state;
          }

          if (isCorrect) {
            answers[questionId] = {
              firstTryCorrect: !prev, // correct AND no prior attempts recorded => first try
              attempts: (prev?.attempts ?? 0) + 1,
              chosen,
            };
          } else {
            answers[questionId] = {
              firstTryCorrect: false,
              attempts: (prev?.attempts ?? 0) + 1,
              chosen,
            };
          }

          return {
            tests: {
              ...state.tests,
              [testId]: {
                answers,
                completed: existing?.completed ?? false,
                firstTryCorrect: existing?.firstTryCorrect ?? 0,
                total: existing?.total ?? 0,
                areaScoreEstimate: existing?.areaScoreEstimate ?? 0,
                completedAt: existing?.completedAt,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      completeTest: (test) => {
        set((state) => {
          const existing = state.tests[test.id];
          const answers = existing?.answers ?? {};
          const firstTryCorrect = test.questions.filter(
            (q) => answers[q.id]?.firstTryCorrect
          ).length;
          const total = test.questions.length;
          const areaScoreEstimate = estimateAreaScore(firstTryCorrect, total);

          return {
            tests: {
              ...state.tests,
              [test.id]: {
                answers,
                completed: true,
                firstTryCorrect,
                total,
                areaScoreEstimate,
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      getTestProgress: (testId) => get().tests[testId],

      resetAll: () => set({ tests: {} }),

      resetTest: (testId) =>
        set((state) => {
          const next = { ...state.tests };
          delete next[testId];
          return { tests: next };
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
