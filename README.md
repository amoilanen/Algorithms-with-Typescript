# Algorithms with TypeScript

A comprehensive book on data structures and algorithms, with tested TypeScript implementations. Covers the core curriculum of an undergraduate algorithms course - from sorting and searching through graph algorithms, dynamic programming, and computational complexity.

* Read online at http://amoilanen.github.io/Algorithms-with-Typescript
* PDF http://amoilanen.github.io/Algorithms-with-Typescript/algorithms-with-typescript.pdf

## Contents

The book is organized into six parts across 22 chapters:

| Part | Chapters | Topics |
|------|----------|--------|
| I. Foundations | 1--3 | Algorithms, analysis, recursion, divide-and-conquer |
| II. Sorting and Selection | 4--6 | Elementary sorts, efficient sorts, linear-time sorts, selection |
| III. Data Structures | 7--11 | Lists, stacks, queues, hash tables, trees, BSTs, heaps |
| IV. Graph Algorithms | 12--15 | Traversal, shortest paths, MSTs, network flow |
| V. Design Techniques | 16--17 | Dynamic programming, greedy algorithms |
| VI. Advanced Topics | 18--22 | Union-find, tries, string matching, NP-completeness, approximation |

Every algorithm discussed in the book is implemented in TypeScript under `src/` and tested under `tests/`.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Pandoc](https://pandoc.org/installing.html) >= 3.0 (for PDF build)
- A LaTeX distribution with XeLaTeX, or [Tectonic](https://tectonic-typesetting.github.io/) (for PDF build)
- [DejaVu fonts](https://dejavu-fonts.github.io/) (for PDF build)
- [mdBook](https://rust-lang.github.io/mdBook/guide/installation.html) (for website build)

## Quick start

```bash
# Install dependencies
npm install

# Run the test suite
npm test

# Type-check all implementations
npm run typecheck

# Lint and format
npm run lint
npm run format:check
```

## Building the book

### PDF

Requires Pandoc and a LaTeX engine (XeLaTeX or Tectonic):

```bash
# Arch Linux
sudo pacman -S pandoc texlive-xetex texlive-latexextra texlive-fontsrecommended ttf-dejavu

# Debian / Ubuntu
sudo apt install pandoc texlive-xetex texlive-latex-extra texlive-fonts-recommended fonts-dejavu

# macOS (with Homebrew)
brew install pandoc
brew install --cask mactex
brew install font-dejavu

# Build the PDF
npm run build:pdf
```

The PDF is written to `dist/pdf/algorithms-with-typescript.pdf`.

### Website

Requires mdBook:

```bash
# Install mdBook
cargo install mdbook
# or download a binary from https://github.com/rust-lang/mdBook/releases

# Build the static site
npm run build:web

# Preview locally
mdbook serve book --open
```

The website is written to `dist/web/`.

## Deployment

The website is automatically deployed to [GitHub Pages](https://amoilanen.github.io/Algorithms-with-TypeScript/) on every push to `master` via the GitHub Actions workflow in `.github/workflows/deploy.yml`.

## Project structure

```
src/                   TypeScript implementations, organized by chapter
tests/                 Vitest test suite, mirroring src/ structure
book/
  chapters/            Markdown source for all 22 chapters, preface, notation, and bibliography
  metadata.yaml        Pandoc/LaTeX configuration for PDF
  book.toml            mdBook configuration for the website
scripts/
  build-pdf.sh         PDF build script (Pandoc + XeLaTeX/Tectonic)
  build-web.sh         Website build script (mdBook)
```

## npm scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run the full test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run lint` | Lint with ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |
| `npm run build:pdf` | Build the PDF |
| `npm run build:web` | Build the website |

## License

MIT
