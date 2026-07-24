"""Crop a rectangular region of a PDF page to a PNG for questions that depend on a figure/table.

Usage: python crop_figure.py <input.pdf> <page_1indexed> <x0> <y0> <x1> <y1> <output.png> [zoom]
Coordinates are in PDF points (page.rect), as seen via `page.get_text('dict')` bounding boxes
or by rendering the full page first (see render_page.py) to eyeball the crop box.
"""
import sys
import fitz

def main():
    if len(sys.argv) < 8:
        print("Usage: python crop_figure.py <input.pdf> <page_1indexed> <x0> <y0> <x1> <y1> <output.png> [zoom]")
        sys.exit(1)
    src = sys.argv[1]
    page_no = int(sys.argv[2]) - 1
    x0, y0, x1, y1 = (float(v) for v in sys.argv[3:7])
    out = sys.argv[7]
    zoom = float(sys.argv[8]) if len(sys.argv) > 8 else 2.5

    d = fitz.open(src)
    page = d[page_no]
    clip = fitz.Rect(x0, y0, x1, y1)
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, clip=clip)
    pix.save(out)
    print(f"Saved crop {clip} from page {page_no+1} -> {out} ({pix.width}x{pix.height})")

if __name__ == "__main__":
    main()
