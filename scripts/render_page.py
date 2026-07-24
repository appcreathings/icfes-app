"""Render a full PDF page to PNG at a given zoom, to eyeball crop coordinates for crop_figure.py."""
import sys
import fitz

def main():
    if len(sys.argv) < 4:
        print("Usage: python render_page.py <input.pdf> <page_1indexed> <output.png> [zoom]")
        sys.exit(1)
    src = sys.argv[1]
    page_no = int(sys.argv[2]) - 1
    out = sys.argv[3]
    zoom = float(sys.argv[4]) if len(sys.argv) > 4 else 2.0

    d = fitz.open(src)
    page = d[page_no]
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    pix.save(out)
    print(f"Saved page {page_no+1} ({page.rect}) -> {out} ({pix.width}x{pix.height})")

if __name__ == "__main__":
    main()
