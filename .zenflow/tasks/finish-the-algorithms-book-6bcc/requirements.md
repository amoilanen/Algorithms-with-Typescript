# Product Requirements Document: Algorithms with TypeScript

## 1. Overview

**Project**: Algorithms with TypeScript
**Author**: Anton Moilanen
**License**: MIT
**Status**: Major rewrite and expansion of an existing "Algorithms with JavaScript" project started ~2016

### 1.1 Background

The project is an open-source algorithms and data structures book with executable source code. It was started over 10 years ago using JavaScript (ES6 with Babel), Karma/Jasmine for testing, and Pandoc for book compilation. The current state includes:

- **2 chapters written** (Chapter 1: Algorithms introduction is substantial; Chapter 2: Sorting is a stub)
- **11 algorithm implementations** in JavaScript across 2 topic areas (basic algorithms, sorting)
- **6 test files** with comprehensive coverage of existing implementations
- **Outdated tooling**: Babel ES2015 presets, Karma, PhantomJS, shelljs-based build scripts
- **No deployment infrastructure** for web hosting

The project needs a complete modernization and significant content expansion to cover a full computer science algorithms curriculum.

### 1.2 Goals

1. Migrate all code from JavaScript to TypeScript with modern tooling
2. Expand coverage to a full two-semester CS algorithms curriculum
3. Write complete, high-quality book chapters with explanations, code snippets, and exercises
4. Produce both a buildable PDF and a deployable static website
5. Provide documentation for building and deploying the book

### 1.3 Target Audience

- Software engineers refreshing their knowledge of data structures and algorithms
- Computer Science students studying algorithms courses
- Self-taught programmers seeking rigorous algorithmic foundations

### 1.4 Non-Goals

- This is not an interactive coding platform or MOOC
- No video or multimedia content
- No automated grading of exercises
- No user accounts or progress tracking on the website

---

## 2. Curriculum & Book Structure

The curriculum is modeled after MIT 6.006 / 6.046 (now 6.1210 / 6.1220), CLRS, and Niklaus Wirth's "Algorithms + Data Structures = Programs". The book is organized into parts grouping related chapters.

### Part I: Foundations

#### Chapter 1: Introduction to Algorithms
*Exists (needs update to TypeScript examples)*

- What is an algorithm? Formal definition and properties
- Expressing algorithms: natural language, pseudocode, TypeScript
- Computational procedures that are not algorithms
- Introduction to TypeScript as the book's language
- Setting up the development environment

#### Chapter 2: Analyzing Algorithms
*New chapter*

- Why analyze algorithms?
- Asymptotic notation: O, Omega, Theta
- Best-case, worst-case, average-case analysis
- Amortized analysis (introduction)
- Recurrence relations and the Master Theorem
- Space complexity

#### Chapter 3: Recursion and Divide-and-Conquer
*New chapter*

- Recursion: principles, base cases, call stack
- Mathematical induction and recursive correctness
- Divide-and-conquer strategy
- Examples: binary search, fast exponentiation, GCD
- Closest pair of points
- The Master Theorem applied

**Algorithms to implement**: binary search, fast exponentiation (existing `pow`), Euclidean GCD (existing `gcd`), closest pair of points

### Part II: Sorting and Selection

#### Chapter 4: Elementary Sorting
*Expansion of existing Chapter 2 stub*

- The sorting problem: definition and importance
- Stability and in-place sorting
- Bubble sort
- Selection sort
- Insertion sort
- Comparison-based sorting lower bound (Omega(n log n))

**Algorithms to implement**: bubble sort (existing), selection sort (existing), insertion sort (existing)

#### Chapter 5: Efficient Sorting
*New chapter*

- Merge sort: divide-and-conquer applied to sorting
- Quick sort: partitioning and pivot selection
- Heap sort: using the heap data structure
- Analysis and comparison of O(n log n) sorts
- Randomized quicksort

**Algorithms to implement**: merge sort (existing), quick sort (existing), heap sort (existing), randomized quicksort

#### Chapter 6: Linear-Time Sorting and Selection
*New chapter*

- Breaking the comparison lower bound
- Counting sort
- Radix sort
- Bucket sort
- Selection algorithms: quickselect, median of medians

**Algorithms to implement**: counting sort, radix sort, bucket sort, quickselect, median of medians

### Part III: Data Structures

#### Chapter 7: Arrays, Linked Lists, Stacks, and Queues
*New chapter*

- Arrays and dynamic arrays
- Singly and doubly linked lists
- Stacks: interface and implementations
- Queues and deques
- Amortized analysis of dynamic arrays

**Data structures to implement**: dynamic array, singly linked list, doubly linked list, stack, queue, deque

#### Chapter 8: Hash Tables
*New chapter*

- Direct-address tables
- Hash functions: division, multiplication, universal hashing
- Collision resolution: chaining, open addressing (linear probing, double hashing)
- Dynamic resizing and load factor
- Applications: frequency counting, two-sum, anagram detection

**Data structures to implement**: hash table with chaining, hash table with open addressing

#### Chapter 9: Trees and Binary Search Trees
*New chapter*

- Tree terminology and representations
- Binary trees and traversals (inorder, preorder, postorder, level-order)
- Binary search trees: search, insert, delete, successor, predecessor
- BST performance analysis

**Data structures to implement**: binary tree, binary search tree

#### Chapter 10: Balanced Search Trees
*New chapter*

- The problem with unbalanced BSTs
- AVL trees: rotations and balancing
- Red-black trees: properties and operations
- B-trees: multi-way search trees for external storage
- Comparison of balanced tree variants

**Data structures to implement**: AVL tree, red-black tree

#### Chapter 11: Heaps and Priority Queues
*New chapter*

- Binary heaps: structure and heap property
- Heap operations: insert, extract-min/max, decrease-key
- Building a heap in O(n)
- Priority queue interface
- Applications: event simulation, median maintenance

**Data structures to implement**: binary min-heap, binary max-heap, priority queue

### Part IV: Graph Algorithms

#### Chapter 12: Graphs and Graph Traversal
*New chapter*

- Graph terminology: directed, undirected, weighted, etc.
- Representations: adjacency matrix, adjacency list
- Breadth-first search (BFS): shortest paths in unweighted graphs
- Depth-first search (DFS): classification of edges
- Topological sort
- Cycle detection
- Connected components

**Algorithms to implement**: BFS, DFS, topological sort (Kahn's and DFS-based), cycle detection

#### Chapter 13: Shortest Paths
*New chapter*

- Single-source shortest paths problem
- Relaxation and shortest-path properties
- Dijkstra's algorithm (non-negative weights)
- Bellman-Ford algorithm (general weights, negative cycle detection)
- DAG shortest paths
- All-pairs shortest paths: Floyd-Warshall

**Algorithms to implement**: Dijkstra, Bellman-Ford, DAG shortest paths, Floyd-Warshall

#### Chapter 14: Minimum Spanning Trees
*New chapter*

- The MST problem
- Cut property and cycle property
- Kruskal's algorithm (with Union-Find)
- Prim's algorithm (with priority queue)

**Algorithms to implement**: Kruskal's, Prim's

#### Chapter 15: Network Flow
*New chapter*

- Flow networks and the max-flow problem
- Ford-Fulkerson method and augmenting paths
- Edmonds-Karp algorithm (BFS-based Ford-Fulkerson)
- Max-flow min-cut theorem
- Applications: bipartite matching

**Algorithms to implement**: Edmonds-Karp, bipartite matching

### Part V: Algorithm Design Techniques

#### Chapter 16: Dynamic Programming
*New chapter*

- Optimal substructure and overlapping subproblems
- Memoization (top-down) vs. tabulation (bottom-up)
- Systematic approach to DP problems
- Examples: Fibonacci, climbing stairs, coin change
- Longest common subsequence
- Edit distance (Levenshtein)
- 0/1 Knapsack
- Matrix chain multiplication
- Longest increasing subsequence

**Algorithms to implement**: Fibonacci (memoized and tabulated), coin change, LCS, edit distance, 0/1 knapsack, matrix chain multiplication, LIS

#### Chapter 17: Greedy Algorithms
*New chapter*

- Greedy strategy and when it works
- Proving greedy correctness: exchange arguments, greedy stays ahead
- Activity selection / interval scheduling
- Huffman coding
- Fractional knapsack

**Algorithms to implement**: interval scheduling, Huffman coding, fractional knapsack

### Part VI: Advanced Data Structures

#### Chapter 18: Disjoint Sets (Union-Find)
*New chapter*

- The disjoint-set problem
- Union by rank and path compression
- Amortized analysis (inverse Ackermann)
- Applications: Kruskal's MST, dynamic connectivity

**Data structures to implement**: Union-Find with path compression and union by rank

#### Chapter 19: Tries and String Data Structures
*New chapter*

- Tries: prefix trees for string storage
- Compressed tries (radix trees)
- Applications: autocomplete, spell checking, IP routing
- Introduction to suffix arrays

**Data structures to implement**: trie, compressed trie

### Part VII: String Algorithms

#### Chapter 20: String Matching
*New chapter*

- The pattern matching problem
- Naive string matching
- Rabin-Karp algorithm (rolling hash)
- Knuth-Morris-Pratt (KMP) algorithm
- Comparison and applications

**Algorithms to implement**: naive matching, Rabin-Karp, KMP

### Part VIII: Computational Complexity

#### Chapter 21: Complexity Classes and NP-Completeness
*New chapter*

- Complexity classes: P, NP, co-NP
- Polynomial-time reductions
- NP-completeness: Cook-Levin theorem (statement)
- Classic NP-complete problems: SAT, 3-SAT, vertex cover, Hamiltonian cycle, TSP, subset sum, graph coloring
- Proving NP-completeness by reduction
- Coping with NP-hardness: approximation, heuristics, special cases

**Algorithms to implement**: brute-force subset sum, brute-force TSP (for illustration of exponential time)

#### Chapter 22: Approximation Algorithms
*New chapter*

- When exact solutions are infeasible
- Approximation ratios
- Vertex cover 2-approximation
- Greedy set cover
- Metric TSP (2-approximation via MST)

**Algorithms to implement**: vertex cover 2-approximation, greedy set cover, metric TSP approximation

---

## 3. Technical Requirements

### 3.1 Language Migration: JavaScript to TypeScript

**Requirement**: All algorithm implementations must be rewritten in TypeScript.

- Use TypeScript 5.x with strict mode enabled
- Leverage generics for data structures (e.g., `BinarySearchTree<T>`, `PriorityQueue<T>`)
- Use interfaces to define ADT contracts (e.g., `interface Stack<T>`, `interface Graph<T>`)
- Source code should be clear and educational, prioritizing readability over cleverness
- Each algorithm/data structure in its own file, organized by chapter
- Export all public functions and classes for testability and book snippet inclusion

### 3.2 Project Structure

```
algorithms-with-typescript/
  src/
    01-foundations/
    02-analysis/
    03-recursion-and-divide-and-conquer/
    04-elementary-sorting/
    05-efficient-sorting/
    06-linear-time-sorting-and-selection/
    07-arrays-linked-lists-stacks-queues/
    08-hash-tables/
    09-trees-and-bst/
    10-balanced-search-trees/
    11-heaps-and-priority-queues/
    12-graphs-and-traversal/
    13-shortest-paths/
    14-minimum-spanning-trees/
    15-network-flow/
    16-dynamic-programming/
    17-greedy-algorithms/
    18-disjoint-sets/
    19-tries-and-string-data-structures/
    20-string-matching/
    21-complexity/
    22-approximation-algorithms/
  tests/
    (mirrors src/ structure)
  book/
    chapters/
      01-introduction.md
      02-analyzing-algorithms.md
      ...
      22-approximation-algorithms.md
    assets/          (diagrams, images)
    bibliography.md
    index.md         (book front matter / table of contents)
  dist/              (generated: PDF, website)
  scripts/           (build and deploy scripts)
  tsconfig.json
  package.json
  .gitignore
```

### 3.3 Build System & Tooling

**Test framework**: Vitest (modern, fast, native TypeScript support, compatible with ESM)

**Linting & formatting**:
- ESLint with TypeScript plugin
- Prettier for code formatting

**Book compilation**:
- Pandoc for PDF generation (via LaTeX)
- A static site generator for the web version (options: Astro, or custom Pandoc-to-HTML pipeline)
- Support for:
  - LaTeX math formulas (MathJax/KaTeX on web, LaTeX in PDF)
  - Syntax-highlighted TypeScript code blocks
  - Automatic inclusion of source code snippets from `src/` (to keep book and code in sync)
  - Chapter numbering and cross-references
  - Table of contents generation
  - Bibliography/references

**Package manager**: npm or pnpm

**Build commands** (target):
```
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run lint          # Lint source and tests
npm run build:pdf     # Build PDF book
npm run build:web     # Build static website
npm run deploy        # Deploy to Google Cloud
```

### 3.4 Testing Requirements

- Every algorithm and data structure must have a corresponding test file
- Tests should cover:
  - Normal/expected inputs
  - Edge cases (empty inputs, single elements, duplicates)
  - Boundary conditions
  - Performance characteristics where practical (e.g., sorting a large array)
- Tests should be self-documenting and serve as usage examples
- Maintain the existing test style: descriptive `describe`/`it` blocks with clear expectations

### 3.5 Book Content Quality Requirements

Each chapter must include:

1. **Introduction**: Motivation and real-world context for the topic
2. **Formal definitions**: Mathematical definitions where appropriate
3. **Step-by-step explanations**: Walk through the algorithm logic with examples
4. **TypeScript implementation**: Complete, runnable code snippets from the `src/` directory
5. **Complexity analysis**: Time and space complexity with derivations
6. **Correctness arguments**: Informal proofs or invariant-based reasoning
7. **Worked examples**: Trace through the algorithm on concrete inputs
8. **Exercises**: 3-5 exercises per chapter, ranging from comprehension to implementation challenges
9. **Chapter summary**: Key takeaways

Writing guidelines:
- Formal but accessible tone (as established in existing Chapter 1)
- Define terms before using them
- Build on previously introduced concepts (chapters should be read in order)
- Use consistent notation throughout the book
- Include complexity comparison tables where multiple algorithms solve the same problem

### 3.6 Deployment Requirements

**PDF**: Buildable locally with `pandoc` and a LaTeX distribution (e.g., TeX Live). The PDF should be a single document with all chapters, table of contents, and page numbers.

**Static website**:
- Deployable to Google Cloud (Cloud Storage + Cloud CDN, or Cloud Run for a static container)
- Responsive design, readable on mobile
- Syntax highlighting for code blocks
- MathJax or KaTeX for mathematical formulas
- Navigation: table of contents, previous/next chapter links
- Searchable (client-side search)

**Documentation**: A `DEPLOYMENT.md` or section in `README.md` explaining:
- Prerequisites (Node.js version, pandoc, LaTeX distribution)
- How to build the PDF locally
- How to build and preview the website locally
- How to deploy to Google Cloud (step-by-step with `gcloud` commands)
- Domain registration and DNS configuration guidance

---

## 4. Migration Strategy

### 4.1 What to Preserve

- The pedagogical approach from Chapter 1 (formal definitions, progression from informal to formal, use of examples and counterexamples)
- The existing algorithm implementations as a starting point (translated to TypeScript)
- The comprehensive testing approach (edge cases, non-destructive behavior)
- MIT License

### 4.2 What to Replace

| Current | Target |
|---------|--------|
| JavaScript (ES6 + Babel) | TypeScript 5.x (strict mode) |
| Karma + Jasmine + PhantomJS | Vitest |
| ESLint (basic config) | ESLint + TypeScript plugin + Prettier |
| `compile.book.js` (custom Node.js script) | Pandoc-based pipeline + static site generator |
| `shelljs` / `chokidar` | Native npm scripts or build tool |
| `var` declarations | `const` / `let` |
| UMD module format | ESM (ES Modules) |

### 4.3 Content Migration

Existing implementations to port (11 files):
1. `pow.js` -> `pow.ts` (Chapter 3: Recursion)
2. `gcd.js` -> `gcd.ts` (Chapter 3: Recursion)
3. `find.js` -> `find.ts` (Chapter 3: Recursion - binary search)
4. `max.js` -> `max.ts` (Chapter 1: Introduction)
5. `prime.numbers.js` -> `sieve-of-eratosthenes.ts` (Chapter 1: Introduction)
6. `bubble.sort.js` -> `bubble-sort.ts` (Chapter 4)
7. `insertion.sort.js` -> `insertion-sort.ts` (Chapter 4)
8. `selection.sort.js` -> `selection-sort.ts` (Chapter 4)
9. `merge.sort.js` -> `merge-sort.ts` (Chapter 5)
10. `quick.sort.js` -> `quick-sort.ts` (Chapter 5)
11. `heap.sort.js` -> `heap-sort.ts` (Chapter 5)

Existing chapter to revise:
1. `01-algorithms.md` -> Update code examples to TypeScript, expand

New content to write: ~21 new chapters with corresponding implementations and tests.

---

## 5. Complete Algorithm and Data Structure Inventory

### Algorithms (approximately 55-60 implementations)

| # | Algorithm | Chapter | Status |
|---|-----------|---------|--------|
| 1 | Fast exponentiation | 3 | Exists (port) |
| 2 | Euclidean GCD | 3 | Exists (port) |
| 3 | Binary search | 3 | Exists as linear (rewrite) |
| 4 | Closest pair of points | 3 | New |
| 5 | Bubble sort | 4 | Exists (port) |
| 6 | Selection sort | 4 | Exists (port) |
| 7 | Insertion sort | 4 | Exists (port) |
| 8 | Merge sort | 5 | Exists (port) |
| 9 | Quick sort | 5 | Exists (port) |
| 10 | Heap sort | 5 | Exists (port) |
| 11 | Randomized quicksort | 5 | New |
| 12 | Counting sort | 6 | New |
| 13 | Radix sort | 6 | New |
| 14 | Bucket sort | 6 | New |
| 15 | Quickselect | 6 | New |
| 16 | Median of medians | 6 | New |
| 17 | Sieve of Eratosthenes | 1 | Exists (port) |
| 18 | BFS | 12 | New |
| 19 | DFS | 12 | New |
| 20 | Topological sort (Kahn's) | 12 | New |
| 21 | Topological sort (DFS) | 12 | New |
| 22 | Cycle detection | 12 | New |
| 23 | Dijkstra's algorithm | 13 | New |
| 24 | Bellman-Ford | 13 | New |
| 25 | DAG shortest paths | 13 | New |
| 26 | Floyd-Warshall | 13 | New |
| 27 | Kruskal's algorithm | 14 | New |
| 28 | Prim's algorithm | 14 | New |
| 29 | Edmonds-Karp | 15 | New |
| 30 | Bipartite matching | 15 | New |
| 31 | Fibonacci (DP) | 16 | New |
| 32 | Coin change | 16 | New |
| 33 | Longest common subsequence | 16 | New |
| 34 | Edit distance | 16 | New |
| 35 | 0/1 Knapsack | 16 | New |
| 36 | Matrix chain multiplication | 16 | New |
| 37 | Longest increasing subsequence | 16 | New |
| 38 | Interval scheduling | 17 | New |
| 39 | Huffman coding | 17 | New |
| 40 | Fractional knapsack | 17 | New |
| 41 | Naive string matching | 20 | New |
| 42 | Rabin-Karp | 20 | New |
| 43 | KMP | 20 | New |
| 44 | Brute-force subset sum | 21 | New |
| 45 | Brute-force TSP | 21 | New |
| 46 | Vertex cover 2-approx | 22 | New |
| 47 | Greedy set cover | 22 | New |
| 48 | Metric TSP approximation | 22 | New |

### Data Structures (approximately 15-18 implementations)

| # | Data Structure | Chapter | Status |
|---|---------------|---------|--------|
| 1 | Dynamic array | 7 | New |
| 2 | Singly linked list | 7 | New |
| 3 | Doubly linked list | 7 | New |
| 4 | Stack | 7 | New |
| 5 | Queue | 7 | New |
| 6 | Deque | 7 | New |
| 7 | Hash table (chaining) | 8 | New |
| 8 | Hash table (open addressing) | 8 | New |
| 9 | Binary search tree | 9 | New |
| 10 | AVL tree | 10 | New |
| 11 | Red-black tree | 10 | New |
| 12 | Binary heap (min/max) | 11 | New |
| 13 | Priority queue | 11 | New |
| 14 | Graph (adjacency list) | 12 | New |
| 15 | Graph (adjacency matrix) | 12 | New |
| 16 | Union-Find | 18 | New |
| 17 | Trie | 19 | New |
| 18 | Compressed trie | 19 | New |

---

## 6. Delivery Phases

The work should be delivered incrementally so that the book is buildable and testable at every stage.

### Phase 1: Project Setup & Migration
- Initialize TypeScript project with modern tooling (Vitest, ESLint, Prettier)
- Set up book build pipeline (Pandoc for PDF, static site generator for web)
- Port existing 11 implementations to TypeScript with tests
- Update Chapter 1 with TypeScript examples
- Verify PDF and website builds work end-to-end

### Phase 2: Foundations & Sorting (Chapters 1-6)
- Write Chapters 2-6
- Implement new algorithms for Chapters 3 and 6
- All existing sorting algorithms already ported in Phase 1

### Phase 3: Data Structures (Chapters 7-11)
- Write Chapters 7-11
- Implement all data structures
- Comprehensive tests for each

### Phase 4: Graph Algorithms (Chapters 12-15)
- Write Chapters 12-15
- Implement graph representations and all graph algorithms
- Comprehensive tests

### Phase 5: Algorithm Design Techniques (Chapters 16-17)
- Write Chapters 16-17
- Implement DP and greedy algorithm examples
- Comprehensive tests

### Phase 6: Advanced Topics (Chapters 18-22)
- Write Chapters 18-22
- Implement remaining data structures and algorithms
- Comprehensive tests

### Phase 7: Polish & Deployment
- Write front matter (preface, table of contents, bibliography)
- Add exercises to all chapters
- Review and proofread all content
- Set up Google Cloud deployment
- Write deployment documentation
- Final PDF and website builds

---

## 7. Success Criteria

1. All ~48 algorithms and ~18 data structures implemented in TypeScript with passing tests
2. All 22 chapters written with explanations, code snippets, complexity analysis, and exercises
3. PDF builds successfully as a single document with table of contents
4. Static website builds and is deployable to Google Cloud
5. Deployment documentation is clear and complete
6. Code is clean, well-typed, and follows consistent conventions
7. Book content is technically accurate and suitable for the target audience

---

## 8. Assumptions and Decisions

1. **TypeScript over other languages**: The task description explicitly requests TypeScript. This is appropriate for the target audience (software engineers) as TypeScript is widely used in industry.

2. **Vitest over Jest/Jasmine**: Vitest provides native TypeScript and ESM support without additional configuration, faster execution, and a modern API. This replaces the outdated Karma + Jasmine + PhantomJS stack.

3. **Chapter scope**: The curriculum covers two semesters of university-level algorithms. Topics like computational geometry, number theory beyond GCD, linear programming, and randomized algorithms beyond quicksort are excluded to keep the book focused and completable. These can be added as future extensions.

4. **Red-black trees included**: While complex to implement, red-black trees are a standard part of algorithms education and appear in CLRS and MIT courses. The implementation will be thorough but the chapter will emphasize understanding over memorizing rotation cases.

5. **No B-trees implementation**: B-trees are discussed conceptually in Chapter 10 but not implemented, as they are primarily relevant to database/filesystem contexts that don't translate well to in-memory TypeScript demonstrations.

6. **Static site over SPA**: The website will be a static site (not a single-page application). This keeps deployment simple, is SEO-friendly, and aligns with the book-reading use case.

7. **Google Cloud deployment**: Cloud Storage with a load balancer is the simplest option for hosting static content with a custom domain on Google Cloud. Cloud Run is an alternative if server-side features are needed later.

8. **Pandoc for PDF**: Pandoc with LaTeX produces high-quality PDFs suitable for technical books with mathematical notation. This is a proven toolchain for this use case.
