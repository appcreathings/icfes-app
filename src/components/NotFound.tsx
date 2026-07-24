import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Error 404
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        No encontramos esta página.
      </p>
      <Link to="/" className="mt-4 inline-block text-blue-600 underline dark:text-blue-400">
        Volver al dashboard
      </Link>
    </div>
  );
}
