#!/usr/bin/env bash
#
# Build the book as a static website using mdBook.
#
# Prerequisites:
#   - mdbook (https://rust-lang.github.io/mdBook/guide/installation.html)
#     Install via: cargo install mdbook
#     Or download a binary from: https://github.com/rust-lang/mdBook/releases
#
# Usage:
#   npm run build:web
#   # or directly:
#   bash scripts/build-web.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BOOK_DIR="$PROJECT_ROOT/book"

if ! command -v mdbook &>/dev/null; then
  echo "Error: 'mdbook' is not installed."
  echo ""
  echo "Install mdBook:"
  echo "  cargo install mdbook"
  echo "  # or download from https://github.com/rust-lang/mdBook/releases"
  exit 1
fi

echo "Building website..."

mdbook build "$BOOK_DIR"

echo "Website built: $PROJECT_ROOT/dist/web/"
echo ""
echo "To preview locally:"
echo "  mdbook serve $BOOK_DIR --open"
