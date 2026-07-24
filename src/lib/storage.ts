/**
 * La persistencia real vive en el store de zustand (`src/store/progress.ts`,
 * middleware `persist` -> localStorage). Este módulo solo centraliza la
 * clave usada, para que el componente de "Reiniciar progreso" y cualquier
 * utilidad de depuración no dupliquen el string mágico.
 */
export const PROGRESS_STORAGE_KEY = "icfes-progress-v1";

export function clearProgressStorage(): void {
  localStorage.removeItem(PROGRESS_STORAGE_KEY);
}
