import { useState } from "react";
import { useProgressStore } from "../store/progress";

export function ResetButton() {
  const [confirming, setConfirming] = useState(false);
  const resetAll = useProgressStore((s) => s.resetAll);

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500 dark:text-slate-400">¿Borrar todo el progreso?</span>
        <button
          type="button"
          onClick={() => {
            resetAll();
            setConfirming(false);
          }}
          className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700"
        >
          Sí, reiniciar
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg px-3 py-1.5 font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm font-medium text-slate-400 underline-offset-2 hover:text-red-600 hover:underline dark:text-slate-500 dark:hover:text-red-400"
    >
      Reiniciar progreso
    </button>
  );
}
