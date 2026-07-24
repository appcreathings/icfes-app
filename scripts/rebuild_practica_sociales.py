"""One-off reconstruction of 06_PRACTICA_SOCIALES.pdf questions.

This PDF has a layout bug where pymupdf extracts each 'Pregunta N' block as:
  [OPTIONS for question N-1] + "A.\nB.\nC.\nD." + [STEM for question N]
(the option-label column apparently gets flushed into the text stream one
question late). This script undoes that shift: for sequential block index n
(1-based, in the order 'Pregunta' headers appear), the true stem is block[n]'s
tail (after "A. B. C. D."), and the true options are block[n+1]'s head
(before "A. B. C. D."), split into 4 sentences.

Usage: python rebuild_practica_sociales.py <input.pdf> <output.json>
"""
import json
import re
import sys

import fitz

PREGUNTA_RE = re.compile(r"\nPregunta (\d+)\n")
FURNITURE_RE = re.compile(
    r"^(M[óo]dulo de\s*)?(Cuadernillo de\s*preguntas\s*)?(Prueba\s*Sociales y Ciudadanas\s*)?Saber 11\.?[°º]?\s*2021\s*\d*\s*"
)


def clean(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def split_abcd(block_text: str):
    m = re.search(r"^(.*?)A\.\s*B\.\s*C\.\s*D\.\s*(.*)$", block_text, re.DOTALL)
    if not m:
        return None, None
    return m.group(1).strip(), m.group(2).strip()


def main():
    if len(sys.argv) < 3:
        print("Usage: python rebuild_practica_sociales.py <input.pdf> <output.json>")
        sys.exit(1)
    src, out = sys.argv[1], sys.argv[2]
    d = fitz.open(src)
    full_text = "\n".join(p.get_text() for p in d)

    matches = list(PREGUNTA_RE.finditer(full_text))
    blocks = []
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        before, after = split_abcd(full_text[start:end])
        blocks.append({"before": before, "after": after})

    print(f"Found {len(blocks)} 'Pregunta' blocks")

    questions = {}
    for i in range(len(blocks) - 1):
        n = i + 1  # sequential block number
        stem = clean(FURNITURE_RE.sub("", blocks[i]["after"] or ""))
        opts_raw = blocks[i + 1]["before"] or ""
        parts = [p.strip() for p in re.split(r"(?<=[.?!])\s+(?=[A-ZÁÉÍÓÚÑ¿])", opts_raw) if p.strip()]
        questions[n] = {"stem": stem, "options": parts, "ok": len(parts) == 4}

    ok_count = sum(1 for q in questions.values() if q["ok"])
    print(f"Clean (stem + exactly 4 options): {ok_count} / {len(questions)}")
    bad = [n for n, q in questions.items() if not q["ok"]]
    print("Not clean:", bad)

    with open(out, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
