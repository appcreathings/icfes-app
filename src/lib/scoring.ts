import { AREA_ORDER, AREAS, type AreaId } from "../data/areas";

/**
 * Modelo de puntaje APROXIMADO, con fines motivacionales.
 *
 * El ICFES real calcula los puntajes de área (0-100) y el puntaje global (0-500)
 * con un modelo estadístico (TRI / IRT) que pondera la dificultad de cada
 * pregunta y no es público. Aquí usamos una aproximación simple y transparente:
 * el % de aciertos "a la primera" en las preguntas practicadas, mapeado
 * linealmente a la escala 0-100 del área.
 *
 * Toda la UI debe rotular estos valores como "estimado" / "aproximado".
 */

/** Convierte una fracción de aciertos [0,1] al puntaje estimado de área (0-100). */
export function estimateAreaScore(firstTryCorrect: number, total: number): number {
  if (total <= 0) return 0;
  const pct = clamp(firstTryCorrect / total, 0, 1);
  return Math.round(pct * 100);
}

/**
 * Puntaje global estimado (0-500), usando los pesos oficiales del examen
 * Saber 11 (Lectura Crítica, Matemáticas, Sociales y Ciudadanas, Ciencias
 * Naturales = 3; Inglés = 1), normalizado sobre la suma de pesos (13) y
 * escalado a 500.
 *
 * Áreas sin ningún test completado se excluyen del cálculo (no se asume 0),
 * y se re-normaliza sobre los pesos de las áreas presentes para no castigar
 * al usuario por no haber practicado todavía una materia.
 */
export function estimateGlobalScore(areaScores: Partial<Record<AreaId, number>>): {
  score: number | null;
  areasCounted: AreaId[];
} {
  let weightedSum = 0;
  let weightTotal = 0;
  const areasCounted: AreaId[] = [];

  for (const area of AREA_ORDER) {
    const score = areaScores[area];
    if (score === undefined || score === null) continue;
    const weight = AREAS[area].weight;
    weightedSum += score * weight;
    weightTotal += weight;
    areasCounted.push(area);
  }

  if (weightTotal === 0) return { score: null, areasCounted };

  // weightedSum/weightTotal is on a 0-100 scale; scale to 0-500.
  const score = Math.round((weightedSum / weightTotal) * 5);
  return { score, areasCounted };
}

export interface MotivationalMessage {
  label: string;
  emoji: string;
  tone: "excellent" | "good" | "ok" | "keep-going";
}

/** Mensaje motivador según el puntaje de área (0-100) o global normalizado a 0-100. */
export function motivationalMessage(scoreOn100: number): MotivationalMessage {
  if (scoreOn100 >= 90) return { label: "¡Excelente nivel!", emoji: "🏆", tone: "excellent" };
  if (scoreOn100 >= 70) return { label: "¡Muy bien, vas sólido!", emoji: "💪", tone: "good" };
  if (scoreOn100 >= 50) return { label: "Vas bien, sigue así", emoji: "🙂", tone: "ok" };
  return { label: "Sigue practicando, vas a mejorar", emoji: "📚", tone: "keep-going" };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
