import type { AreaId } from "./areas";

export type OptionKey = "A" | "B" | "C" | "D";

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface Question {
  id: string;
  /** Groups questions that share a reading passage / context block */
  contextId?: string;
  /** Shared passage text (plain text, may contain \n\n for paragraphs) */
  context?: string;
  /** Optional cropped figure/table image, relative to /images/ */
  image?: string;
  /** Alt text for the image, for accessibility */
  imageAlt?: string;
  stem: string;
  options: QuestionOption[];
  answer: OptionKey;
  /** Competencia evaluada (from the official answer key) */
  competency?: string;
  /** Short hint shown when the user answers incorrectly */
  tip: string;
  /** Explanation shown when the user answers correctly */
  explanation: string;
  /** Per-option rationale, mainly available for Tier A (EXPLICADAS) questions */
  optionRationales?: Partial<Record<OptionKey, string>>;
  difficulty?: "baja" | "media" | "alta";
}

export interface TestDef {
  id: string;
  area: AreaId;
  title: string;
  source: string;
  questions: Question[];
}
