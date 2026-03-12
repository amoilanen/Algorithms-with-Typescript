# Preface

> **[Download this book as PDF](algorithms-with-typescript.pdf)**

This book grew out of a simple observation: most software engineers use algorithms and data structures every day, yet many feel uncertain about the fundamentals. They may use a hash map or call a sorting function without fully understanding the guarantees those abstractions provide, or they may struggle when a problem requires designing a new algorithm from scratch. At the same time, Computer Science students often encounter algorithms in a highly theoretical setting that can feel disconnected from the code they write in practice.

*Algorithms with TypeScript* bridges that gap. It presents the core algorithms and data structures from a typical undergraduate algorithms curriculum --- roughly equivalent to MIT's 6.006 and 6.046 --- but uses TypeScript as the language of expression. Every algorithm discussed in the text is implemented, tested, and available in the accompanying repository. The implementations are not pseudocode translated into TypeScript; they are idiomatic, type-safe, and tested with a modern toolchain.

## Who this book is for

This book is written for two audiences:

- **Software engineers** who want to solidify their understanding of algorithms and data structures. Perhaps you learned this material years ago and want a refresher, or perhaps you are self-taught and want to fill in the gaps. Either way, seeing algorithms in a language you likely use at work --- TypeScript --- makes the material immediately applicable.

- **Computer Science students** who are taking (or preparing to take) an algorithms course. The book follows a standard curricular sequence and includes exercises at the end of every chapter. The TypeScript implementations let you run, modify, and experiment with every algorithm.

## Prerequisites

The book assumes you can read and write basic TypeScript or JavaScript. You should be comfortable with functions, loops, conditionals, arrays, and objects. No prior knowledge of algorithms or data structures is required --- we build everything from the ground up, starting with the definition of an algorithm in Chapter 1.

Some chapters use mathematical notation, particularly for complexity analysis. Chapter 2 introduces asymptotic notation ($O$, $\Omega$, $\Theta$), and the Notation section that follows this preface summarizes all conventions used in the book. A comfort with basic algebra and mathematical reasoning is helpful but not strictly required; we explain each concept as it arises.

## How to use this book

The book is organized into six parts:

- **Part I: Foundations** (Chapters 1--3) introduces the notion of an algorithm, the mathematical tools for analyzing algorithms, and recursion with divide-and-conquer.
- **Part II: Sorting and Selection** (Chapters 4--6) covers the classical sorting algorithms, from elementary $O(n^2)$ methods through $O(n \log n)$ comparison sorts to linear-time non-comparison sorts and selection algorithms.
- **Part III: Data Structures** (Chapters 7--11) presents the fundamental data structures: arrays, linked lists, stacks, queues, hash tables, trees, balanced search trees, heaps, and priority queues.
- **Part IV: Graph Algorithms** (Chapters 12--15) covers graph representations, traversal, shortest paths, minimum spanning trees, and network flow.
- **Part V: Algorithm Design Techniques** (Chapters 16--17) explores dynamic programming and greedy algorithms as general problem-solving strategies.
- **Part VI: Advanced Topics** (Chapters 18--22) covers disjoint sets, tries, string matching, computational complexity, and approximation algorithms.

The parts are designed to be read in order, as later chapters build on concepts and data structures introduced in earlier ones. Within each part, the chapters are largely self-contained --- if you are comfortable with the prerequisites, you can often read individual chapters independently.

Each chapter follows a consistent structure: a motivating introduction, formal definitions, detailed algorithm descriptions with step-by-step traces, TypeScript implementations with code snippets, complexity analysis, and exercises. The exercises range from straightforward checks of understanding to more challenging problems that extend the material.

## The code

All implementations live in the `src/` directory of the repository, organized by chapter. Tests are in the `tests/` directory with a parallel structure. To run the full test suite:

```bash
npm install
npm test
```

The code is written in TypeScript 5 with strict mode enabled, uses ES modules, and is tested with Vitest. See the project README for detailed setup instructions.

We encourage you to read the code alongside the text. The implementations are designed to be clear and readable rather than maximally optimized. Where there is a tension between clarity and performance, we choose clarity and discuss the performance implications in the text.

## Authors

This book was written by Anton Moilanen, with a substantial portion of the content created with the assistance of [Zenflow](https://zencoder.ai/zenflow) using Claude Code and Claude Opus 4.6.

## Acknowledgments

This book draws inspiration from several excellent texts, most notably Cormen, Leiserson, Rivest, and Stein's *Introduction to Algorithms* (CLRS), Sedgewick and Wayne's *Algorithms*, Niklaus Wirth's *Algorithms + Data Structures = Programs*, and Kleinberg and Tardos's *Algorithm Design*. The MIT OpenCourseWare materials for 6.006 and 6.046 were invaluable in shaping the curriculum. Full references are in the Bibliography.
