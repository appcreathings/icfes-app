"""Validates every test JSON in src/data/tests/ against the app's Question schema.

Checks:
  - required fields present (id, area, title, source, questions)
  - each question has 3-4 options with unique keys from {A,B,C,D}
  - question.answer is one of its own option keys
  - question ids are globally unique across all tests
  - referenced images exist in public/images/
  - test id matches its filename

Usage: python validate_data.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TESTS_DIR = ROOT / "src" / "data" / "tests"
IMAGES_DIR = ROOT / "public" / "images"
VALID_AREAS = {"lectura-critica", "matematicas", "sociales", "ciencias", "ingles"}


def main():
    errors = []
    seen_question_ids = {}
    test_files = sorted(TESTS_DIR.glob("*.json"))

    if not test_files:
        print("No test JSON files found in", TESTS_DIR)
        sys.exit(1)

    for path in test_files:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            errors.append(f"{path.name}: invalid JSON ({e})")
            continue

        if data.get("id") != path.stem:
            errors.append(f"{path.name}: test id '{data.get('id')}' does not match filename")

        if data.get("area") not in VALID_AREAS:
            errors.append(f"{path.name}: invalid area '{data.get('area')}'")

        for field in ("title", "source"):
            if not data.get(field):
                errors.append(f"{path.name}: missing '{field}'")

        questions = data.get("questions", [])
        if not questions:
            errors.append(f"{path.name}: no questions")

        for q in questions:
            qid = q.get("id")
            loc = f"{path.name} / {qid}"

            if not qid:
                errors.append(f"{path.name}: question missing 'id'")
            elif qid in seen_question_ids:
                errors.append(f"{loc}: duplicate question id (also in {seen_question_ids[qid]})")
            else:
                seen_question_ids[qid] = path.name

            if not q.get("stem"):
                errors.append(f"{loc}: missing 'stem'")
            if not q.get("tip"):
                errors.append(f"{loc}: missing 'tip'")
            if not q.get("explanation"):
                errors.append(f"{loc}: missing 'explanation'")

            options = q.get("options", [])
            keys = [o.get("key") for o in options]
            if len(keys) not in (3, 4):
                errors.append(f"{loc}: expected 3 or 4 options, got {len(keys)}")
            if len(set(keys)) != len(keys):
                errors.append(f"{loc}: duplicate option keys {keys}")
            if not set(keys).issubset({"A", "B", "C", "D"}):
                errors.append(f"{loc}: option keys must be within A-D, got {keys}")
            for o in options:
                if not o.get("text", "").strip():
                    errors.append(f"{loc}: option {o.get('key')} has empty text")

            answer = q.get("answer")
            if answer not in keys:
                errors.append(f"{loc}: answer '{answer}' not among option keys {keys}")

            image = q.get("image")
            if image:
                img_path = IMAGES_DIR / image
                if not img_path.exists():
                    errors.append(f"{loc}: referenced image '{image}' not found in public/images/")

            rationales = q.get("optionRationales")
            if rationales:
                for k in rationales:
                    if k not in keys:
                        errors.append(f"{loc}: optionRationales has key '{k}' not in options")
                    if k == answer:
                        errors.append(f"{loc}: optionRationales should only cover WRONG options, but includes the answer '{k}'")

        print(f"{path.name}: {len(questions)} questions")

    print()
    if errors:
        print(f"FAILED with {len(errors)} error(s):")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    else:
        total = sum(len(json.loads(p.read_text(encoding='utf-8'))['questions']) for p in test_files)
        print(f"OK: {len(test_files)} test(s), {total} questions total, no errors.")


if __name__ == "__main__":
    main()
