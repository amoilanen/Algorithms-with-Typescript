# Technical Specification: Algorithms with TypeScript

## 1. Technical Context

### 1.1 Current State

| Aspect | Current | Target |
|--------|---------|--------|
| Language | JavaScript ES6 (Babel transpilation) | TypeScript 5.x, strict mode, ESM |
| Test framework | Karma + Jasmine + PhantomJS | Vitest |
| Linting | ESLint (basic) | ESLint + @typescript-eslint + Prettier |
| Module system | UMD (via Babel plugin) | Native ESM |
| Build (book) | Custom Node.js script (shelljs + chokidar + Pandoc) | Pandoc CLI for PDF; mdBook for static website |
| Package manager | npm | npm |
| Deployment | None | Google Cloud Storage + Cloud CDN |

### 1.2 Key Dependencies (Target)

**Runtime / Build:**
- TypeScript ^5.7
- Node.js >= 20 LTS

**Testing:**
- Vitest ^3.x (native TS support, ESM, fast, watch mode)

**Linting / Formatting:**
- ESLint ^9 (flat config) with @typescript-eslint
- Prettier ^3

**Book - PDF:**
- Pandoc >= 3.1 (Markdown -> LaTeX -> PDF)
- TeX Live (or TinyTeX) for LaTeX backend
- pandoc-crossref for figure/equation/section cross-references

**Book - Website:**
- mdBook (Rust-based static site generator for technical books)
  - Rationale: purpose-built for technical books, produces static HTML, has built-in search, chapter navigation, theming, and MathJax/KaTeX support out of the box. No JavaScript framework overhead. Pandoc Markdown compatibility is high.
  - Alternative considered: Astro — more flexible but more complex to configure for a book-style layout. mdBook provides the book UX (sidebar TOC, prev/next navigation, search) with zero custom code.

**Deployment:**
- Google Cloud SDK (`gcloud`)
- `gsutil` for Cloud Storage uploads

---

## 2. Project Structure

```
algorithms-with-typescript/
├── src/                              # TypeScript algorithm/data structure implementations
│   ├── 01-foundations/
│   │   ├── max.ts
│   │   ├── sieve-of-eratosthenes.ts
│   │   └── index.ts                  # Re-exports
│   ├── 02-analysis/                  # (Chapter 2 has no code implementations)
│   ├── 03-recursion-and-divide-and-conquer/
│   │   ├── binary-search.ts
│   │   ├── pow.ts
│   │   ├── gcd.ts
│   │   ├── closest-pair.ts
│   │   └── index.ts
│   ├── 04-elementary-sorting/
│   │   ├── bubble-sort.ts
│   │   ├── selection-sort.ts
│   │   ├── insertion-sort.ts
│   │   └── index.ts
│   ├── 05-efficient-sorting/
│   │   ├── merge-sort.ts
│   │   ├── quick-sort.ts
│   │   ├── heap-sort.ts
│   │   ├── randomized-quick-sort.ts
│   │   └── index.ts
│   ├── 06-linear-time-sorting-and-selection/
│   │   ├── counting-sort.ts
│   │   ├── radix-sort.ts
│   │   ├── bucket-sort.ts
│   │   ├── quickselect.ts
│   │   ├── median-of-medians.ts
│   │   └── index.ts
│   ├── 07-arrays-linked-lists-stacks-queues/
│   │   ├── dynamic-array.ts
│   │   ├── singly-linked-list.ts
│   │   ├── doubly-linked-list.ts
│   │   ├── stack.ts
│   │   ├── queue.ts
│   │   ├── deque.ts
│   │   └── index.ts
│   ├── 08-hash-tables/
│   │   ├── hash-table-chaining.ts
│   │   ├── hash-table-open-addressing.ts
│   │   └── index.ts
│   ├── 09-trees-and-bst/
│   │   ├── binary-tree.ts
│   │   ├── binary-search-tree.ts
│   │   └── index.ts
│   ├── 10-balanced-search-trees/
│   │   ├── avl-tree.ts
│   │   ├── red-black-tree.ts
│   │   └── index.ts
│   ├── 11-heaps-and-priority-queues/
│   │   ├── binary-heap.ts
│   │   ├── priority-queue.ts
│   │   └── index.ts
│   ├── 12-graphs-and-traversal/
│   │   ├── graph.ts               # Adjacency list and adjacency matrix
│   │   ├── bfs.ts
│   │   ├── dfs.ts
│   │   ├── topological-sort.ts
│   │   ├── cycle-detection.ts
│   │   └── index.ts
│   ├── 13-shortest-paths/
│   │   ├── dijkstra.ts
│   │   ├── bellman-ford.ts
│   │   ├── dag-shortest-paths.ts
│   │   ├── floyd-warshall.ts
│   │   └── index.ts
│   ├── 14-minimum-spanning-trees/
│   │   ├── kruskal.ts
│   │   ├── prim.ts
│   │   └── index.ts
│   ├── 15-network-flow/
│   │   ├── edmonds-karp.ts
│   │   ├── bipartite-matching.ts
│   │   └── index.ts
│   ├── 16-dynamic-programming/
│   │   ├── fibonacci.ts
│   │   ├── coin-change.ts
│   │   ├── lcs.ts
│   │   ├── edit-distance.ts
│   │   ├── knapsack.ts
│   │   ├── matrix-chain.ts
│   │   ├── lis.ts
│   │   └── index.ts
│   ├── 17-greedy-algorithms/
│   │   ├── interval-scheduling.ts
│   │   ├── huffman.ts
│   │   ├── fractional-knapsack.ts
│   │   └── index.ts
│   ├── 18-disjoint-sets/
│   │   ├── union-find.ts
│   │   └── index.ts
│   ├── 19-tries-and-string-data-structures/
│   │   ├── trie.ts
│   │   ├── compressed-trie.ts
│   │   └── index.ts
│   ├── 20-string-matching/
│   │   ├── naive-matching.ts
│   │   ├── rabin-karp.ts
│   │   ├── kmp.ts
│   │   └── index.ts
│   ├── 21-complexity/
│   │   ├── subset-sum.ts
│   │   ├── tsp-brute-force.ts
│   │   └── index.ts
│   └── 22-approximation-algorithms/
│       ├── vertex-cover.ts
│       ├── set-cover.ts
│       ├── metric-tsp.ts
│       └── index.ts
├── tests/                            # Test files mirror src/ structure
│   ├── 01-foundations/
│   │   ├── max.test.ts
│   │   └── sieve-of-eratosthenes.test.ts
│   ├── 03-recursion-and-divide-and-conquer/
│   │   ├── binary-search.test.ts
│   │   ├── pow.test.ts
│   │   ├── gcd.test.ts
│   │   └── closest-pair.test.ts
│   ├── 04-elementary-sorting/
│   │   └── sorting.test.ts          # Shared parameterized test for all elementary sorts
│   ├── 05-efficient-sorting/
│   │   └── sorting.test.ts
│   ├── ...                           # Same pattern for all chapters
│   └── 22-approximation-algorithms/
│       ├── vertex-cover.test.ts
│       ├── set-cover.test.ts
│       └── metric-tsp.test.ts
├── book/                             # Book chapter sources (Pandoc Markdown)
│   ├── chapters/
│   │   ├── 01-introduction.md
│   │   ├── 02-analyzing-algorithms.md
│   │   ├── 03-recursion-and-divide-and-conquer.md
│   │   ├── ...
│   │   └── 22-approximation-algorithms.md
│   ├── front-matter/
│   │   ├── preface.md
│   │   └── notation.md
│   ├── back-matter/
│   │   └── bibliography.md
│   ├── assets/                       # Diagrams and images
│   │   └── ...
│   ├── metadata.yaml                 # Pandoc metadata (title, author, LaTeX settings)
│   └── book.toml                     # mdBook configuration (for website build)
├── scripts/
│   ├── build-pdf.sh                  # Pandoc PDF build script
│   ├── build-web.sh                  # mdBook build script
│   └── deploy.sh                     # Google Cloud deployment script
├── dist/                             # Generated output (gitignored)
│   ├── pdf/
│   │   └── algorithms-with-typescript.pdf
│   └── web/                          # mdBook output
│       └── ...
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.ts
├── .prettierrc
├── package.json
├── .gitignore
├── README.md
├── DEPLOYMENT.md
└── LICENSE
```

### Key structural decisions:

1. **`tests/` directory (not `spec/`)**: Vitest convention; mirrors `src/` chapter structure.
2. **`index.ts` barrel files per chapter**: Enable clean imports like `import { mergeSort } from '../05-efficient-sorting'`. Also make it easy to reference implementations from book chapters.
3. **Sorting tests grouped by speed category**: Elementary sorts share a parameterized test suite (as in the existing codebase); efficient sorts do the same. Algorithm-specific helper tests (e.g., `merge`, `partition`) are in the same file.
4. **`book/chapters/` subdirectory**: Separates chapter source from generated output and config files.
5. **`dist/` for all generated output**: PDF and website output both go here, gitignored.

---

## 3. Implementation Approach

### 3.1 TypeScript Conventions

All implementations follow these conventions to maximize educational value:

```typescript
// Use generics for data structures
export class BinarySearchTree<T> { ... }
export class PriorityQueue<T> { ... }

// Use interfaces for ADT contracts
export interface Stack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  readonly size: number;
}

// Comparator type used throughout
export type Comparator<T> = (a: T, b: T) => number;

// Default numeric comparator
export const defaultComparator: Comparator<number> = (a, b) => a - b;
```

**Style rules:**
- `const`/`let` only (no `var`)
- Explicit return types on exported functions
- Strict null checks enabled
- No `any` type — use generics or `unknown` with type guards
- Algorithm functions are pure where possible (sorting functions return new arrays, as in the existing codebase)
- Descriptive variable names prioritized over brevity (educational context)

### 3.2 TypeScript Configuration

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist/lib",
    "rootDir": "./src",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 3.3 Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts'],
    },
  },
});
```

### 3.4 ESLint Configuration

Use ESLint v9 flat config with @typescript-eslint:

```typescript
// eslint.config.ts
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
      }],
    },
  },
  { ignores: ['dist/', 'node_modules/'] },
);
```

### 3.5 Shared Types

A small set of shared types used across chapter implementations:

```typescript
// src/types.ts
export type Comparator<T> = (a: T, b: T) => number;

export const numberComparator: Comparator<number> = (a, b) => a - b;

// Used by graph algorithms (Chapters 12-15)
export interface Edge<T = number> {
  from: T;
  to: T;
  weight?: number;
}
```

This file stays minimal — only types genuinely shared across multiple chapters belong here. Chapter-specific interfaces (e.g., `TrieNode`) live in their own chapter module.

---

## 4. Migration of Existing Code

### 4.1 Algorithm Migration Table

Each existing JS file is ported to TypeScript with the following changes:

| Original file | Target file | Key changes |
|---|---|---|
| `src/01-algorithms/max.js` | `src/01-foundations/max.ts` | Add type annotations, `const`/`let` |
| `src/01-algorithms/prime.numbers.js` | `src/01-foundations/sieve-of-eratosthenes.ts` | Type annotations, rename to match algorithm name |
| `src/01-algorithms/find.js` | `src/03-recursion-and-divide-and-conquer/binary-search.ts` | Rewrite as binary search (existing is linear search); keep linear as comparison |
| `src/01-algorithms/gcd.js` | `src/03-recursion-and-divide-and-conquer/gcd.ts` | Type annotations, `const`/`let`, add recursive variant |
| `src/01-algorithms/pow.js` | `src/03-recursion-and-divide-and-conquer/pow.ts` | Type annotations, `const`/`let` |
| `src/02-sorting/bubble.sort.js` | `src/04-elementary-sorting/bubble-sort.ts` | Generic `Comparator<T>`, type annotations |
| `src/02-sorting/selection.sort.js` | `src/04-elementary-sorting/selection-sort.ts` | Generic `Comparator<T>`, type annotations |
| `src/02-sorting/insertion.sort.js` | `src/04-elementary-sorting/insertion-sort.ts` | Generic `Comparator<T>`, type annotations |
| `src/02-sorting/merge.sort.js` | `src/05-efficient-sorting/merge-sort.ts` | Generic `Comparator<T>`, type annotations; keep both iterative and recursive variants |
| `src/02-sorting/quick.sort.js` | `src/05-efficient-sorting/quick-sort.ts` | Generic `Comparator<T>`, type annotations |
| `src/02-sorting/heap.sort.js` | `src/05-efficient-sorting/heap-sort.ts` | Generic `Comparator<T>`, type annotations |

### 4.2 Test Migration

Existing tests migrate from Jasmine syntax to Vitest:

| Jasmine | Vitest |
|---------|--------|
| `describe('...', function() { ... })` | `describe('...', () => { ... })` |
| `it('...', function() { ... })` | `it('...', () => { ... })` |
| `expect(x).toEqual(y)` | `expect(x).toEqual(y)` (same API) |
| `expect(x).toBe(y)` | `expect(x).toBe(y)` (same API) |
| `var` declarations | `const`/`let` |
| `.js` imports | `.js` extension-less imports (Vitest resolves TS) |

The parameterized test pattern from `sort.spec.js` (iterating over sort functions) is preserved — it's a good pattern.

### 4.3 Behavior Preservation

All sorting functions maintain the existing contract: **non-destructive** (return a new array, don't mutate input). This is tested explicitly in the existing test suite and will be preserved.

---

## 5. Book Build Pipeline

### 5.1 PDF Build (Pandoc + LaTeX)

**Pipeline**: Markdown chapters -> Pandoc -> LaTeX -> PDF

```bash
# scripts/build-pdf.sh
pandoc \
  book/metadata.yaml \
  book/front-matter/preface.md \
  book/front-matter/notation.md \
  book/chapters/01-introduction.md \
  book/chapters/02-analyzing-algorithms.md \
  ... \
  book/chapters/22-approximation-algorithms.md \
  book/back-matter/bibliography.md \
  --pdf-engine=xelatex \
  --filter pandoc-crossref \
  --table-of-contents \
  --toc-depth=3 \
  --number-sections \
  --highlight-style=tango \
  --top-level-division=chapter \
  -o dist/pdf/algorithms-with-typescript.pdf
```

**Metadata file** (`book/metadata.yaml`):
```yaml
---
title: "Algorithms with TypeScript"
author: "Anton Moilanen"
date: 2025
documentclass: report
geometry: "margin=1in"
fontsize: 11pt
mainfont: "Latin Modern Roman"
monofont: "Fira Code"
linkcolor: blue
urlcolor: blue
header-includes:
  - \usepackage{algorithm2e}
  - \usepackage{amsmath}
  - \usepackage{amssymb}
---
```

**Code snippet inclusion**: Chapters include TypeScript code directly in fenced code blocks:

```markdown
```typescript
export function gcd(a: number, b: number): number {
  let remainder = a % b;
  while (remainder > 0) {
    a = b;
    b = remainder;
    remainder = a % b;
  }
  return b;
}
```​
```

Code snippets are written directly in the chapter Markdown (not auto-included from source files). This gives full control over what to show, allows omitting boilerplate, and adding annotations. The source files in `src/` are the canonical tested implementations; chapter snippets may show simplified or annotated versions.

### 5.2 Website Build (mdBook)

**Why mdBook:**
- Purpose-built for technical books → sidebar TOC, prev/next navigation, search built-in
- Renders Markdown to static HTML with zero JavaScript framework
- Built-in MathJax support for LaTeX math
- Built-in syntax highlighting (via highlight.js)
- Responsive design out of the box
- Simple TOML configuration
- Fast (Rust binary, sub-second builds)
- Well-maintained, widely used (Rust book, many others)

**Configuration** (`book/book.toml`):
```toml
[book]
title = "Algorithms with TypeScript"
authors = ["Anton Moilanen"]
language = "en"
src = "chapters"

[build]
build-dir = "../dist/web"

[output.html]
default-theme = "light"
preferred-dark-theme = "navy"
mathjax-support = true
git-repository-url = "https://github.com/antivanov/algorithms-with-typescript"

[output.html.search]
enable = true
```

**Chapter organization for mdBook** (`book/chapters/SUMMARY.md`):
```markdown
# Summary

[Preface](../front-matter/preface.md)
[Notation](../front-matter/notation.md)

# Part I: Foundations

- [Introduction to Algorithms](01-introduction.md)
- [Analyzing Algorithms](02-analyzing-algorithms.md)
- [Recursion and Divide-and-Conquer](03-recursion-and-divide-and-conquer.md)

# Part II: Sorting and Selection

- [Elementary Sorting](04-elementary-sorting.md)
- [Efficient Sorting](05-efficient-sorting.md)
- [Linear-Time Sorting and Selection](06-linear-time-sorting-and-selection.md)

# Part III: Data Structures

- [Arrays, Linked Lists, Stacks, and Queues](07-arrays-linked-lists-stacks-queues.md)
- [Hash Tables](08-hash-tables.md)
- [Trees and Binary Search Trees](09-trees-and-bst.md)
- [Balanced Search Trees](10-balanced-search-trees.md)
- [Heaps and Priority Queues](11-heaps-and-priority-queues.md)

# Part IV: Graph Algorithms

- [Graphs and Graph Traversal](12-graphs-and-traversal.md)
- [Shortest Paths](13-shortest-paths.md)
- [Minimum Spanning Trees](14-minimum-spanning-trees.md)
- [Network Flow](15-network-flow.md)

# Part V: Algorithm Design Techniques

- [Dynamic Programming](16-dynamic-programming.md)
- [Greedy Algorithms](17-greedy-algorithms.md)

# Part VI: Advanced Data Structures

- [Disjoint Sets (Union-Find)](18-disjoint-sets.md)
- [Tries and String Data Structures](19-tries-and-string-data-structures.md)

# Part VII: String Algorithms

- [String Matching](20-string-matching.md)

# Part VIII: Computational Complexity

- [Complexity Classes and NP-Completeness](21-complexity.md)
- [Approximation Algorithms](22-approximation-algorithms.md)

---

[Bibliography](../back-matter/bibliography.md)
```

### 5.3 Markdown Compatibility

Both Pandoc and mdBook consume Markdown, but have minor syntax differences. The chapters will use a common subset:

| Feature | Pandoc syntax | mdBook syntax | Common approach |
|---------|--------------|---------------|-----------------|
| Math (inline) | `$x^2$` | `\\(x^2\\)` | Use `$...$` — mdBook MathJax config handles it |
| Math (display) | `$$..$$` | `\\[...\\]` | Use `$$...$$` — works in both with mdBook MathJax |
| Code blocks | ` ```typescript ` | ` ```typescript ` | Identical |
| Cross-refs | `[@fig:label]` (pandoc-crossref) | Not supported | Use pandoc-crossref in PDF only; omit from web or use HTML anchors |
| Definitions | `> **Definition**` blockquote | Same | Identical (use blockquotes as in existing Chapter 1) |
| Section numbering | `--number-sections` flag | Built-in with mdBook config | Handled by each tool |

For features that diverge (cross-references), the PDF pipeline uses pandoc-crossref while the web version uses manual HTML anchors or accepts unnumbered references. This is a pragmatic trade-off that avoids a complex preprocessor.

---

## 6. Source Code Architecture Patterns

### 6.1 Algorithm Functions

Algorithms are standalone exported functions (not classes):

```typescript
// src/05-efficient-sorting/merge-sort.ts

import type { Comparator } from '../types.js';
import { numberComparator } from '../types.js';

export function merge<T>(
  arr: T[],
  start: number,
  middle: number,
  end: number,
  compare: Comparator<T>,
): void {
  // ... in-place merge on the working array
}

export function mergeSort<T>(
  elements: T[],
  compare: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = [...elements];
  // ... sort copy using merge()
  return copy;
}
```

### 6.2 Data Structure Classes

Data structures are generic classes implementing explicit interfaces:

```typescript
// src/07-arrays-linked-lists-stacks-queues/stack.ts

export interface IStack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  readonly size: number;
}

export class Stack<T> implements IStack<T> {
  private items: T[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
```

### 6.3 Graph Representation

Graphs are used across multiple chapters (12-15). A shared representation:

```typescript
// src/12-graphs-and-traversal/graph.ts

export class Graph<T> {
  private adjacencyList: Map<T, Array<{ node: T; weight: number }>>;
  private directed: boolean;

  constructor(directed: boolean = false) { ... }

  addVertex(vertex: T): void { ... }
  addEdge(from: T, to: T, weight?: number): void { ... }
  getNeighbors(vertex: T): Array<{ node: T; weight: number }> { ... }
  getVertices(): T[] { ... }
  hasVertex(vertex: T): boolean { ... }
  hasEdge(from: T, to: T): boolean { ... }
}
```

Graph algorithms in chapters 13-15 import and use this representation.

---

## 7. Data Model / Interface Changes

### 7.1 No External Data Storage

The project has no database, API, or persistent data layer. All algorithms operate on in-memory data structures.

### 7.2 Public Interface

The project's public interface consists of:
1. **Exported TypeScript functions and classes** — usable as a library (secondary goal)
2. **Book content** (PDF + website) — primary deliverable

### 7.3 Package.json Changes

```jsonc
{
  "name": "algorithms-with-typescript",
  "version": "1.0.0",
  "type": "module",
  "author": "Anton Moilanen",
  "license": "MIT",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/ tests/",
    "lint:fix": "eslint src/ tests/ --fix",
    "format": "prettier --write 'src/**/*.ts' 'tests/**/*.ts'",
    "format:check": "prettier --check 'src/**/*.ts' 'tests/**/*.ts'",
    "typecheck": "tsc --noEmit",
    "build:pdf": "bash scripts/build-pdf.sh",
    "build:web": "bash scripts/build-web.sh",
    "deploy": "bash scripts/deploy.sh"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "@vitest/coverage-v8": "^3.0.0",
    "eslint": "^9.0.0",
    "@eslint/js": "^9.0.0",
    "typescript-eslint": "^8.0.0",
    "prettier": "^3.4.0"
  }
}
```

---

## 8. Deployment Architecture

### 8.1 Google Cloud Static Website Hosting

**Architecture**: Cloud Storage bucket + Cloud Load Balancer (for HTTPS with custom domain)

```
[User Browser] → [Cloud CDN] → [Cloud Load Balancer (HTTPS)] → [Cloud Storage Bucket]
                                         ↑
                                   [SSL Certificate]
                                   [Custom Domain DNS]
```

**Deployment steps** (documented in `DEPLOYMENT.md`):

1. Create a Cloud Storage bucket with website configuration
2. Upload built static files from `dist/web/`
3. Set up a global external Application Load Balancer with a backend bucket
4. Provision an SSL certificate via Certificate Manager
5. Configure DNS (A/AAAA records pointing to the load balancer IP)
6. Enable Cloud CDN on the backend bucket for caching

**`scripts/deploy.sh`** automates step 2 (upload):
```bash
#!/usr/bin/env bash
set -euo pipefail

BUCKET="gs://algorithms-with-typescript"

# Sync website files
gsutil -m rsync -r -d dist/web/ "$BUCKET"

# Set cache headers
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" "$BUCKET/**"

echo "Deployed to $BUCKET"
```

### 8.2 PDF Distribution

The PDF is built locally and can be:
- Committed to the repo as a release artifact
- Uploaded to the website (`/algorithms-with-typescript.pdf`)
- Attached to GitHub releases

---

## 9. Delivery Phases

Each phase produces a testable, buildable state of the project.

### Phase 1: Project Setup & Infrastructure
- Initialize TypeScript project (tsconfig, package.json, vitest, eslint, prettier)
- Set up book build pipeline (Pandoc PDF script, mdBook configuration)
- Create project structure (all directories, .gitignore)
- Port existing 11 implementations to TypeScript with tests
- Update Chapter 1 with TypeScript examples
- Verify: `npm test` passes, `npm run build:pdf` produces PDF, `npm run build:web` produces website

### Phase 2: Foundations & Sorting (Chapters 1-6)
- Write Chapter 2 (Analyzing Algorithms — theory only, no code)
- Write Chapter 3 + implement binary search, closest pair
- Write Chapter 4 (content around ported elementary sorts)
- Write Chapter 5 (content around ported efficient sorts + implement randomized quicksort)
- Write Chapter 6 + implement counting sort, radix sort, bucket sort, quickselect, median of medians
- Verify: all tests pass, chapters build in PDF and website

### Phase 3: Data Structures (Chapters 7-11)
- Write Chapter 7 + implement dynamic array, linked lists, stack, queue, deque
- Write Chapter 8 + implement hash tables
- Write Chapter 9 + implement binary tree, BST
- Write Chapter 10 + implement AVL tree, red-black tree
- Write Chapter 11 + implement binary heap, priority queue
- Verify: all tests pass, chapters build

### Phase 4: Graph Algorithms (Chapters 12-15)
- Write Chapter 12 + implement graph representations, BFS, DFS, topological sort, cycle detection
- Write Chapter 13 + implement Dijkstra, Bellman-Ford, DAG shortest paths, Floyd-Warshall
- Write Chapter 14 + implement Kruskal's, Prim's (depends on Union-Find from Phase 6 — implement Union-Find early or use inline version)
- Write Chapter 15 + implement Edmonds-Karp, bipartite matching
- Verify: all tests pass, chapters build

**Note**: Kruskal's algorithm needs Union-Find. Implement Union-Find alongside Chapter 14 (pull forward from Phase 6) since it's a natural dependency.

### Phase 5: Algorithm Design Techniques (Chapters 16-17)
- Write Chapter 16 + implement all DP algorithms (Fibonacci, coin change, LCS, edit distance, knapsack, matrix chain, LIS)
- Write Chapter 17 + implement interval scheduling, Huffman coding, fractional knapsack
- Verify: all tests pass, chapters build

### Phase 6: Advanced Topics & Strings (Chapters 18-22)
- Write Chapter 18 + Union-Find (if not already done in Phase 4)
- Write Chapter 19 + implement trie, compressed trie
- Write Chapter 20 + implement naive matching, Rabin-Karp, KMP
- Write Chapter 21 + implement brute-force subset sum, brute-force TSP
- Write Chapter 22 + implement vertex cover, set cover, metric TSP approximation
- Verify: all tests pass, chapters build

### Phase 7: Polish & Deployment
- Write front matter (preface, notation guide)
- Write back matter (bibliography)
- Add exercises to all chapters (3-5 per chapter)
- Review and proofread content
- Set up Google Cloud deployment infrastructure
- Write DEPLOYMENT.md
- Final PDF and website builds
- Verify: full book builds, deploy script works

---

## 10. Verification Approach

### 10.1 Automated Verification

| Check | Command | Frequency |
|-------|---------|-----------|
| Type checking | `npx tsc --noEmit` | Every phase |
| Unit tests | `npm test` | Every phase |
| Linting | `npm run lint` | Every phase |
| Formatting | `npm run format:check` | Every phase |
| PDF build | `npm run build:pdf` | Every phase (after chapters added) |
| Website build | `npm run build:web` | Every phase (after chapters added) |

### 10.2 Quality Criteria per Chapter

Each chapter is considered complete when:
1. All algorithms/data structures for the chapter are implemented in TypeScript
2. All implementations have passing tests covering normal cases, edge cases, and boundary conditions
3. Chapter Markdown renders correctly in both PDF and website
4. Math formulas render correctly
5. Code snippets are syntax-highlighted
6. Chapter follows the structure: introduction, definitions, explanations, implementation, complexity analysis, exercises

### 10.3 Testing Patterns

**Algorithm tests** (following existing parameterized pattern):
```typescript
import { describe, it, expect } from 'vitest';
import { bubbleSort } from '../../src/04-elementary-sorting/bubble-sort.js';
import { selectionSort } from '../../src/04-elementary-sorting/selection-sort.js';
import { insertionSort } from '../../src/04-elementary-sorting/insertion-sort.js';

const sortFunctions = [bubbleSort, selectionSort, insertionSort];

describe('Elementary sorting', () => {
  sortFunctions.forEach((sortFunc) => {
    describe(sortFunc.name, () => {
      it('should sort an array', () => {
        expect(sortFunc([6, 0, 4, 3, 9, 8, 7, 1, 2, 5]))
          .toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });

      it('should not mutate the input array', () => {
        const input = [3, 5, 1, 4, 2];
        sortFunc(input);
        expect(input).toEqual([3, 5, 1, 4, 2]);
      });

      // ... edge cases
    });
  });
});
```

**Data structure tests**:
```typescript
import { describe, it, expect } from 'vitest';
import { Stack } from '../../src/07-arrays-linked-lists-stacks-queues/stack.js';

describe('Stack', () => {
  it('should push and pop in LIFO order', () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
  });

  it('should return undefined when popping empty stack', () => {
    const stack = new Stack<number>();
    expect(stack.pop()).toBeUndefined();
  });

  // ...
});
```

---

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pandoc/mdBook Markdown incompatibility | Chapters need separate source for PDF vs web | Use common Markdown subset; handle math via `$...$` which both support; avoid pandoc-specific extensions in web-facing content |
| Red-black tree implementation complexity | High effort, error-prone | Implement AVL tree first (simpler); use well-known CLRS-based approach for RB tree; thorough property-based test coverage |
| LaTeX installation complexity for contributors | Barrier to PDF builds | Document TinyTeX as lightweight alternative; make PDF build optional (website is primary) |
| mdBook limitations vs full SSG | Missing features (e.g., custom components) | mdBook covers all stated requirements (search, navigation, math, highlighting); if limitations arise, can add preprocessors |
| Scope (22 chapters, ~66 implementations) | Large project | Phased delivery ensures each phase is independently useful and testable |
