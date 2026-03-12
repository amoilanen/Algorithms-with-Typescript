# Complexity Classes and NP-Completeness

_Throughout this book we have analyzed algorithms by their running time as a function of input size: $O(n \log n)$ for merge sort, $O(V + E)$ for BFS, $O(nW)$ for knapsack. An implicit assumption has been that every problem we studied has an efficient — polynomial-time — solution. But not all problems do. Some of the most natural and practically important computational problems appear to resist all attempts at efficient solution. In this chapter we develop the theoretical framework of complexity classes — P, NP, and co-NP — that categorizes problems by the computational resources they require. We then introduce the concept of NP-completeness, which identifies a class of problems that are, in a precise sense, the "hardest" problems in NP. Understanding this theory is essential for every computer scientist: it tells us when to stop searching for an efficient algorithm and instead reach for approximation, heuristics, or special-case solutions._

## Decision problems and languages

Complexity theory is formalized in terms of **decision problems** — problems with a yes/no answer. While this may seem restrictive, optimization problems can always be rephrased as decision problems. For example:

- **Optimization:** Find the shortest Hamiltonian cycle (TSP).
- **Decision:** Is there a Hamiltonian cycle of length $\leq k$?

If we can solve the decision version efficiently, we can typically solve the optimization version by binary searching on $k$.

Formally, a decision problem corresponds to a **language** $L \subseteq \{0, 1\}^*$: the set of all binary strings (encodings of inputs) for which the answer is "yes." An algorithm **decides** $L$ if, given any input $x$, it correctly outputs "yes" if $x \in L$ and "no" if $x \notin L$.

## The class P

**Definition.** $\mathbf{P}$ is the class of decision problems solvable by a deterministic Turing machine in time polynomial in the input size $n$:

$$\mathbf{P} = \bigcup_{k \geq 0} \text{DTIME}(n^k)$$

In practical terms, a problem is in P if there exists an algorithm that solves every instance of size $n$ in $O(n^k)$ time for some constant $k$.

Almost every algorithm in this book solves a problem in P:

| Problem | Algorithm | Time |
|---------|-----------|------|
| Sorting | Merge sort | $O(n \log n)$ |
| Shortest path | Dijkstra | $O((V + E) \log V)$ |
| MST | Kruskal | $O(E \log E)$ |
| Maximum flow | Edmonds-Karp | $O(VE^2)$ |
| String matching | KMP | $O(n + m)$ |

P captures the intuitive notion of "efficiently solvable." While $O(n^{100})$ is technically polynomial, in practice all known polynomial algorithms for natural problems have small exponents.

## The class NP

**Definition.** $\mathbf{NP}$ (Nondeterministic Polynomial time) is the class of decision problems for which a "yes" answer can be **verified** in polynomial time given an appropriate **certificate** (also called a witness).

More precisely, a language $L$ is in NP if there exists a polynomial-time verifier $V$ and a polynomial $p$ such that:

$$x \in L \iff \exists \, c \text{ with } |c| \leq p(|x|) \text{ such that } V(x, c) = \text{yes}$$

The certificate $c$ is a "proof" that $x$ is a yes-instance, and $V$ checks this proof in polynomial time.

**Key point:** NP does **not** stand for "not polynomial." It stands for **nondeterministic** polynomial time. A nondeterministic machine can "guess" the certificate and verify it in polynomial time.

### Examples

| Problem | Certificate | Verification |
|---------|-------------|--------------|
| HAMILTONIAN CYCLE | A permutation of vertices | Check it forms a valid cycle: $O(V)$ |
| SUBSET SUM | A subset of numbers | Check the sum equals the target: $O(n)$ |
| SAT | A truth assignment | Evaluate the formula: $O(n)$ |
| GRAPH COLORING | A color assignment | Check no adjacent vertices share a color: $O(V + E)$ |
| CLIQUE | A set of $k$ vertices | Check all pairs are adjacent: $O(k^2)$ |

### P $\subseteq$ NP

Every problem in P is also in NP. If we can solve a problem in polynomial time, we can certainly verify a "yes" answer in polynomial time — we simply ignore the certificate and solve the problem from scratch. The deep open question is whether the converse holds.

## The class co-NP

**Definition.** $\mathbf{co\text{-}NP}$ is the class of decision problems whose **complement** is in NP. Equivalently, a problem is in co-NP if "no" answers can be verified in polynomial time.

For example, "Is this formula unsatisfiable?" is in co-NP: if the formula is satisfiable, a satisfying assignment serves as a short certificate of "no" (to the unsatisfiability question). But proving unsatisfiability — providing a certificate that no satisfying assignment exists — appears to require exponential-length proofs in general.

It is known that $\mathbf{P} \subseteq \mathbf{NP} \cap \mathbf{co\text{-}NP}$. Whether $\mathbf{NP} = \mathbf{co\text{-}NP}$ is another major open question in complexity theory.

## The P versus NP question

The most famous open problem in theoretical computer science — and one of the seven Clay Millennium Prize Problems — asks:

> **Is P = NP?**

If P = NP, then every problem whose solution can be efficiently verified can also be efficiently solved. This would have profound consequences: public-key cryptography would be broken, many optimization problems in logistics, biology, and AI would become tractable, and mathematical proof search would be automatable.

Most researchers believe $\mathbf{P} \neq \mathbf{NP}$, based on decades of failed attempts to find polynomial algorithms for NP-complete problems. But a proof remains elusive.

## Polynomial-time reductions

To compare the difficulty of problems, we use **polynomial-time reductions**.

**Definition.** A polynomial-time reduction from problem $A$ to problem $B$ (written $A \leq_P B$) is a polynomial-time computable function $f$ such that for all inputs $x$:

$$x \in A \iff f(x) \in B$$

If $A \leq_P B$, then B is "at least as hard as" A:

- If B is in P, then A is in P (we can solve A by reducing to B and solving B).
- If A is not in P, then B is not in P either.

Reductions are **transitive**: if $A \leq_P B$ and $B \leq_P C$, then $A \leq_P C$.

## NP-completeness

**Definition.** A problem $B$ is **NP-hard** if every problem $A$ in NP satisfies $A \leq_P B$.

**Definition.** A problem $B$ is **NP-complete** if:
1. $B \in \mathbf{NP}$, and
2. $B$ is NP-hard.

NP-complete problems are the "hardest" problems in NP: if any one of them can be solved in polynomial time, then **every** problem in NP can be solved in polynomial time, and P = NP.

### The Cook-Levin theorem

The foundational result in NP-completeness theory is:

> **Theorem (Cook 1971, Levin 1973).** The Boolean satisfiability problem (SAT) is NP-complete.

**SAT:** Given a Boolean formula $\phi$ in conjunctive normal form (CNF), is there a truth assignment to its variables that makes $\phi$ true?

The proof (which we state without proving) shows that any computation of a nondeterministic Turing machine can be encoded as a Boolean formula in polynomial time. This means SAT is universal — every NP problem reduces to it.

Once SAT was shown to be NP-complete, the floodgates opened. Proving that a new problem $B$ is NP-complete requires just two steps:

1. Show $B \in \mathbf{NP}$ (exhibit a polynomial-time verifier).
2. Show that some known NP-complete problem $A$ reduces to $B$: $A \leq_P B$.

By transitivity, this means every NP problem reduces to $B$.

## Classic NP-complete problems

Thousands of problems have been shown to be NP-complete. Here are some of the most important, organized by domain.

### Boolean satisfiability

**SAT.** Given a CNF formula (conjunction of clauses, each a disjunction of literals), is it satisfiable?

**3-SAT.** A restriction of SAT where each clause has exactly 3 literals. Despite the restriction, 3-SAT remains NP-complete (SAT reduces to 3-SAT by clause splitting). 3-SAT is the starting point for most NP-completeness reductions because its structure is simple yet expressive.

Note that **2-SAT** is in P — it can be solved in linear time using strongly connected components. The jump from 2 to 3 literals per clause is where tractability breaks down.

### Graph problems

**VERTEX COVER.** Given a graph $G = (V, E)$ and an integer $k$, is there a set $S \subseteq V$ with $|S| \leq k$ such that every edge has at least one endpoint in $S$?

**INDEPENDENT SET.** Given $G$ and $k$, is there a set $S \subseteq V$ with $|S| \geq k$ such that no two vertices in $S$ are adjacent? (Complement of vertex cover: $S$ is independent $\iff$ $V \setminus S$ is a vertex cover.)

**CLIQUE.** Given $G$ and $k$, does $G$ contain a complete subgraph on $k$ vertices?

**HAMILTONIAN CYCLE.** Given $G$, does it contain a cycle that visits every vertex exactly once?

**GRAPH COLORING.** Given $G$ and $k$, can the vertices be colored with $k$ colors so that no two adjacent vertices share a color? NP-complete for $k \geq 3$.

### Numeric problems

**SUBSET SUM.** Given a set $S$ of integers and a target $t$, is there a subset of $S$ that sums to exactly $t$?

**PARTITION.** Given a multiset of integers, can it be partitioned into two subsets with equal sum? (A special case of subset sum with $t = \text{total}/2$.)

**BIN PACKING.** Given items of various sizes and bins of capacity $C$, can all items be packed into $k$ bins?

### Optimization problems (decision versions)

**TRAVELING SALESMAN (TSP).** Given a complete weighted graph and a bound $B$, is there a Hamiltonian cycle of total weight $\leq B$?

**SET COVER.** Given a universe $U$, a collection of subsets $S_1, \ldots, S_m$, and an integer $k$, is there a sub-collection of $\leq k$ sets whose union is $U$?

## Proving NP-completeness by reduction: a worked example

We prove that **VERTEX COVER** is NP-complete by reducing from 3-SAT.

### Step 1: VERTEX COVER is in NP

**Certificate:** A set $S$ of at most $k$ vertices.
**Verification:** Check $|S| \leq k$ and that every edge $(u, v) \in E$ has $u \in S$ or $v \in S$. This takes $O(V + E)$ time. $\checkmark$

### Step 2: 3-SAT $\leq_P$ VERTEX COVER

Given a 3-SAT formula $\phi$ with $n$ variables $x_1, \ldots, x_n$ and $m$ clauses $C_1, \ldots, C_m$, we construct a graph $G$ and a number $k$ such that:

$$\phi \text{ is satisfiable} \iff G \text{ has a vertex cover of size } \leq k$$

**Construction:**

1. **Variable gadgets.** For each variable $x_i$, create two vertices $x_i$ and $\overline{x}_i$ connected by an edge. Any vertex cover must include at least one of $\{x_i, \overline{x}_i\}$ — this models the truth assignment.

2. **Clause gadgets.** For each clause $C_j = (\ell_a \lor \ell_b \lor \ell_c)$, create a triangle on three new vertices $a_j, b_j, c_j$. Any vertex cover must include at least 2 of these 3 vertices.

3. **Connection edges.** Connect $a_j$ to the vertex representing literal $\ell_a$ (that is, $x_i$ if $\ell_a = x_i$, or $\overline{x}_i$ if $\ell_a = \overline{x}_i$). Similarly for $b_j$ and $c_j$.

4. **Set $k = n + 2m$.**

**Correctness (sketch):**

- ($\Rightarrow$) If $\phi$ is satisfiable, pick the true literal from each variable gadget ($n$ vertices), and for each clause triangle, pick the 2 vertices whose connection edges lead to **false** literals (which are not in the cover from step 1). This gives a vertex cover of size $n + 2m$.

- ($\Leftarrow$) If $G$ has a vertex cover of size $\leq k = n + 2m$, then exactly 1 vertex per variable gadget and exactly 2 per clause triangle are chosen (since we need at least $n + 2m$). The vertex not covered in each clause triangle must have its connection edge covered by the variable-gadget vertex — meaning the corresponding literal is true. So $\phi$ is satisfiable.

The construction takes polynomial time (the graph has $2n + 3m$ vertices and $n + 6m$ edges), so this is a valid polynomial-time reduction. Since 3-SAT is NP-complete and reduces to VERTEX COVER, and VERTEX COVER is in NP, VERTEX COVER is NP-complete. $\square$

## The reduction landscape

Many NP-completeness proofs follow chains of reductions from SAT or 3-SAT:

```
SAT
 └─→ 3-SAT
      ├─→ INDEPENDENT SET ──→ CLIQUE
      ├─→ VERTEX COVER
      ├─→ HAMILTONIAN CYCLE ──→ TSP
      ├─→ SUBSET SUM ──→ PARTITION ──→ BIN PACKING
      ├─→ GRAPH COLORING
      └─→ SET COVER
```

Each arrow represents a polynomial-time reduction. The diversity of these problems — spanning logic, graphs, numbers, and optimization — is what makes NP-completeness so remarkable: all these seemingly unrelated problems are computationally equivalent.

## Brute-force illustrations

To make the exponential nature of NP-complete problems concrete, we implement brute-force solvers for two classic problems. These are educational implementations — they work correctly but have exponential running times that make them impractical for large inputs.

### Subset sum (brute force)

The brute-force approach enumerates all $2^n$ subsets of the input set and checks whether any of them sums to the target.

**Algorithm:**

```
SUBSET-SUM-BRUTE(S, t):
    n ← |S|
    for mask ← 1 to 2^n − 1:
        sum ← 0
        subset ← ∅
        for i ← 0 to n − 1:
            if bit i of mask is set:
                sum ← sum + S[i]
                add S[i] to subset
        if sum = t:
            return (true, subset)
    return (false, ∅)
```

**Implementation:**

```typescript
export interface SubsetSumResult {
  found: boolean;
  subset: number[];
}

export function subsetSum(
  nums: readonly number[],
  target: number,
): SubsetSumResult {
  const n = nums.length;

  if (n > 30) {
    throw new RangeError(
      `input size ${n} is too large for brute-force enumeration (max 30)`,
    );
  }

  if (target === 0) {
    return { found: true, subset: [] };
  }

  const total = 1 << n;

  for (let mask = 1; mask < total; mask++) {
    let sum = 0;
    const subset: number[] = [];

    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        sum += nums[i]!;
        subset.push(nums[i]!);
      }
    }

    if (sum === target) {
      return { found: true, subset };
    }
  }

  return { found: false, subset: [] };
}
```

**Complexity:**

- **Time:** $O(2^n \cdot n)$. There are $2^n$ subsets, and summing each takes $O(n)$.
- **Space:** $O(n)$ for the current subset.

Note that the dynamic programming approach from Chapter 16 (the 0/1 knapsack DP) can solve subset sum in $O(n \cdot t)$ time when $t$ is bounded. But $O(n \cdot t)$ is **pseudo-polynomial** — polynomial in the numeric value of $t$, not in the number of bits needed to encode $t$. The subset sum problem remains NP-complete because the target $t$ can be exponentially large relative to the input length.

### Traveling salesman (brute force)

The brute-force TSP solver generates all $(n-1)!$ permutations of cities (fixing the starting city) and evaluates each tour.

**Algorithm:**

```
TSP-BRUTE(dist[0..n-1][0..n-1]):
    bestDist ← ∞
    bestTour ← nil
    for each permutation π of {1, 2, ..., n-1}:
        cost ← dist[0][π[0]]
        for i ← 0 to n − 3:
            cost ← cost + dist[π[i]][π[i+1]]
        cost ← cost + dist[π[n−2]][0]
        if cost < bestDist:
            bestDist ← cost
            bestTour ← (0, π[0], ..., π[n−2])
    return (bestTour, bestDist)
```

**Implementation:**

```typescript
export type DistanceMatrix = readonly (readonly number[])[];

export interface TSPResult {
  tour: number[];
  distance: number;
}

export function tspBruteForce(dist: DistanceMatrix): TSPResult {
  const n = dist.length;

  if (n === 0) {
    throw new RangeError('distance matrix must not be empty');
  }
  if (n > 12) {
    throw new RangeError(
      `input size ${n} is too large for brute-force TSP (max 12)`,
    );
  }

  if (n === 1) return { tour: [0], distance: 0 };
  if (n === 2) {
    return { tour: [0, 1], distance: dist[0]![1]! + dist[1]![0]! };
  }

  const remaining = Array.from({ length: n - 1 }, (_, i) => i + 1);
  let bestDistance = Infinity;
  let bestTour: number[] = [];

  function tourCost(perm: number[]): number {
    let cost = dist[0]![perm[0]!]!;
    for (let i = 0; i < perm.length - 1; i++) {
      cost += dist[perm[i]!]![perm[i + 1]!]!;
    }
    cost += dist[perm[perm.length - 1]!]![0]!;
    return cost;
  }

  function heapPermute(arr: number[], size: number): void {
    if (size === 1) {
      const cost = tourCost(arr);
      if (cost < bestDistance) {
        bestDistance = cost;
        bestTour = [0, ...arr];
      }
      return;
    }
    for (let i = 0; i < size; i++) {
      heapPermute(arr, size - 1);
      const swapIdx = size % 2 === 0 ? i : 0;
      const temp = arr[swapIdx]!;
      arr[swapIdx] = arr[size - 1]!;
      arr[size - 1] = temp;
    }
  }

  heapPermute(remaining, remaining.length);
  return { tour: bestTour, distance: bestDistance };
}
```

**Complexity:**

- **Time:** $O(n!)$. We fix city 0 and generate all $(n-1)!$ permutations of the remaining cities. Each permutation requires $O(n)$ to evaluate, giving $O(n \cdot (n-1)!) = O(n!)$ total.
- **Space:** $O(n)$ for the recursion stack and current permutation.

The factorial growth makes this approach completely impractical beyond about 12–15 cities:

| $n$ | $(n-1)!$ permutations |
|-----|----------------------:|
| 5 | 24 |
| 8 | 5,040 |
| 10 | 362,880 |
| 12 | 39,916,800 |
| 15 | 87,178,291,200 |
| 20 | $\approx 1.2 \times 10^{17}$ |

For practical TSP instances (hundreds or thousands of cities), we need approximation algorithms (Chapter 22), branch-and-bound, or metaheuristics like simulated annealing and genetic algorithms.

## Coping with NP-hardness

When faced with an NP-hard problem, giving up is not the answer. Several strategies can yield useful solutions:

### 1. Approximation algorithms

Accept a solution that is provably close to optimal. For example:

- **Vertex cover:** A simple greedy algorithm achieves a 2-approximation — it always finds a cover at most twice the size of the optimum (Chapter 22).
- **Metric TSP:** An MST-based algorithm achieves a 2-approximation when the triangle inequality holds (Chapter 22).
- **Set cover:** A greedy algorithm achieves an $O(\log n)$-approximation (Chapter 22).

The key advantage is a **guaranteed approximation ratio** — we know how far from optimal the solution can be.

### 2. Exact algorithms for special cases

Many NP-hard problems become tractable for restricted inputs:

- **TSP on planar graphs** can be solved in $O(2^{O(\sqrt{n})} \cdot n)$ time.
- **Vertex cover** parameterized by $k$ can be solved in $O(2^k \cdot n)$ time (fixed-parameter tractable).
- **2-SAT** is solvable in linear time, even though 3-SAT is NP-complete.
- **Tree-width bounded graphs** admit polynomial-time algorithms for many NP-hard problems.

### 3. Pseudo-polynomial algorithms

Problems like subset sum and knapsack have algorithms running in $O(n \cdot W)$ time, where $W$ is a numeric parameter. When $W$ is small relative to $n$, these algorithms are practical despite the problem's NP-completeness. See the dynamic programming chapter (Chapter 16) for implementations.

### 4. Heuristics and metaheuristics

When provable guarantees are not needed, heuristic methods often find good solutions quickly:

- **Local search:** Start with a random solution and iteratively improve it by making small changes (e.g., 2-opt for TSP swaps pairs of edges).
- **Simulated annealing:** Like local search, but occasionally accepts worse solutions to escape local optima, with the probability of acceptance decreasing over time.
- **Genetic algorithms:** Maintain a population of solutions, combine them via crossover, and apply mutation to explore the search space.
- **Branch and bound:** Systematically explore the solution space, pruning branches that provably cannot improve on the best solution found so far.

### 5. Randomized algorithms

Randomization can sometimes break through worst-case barriers:

- **Random sampling** can quickly find satisfying assignments for SAT instances that are not too constrained.
- **Randomized rounding** of linear programming relaxations yields good approximations for many NP-hard problems.

## Summary of complexity classes

| Class | Informal definition | Examples |
|-------|--------------------|---------|
| **P** | Efficiently solvable (polynomial time) | Sorting, shortest path, MST, max flow |
| **NP** | Efficiently verifiable (polynomial-time certificate for "yes") | SAT, TSP, subset sum, clique, coloring |
| **co-NP** | Efficiently verifiable "no" answers | Tautology, primality (also in P) |
| **NP-complete** | Hardest problems in NP (every NP problem reduces to them) | 3-SAT, vertex cover, TSP, subset sum |
| **NP-hard** | At least as hard as NP-complete (but may not be in NP) | Halting problem, optimal chess play |

Relationships: $\mathbf{P} \subseteq \mathbf{NP} \cap \mathbf{co\text{-}NP} \subseteq \mathbf{NP} \cup \mathbf{co\text{-}NP}$.

Whether any of these inclusions are strict is unknown (except that NP-hard $\not\subseteq$ NP, since NP-hard includes undecidable problems).

## Exercises

1. **NP membership.** Show that the CLIQUE problem is in NP by describing a certificate and a polynomial-time verifier. What is the running time of your verifier?

2. **Reduction practice.** Prove that INDEPENDENT SET is NP-complete by reducing from VERTEX COVER. (Hint: $S$ is an independent set in $G$ if and only if $V \setminus S$ is a vertex cover.)

3. **Subset sum variants.** The PARTITION problem asks whether a multiset of integers can be divided into two subsets of equal sum. Show that PARTITION is NP-complete by reducing from SUBSET SUM. (Hint: given a SUBSET SUM instance $(S, t)$, construct a PARTITION instance by adding appropriate elements.)

4. **Pseudo-polynomial vs polynomial.** Explain why the $O(nW)$ dynamic programming algorithm for 0/1 knapsack does not prove P = NP, even though knapsack is NP-complete. What is the relationship between $W$ and the input size?

5. **Brute-force analysis.** Suppose you have a computer that can evaluate $10^9$ TSP tours per second. How long would it take to solve a 20-city instance by brute force? A 25-city instance? Express your answers in meaningful time units (seconds, years, etc.).

## Chapter summary

This chapter introduced the theoretical framework for classifying computational problems by their inherent difficulty.

**P** contains problems solvable in polynomial time — the "efficiently solvable" problems that have been our focus throughout this book. **NP** contains problems whose solutions can be verified in polynomial time, even if finding a solution may be hard. The question of whether P = NP — whether efficient verification implies efficient solution — is the most important open problem in computer science.

**NP-complete** problems, identified through polynomial-time reductions, are the hardest problems in NP: solving any one of them efficiently would solve all of them. The Cook-Levin theorem established SAT as the first NP-complete problem, and thousands more have been identified through chains of reductions — from satisfiability to graph problems (vertex cover, clique, Hamiltonian cycle), to numeric problems (subset sum, partition), to optimization problems (TSP, set cover).

We implemented brute-force solvers for two NP-complete problems to illustrate their exponential nature:

- **Subset sum** by exhaustive enumeration of all $2^n$ subsets: $O(2^n \cdot n)$ time.
- **TSP** by exhaustive enumeration of all $(n-1)!$ permutations: $O(n!)$ time.

When facing NP-hard problems in practice, we have several coping strategies: **approximation algorithms** with provable guarantees (Chapter 22), **exact algorithms for special cases** (e.g., fixed-parameter tractability, bounded tree-width), **pseudo-polynomial algorithms** (e.g., DP for knapsack when the target is small), and **heuristics** (local search, simulated annealing, genetic algorithms). The theory of NP-completeness tells us not that these problems are unsolvable, but that we should not expect a polynomial-time algorithm that works optimally on all instances — and guides us toward the right tool for each situation.
