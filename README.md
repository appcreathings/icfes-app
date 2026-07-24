# ICFES App

Simulador de práctica para el examen **Saber 11** (ICFES). Presenta bancos de preguntas oficiales (de cuadernillos y guías EXPLICADAS del ICFES) como quizzes interactivos, con retroalimentación inmediata, seguimiento de progreso por localStorage y un puntaje global estimado.

## Características

- **5 áreas evaluadas**: Lectura Crítica, Matemáticas, Sociales y Ciudadanas, Ciencias Naturales e Inglés, cada una con su peso oficial dentro del puntaje global (LC/Mat/Soc/CN = 3, Inglés = 1).
- **Preguntas con contexto**: soporta lecturas/pasajes compartidos entre preguntas e imágenes recortadas (gráficas, tablas, figuras).
- **Feedback pedagógico**: pista al fallar, explicación al acertar y, cuando el banco lo permite (preguntas "Tier A / EXPLICADAS"), justificación por cada opción.
- **Progreso persistente**: intentos, aciertos "a la primera" e índice de la pregunta actual se guardan en `localStorage` vía `zustand/persist`, así que un test se puede retomar donde quedó.
- **Puntaje estimado**: cálculo transparente y aproximado (no el modelo TRI real del ICFES) del puntaje por área (0-100) y global (0-500), ponderado por área y excluyendo áreas sin practicar.

## Stack técnico

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) como bundler/dev server
- [Tailwind CSS 4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- [React Router](https://reactrouter.com/) (`HashRouter`, apto para hosting estático)
- [Zustand](https://github.com/pmndrs/zustand) para estado + persistencia de progreso
- [Oxlint](https://oxc.rs/) para linting

## Requisitos

- Node.js 20+
- Python 3 (opcional, solo para los scripts de generación/validación de datos en `scripts/`)

## Puesta en marcha

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Arranca el servidor de desarrollo con HMR |
| `npm run build` | Type-checks (`tsc -b`) y genera el build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | Corre Oxlint sobre el proyecto |
| `npm run validate:data` | Valida los JSON de `src/data/tests/` contra el schema de preguntas |

## Estructura del proyecto

```
src/
  components/     UI: Dashboard, Quiz, Results, tarjetas de pregunta/test, etc.
  data/
    areas.ts      Metadatos de las 5 áreas (peso, color, descripción)
    types.ts      Tipos TestDef / Question (schema del banco de preguntas)
    tests/        Un JSON por test (banco de preguntas), + index.ts que los registra
  lib/
    scoring.ts    Modelo de puntaje estimado por área y global
    storage.ts    Clave de localStorage usada por el store de progreso
  store/
    progress.ts   Store de Zustand (persist) con el progreso del usuario
scripts/          Utilidades en Python para extraer/parsear/validar los bancos de preguntas
  a partir de los cuadernillos y guías oficiales del ICFES (PDF -> JSON)
```

## Banco de preguntas

Cada test vive como un archivo JSON en `src/data/tests/` que cumple el schema `TestDef` (`src/data/types.ts`) y se registra manualmente en `src/data/tests/index.ts`. Antes de agregar o modificar un test, corre:

```bash
npm run validate:data
```

Este script verifica campos requeridos, que cada pregunta tenga entre 3 y 4 opciones con claves únicas (`A`-`D`), que la respuesta correcta exista entre las opciones, que los IDs de pregunta sean únicos en todo el banco, y que las imágenes referenciadas existan en `public/images/`.

> Los puntajes que muestra la app son **estimados y con fines motivacionales**: el ICFES real usa un modelo estadístico (TRI) no público que pondera la dificultad de cada pregunta.

## Notas de despliegue

La app usa `HashRouter`, por lo que puede publicarse en cualquier hosting estático (GitHub Pages, Netlify, etc.) sin configuración adicional de rutas del servidor.
