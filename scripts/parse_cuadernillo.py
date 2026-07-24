"""Best-effort structural parser for Icfes 'Cuadernillo de preguntas' PDFs.

These booklets follow a consistent pattern:
  - Optional shared passage introduced by a line like
    "RESPONDE LAS PREGUNTAS 1 A 3 DE ACUERDO CON LA SIGUIENTE INFORMACIÓN"
  - "Pregunta N" header
  - Stem text
  - Four options, each starting with "A.\t", "B.\t", "C.\t", "D.\t" (real tab char)

It also parses the trailing "Tabla de respuestas correctas" pages, which list
per-question: position number, competencia/afirmación evaluada, and the
correct answer letter.

Output is a draft JSON array (list of dicts with number/stem/options/context/
answer/competency) written for human review -- this is a transcription aid,
NOT a fully automatic pipeline. A person must still spot-check the parse
against the source PDF, write `tip`/`explanation` text, and flag any
question that depends on a figure (so it can be cropped with crop_figure.py
instead of relying on garbled text extraction).

Usage: python parse_cuadernillo.py <input.pdf> <output.json>
"""
import json
import re
import sys

import fitz

PREGUNTA_RE = re.compile(r"\nPregunta (\d+)\n")
OPTION_RE = re.compile(r"([A-D])\.\t")
CONTEXT_HEADER_RE = re.compile(
    r"RESPOND[EA]\s+LAS?\s+PREGUNTAS?\s+(\d+)\s*(?:A|Y)\s*(\d+)?\s+DE ACUERDO\s+CON\s+(?:LA SIGUIENTE INFORMACI[ÓO]N|EL SIGUIENTE (?:CONTEXTO|TEXTO|GR[ÁA]FICO))",
    re.IGNORECASE,
)


PAGE_NOISE_RE = re.compile(
    r"^(Cuadernillo de preguntas|Prueba [A-Za-zÁÉÍÓÚáéíóúñÑ ]+|\d{1,3})$", re.MULTILINE
)


def strip_page_noise(text: str) -> str:
    """Removes repeating page headers/footers ('Cuadernillo de preguntas', 'Prueba X', bare page numbers)."""
    return PAGE_NOISE_RE.sub("", text)


def clean(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def parse_questions(full_text: str):
    """Returns list of {number, stem, options: {A..D: text}}.

    Each question block is truncated at the next 'Pregunta N' OR the next
    context-header marker, whichever comes first -- this prevents a shared
    passage that follows a question from leaking into that question's last
    option (a passage belongs to the *next* group of questions, not the
    previous one).
    """
    q_matches = list(PREGUNTA_RE.finditer(full_text))
    ctx_matches = list(CONTEXT_HEADER_RE.finditer(full_text))
    boundary_positions = sorted(m.start() for m in q_matches) + [m.start() for m in ctx_matches]
    boundary_positions.append(len(full_text))

    questions = []
    for i, m in enumerate(q_matches):
        num = int(m.group(1))
        start = m.end()
        end = min((p for p in boundary_positions if p > start), default=len(full_text))
        block = full_text[start:end]

        opt_matches = list(OPTION_RE.finditer(block))
        if len(opt_matches) < 4:
            questions.append({"number": num, "stem": clean(block), "options": {}, "incomplete": True})
            continue

        stem = clean(block[: opt_matches[0].start()])
        options = {}
        for j, om in enumerate(opt_matches):
            letter = om.group(1)
            text_start = om.end()
            text_end = opt_matches[j + 1].start() if j + 1 < len(opt_matches) else len(block)
            options[letter] = clean(block[text_start:text_end])

        questions.append({"number": num, "stem": stem, "options": options})
    return questions


def parse_context_headers(full_text: str):
    """Returns list of (start_q, end_q, context_text) for each shared-passage marker."""
    q_starts = [m.start() for m in PREGUNTA_RE.finditer(full_text)]
    ctx_matches = list(CONTEXT_HEADER_RE.finditer(full_text))
    ranges = []
    for i, m in enumerate(ctx_matches):
        start_q = int(m.group(1))
        end_q = int(m.group(2)) if m.group(2) else start_q
        text_start = m.end()
        next_q_start = next((p for p in q_starts if p > text_start), len(full_text))
        context_text = clean(full_text[text_start:next_q_start])
        ranges.append({"start_q": start_q, "end_q": end_q, "context": context_text})
    return ranges


def main():
    if len(sys.argv) < 3:
        print("Usage: python parse_cuadernillo.py <input.pdf> <output.json>")
        sys.exit(1)
    src, out = sys.argv[1], sys.argv[2]
    d = fitz.open(src)
    full_text = "\n".join(p.get_text() for p in d)
    full_text = strip_page_noise(full_text)

    questions = parse_questions(full_text)
    ranges = parse_context_headers(full_text)

    with open(out, "w", encoding="utf-8") as f:
        json.dump({"questions": questions, "context_ranges": ranges}, f, ensure_ascii=False, indent=2)

    print(f"Parsed {len(questions)} question blocks, {len(ranges)} context headers -> {out}")
    incomplete = [q["number"] for q in questions if q.get("incomplete")]
    if incomplete:
        print(f"WARNING: could not find 4 options for questions: {incomplete}")


if __name__ == "__main__":
    main()
