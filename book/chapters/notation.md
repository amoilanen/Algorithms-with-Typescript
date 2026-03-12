# Notation

This section summarizes the mathematical and typographical conventions used throughout the book. It is intended as a reference; each symbol is introduced and explained in context when it first appears.

## Asymptotic notation

| Symbol | Meaning |
|--------|---------|
| $O(g(n))$ | Asymptotic upper bound: $f(n) \leq c \cdot g(n)$ for all $n \geq n_0$ (Definition 2.2) |
| $\Omega(g(n))$ | Asymptotic lower bound: $f(n) \geq c \cdot g(n)$ for all $n \geq n_0$ (Definition 2.3) |
| $\Theta(g(n))$ | Tight bound: $f(n) = O(g(n))$ and $f(n) = \Omega(g(n))$ (Definition 2.4) |
| $o(g(n))$ | Strict upper bound: $f(n) / g(n) \to 0$ as $n \to \infty$ |
| $\omega(g(n))$ | Strict lower bound: $g(n) / f(n) \to 0$ as $n \to \infty$ |

The asymptotic families correspond loosely to the comparison operators: $O$ to $\leq$, $\Omega$ to $\geq$, $\Theta$ to $=$, $o$ to $<$, and $\omega$ to $>$.

## Common growth rates

| Growth rate | Name | Example algorithm |
|-------------|------|-------------------|
| $O(1)$ | Constant | Hash table lookup (expected) |
| $O(\log n)$ | Logarithmic | Binary search |
| $O(n)$ | Linear | Finding the maximum |
| $O(n \log n)$ | Linearithmic | Merge sort, heap sort |
| $O(n^2)$ | Quadratic | Insertion sort (worst case) |
| $O(n^3)$ | Cubic | Floyd-Warshall |
| $O(2^n)$ | Exponential | Subset sum (brute force) |
| $O(n!)$ | Factorial | TSP (brute force) |

## General mathematical notation

| Symbol | Meaning |
|--------|---------|
| $n$ | Input size (unless otherwise stated) |
| $T(n)$ | Running time as a function of input size |
| $\lfloor x \rfloor$ | Floor: largest integer $\leq x$ |
| $\lceil x \rceil$ | Ceiling: smallest integer $\geq x$ |
| $\log n$ | Logarithm base 2 (unless base is stated explicitly) |
| $\log_b n$ | Logarithm base $b$ |
| $\ln n$ | Natural logarithm (base $e$) |
| $H_n$ | $n$-th harmonic number: $H_n = \sum_{i=1}^{n} 1/i \approx \ln n$ |
| $n!$ | Factorial: $n! = n \cdot (n-1) \cdot \ldots \cdot 2 \cdot 1$ |
| $\binom{n}{k}$ | Binomial coefficient: $n! / (k!(n-k)!)$ |
| $x \bmod m$ | Remainder when $x$ is divided by $m$ |
| $\sum_{i=a}^{b} f(i)$ | Summation of $f(i)$ for $i$ from $a$ to $b$ |
| $\prod_{i=a}^{b} f(i)$ | Product of $f(i)$ for $i$ from $a$ to $b$ |
| $\infty$ | Infinity |
| $\approx$ | Approximately equal |

## Logic and quantifiers

| Symbol | Meaning |
|--------|---------|
| $\implies$ | Implies (if ... then) |
| $\iff$ | If and only if |
| $\forall$ | For all |
| $\exists$ | There exists |

## Set notation

| Symbol | Meaning |
|--------|---------|
| $\{a, b, c\}$ | Set containing elements $a$, $b$, $c$ |
| $x \in S$ | $x$ is a member of set $S$ |
| $x \notin S$ | $x$ is not a member of set $S$ |
| $A \subseteq B$ | $A$ is a subset of $B$ (possibly equal) |
| $A \subset B$ | $A$ is a proper subset of $B$ |
| $A \cup B$ | Union of $A$ and $B$ |
| $A \cap B$ | Intersection of $A$ and $B$ |
| $A \setminus B$ | Set difference: elements in $A$ but not in $B$ |
| $|S|$ | Cardinality (number of elements) of set $S$ |
| $\emptyset$ | Empty set |
| $\mathbb{R}$ | Set of real numbers |
| $\{0,1\}^*$ | Set of all binary strings |

## Graph notation

| Symbol | Meaning |
|--------|---------|
| $G = (V, E)$ | Graph $G$ with vertex set $V$ and edge set $E$ |
| $|V|$ | Number of vertices |
| $|E|$ | Number of edges |
| $(u, v)$ | Edge from vertex $u$ to vertex $v$ |
| $w(u, v)$ | Weight of edge $(u, v)$ |
| $w : E \to \mathbb{R}$ | Weight function mapping edges to real numbers |
| $\delta(s, v)$ | Shortest-path weight from $s$ to $v$ |
| $d(u, v)$ | Distance between vertices $u$ and $v$ |
| $c(u, v)$ | Capacity of edge $(u, v)$ (in flow networks) |
| $f(u, v)$ | Flow on edge $(u, v)$ |
| $w(T)$ | Total weight of tree $T$ |
| $\text{Adj}[v]$ | Adjacency list of vertex $v$ |

Vertices are typically denoted by lowercase letters: $u$, $v$, $s$ (source), $t$ (sink). We use $s \leadsto v$ to denote a path from $s$ to $v$.

## Probability notation

| Symbol | Meaning |
|--------|---------|
| $\Pr[A]$ | Probability of event $A$ |
| $\mathbb{E}[X]$ | Expected value of random variable $X$ |

## Complexity classes

Complexity classes are set in bold: $\mathbf{P}$, $\mathbf{NP}$, $\mathbf{co\text{-}NP}$. NP-complete problems are written in small capitals in running text (e.g., SUBSET SUM, SAT, HAMILTONIAN CYCLE).

## Algorithm and function names

In mathematical expressions, algorithm names are typeset in roman (upright) text to distinguish them from variables:

- $\text{parent}(i)$, $\text{left}(i)$, $\text{right}(i)$ for heap index calculations
- $\text{Relax}(u, v, w)$ for shortest-path edge relaxation
- $\text{OPT}(I)$ for the optimal solution value on instance $I$

Running-time recurrences use $T(n)$. Fibonacci numbers are $F(n)$.

## Array and indexing conventions

All TypeScript implementations use **0-based indexing**: the first element of an array `arr` is `arr[0]`, and an array of $n$ elements has indices $0, 1, \ldots, n-1$.

In mathematical discussion, array ranges are written as $A[\ell..r)$ to denote the subarray from index $\ell$ (inclusive) to $r$ (exclusive). In heap formulas:

$$\text{parent}(i) = \lfloor(i-1)/2\rfloor, \quad \text{left}(i) = 2i+1, \quad \text{right}(i) = 2i+2$$

## Formal structures

Formal definitions, theorems, and lemmas are set in blockquotes with a label:

> **Definition X.Y --- Title**
>
> Statement of the definition.

Proofs end with the symbol $\square$. Examples are labeled **Example X.Y** and numbered within each chapter.

## Code conventions

- All code is TypeScript with strict mode and ES module syntax.
- Generic type parameters (e.g., `T`, `K`, `V`) follow standard TypeScript conventions.
- The shared type `Comparator<T>` is `(a: T, b: T) => number`, returning negative if $a < b$, zero if $a = b$, and positive if $a > b$.
- Code snippets in chapters match the tested implementations in the `src/` directory.
