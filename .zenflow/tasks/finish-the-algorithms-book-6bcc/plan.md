# Full SDD workflow

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

---

## Workflow Steps

### [x] Step: Requirements
<!-- chat-id: 0035447e-4109-455b-8537-dd2e579405e7 -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification
<!-- chat-id: 4c08780b-dcdb-42e2-aa32-1c970c6e7e4f -->

Create a technical specification based on the PRD in `{@artifacts_path}/requirements.md`.

1. Review existing codebase architecture and identify reusable components
2. Define the implementation approach

Save to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach referencing existing code patterns
- Source code structure changes
- Data model / API / interface changes
- Delivery phases (incremental, testable milestones)
- Verification approach using project lint/test commands

### [x] Step: Planning
<!-- chat-id: feb39245-9255-4f13-ac94-0f36ef5b8082 -->

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

1. Break down the work into concrete tasks
2. Each task should reference relevant contracts and include verification steps
3. Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint). Avoid steps that are too granular (single function) or too broad (entire feature).

Important: unit tests must be part of each implementation task, not separate tasks. Each task should implement the code and its tests together, if relevant.

If the feature is trivial and doesn't warrant full specification, update this workflow to remove unnecessary steps and explain the reasoning to the user.

Save to `{@artifacts_path}/plan.md`.

### [x] Step: Project Setup and Tooling Migration
<!-- chat-id: 8a7eab3a-b84e-4ca4-9f3f-9d48ea12c027 -->

Initialize the modern TypeScript project, replacing all legacy tooling. This is the foundation every subsequent step depends on.

- Remove legacy config files: `.babelrc`, `karma.conf.js`, `.eslintrc.js`, `compile.book.js`
- Remove legacy devDependencies from `package.json` (babel, karma, jasmine, phantomjs, shelljs, chokidar)
- Create `tsconfig.json` (TypeScript 5.x, strict mode, ESM, target ES2022, `moduleResolution: "bundler"`)
- Create `vitest.config.ts` (tests in `tests/**/*.test.ts`, v8 coverage)
- Create `eslint.config.ts` (flat config, @typescript-eslint, Prettier integration)
- Create `.prettierrc` (2 spaces, single quotes, trailing commas)
- Update `package.json`: name to `algorithms-with-typescript`, `"type": "module"`, add all new devDependencies (typescript, vitest, @vitest/coverage-v8, eslint, @eslint/js, typescript-eslint, prettier), add scripts (test, test:watch, lint, lint:fix, format, format:check, typecheck, build:pdf, build:web, deploy)
- Update `.gitignore` to include `node_modules/`, `dist/`, `build/`, `.cache/`, `*.log`, coverage directories
- Create `src/types.ts` with shared `Comparator<T>` type, `numberComparator`, and `Edge<T>` interface
- Create the new directory structure: `src/01-foundations/` through `src/22-approximation-algorithms/`, `tests/` mirroring `src/`, `book/chapters/`, `book/front-matter/`, `book/back-matter/`, `book/assets/`, `scripts/`, `dist/`
- Run `npm install` and verify `npx tsc --noEmit` passes with the empty project
- Run `npm run lint` and `npm run format:check` to verify tooling works
- Verification: `npm install` succeeds, `npx tsc --noEmit` passes, `npm run lint` passes

### [x] Step: Port Existing Implementations to TypeScript
<!-- chat-id: a20b0360-461f-4933-9d81-b420ccfb3f07 -->

Migrate all 11 existing JavaScript implementations and their 6 test files to TypeScript with Vitest. Preserve all existing behavior and test coverage.

- Port `src/01-algorithms/max.js` → `src/01-foundations/max.ts` (add type annotations, replace `var` with `const`/`let`, explicit return types)
- Port `src/01-algorithms/prime.numbers.js` → `src/01-foundations/sieve-of-eratosthenes.ts` (rename to match algorithm, type annotations)
- Port `src/01-algorithms/find.js` → `src/03-recursion-and-divide-and-conquer/binary-search.ts` (rewrite as proper binary search; keep existing linear search as comparison)
- Port `src/01-algorithms/gcd.js` → `src/03-recursion-and-divide-and-conquer/gcd.ts` (both `gcd` and `gcdSlow` variants, type annotations)
- Port `src/01-algorithms/pow.js` → `src/03-recursion-and-divide-and-conquer/pow.ts` (both `pow` and `powSlow` variants, type annotations)
- Port `src/02-sorting/bubble.sort.js` → `src/04-elementary-sorting/bubble-sort.ts` (generic `Comparator<T>`, type annotations)
- Port `src/02-sorting/selection.sort.js` → `src/04-elementary-sorting/selection-sort.ts` (generic `Comparator<T>`)
- Port `src/02-sorting/insertion.sort.js` → `src/04-elementary-sorting/insertion-sort.ts` (generic `Comparator<T>`)
- Port `src/02-sorting/merge.sort.js` → `src/05-efficient-sorting/merge-sort.ts` (generic `Comparator<T>`, keep iterative bottom-up approach)
- Port `src/02-sorting/quick.sort.js` → `src/05-efficient-sorting/quick-sort.ts` (generic `Comparator<T>`)
- Port `src/02-sorting/heap.sort.js` → `src/05-efficient-sorting/heap-sort.ts` (generic `Comparator<T>`)
- Create `index.ts` barrel files for each chapter directory that has implementations
- Port test files from Jasmine to Vitest:
  - `spec/01-algorithms/max.spec.js` → `tests/01-foundations/max.test.ts`
  - `spec/01-algorithms/prime.numbers.spec.js` → `tests/01-foundations/sieve-of-eratosthenes.test.ts`
  - `spec/01-algorithms/find.spec.js` → `tests/03-recursion-and-divide-and-conquer/binary-search.test.ts`
  - `spec/01-algorithms/gcd.spec.js` → `tests/03-recursion-and-divide-and-conquer/gcd.test.ts`
  - `spec/01-algorithms/pow.spec.js` → `tests/03-recursion-and-divide-and-conquer/pow.test.ts`
  - `spec/02-sorting/sort.spec.js` → `tests/04-elementary-sorting/sorting.test.ts` and `tests/05-efficient-sorting/sorting.test.ts` (split parameterized tests by chapter)
- All sorting functions must remain non-destructive (return new array, don't mutate input) — test this explicitly
- Remove old `src/01-algorithms/`, `src/02-sorting/`, and `spec/` directories after porting
- Verification: `npm test` passes all ported tests, `npx tsc --noEmit` passes, `npm run lint` passes

### [x] Step: Book Build Pipeline
<!-- chat-id: f78baa5b-8824-48d1-bb1c-79f54201c32e -->

Set up the dual book build system: Pandoc for PDF, mdBook for the static website.

- Create `book/metadata.yaml` (title, author, date, documentclass: report, geometry, fonts, LaTeX packages for math and algorithms)
- Create `book/front-matter/preface.md` (placeholder with book overview and target audience)
- Create `book/front-matter/notation.md` (placeholder for asymptotic notation conventions, graph notation, etc.)
- Create `book/back-matter/bibliography.md` (initial references: CLRS, Wirth, Sedgewick, MIT OCW)
- Create `book/chapters/SUMMARY.md` for mdBook (full table of contents with all 22 chapters organized by parts)
- Create `book/book.toml` for mdBook configuration (title, authors, src directory, build output to `dist/web`, MathJax support, search enabled, light/dark themes)
- Create `scripts/build-pdf.sh` (Pandoc pipeline: metadata.yaml + front-matter + all chapters + back-matter → xelatex → PDF with TOC, numbered sections, syntax highlighting, cross-references via pandoc-crossref)
- Create `scripts/build-web.sh` (run mdBook build from `book/` directory, output to `dist/web/`)
- Create `scripts/deploy.sh` (gsutil rsync from `dist/web/` to Cloud Storage bucket with cache headers)
- Update existing `book/01-algorithms.md` → `book/chapters/01-introduction.md`: migrate code examples from JavaScript to TypeScript, update language references, preserve pedagogical structure
- Create `book/chapters/02-analyzing-algorithms.md` as a stub (title and placeholder for content)
- Create stub files for all remaining chapters (03 through 22) so the book builds end-to-end
- Remove old `book/html/`, `book/pdf/` generated directories and `compile.book.js`
- Verify PDF build: `npm run build:pdf` produces `dist/pdf/algorithms-with-typescript.pdf`
- Verify web build: `npm run build:web` produces static site in `dist/web/`
- Verification: both `build:pdf` and `build:web` succeed; PDF has table of contents and numbered chapters; website has sidebar navigation and search

### [x] Step: Chapter 1 — Introduction to Algorithms
<!-- chat-id: 3a98cd3b-6a64-4b9e-b458-f35f9aa0dbac -->

Write the complete Chapter 1 based on the existing content. This chapter already has substantial material; expand and update it.

- Rewrite `book/chapters/01-introduction.md` with full chapter content:
  - What is an algorithm? Formal definition and properties (preserve existing content, refine)
  - Expressing algorithms: natural language, pseudocode, TypeScript
  - Computational procedures that are not algorithms (preserve existing counterexamples)
  - Introduction to TypeScript as the book's language
  - Setting up the development environment
  - Worked example using `max.ts` and `sieve-of-eratosthenes.ts`
  - Include TypeScript code snippets from `src/01-foundations/`
  - Complexity analysis of max and sieve
  - 3–5 exercises
  - Chapter summary
- Verify chapter renders correctly in both PDF and website builds
- Verification: `npm run build:pdf` and `npm run build:web` succeed; chapter content is complete

### [x] Step: Chapter 2 — Analyzing Algorithms
<!-- chat-id: 08242cdd-daa7-45b4-9c5a-f765c7790cca -->

Write Chapter 2 (theory chapter, no new implementations).

- Write `book/chapters/02-analyzing-algorithms.md`:
  - Why analyze algorithms? Motivation with concrete examples
  - Asymptotic notation: Big-O, Big-Omega, Big-Theta with formal definitions
  - Best-case, worst-case, average-case analysis (use insertion sort from Chapter 4 as running example)
  - Introduction to amortized analysis
  - Recurrence relations and the Master Theorem (with worked examples)
  - Space complexity
  - Comparison table of common growth rates
  - 3–5 exercises
  - Chapter summary
- Verification: `npm run build:pdf` and `npm run build:web` succeed; math formulas render correctly

### [x] Step: Chapter 3 — Recursion and Divide-and-Conquer
<!-- chat-id: 2ebd7ba0-b5e0-4540-9ba8-3b66c45b9e9e -->

Write Chapter 3 and implement the remaining algorithms (closest pair of points). Binary search, pow, and gcd are already ported.

- Implement `src/03-recursion-and-divide-and-conquer/closest-pair.ts` (closest pair of points, O(n log n) divide-and-conquer)
- Write `tests/03-recursion-and-divide-and-conquer/closest-pair.test.ts` (small inputs, collinear points, large random sets, edge cases)
- Write `book/chapters/03-recursion-and-divide-and-conquer.md`:
  - Recursion: principles, base cases, call stack visualization
  - Mathematical induction and recursive correctness
  - Divide-and-conquer strategy
  - Examples: binary search (from src), fast exponentiation (from src), Euclidean GCD (from src)
  - Closest pair of points (from src) with full explanation
  - Master Theorem applied to these examples
  - Code snippets from all implementations
  - Complexity analysis for each algorithm
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes (including closest-pair tests), builds succeed

### [x] Step: Chapter 4 — Elementary Sorting
<!-- chat-id: 71cb70f0-0656-4232-90cf-ea64bc725f29 -->

Write Chapter 4 (implementations already ported in earlier step).

- Write `book/chapters/04-elementary-sorting.md`:
  - The sorting problem: formal definition, importance, applications
  - Stability and in-place sorting definitions
  - Bubble sort: algorithm, trace through example, TypeScript implementation, O(n²) analysis
  - Selection sort: algorithm, trace, implementation, O(n²) analysis, why it's not stable
  - Insertion sort: algorithm, trace, implementation, O(n²) worst / O(n) best analysis
  - Comparison-based sorting lower bound Ω(n log n) via decision tree argument
  - Comparison table of elementary sorts
  - Code snippets from `src/04-elementary-sorting/`
  - 3–5 exercises
  - Chapter summary
- Verification: builds succeed

### [x] Step: Chapter 5 — Efficient Sorting
<!-- chat-id: 38bac193-3880-4549-9f00-bdba2c78c281 -->

Write Chapter 5 and implement randomized quicksort.

- Implement `src/05-efficient-sorting/randomized-quick-sort.ts` (quicksort with random pivot selection, generic `Comparator<T>`)
- Write `tests/05-efficient-sorting/randomized-quick-sort.test.ts` (same parameterized sorting test suite)
- Add randomized quicksort to `src/05-efficient-sorting/index.ts`
- Write `book/chapters/05-efficient-sorting.md`:
  - Merge sort: divide-and-conquer applied, merge procedure, analysis O(n log n)
  - Quick sort: partitioning, pivot selection, average and worst case analysis
  - Heap sort: heap property, heapify, extractMax, analysis O(n log n)
  - Randomized quicksort: expected O(n log n), probability argument
  - Analysis and comparison of O(n log n) sorts (stability, space, cache performance)
  - Code snippets from `src/05-efficient-sorting/`
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [x] Step: Chapter 6 — Linear-Time Sorting and Selection
<!-- chat-id: a5d7b9e1-a543-4f8b-8895-bd464d3cccfa -->

Write Chapter 6 and implement all new algorithms: counting sort, radix sort, bucket sort, quickselect, median of medians.

- Implement `src/06-linear-time-sorting-and-selection/counting-sort.ts` (stable counting sort for non-negative integers)
- Implement `src/06-linear-time-sorting-and-selection/radix-sort.ts` (LSD radix sort using counting sort as stable subroutine)
- Implement `src/06-linear-time-sorting-and-selection/bucket-sort.ts` (bucket sort for uniformly distributed data)
- Implement `src/06-linear-time-sorting-and-selection/quickselect.ts` (randomized selection, expected O(n))
- Implement `src/06-linear-time-sorting-and-selection/median-of-medians.ts` (deterministic O(n) selection)
- Create `src/06-linear-time-sorting-and-selection/index.ts`
- Write comprehensive tests for all five algorithms in `tests/06-linear-time-sorting-and-selection/`:
  - Sorting: empty, single, duplicates, already sorted, reverse sorted, large arrays
  - Selection: find min, max, median, kth element, edge cases
- Write `book/chapters/06-linear-time-sorting-and-selection.md`:
  - Breaking the comparison lower bound
  - Counting sort: algorithm, stability, O(n + k) analysis
  - Radix sort: digit-by-digit, O(d(n + k)) analysis
  - Bucket sort: assumptions, O(n) expected analysis
  - Selection: quickselect with expected O(n), median of medians with worst-case O(n)
  - Code snippets, complexity comparison table
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [x] Step: Chapter 7 — Arrays, Linked Lists, Stacks, and Queues
<!-- chat-id: 3c099a06-675d-4533-95ac-db9ad9886bbe -->

Implement fundamental data structures and write Chapter 7.

- Implement `src/07-arrays-linked-lists-stacks-queues/dynamic-array.ts` (generic `DynamicArray<T>` with amortized O(1) append, doubling strategy)
- Implement `src/07-arrays-linked-lists-stacks-queues/singly-linked-list.ts` (generic `SinglyLinkedList<T>` with prepend, append, delete, find, iterator)
- Implement `src/07-arrays-linked-lists-stacks-queues/doubly-linked-list.ts` (generic `DoublyLinkedList<T>` with O(1) head/tail operations)
- Implement `src/07-arrays-linked-lists-stacks-queues/stack.ts` (generic `Stack<T>` implementing `IStack<T>` interface)
- Implement `src/07-arrays-linked-lists-stacks-queues/queue.ts` (generic `Queue<T>` implementing `IQueue<T>` interface)
- Implement `src/07-arrays-linked-lists-stacks-queues/deque.ts` (generic `Deque<T>` with O(1) front/back operations)
- Create `src/07-arrays-linked-lists-stacks-queues/index.ts`
- Write tests for all 6 data structures in `tests/07-arrays-linked-lists-stacks-queues/`:
  - Each: construction, insertion, deletion, iteration, edge cases (empty, single element), size tracking
  - Dynamic array: verify resizing behavior
  - Stack: LIFO order, peek
  - Queue: FIFO order
  - Deque: front/back operations
- Write `book/chapters/07-arrays-linked-lists-stacks-queues.md`:
  - Arrays and dynamic arrays with amortized analysis
  - Singly and doubly linked lists with trade-offs
  - Stack ADT and implementations
  - Queue and deque ADTs
  - Comparison table (operation complexities)
  - Code snippets from implementations
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [x] Step: Chapter 8 — Hash Tables
<!-- chat-id: a50592bf-45eb-420c-b3f6-2371e2d69bc9 -->

Implement hash tables and write Chapter 8.

- Implement `src/08-hash-tables/hash-table-chaining.ts` (generic `HashTableChaining<K, V>` with separate chaining, dynamic resizing, load factor threshold)
- Implement `src/08-hash-tables/hash-table-open-addressing.ts` (generic `HashTableOpenAddressing<K, V>` with linear probing and double hashing variants)
- Create `src/08-hash-tables/index.ts`
- Write tests in `tests/08-hash-tables/`:
  - Both implementations: get/set/delete, collision handling, resizing, non-existent keys, overwrite existing keys, iteration, load factor behavior
  - Edge cases: empty table, single entry, many collisions
- Write `book/chapters/08-hash-tables.md`:
  - Direct-address tables
  - Hash functions: division, multiplication, universal hashing
  - Collision resolution: chaining vs open addressing (linear probing, double hashing)
  - Dynamic resizing and load factor
  - Applications: frequency counting, two-sum, anagram detection
  - O(1) expected analysis, O(n) worst case
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [x] Step: Chapter 9 — Trees and Binary Search Trees
<!-- chat-id: 86021c62-d90a-49cd-b0e6-45b5c7b6988e -->

Implement binary tree and BST, write Chapter 9.

- Implement `src/09-trees-and-bst/binary-tree.ts` (generic `BinaryTree<T>` with traversals: inorder, preorder, postorder, level-order)
- Implement `src/09-trees-and-bst/binary-search-tree.ts` (generic `BinarySearchTree<T>` with search, insert, delete, min, max, successor, predecessor, in-order traversal)
- Create `src/09-trees-and-bst/index.ts`
- Write tests in `tests/09-trees-and-bst/`:
  - Binary tree: construction, all four traversal orders
  - BST: insert/search/delete, min/max, successor/predecessor, empty tree, single node, balanced and skewed cases, duplicate handling
- Write `book/chapters/09-trees-and-bst.md`:
  - Tree terminology and representations
  - Binary trees and traversals with trace-throughs
  - BST property, search, insert, delete (3 cases), successor/predecessor
  - BST performance analysis (balanced vs skewed)
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [x] Step: Chapter 10 — Balanced Search Trees
<!-- chat-id: 670e4b6e-0fca-4d5f-abe5-f81efc4f0a6c -->

Implement AVL and red-black trees, write Chapter 10.

- Implement `src/10-balanced-search-trees/avl-tree.ts` (generic `AVLTree<T>` with insert, delete, search, rotations: left, right, left-right, right-left, automatic balancing)
- Implement `src/10-balanced-search-trees/red-black-tree.ts` (generic `RedBlackTree<T>` with insert, delete, search, color flips, rotations, following CLRS approach)
- Create `src/10-balanced-search-trees/index.ts`
- Write tests in `tests/10-balanced-search-trees/`:
  - AVL: insert sequences that trigger all 4 rotation types, delete with rebalancing, verify balance factor invariant after every operation, sequential and random insertions
  - Red-black: insert sequences, verify red-black properties (root black, no red-red, equal black-height) after every operation, delete with fixup, large random datasets
- Write `book/chapters/10-balanced-search-trees.md`:
  - The problem with unbalanced BSTs
  - AVL trees: balance factor, rotations, step-by-step insert/delete examples
  - Red-black trees: properties, insert cases, delete cases (conceptual emphasis over memorization)
  - B-trees: conceptual discussion (no implementation) for external storage
  - Comparison of balanced tree variants
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [x] Step: Chapter 11 — Heaps and Priority Queues
<!-- chat-id: f3152abf-8857-4196-abce-d4c055769849 -->

Implement heaps and priority queue, write Chapter 11.

- Implement `src/11-heaps-and-priority-queues/binary-heap.ts` (generic `BinaryHeap<T>` supporting both min-heap and max-heap via comparator, with insert, extractMin/Max, peek, decreaseKey, buildHeap in O(n))
- Implement `src/11-heaps-and-priority-queues/priority-queue.ts` (generic `PriorityQueue<T>` built on BinaryHeap, with enqueue, dequeue, peek, changePriority)
- Create `src/11-heaps-and-priority-queues/index.ts`
- Write tests in `tests/11-heaps-and-priority-queues/`:
  - Binary heap: insert, extract, peek, build from array, verify heap property, min and max variants, decrease key, empty heap
  - Priority queue: enqueue/dequeue ordering, priority changes, empty queue
- Write `book/chapters/11-heaps-and-priority-queues.md`:
  - Binary heaps: array representation, heap property, sift-up/sift-down
  - Heap operations: insert O(log n), extract O(log n), peek O(1), decrease-key O(log n)
  - Building a heap in O(n) with proof
  - Priority queue interface and applications
  - Applications: event simulation, running median
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [x] Step: Chapter 12 — Graphs and Graph Traversal
<!-- chat-id: e0b8e3a0-f39e-4259-8348-1102eaac7cdd -->

Implement graph representations and traversal algorithms, write Chapter 12.

- Implement `src/12-graphs-and-traversal/graph.ts`:
  - `Graph<T>` class with adjacency list (Map-based), supporting directed/undirected, weighted/unweighted
  - `GraphMatrix` class with adjacency matrix representation
  - Methods: addVertex, addEdge, removeVertex, removeEdge, getNeighbors, getVertices, hasVertex, hasEdge, getEdgeWeight
- Implement `src/12-graphs-and-traversal/bfs.ts` (BFS returning parent map and distances; shortest paths in unweighted graphs)
- Implement `src/12-graphs-and-traversal/dfs.ts` (DFS with discovery/finish times, edge classification: tree, back, forward, cross)
- Implement `src/12-graphs-and-traversal/topological-sort.ts` (both Kahn's algorithm and DFS-based)
- Implement `src/12-graphs-and-traversal/cycle-detection.ts` (directed and undirected cycle detection)
- Create `src/12-graphs-and-traversal/index.ts`
- Write tests in `tests/12-graphs-and-traversal/`:
  - Graph: construction, add/remove vertices/edges, directed vs undirected behavior, weighted edges
  - BFS: shortest paths, unreachable vertices, single vertex, disconnected graph
  - DFS: traversal order, edge classification, forest discovery
  - Topological sort: valid orderings for DAGs, error on cyclic graph
  - Cycle detection: graphs with cycles, DAGs, self-loops, undirected cycles
- Write `book/chapters/12-graphs-and-traversal.md`:
  - Graph terminology: directed, undirected, weighted, dense, sparse
  - Representations: adjacency list vs matrix (trade-offs, when to use each)
  - BFS: algorithm, shortest paths in unweighted graphs, trace-through
  - DFS: algorithm, edge classification, timestamps
  - Topological sort: Kahn's and DFS-based with examples
  - Cycle detection
  - Connected components
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [x] Step: Chapter 13 — Shortest Paths
<!-- chat-id: 47f0c2e7-84f0-4ba9-a5e5-292313d745ad -->

Implement shortest path algorithms, write Chapter 13.

- Implement `src/13-shortest-paths/dijkstra.ts` (Dijkstra using priority queue from Chapter 11, generic graph input)
- Implement `src/13-shortest-paths/bellman-ford.ts` (Bellman-Ford with negative cycle detection)
- Implement `src/13-shortest-paths/dag-shortest-paths.ts` (topological sort + relaxation for DAGs)
- Implement `src/13-shortest-paths/floyd-warshall.ts` (all-pairs shortest paths, O(V³))
- Create `src/13-shortest-paths/index.ts`
- Write tests in `tests/13-shortest-paths/`:
  - Dijkstra: simple graph, disconnected vertices, single vertex, graph from CLRS examples
  - Bellman-Ford: positive weights, negative weights, negative cycle detection
  - DAG shortest paths: DAGs with positive and negative weights
  - Floyd-Warshall: small complete graph, verify all-pairs distances, negative weights (no negative cycles)
- Write `book/chapters/13-shortest-paths.md`:
  - Single-source shortest paths problem
  - Relaxation and shortest-path properties
  - Dijkstra's algorithm with priority queue, O((V + E) log V) analysis
  - Bellman-Ford: general weights, O(VE) analysis, negative cycle detection
  - DAG shortest paths: O(V + E) using topological order
  - Floyd-Warshall: all-pairs, O(V³), dynamic programming formulation
  - Comparison table: when to use which algorithm
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [x] Step: Chapter 14 — Minimum Spanning Trees
<!-- chat-id: d3f7aeb1-e369-4636-9077-c836e81aa498 -->

Implement Union-Find (needed by Kruskal's), MST algorithms, and write Chapter 14.

- Implement `src/18-disjoint-sets/union-find.ts` (Union-Find with path compression and union by rank, generic)
- Create `src/18-disjoint-sets/index.ts`
- Write tests in `tests/18-disjoint-sets/union-find.test.ts` (make, find, union, connected components, path compression verification, large inputs)
- Implement `src/14-minimum-spanning-trees/kruskal.ts` (Kruskal's algorithm using Union-Find, returns MST edges and total weight)
- Implement `src/14-minimum-spanning-trees/prim.ts` (Prim's algorithm using priority queue, returns MST edges and total weight)
- Create `src/14-minimum-spanning-trees/index.ts`
- Write tests in `tests/14-minimum-spanning-trees/`:
  - Kruskal: standard examples, verify MST weight, disconnected graph, single vertex
  - Prim: same examples, verify same MST weight as Kruskal
- Write `book/chapters/14-minimum-spanning-trees.md`:
  - The MST problem definition
  - Cut property and cycle property (proofs)
  - Kruskal's algorithm with Union-Find, O(E log E) analysis
  - Prim's algorithm with priority queue, O(E log V) analysis
  - Comparison of Kruskal's vs Prim's
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Note: Union-Find is implemented here (pulled forward from Chapter 18) because Kruskal's depends on it. The Chapter 18 write-up will reference and expand on this implementation.
- Verification: `npm test` passes (including union-find tests), builds succeed

### [x] Step: Chapter 15 — Network Flow
<!-- chat-id: eeb4c330-ac59-4dd4-b304-e1f587a3a4b6 -->

Implement network flow algorithms, write Chapter 15.

- Implement `src/15-network-flow/edmonds-karp.ts` (BFS-based Ford-Fulkerson, returns max flow value and flow assignment)
- Implement `src/15-network-flow/bipartite-matching.ts` (maximum bipartite matching via max-flow reduction)
- Create `src/15-network-flow/index.ts`
- Write tests in `tests/15-network-flow/`:
  - Edmonds-Karp: standard flow network examples (CLRS-style), verify max flow value, single path, multiple augmenting paths
  - Bipartite matching: perfect matching, partial matching, no matching possible
- Write `book/chapters/15-network-flow.md`:
  - Flow networks and the max-flow problem
  - Ford-Fulkerson method and augmenting paths
  - Edmonds-Karp: BFS ensures O(VE²) complexity
  - Max-flow min-cut theorem (with proof sketch)
  - Applications: bipartite matching
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [x] Step: Chapter 16 — Dynamic Programming
<!-- chat-id: 04a35e3a-c638-4639-ac0a-6dc4da932202 -->

Implement all DP algorithms, write Chapter 16.

- Implement `src/16-dynamic-programming/fibonacci.ts` (naive recursive, memoized top-down, tabulated bottom-up)
- Implement `src/16-dynamic-programming/coin-change.ts` (minimum coins, number of ways, tabulated)
- Implement `src/16-dynamic-programming/lcs.ts` (longest common subsequence, tabulated with backtracking to recover subsequence)
- Implement `src/16-dynamic-programming/edit-distance.ts` (Levenshtein distance, tabulated with operation recovery)
- Implement `src/16-dynamic-programming/knapsack.ts` (0/1 knapsack, tabulated with item recovery)
- Implement `src/16-dynamic-programming/matrix-chain.ts` (matrix chain multiplication, optimal parenthesization)
- Implement `src/16-dynamic-programming/lis.ts` (longest increasing subsequence, O(n log n) patience-sorting approach and O(n²) DP)
- Create `src/16-dynamic-programming/index.ts`
- Write tests in `tests/16-dynamic-programming/`:
  - Fibonacci: correctness for known values, verify memoized and tabulated match
  - Coin change: standard examples, impossible cases, single denomination
  - LCS: known examples (CLRS), empty strings, identical strings
  - Edit distance: known pairs, empty string, identical strings
  - Knapsack: standard examples, zero capacity, item larger than capacity
  - Matrix chain: standard examples, single matrix, two matrices
  - LIS: increasing, decreasing, mixed, duplicates
- Write `book/chapters/16-dynamic-programming.md`:
  - Optimal substructure and overlapping subproblems
  - Memoization vs tabulation (top-down vs bottom-up)
  - Systematic approach to DP: define subproblems, recurrence, base cases, compute order, recover solution
  - Fibonacci as introduction
  - Coin change, LCS, edit distance with worked examples and recurrence derivations
  - 0/1 Knapsack with 2D table walkthrough
  - Matrix chain multiplication
  - Longest increasing subsequence
  - Code snippets for each
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [ ] Step: Chapter 17 — Greedy Algorithms

Implement greedy algorithms, write Chapter 17.

- Implement `src/17-greedy-algorithms/interval-scheduling.ts` (activity selection / interval scheduling maximization)
- Implement `src/17-greedy-algorithms/huffman.ts` (Huffman coding: build tree, encode, decode)
- Implement `src/17-greedy-algorithms/fractional-knapsack.ts` (fractional knapsack by value-to-weight ratio)
- Create `src/17-greedy-algorithms/index.ts`
- Write tests in `tests/17-greedy-algorithms/`:
  - Interval scheduling: overlapping intervals, non-overlapping, single interval, empty
  - Huffman: encode/decode round-trip, frequency-based coding, single character, verify prefix-free property
  - Fractional knapsack: standard examples, exact fit, all items fit
- Write `book/chapters/17-greedy-algorithms.md`:
  - Greedy strategy: when it works, when it doesn't
  - Proving greedy correctness: exchange argument, greedy-stays-ahead
  - Activity selection / interval scheduling with proof
  - Huffman coding: prefix-free codes, tree construction, optimality proof sketch
  - Fractional knapsack with proof
  - Contrast with DP: greedy vs DP on knapsack (0/1 vs fractional)
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [ ] Step: Chapter 18 — Disjoint Sets (Union-Find)

Write Chapter 18. Union-Find was already implemented in the Chapter 14 step; this step writes the dedicated chapter.

- If Union-Find was not already implemented in the Chapter 14 step, implement it now (see Chapter 14 step for details)
- Write `book/chapters/18-disjoint-sets.md`:
  - The disjoint-set problem: motivation and applications
  - Naive implementations and their limitations
  - Union by rank: keep trees balanced
  - Path compression: flatten trees during find
  - Combined: near-O(1) amortized (inverse Ackermann)
  - Amortized analysis explanation (intuitive level)
  - Applications: Kruskal's MST (back-reference to Chapter 14), dynamic connectivity
  - Code snippets from `src/18-disjoint-sets/union-find.ts`
  - 3–5 exercises
  - Chapter summary
- Verification: builds succeed

### [ ] Step: Chapter 19 — Tries and String Data Structures

Implement tries, write Chapter 19.

- Implement `src/19-tries-and-string-data-structures/trie.ts` (generic `Trie` with insert, search, startsWith, delete, autocomplete)
- Implement `src/19-tries-and-string-data-structures/compressed-trie.ts` (radix tree / compressed trie with same operations)
- Create `src/19-tries-and-string-data-structures/index.ts`
- Write tests in `tests/19-tries-and-string-data-structures/`:
  - Trie: insert/search/delete, prefix search, autocomplete, empty trie, single character words, overlapping prefixes
  - Compressed trie: same tests, verify compression (fewer nodes than standard trie)
- Write `book/chapters/19-tries-and-string-data-structures.md`:
  - Tries: prefix trees for string storage, O(m) operations where m = key length
  - Compressed tries (radix trees): space optimization
  - Applications: autocomplete, spell checking, IP routing
  - Introduction to suffix arrays (conceptual, no implementation)
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [ ] Step: Chapter 20 — String Matching

Implement string matching algorithms, write Chapter 20.

- Implement `src/20-string-matching/naive-matching.ts` (brute-force O(nm) string search)
- Implement `src/20-string-matching/rabin-karp.ts` (rolling hash string matching)
- Implement `src/20-string-matching/kmp.ts` (Knuth-Morris-Pratt with failure function computation)
- Create `src/20-string-matching/index.ts`
- Write tests in `tests/20-string-matching/`:
  - All three: pattern found at start/middle/end, pattern not found, empty pattern, pattern longer than text, multiple occurrences, overlapping matches
  - Rabin-Karp: verify matches (handle hash collisions gracefully)
  - KMP: verify failure function on known patterns
- Write `book/chapters/20-string-matching.md`:
  - The pattern matching problem definition
  - Naive string matching: algorithm, O(nm) analysis
  - Rabin-Karp: rolling hash, expected O(n + m) analysis, hash collision handling
  - KMP: failure function, O(n + m) guaranteed analysis, step-by-step trace
  - Comparison and applications
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [ ] Step: Chapter 21 — Complexity Classes and NP-Completeness

Implement illustrative brute-force algorithms, write Chapter 21.

- Implement `src/21-complexity/subset-sum.ts` (brute-force subset sum, O(2^n), returns boolean and the subset if found)
- Implement `src/21-complexity/tsp-brute-force.ts` (brute-force TSP, O(n!), returns optimal tour and distance)
- Create `src/21-complexity/index.ts`
- Write tests in `tests/21-complexity/`:
  - Subset sum: solvable instance, unsolvable instance, empty set, single element, verify returned subset sums correctly
  - TSP: small instances (3–5 cities), verify optimal tour, single city
- Write `book/chapters/21-complexity.md`:
  - Complexity classes: P, NP, co-NP (definitions and examples)
  - Polynomial-time reductions
  - NP-completeness: Cook-Levin theorem (statement, not proof)
  - Classic NP-complete problems: SAT, 3-SAT, vertex cover, Hamiltonian cycle, TSP, subset sum, graph coloring
  - Proving NP-completeness by reduction (worked example)
  - Coping with NP-hardness: approximation, heuristics, special cases
  - Brute-force implementations as illustrations of exponential/factorial time
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [ ] Step: Chapter 22 — Approximation Algorithms

Implement approximation algorithms, write Chapter 22.

- Implement `src/22-approximation-algorithms/vertex-cover.ts` (2-approximation: greedily pick both endpoints of arbitrary edges)
- Implement `src/22-approximation-algorithms/set-cover.ts` (greedy set cover: pick set covering most uncovered elements, O(log n)-approximation)
- Implement `src/22-approximation-algorithms/metric-tsp.ts` (2-approximation via MST: compute MST, DFS preorder walk, shortcut repeated vertices)
- Create `src/22-approximation-algorithms/index.ts`
- Write tests in `tests/22-approximation-algorithms/`:
  - Vertex cover: verify all edges covered, verify size ≤ 2× optimal on known instances
  - Set cover: verify all elements covered, verify approximation ratio on known instances
  - Metric TSP: verify valid tour, verify cost ≤ 2× optimal on small instances
- Write `book/chapters/22-approximation-algorithms.md`:
  - When exact solutions are infeasible (link back to Chapter 21)
  - Approximation ratios definition
  - Vertex cover 2-approximation: algorithm, proof of ratio
  - Greedy set cover: algorithm, O(log n) ratio proof sketch
  - Metric TSP 2-approximation via MST: algorithm, triangle inequality requirement, proof
  - Code snippets
  - 3–5 exercises
  - Chapter summary
- Verification: `npm test` passes, builds succeed

### [ ] Step: Front Matter, Back Matter, and Final Polish

Complete the book's supporting material and ensure everything is production-ready.

- Write `book/front-matter/preface.md`: book motivation, target audience, how to use the book, acknowledgments, prerequisites (basic programming knowledge)
- Write `book/front-matter/notation.md`: asymptotic notation conventions, pseudocode conventions, graph notation, set notation, mathematical symbols used throughout
- Write `book/back-matter/bibliography.md`: complete bibliography with CLRS, Sedgewick, Wirth, Kleinberg/Tardos, MIT OCW, and other referenced works
- Review all 22 chapters for consistent notation, terminology, and cross-references
- Ensure every chapter has 3–5 exercises with a range of difficulty
- Verify all code snippets in chapters match the tested implementations
- Write/update `README.md`: project description, prerequisites (Node.js, Pandoc, TeX Live, mdBook), quick start (install, test, build), contribution guidelines
- Write `DEPLOYMENT.md`: step-by-step Google Cloud deployment (create bucket, configure website, set up load balancer, provision SSL certificate, configure DNS, enable CDN, deploy script usage)
- Final verification:
  - `npm test` — all tests pass
  - `npx tsc --noEmit` — no type errors
  - `npm run lint` — no lint errors
  - `npm run build:pdf` — PDF builds with all chapters, TOC, page numbers
  - `npm run build:web` — website builds with all chapters, navigation, search working
- Verification: full build pipeline succeeds end-to-end, all content is complete and reviewed
