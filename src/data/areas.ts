export type AreaId =
  | "lectura-critica"
  | "matematicas"
  | "sociales"
  | "ciencias"
  | "ingles";

export interface AreaMeta {
  id: AreaId;
  label: string;
  shortLabel: string;
  /** Peso oficial del área en el puntaje global Saber 11 (LC/Mat/Soc/CN = 3, Ing = 1) */
  weight: number;
  color: string; // tailwind color token defined in index.css theme
  description: string;
}

export const AREAS: Record<AreaId, AreaMeta> = {
  "lectura-critica": {
    id: "lectura-critica",
    label: "Lectura Crítica",
    shortLabel: "L. Crítica",
    weight: 3,
    color: "var(--color-lc)",
    description: "Comprensión, análisis y evaluación de textos.",
  },
  matematicas: {
    id: "matematicas",
    label: "Matemáticas",
    shortLabel: "Matemáticas",
    weight: 3,
    color: "var(--color-mat)",
    description: "Razonamiento cuantitativo y resolución de problemas.",
  },
  sociales: {
    id: "sociales",
    label: "Sociales y Ciudadanas",
    shortLabel: "Sociales",
    weight: 3,
    color: "var(--color-soc)",
    description: "Pensamiento social y competencias ciudadanas.",
  },
  ciencias: {
    id: "ciencias",
    label: "Ciencias Naturales",
    shortLabel: "C. Naturales",
    weight: 3,
    color: "var(--color-cn)",
    description: "Indagación y explicación de fenómenos naturales.",
  },
  ingles: {
    id: "ingles",
    label: "Inglés",
    shortLabel: "Inglés",
    weight: 1,
    color: "var(--color-ing)",
    description: "Comprensión de lectura y uso del idioma inglés.",
  },
};

export const AREA_ORDER: AreaId[] = [
  "lectura-critica",
  "matematicas",
  "sociales",
  "ciencias",
  "ingles",
];
