# Auto

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:
- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Implementation
<!-- chat-id: a5161aab-05cb-4cab-ae5f-9c0470f9787d -->

Two issues fixed:

**1. Broken links (preface, notation, bibliography)**
- Root cause: mdBook `src = "chapters"` but front-matter/back-matter files were outside that directory (`book/front-matter/`, `book/back-matter/`), so mdBook never included them in the build output.
- Fix: Moved `preface.md`, `notation.md`, `bibliography.md` into `book/chapters/`. Updated `SUMMARY.md` paths from `../front-matter/X.md` to `X.md`. Updated `scripts/build-pdf.sh` to reference new locations. Updated `README.md` project structure.

**2. LaTeX not rendering on GitHub Pages**
- Root cause: mdBook's `mathjax-support = true` loads MathJax 2.7.1 with `TeX-AMS-MML_HTMLorMML` config, which does NOT support `$...$` delimiters by default. The book uses `$...$` throughout.
- Fix: Replaced MathJax with `mdbook-katex` preprocessor which pre-renders LaTeX to HTML at build time and natively supports `$` delimiters. Removed `mathjax-support = true` from `book.toml`, added `[preprocessor.katex]` section. Added `mdbook-katex` install step to CI workflow (`deploy.yml`).

Files changed:
- `book/chapters/SUMMARY.md` — updated link paths
- `book/chapters/preface.md` — moved from `book/front-matter/`
- `book/chapters/notation.md` — moved from `book/front-matter/`
- `book/chapters/bibliography.md` — moved from `book/back-matter/`
- `book/book.toml` — removed mathjax, added katex preprocessor
- `scripts/build-pdf.sh` — updated file paths
- `.github/workflows/deploy.yml` — added mdbook-katex install step
- `README.md` — updated project structure description
