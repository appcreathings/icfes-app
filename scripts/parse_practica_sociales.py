"""Structural parser for the '06_PRACTICA_SOCIALES.pdf' layout, which differs from the
standard cuadernillo: each question ends with ONE text block containing its 4 option
paragraphs back-to-back (each ending in a period immediately followed by a newline,
even when the option text itself wraps across lines), followed by a separate block
with the literal "A.\nB.\nC.\nD." labels (apparently a side column that gets extracted
after the option text in reading order).

Strategy: use page.get_text('blocks') (paragraph-level blocks, which keep a wrapped
option's lines together) instead of the flat line-based text, then split the options
block on "period immediately followed by newline" -- word-wrap line breaks occur after
a space, not directly after a period, so this reliably separates the 4 options even
when individual options span multiple lines.

Usage: python parse_practica_sociales.py <input.pdf> <output.json>
"""
import json
import re
import sys

import fitz

LABEL_BLOCK_RE = re.compile(r"^(?:[A-D]\.\s*\n?)+$")
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.…])\n")


def clean(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def main():
    if len(sys.argv) < 3:
        print("Usage: python parse_practica_sociales.py <input.pdf> <output.json>")
        sys.exit(1)
    src, out = sys.argv[1], sys.argv[2]
    d = fitz.open(src)

    # Flatten all blocks across all pages, in order, as (text,) tuples.
    all_blocks = []
    for page in d:
        for b in page.get_text("blocks"):
            all_blocks.append(b[4])

    questions = []
    current = None
    i = 0
    while i < len(all_blocks):
        block = all_blocks[i]
        m = re.match(r"^Pregunta (\d+)\s*$", block.strip())
        if m:
            if current:
                questions.append(current)
            current = {"number": int(m.group(1)), "text_blocks": []}
            i += 1
            continue

        if current is not None:
            if LABEL_BLOCK_RE.match(block.strip()) and block.strip():
                # This is the "A.\nB.\nC.\nD." label block: the PRECEDING accumulated
                # block is the options block; everything before that is the stem.
                if current["text_blocks"]:
                    options_raw = current["text_blocks"].pop()
                    parts = [p.strip() for p in SENTENCE_SPLIT_RE.split(options_raw) if p.strip()]
                    if len(parts) == 4:
                        current["options"] = dict(zip("ABCD", (clean(p) for p in parts)))
                    else:
                        current["options"] = {}
                        current["incomplete"] = True
                    current["stem"] = clean(" ".join(current["text_blocks"]))
                    current["text_blocks"] = []
                questions.append(current)
                current = None
                i += 1
                continue
            else:
                current["text_blocks"].append(block)
        i += 1

    if current:
        questions.append(current)

    for q in questions:
        q.pop("text_blocks", None)
        if "options" not in q:
            q["options"] = {}
            q["incomplete"] = True

    with open(out, "w", encoding="utf-8") as f:
        json.dump({"questions": questions}, f, ensure_ascii=False, indent=2)

    print(f"Parsed {len(questions)} question blocks -> {out}")
    incomplete = [q["number"] for q in questions if q.get("incomplete")]
    if incomplete:
        print(f"WARNING: could not parse options for questions: {incomplete}")


if __name__ == "__main__":
    main()
