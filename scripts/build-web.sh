#!/usr/bin/env bash
#
# Build the book as a static website using mdBook, then apply SEO post-processing.
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

# Copy static site assets (e.g. Google Search Console verification file)
if [[ -d "$PROJECT_ROOT/site" ]]; then
  cp -r "$PROJECT_ROOT/site/"* "$PROJECT_ROOT/dist/web/"
fi

# ---------------------------------------------------------------------------
# SEO Post-Processing
# ---------------------------------------------------------------------------
# mdBook does not support per-page canonical URLs, og:url, or sitemap
# generation. This section post-processes the built HTML to add these
# critical SEO signals that Google requires for proper indexing.
# ---------------------------------------------------------------------------

DIST_DIR="$PROJECT_ROOT/dist/web"
BASE_URL="https://amoilanen.github.io/Algorithms-with-Typescript"

echo "Running SEO post-processing..."

# --- 1. Fix <title>, og:title, and twitter:title for the homepage ----------
# mdBook generates "Preface - Algorithms with TypeScript" but Google reads
# raw HTML before executing JS, so fix-title.js alone is insufficient.
for page in "$DIST_DIR/index.html" "$DIST_DIR/preface.html"; do
  if [[ -f "$page" ]]; then
    sed -i 's|<title>Preface - Algorithms with TypeScript</title>|<title>Algorithms with TypeScript — A Free Online Textbook</title>|' "$page"
    sed -i 's|<meta property="og:title" content="Preface - Algorithms with TypeScript">|<meta property="og:title" content="Algorithms with TypeScript — A Free Online Textbook">|' "$page"
    sed -i 's|<meta name="twitter:title" content="Preface - Algorithms with TypeScript">|<meta name="twitter:title" content="Algorithms with TypeScript — A Free Online Textbook">|' "$page"
  fi
done

# --- 2. Add <link rel="canonical"> and <meta property="og:url"> -----------
# Canonical URLs prevent duplicate-content penalties (index.html = preface.html).
# og:url tells social platforms and crawlers the preferred URL.
for html_file in "$DIST_DIR"/*.html; do
  filename=$(basename "$html_file")

  case "$filename" in
    index.html|preface.html)
      canonical_url="${BASE_URL}/"
      ;;
    404.html|print.html)
      continue  # these get noindex below
      ;;
    *)
      canonical_url="${BASE_URL}/${filename}"
      ;;
  esac

  # Insert canonical link after </title>
  sed -i "s|</title>|</title>\n        <link rel=\"canonical\" href=\"${canonical_url}\">|" "$html_file"

  # Insert og:url after og:locale
  sed -i "s|<meta property=\"og:locale\" content=\"en_US\">|<meta property=\"og:locale\" content=\"en_US\">\n<meta property=\"og:url\" content=\"${canonical_url}\">|" "$html_file"
done

# --- 3. Add noindex to pages that should not appear in search results ------
# print.html is a giant duplicate of all content and competes with chapters.
# toc.html and 404.html are low-value navigational pages.
for page in "$DIST_DIR/print.html" "$DIST_DIR/toc.html" "$DIST_DIR/404.html"; do
  if [[ -f "$page" ]]; then
    sed -i 's|<meta name="robots" content="index, follow">|<meta name="robots" content="noindex, nofollow">|' "$page"
    sed -i 's|<meta name="googlebot" content="index, follow[^"]*">|<meta name="googlebot" content="noindex, nofollow">|' "$page"
  fi
done

# --- 4. Generate robots.txt -----------------------------------------------
cat > "$DIST_DIR/robots.txt" << EOF
User-agent: *
Allow: /Algorithms-with-Typescript/

Disallow: /Algorithms-with-Typescript/print.html
Disallow: /Algorithms-with-Typescript/toc.html

Sitemap: ${BASE_URL}/sitemap.xml
EOF

# --- 5. Generate sitemap.xml ----------------------------------------------
BUILD_DATE=$(date +%Y-%m-%d)
cat > "$DIST_DIR/sitemap.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${BUILD_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
EOF

for html_file in "$DIST_DIR"/*.html; do
  filename=$(basename "$html_file")
  case "$filename" in
    index.html|preface.html|404.html|print.html|toc.html)
      continue
      ;;
  esac

  # Chapters get high priority; supplementary pages get medium
  case "$filename" in
    [0-9]*)  priority="0.8" ;;
    *)       priority="0.6" ;;
  esac

  cat >> "$DIST_DIR/sitemap.xml" << EOF
  <url>
    <loc>${BASE_URL}/${filename}</loc>
    <lastmod>${BUILD_DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>
EOF
done

cat >> "$DIST_DIR/sitemap.xml" << 'EOF'
</urlset>
EOF

echo "SEO post-processing complete."
echo ""
echo "Website built: $DIST_DIR/"
echo ""
echo "To preview locally:"
echo "  mdbook serve $BOOK_DIR --open"
