#!/usr/bin/env bash
#
# Build the book as a PDF using Pandoc + a LaTeX engine (XeLaTeX or Tectonic).
#
# Prerequisites:
#   - pandoc (https://pandoc.org/installing.html)
#   - One of:
#     - xelatex (texlive-xetex + texlive-latex-extra + texlive-fonts-recommended)
#     - tectonic (https://tectonic-typesetting.github.io/ — self-contained, no texlive needed)
#   - DejaVu fonts (fonts-dejavu on Debian/Ubuntu, or install from https://dejavu-fonts.github.io/)
#   - For SVG figures: rsvg-convert (librsvg2-bin on Debian/Ubuntu, librsvg on Arch)
#     or inkscape as a fallback
#
# Usage:
#   npm run build:pdf
#   # or directly:
#   bash scripts/build-pdf.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BOOK_DIR="$PROJECT_ROOT/book"
OUTPUT_DIR="$PROJECT_ROOT/dist/pdf"
OUTPUT_FILE="$OUTPUT_DIR/algorithms-with-typescript.pdf"

# Check for pandoc
if ! command -v pandoc &>/dev/null; then
  echo "Error: 'pandoc' is not installed."
  echo ""
  echo "Install pandoc: https://pandoc.org/installing.html"
  exit 1
fi

# Select PDF engine: prefer xelatex, fall back to tectonic
PDF_ENGINE=""
if command -v xelatex &>/dev/null; then
  PDF_ENGINE="xelatex"
elif command -v tectonic &>/dev/null; then
  PDF_ENGINE="tectonic"
else
  echo "Error: No LaTeX engine found. Install one of:"
  echo "  xelatex:  sudo pacman -S texlive-xetex texlive-latexextra texlive-fontsrecommended"
  echo "            # or: sudo apt install texlive-xetex texlive-latex-extra texlive-fonts-recommended"
  echo "  tectonic: cargo install tectonic"
  echo "            # or download from https://tectonic-typesetting.github.io/"
  exit 1
fi

echo "Using PDF engine: $PDF_ENGINE"

mkdir -p "$OUTPUT_DIR"

# Collect chapter files in order
CHAPTERS=()
for ch in "$BOOK_DIR/chapters"/[0-9][0-9]-*.md; do
  [ -f "$ch" ] && CHAPTERS+=("$ch")
done

if [ ${#CHAPTERS[@]} -eq 0 ]; then
  echo "Error: No chapter files found in $BOOK_DIR/chapters/"
  exit 1
fi

echo "Building PDF..."
echo "  Chapters: ${#CHAPTERS[@]}"

# --- Convert SVG figures to PDF for LaTeX embedding ---
# LaTeX cannot embed SVG directly; convert each .svg to .pdf using rsvg-convert.
FIGURES_DIR="$BOOK_DIR/chapters/figures"
if [ -d "$FIGURES_DIR" ]; then
  SVG_COUNT=0
  for svg in "$FIGURES_DIR"/*.svg; do
    [ -f "$svg" ] || continue
    pdf="${svg%.svg}.pdf"
    # Re-convert only if the SVG is newer than the PDF (or PDF doesn't exist)
    if [ ! -f "$pdf" ] || [ "$svg" -nt "$pdf" ]; then
      if command -v rsvg-convert &>/dev/null; then
        rsvg-convert -f pdf -o "$pdf" "$svg"
        SVG_COUNT=$((SVG_COUNT + 1))
      elif command -v inkscape &>/dev/null; then
        inkscape "$svg" --export-type=pdf --export-filename="$pdf" 2>/dev/null
        SVG_COUNT=$((SVG_COUNT + 1))
      else
        echo "Warning: Cannot convert $svg to PDF."
        echo "  Install rsvg-convert (librsvg) or inkscape to include SVG figures in the PDF."
      fi
    fi
  done
  if [ "$SVG_COUNT" -gt 0 ]; then
    echo "  Converted $SVG_COUNT SVG figure(s) to PDF"
  fi
fi

pandoc \
  --from=markdown+tex_math_dollars+raw_tex+fenced_code_blocks+fenced_code_attributes+backtick_code_blocks+inline_code_attributes \
  --to=pdf \
  --pdf-engine="$PDF_ENGINE" \
  "$BOOK_DIR/metadata.yaml" \
  "$BOOK_DIR/chapters/preface.md" \
  "$BOOK_DIR/chapters/notation.md" \
  "${CHAPTERS[@]}" \
  "$BOOK_DIR/chapters/bibliography.md" \
  --output "$OUTPUT_FILE" \
  --resource-path="$BOOK_DIR:$BOOK_DIR/chapters:$BOOK_DIR/assets:$PROJECT_ROOT" \
  --lua-filter="$BOOK_DIR/filters/svg-to-pdf.lua" \
  --highlight-style=tango \
  --top-level-division=chapter

echo "PDF built: $OUTPUT_FILE"
