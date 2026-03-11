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

pandoc \
  --from=markdown+tex_math_dollars+raw_tex+fenced_code_blocks+fenced_code_attributes+backtick_code_blocks+inline_code_attributes \
  --to=pdf \
  --pdf-engine="$PDF_ENGINE" \
  "$BOOK_DIR/metadata.yaml" \
  "$BOOK_DIR/front-matter/preface.md" \
  "$BOOK_DIR/front-matter/notation.md" \
  "${CHAPTERS[@]}" \
  "$BOOK_DIR/back-matter/bibliography.md" \
  --output "$OUTPUT_FILE" \
  --resource-path="$BOOK_DIR:$BOOK_DIR/assets:$PROJECT_ROOT" \
  --highlight-style=tango \
  --top-level-division=chapter

echo "PDF built: $OUTPUT_FILE"
