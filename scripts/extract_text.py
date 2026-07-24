"""Dump full text of a source PDF to a .txt file for manual transcription/parsing."""
import sys
import fitz

def main():
    if len(sys.argv) < 3:
        print("Usage: python extract_text.py <input.pdf> <output.txt>")
        sys.exit(1)
    src, out = sys.argv[1], sys.argv[2]
    d = fitz.open(src)
    with open(out, "w", encoding="utf-8") as f:
        for i, p in enumerate(d):
            f.write(f"===== PAGE {i+1} =====\n")
            f.write(p.get_text())
            f.write("\n")
    print(f"Wrote {d.page_count} pages to {out}")

if __name__ == "__main__":
    main()
