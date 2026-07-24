import type { TestDef } from "../types";

// Cada test se transcribe como un JSON con el schema de `TestDef` y se registra aquí.
// Fase 1: vertical slice (un test por área). Fase 2: segundo test por área + Ciencias Naturales.
import lecturaCritica01 from "./lectura-critica-01.json";
import lecturaCritica02 from "./lectura-critica-02.json";
import lecturaCritica03 from "./lectura-critica-03.json";
import matematicas01 from "./matematicas-01.json";
import matematicas02 from "./matematicas-02.json";
import matematicas03 from "./matematicas-03.json";
import sociales01 from "./sociales-01.json";
import sociales02 from "./sociales-02.json";
import sociales03 from "./sociales-03.json";
import ciencias01 from "./ciencias-01.json";
import ciencias02 from "./ciencias-02.json";
import ciencias03 from "./ciencias-03.json";
import ingles01 from "./ingles-01.json";
import ingles02 from "./ingles-02.json";
import ingles03 from "./ingles-03.json";

export const TESTS: TestDef[] = [
  lecturaCritica01,
  lecturaCritica02,
  lecturaCritica03,
  matematicas01,
  matematicas02,
  matematicas03,
  sociales01,
  sociales02,
  sociales03,
  ciencias01,
  ciencias02,
  ciencias03,
  ingles01,
  ingles02,
  ingles03,
] as TestDef[];

export function getTestById(id: string): TestDef | undefined {
  return TESTS.find((t) => t.id === id);
}
