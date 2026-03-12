# Approximation Algorithms

_Throughout this book we have designed algorithms that solve problems exactly and efficiently. But in the previous chapter we saw that many important optimization problems — minimum vertex cover, set cover, traveling salesman — are NP-hard: no polynomial-time algorithm is known, and most researchers believe none exists. Approximation algorithms offer a powerful middle ground: polynomial-time algorithms that produce solutions provably close to optimal. Instead of finding the best solution, we settle for one that is guaranteed to be within a known factor of the best. In this chapter we formalize approximation ratios, then study three classical algorithms: a 2-approximation for vertex cover, a greedy $O(\log n)$-approximation for set cover, and a 2-approximation for metric TSP via minimum spanning trees._

## When exact solutions are infeasible

Chapter 21 demonstrated that brute-force approaches to NP-hard problems are impractical for all but the smallest inputs. A brute-force TSP solver exhausts $(n-1)!$ permutations, which is infeasible beyond about 12–15 cities. A brute-force subset sum examines $2^n$ subsets, limiting us to roughly 30 elements.

For real-world instances — routing delivery trucks through hundreds of stops, selecting facilities to cover a service region, or allocating resources across a network — we need algorithms that:

1. **Run in polynomial time** (ideally $O(n^2)$ or $O(n^3)$, not $O(2^n)$).
2. **Provide a quality guarantee** — we can bound how far the solution is from optimal.

Approximation algorithms deliver both.

## Approximation ratios

Let $\mathcal{A}$ be a polynomial-time algorithm for an optimization problem, and let $\text{OPT}(I)$ denote the cost of an optimal solution for instance $I$.

**Definition.** Algorithm $\mathcal{A}$ has **approximation ratio** $\rho(n)$ if, for every instance $I$ of size $n$:

$$\max\left(\frac{\mathcal{A}(I)}{\text{OPT}(I)},\; \frac{\text{OPT}(I)}{\mathcal{A}(I)}\right) \leq \rho(n)$$

The ratio is always $\geq 1$. For minimization problems, $\mathcal{A}(I) \leq \rho(n) \cdot \text{OPT}(I)$. For maximization problems, $\mathcal{A}(I) \geq \text{OPT}(I) / \rho(n)$.

An algorithm with approximation ratio $\rho$ is called a **$\rho$-approximation algorithm**.

Some important distinctions:

- A **constant-factor approximation** has $\rho(n) = c$ for some constant $c$ (e.g., the 2-approximation for vertex cover).
- A **logarithmic approximation** has $\rho(n) = O(\log n)$ (e.g., greedy set cover).
- A **polynomial-time approximation scheme (PTAS)** achieves ratio $1 + \epsilon$ for any constant $\epsilon > 0$, though the running time may depend on $1/\epsilon$.
- A **fully polynomial-time approximation scheme (FPTAS)** is a PTAS whose running time is polynomial in both $n$ and $1/\epsilon$.

Not all NP-hard problems can be approximated equally well. Under standard complexity assumptions:

| Problem | Best known ratio | Hardness of approximation |
|---------|:---:|---|
| Vertex cover | 2 | Cannot do better than $\approx 1.36$ unless P = NP |
| Set cover | $\ln n + 1$ | Cannot do better than $(1 - \epsilon) \ln n$ unless P = NP |
| Metric TSP | 1.5 (Christofides) | Cannot do better than $\frac{123}{122}$ unless P = NP |
| General TSP | — | No constant-factor approximation unless P = NP |
| MAX-3SAT | 7/8 | Cannot do better than $7/8 + \epsilon$ unless P = NP |
| Knapsack | FPTAS | Has a $(1 + \epsilon)$-approximation for any $\epsilon > 0$ |

## Vertex cover: 2-approximation

### Problem definition

Given an undirected graph $G = (V, E)$, a **vertex cover** is a subset $C \subseteq V$ such that every edge in $E$ has at least one endpoint in $C$. The **minimum vertex cover** problem asks for a cover of smallest size.

Vertex cover is one of Karp's 21 NP-complete problems (1972) and has a natural relationship to the independent set problem: $S$ is an independent set if and only if $V \setminus S$ is a vertex cover.

### The algorithm

The 2-approximation is elegantly simple:

1. Start with an empty cover $C$ and the full edge set $E'$.
2. Pick an arbitrary uncovered edge $(u, v)$ from $E'$.
3. Add **both** endpoints $u$ and $v$ to $C$.
4. Remove all edges incident to $u$ or $v$ from $E'$.
5. Repeat until $E'$ is empty.

The key insight is that the edges we pick in step 2 form a **matching** $M$ — a set of edges that share no endpoints. Every vertex cover must include at least one endpoint of each matching edge, so $\text{OPT} \geq |M|$. Our algorithm adds exactly 2 vertices per matching edge, giving $|C| = 2|M| \leq 2 \cdot \text{OPT}$.

### Pseudocode

```
APPROX-VERTEX-COVER(G):
    C ← ∅
    E' ← E
    while E' ≠ ∅:
        pick any edge (u, v) ∈ E'
        C ← C ∪ {u, v}
        remove all edges incident to u or v from E'
    return C
```

### Proof of the 2-approximation

**Claim:** $|C| \leq 2 \cdot \text{OPT}$.

**Proof.** Let $M$ be the set of edges selected by the algorithm. By construction:

1. No two edges in $M$ share an endpoint (each time we select an edge, we remove all incident edges). So $M$ is a matching.
2. The algorithm adds both endpoints of each matching edge: $|C| = 2|M|$.
3. Any vertex cover must include at least one endpoint of every edge, including every edge in $M$. Since matching edges are disjoint, the optimal cover needs at least $|M|$ vertices: $\text{OPT} \geq |M|$.
4. Therefore $|C| = 2|M| \leq 2 \cdot \text{OPT}$. $\square$

### TypeScript implementation

```typescript
import { Graph } from '../12-graphs-and-traversal/graph.js';

export interface VertexCoverResult<T> {
  cover: Set<T>;
  size: number;
}

export function vertexCover<T>(graph: Graph<T>): VertexCoverResult<T> {
  if (graph.directed) {
    throw new Error('Vertex cover requires an undirected graph');
  }

  const cover = new Set<T>();
  const edges = graph.getEdges();

  for (const edge of edges) {
    // If neither endpoint is already covered, add both.
    if (!cover.has(edge.from) && !cover.has(edge.to)) {
      cover.add(edge.from);
      cover.add(edge.to);
    }
  }

  return { cover, size: cover.size };
}
```

Note that the implementation iterates over edges and skips any edge that already has a covered endpoint — this is equivalent to "removing incident edges" in the pseudocode, since we only select an edge when both endpoints are uncovered.

**Complexity:**

- **Time:** $O(V + E)$ — we iterate over all edges once.
- **Space:** $O(V + E)$ — for the edge list and the cover set.

### Worked example

Consider this graph:

```
    1 --- 2
    |     |
    3 --- 4 --- 5
```

Edges: (1,2), (1,3), (2,4), (3,4), (4,5).

Suppose the algorithm processes edges in order:

1. Pick (1,2): add 1 and 2 to $C$. Remove (1,2), (1,3), (2,4).
2. Remaining edges: (3,4), (4,5). Pick (3,4): add 3 and 4 to $C$. Remove (3,4), (4,5).
3. No edges remain. $C = \{1, 2, 3, 4\}$, $|C| = 4$.

The matching was $M = \{(1,2), (3,4)\}$, so $|M| = 2$.

The optimal cover is $\{2, 4\}$ or $\{1, 4\}$ with $\text{OPT} = 2$. Our algorithm returned $|C| = 4 = 2 \cdot \text{OPT}$, which is exactly the worst case of the 2-approximation guarantee.

### Tightness of the bound

The factor of 2 is tight for this algorithm. Consider the complete bipartite graph $K_{n,n}$ with $n$ vertices on each side. The optimal vertex cover selects one side: $\text{OPT} = n$. A maximal matching has $n$ edges (one from each left vertex to a right vertex), and the algorithm adds both endpoints: $|C| = 2n = 2 \cdot \text{OPT}$.

Whether vertex cover can be approximated with a ratio better than 2 in polynomial time is a major open problem. The best known lower bound (assuming the Unique Games Conjecture) is $2 - \epsilon$ for any $\epsilon > 0$.

## Greedy set cover: $O(\log n)$-approximation

### Problem definition

Given a universe $U = \{e_1, e_2, \ldots, e_n\}$ and a collection $\mathcal{S} = \{S_1, S_2, \ldots, S_m\}$ of subsets of $U$ whose union is $U$, the **set cover** problem asks for the smallest sub-collection of $\mathcal{S}$ that covers every element of $U$.

Set cover is a fundamental NP-hard problem that generalizes vertex cover (each vertex corresponds to a "set" of its incident edges, and the universe is the edge set).

### The greedy algorithm

The greedy strategy is intuitive: at each step, select the subset that covers the most currently-uncovered elements.

```
GREEDY-SET-COVER(U, S):
    C ← ∅                  // selected subsets
    uncovered ← U
    while uncovered ≠ ∅:
        select S_i ∈ S maximizing |S_i ∩ uncovered|
        C ← C ∪ {S_i}
        uncovered ← uncovered \ S_i
    return C
```

### Proof of the $O(\log n)$-approximation

**Theorem.** The greedy algorithm produces a cover of size at most $H(\max_i |S_i|) \cdot \text{OPT}$, where $H(k) = 1 + \frac{1}{2} + \cdots + \frac{1}{k} \leq \ln k + 1$ is the $k$-th harmonic number.

**Proof sketch.** We use a charging argument. When the greedy algorithm selects a set $S_i$ that covers $k$ new elements, we "charge" each newly covered element a cost of $\frac{1}{k}$.

Consider any element $e$ that was covered when $t$ elements remained uncovered. The greedy choice covers at least $t / \text{OPT}$ elements (because the optimal solution uses $\text{OPT}$ sets to cover everything, so by pigeonhole, some set covers at least $t / \text{OPT}$ of the remaining elements). So element $e$'s charge is at most $\text{OPT} / t$.

Summing over all elements in the order they were covered:

$$\text{Greedy cost} \leq \sum_{t=1}^{n} \frac{\text{OPT}}{t} = \text{OPT} \cdot H(n) \leq \text{OPT} \cdot (\ln n + 1) \quad \square$$

### TypeScript implementation

```typescript
export interface SetCoverResult<T> {
  selectedIndices: number[];
  selectedSets: ReadonlySet<T>[];
  count: number;
}

export function setCover<T>(
  universe: ReadonlySet<T>,
  subsets: readonly ReadonlySet<T>[],
): SetCoverResult<T> {
  if (universe.size === 0) {
    return { selectedIndices: [], selectedSets: [], count: 0 };
  }

  const uncovered = new Set<T>(universe);
  const selectedIndices: number[] = [];
  const selectedSets: ReadonlySet<T>[] = [];
  const used = new Set<number>();

  while (uncovered.size > 0) {
    let bestIndex = -1;
    let bestCount = 0;

    for (let i = 0; i < subsets.length; i++) {
      if (used.has(i)) continue;
      let count = 0;
      for (const elem of subsets[i]!) {
        if (uncovered.has(elem)) count++;
      }
      if (count > bestCount) {
        bestCount = count;
        bestIndex = i;
      }
    }

    if (bestIndex === -1 || bestCount === 0) {
      throw new Error(
        'Subsets do not cover the entire universe; ' +
          `${uncovered.size} element(s) remain uncovered`,
      );
    }

    used.add(bestIndex);
    selectedIndices.push(bestIndex);
    selectedSets.push(subsets[bestIndex]!);

    for (const elem of subsets[bestIndex]!) {
      uncovered.delete(elem);
    }
  }

  return { selectedIndices, selectedSets, count: selectedIndices.length };
}
```

**Complexity:**

- **Time:** $O(|U| \cdot |\mathcal{S}| \cdot \max_i |S_i|)$ in the worst case. Each of the at most $|\mathcal{S}|$ iterations scans all subsets, and each scan examines up to $\max_i |S_i|$ elements.
- **Space:** $O(|U| + \sum_i |S_i|)$.

### Worked example

Universe: $U = \{1, 2, 3, 4, 5, 6\}$

Subsets:

| Set | Elements |
|-----|----------|
| $S_1$ | $\{1, 2, 3\}$ |
| $S_2$ | $\{2, 4\}$ |
| $S_3$ | $\{3, 4, 5\}$ |
| $S_4$ | $\{5, 6\}$ |

**Iteration 1:** Uncovered = $\{1, 2, 3, 4, 5, 6\}$.

- $S_1$ covers 3 elements, $S_2$ covers 2, $S_3$ covers 3, $S_4$ covers 2.
- Tie between $S_1$ and $S_3$; pick $S_1$.
- Uncovered = $\{4, 5, 6\}$.

**Iteration 2:** $S_2$ covers 1 ($\{4\}$), $S_3$ covers 2 ($\{4, 5\}$), $S_4$ covers 2 ($\{5, 6\}$). Pick $S_3$.

- Uncovered = $\{6\}$.

**Iteration 3:** $S_2$ covers 0, $S_4$ covers 1 ($\{6\}$). Pick $S_4$.

- Uncovered = $\emptyset$.

Result: $\{S_1, S_3, S_4\}$, 3 subsets. The optimal solution is also 3 (e.g., $\{S_1, S_2, S_4\}$), so the greedy algorithm found an optimal solution in this case.

### Optimality of the greedy bound

The $O(\log n)$ approximation ratio is essentially the best possible for set cover. Under standard complexity assumptions, no polynomial-time algorithm can achieve a ratio better than $(1 - \epsilon) \ln n$ for any $\epsilon > 0$.

## Metric TSP: 2-approximation via MST

### Problem definition

The **Traveling Salesman Problem (TSP)** asks for the shortest Hamiltonian cycle (a tour visiting every vertex exactly once and returning to the start) in a complete weighted graph.

General TSP is not only NP-hard but also inapproximable: no polynomial-time algorithm can achieve any constant approximation ratio unless P = NP. (The proof: if we could approximate within any factor $\rho$, we could solve the NP-complete Hamiltonian cycle problem by assigning weight 1 to existing edges and weight $\rho n + 1$ to missing edges.)

However, many practical TSP instances satisfy the **triangle inequality**: for all vertices $u, v, w$:

$$d(u, w) \leq d(u, v) + d(v, w)$$

This holds for Euclidean distances, shortest-path distances in networks, and most other natural distance metrics. The resulting **metric TSP** admits constant-factor approximations.

### The MST-based algorithm

The algorithm exploits a fundamental relationship between MSTs and optimal tours:

1. **Compute an MST** of the complete graph.
2. **Perform a DFS preorder traversal** of the MST.
3. **The preorder sequence**, with a return edge to the start, forms the tour.

```
APPROX-METRIC-TSP(G, d):
    T ← MST(G)                           // Prim's or Kruskal's
    tour ← DFS-PREORDER(T, starting from vertex 0)
    return tour
```

### Why this works: the shortcutting argument

Consider the **full walk** of the MST: start at the root, and traverse every edge twice (once going down, once returning). This walk visits every vertex but may visit some vertices multiple times. Its total cost is exactly $2 \cdot w(T)$, where $w(T)$ is the MST weight.

The preorder traversal is a **shortcut** of this full walk: whenever the walk would revisit an already-visited vertex, we skip directly to the next unvisited vertex. By the triangle inequality, skipping vertices can only decrease the total distance:

$$d(u, w) \leq d(u, v) + d(v, w)$$

So the shortcutted tour costs at most $2 \cdot w(T)$.

### Proof of the 2-approximation

**Claim:** The MST-based tour has cost at most $2 \cdot \text{OPT}$.

**Proof.**

1. **MST $\leq$ OPT:** Removing any edge from the optimal tour yields a spanning tree. Since the MST is the minimum-weight spanning tree: $w(T) \leq \text{OPT}$.
2. **Tour $\leq$ 2 $\cdot$ MST:** The full walk costs $2 \cdot w(T)$, and the shortcutted preorder tour costs at most this (by the triangle inequality).
3. Combining: $\text{Tour} \leq 2 \cdot w(T) \leq 2 \cdot \text{OPT}$. $\square$

### TypeScript implementation

```typescript
import type { DistanceMatrix } from '../21-complexity/tsp-brute-force.js';
import { Graph } from '../12-graphs-and-traversal/graph.js';
import { prim } from '../14-minimum-spanning-trees/prim.js';

export interface MetricTSPResult {
  tour: number[];
  distance: number;
}

export function metricTSP(dist: DistanceMatrix): MetricTSPResult {
  const n = dist.length;

  if (n === 0) throw new RangeError('distance matrix must not be empty');
  for (let i = 0; i < n; i++) {
    if (dist[i]!.length !== n) {
      throw new Error(
        `distance matrix must be square (row ${i} has ` +
          `${dist[i]!.length} columns, expected ${n})`,
      );
    }
  }
  if (n === 1) return { tour: [0], distance: 0 };
  if (n === 2) {
    return { tour: [0, 1], distance: dist[0]![1]! + dist[1]![0]! };
  }

  // Build a complete undirected graph.
  const graph = new Graph<number>(false);
  for (let i = 0; i < n; i++) graph.addVertex(i);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      graph.addEdge(i, j, dist[i]![j]!);
    }
  }

  // Step 1: Compute MST.
  const mst = prim(graph, 0);

  // Build MST adjacency list.
  const mstAdj = new Map<number, number[]>();
  for (let i = 0; i < n; i++) mstAdj.set(i, []);
  for (const edge of mst.edges) {
    mstAdj.get(edge.from)!.push(edge.to);
    mstAdj.get(edge.to)!.push(edge.from);
  }

  // Step 2: DFS preorder traversal.
  const tour: number[] = [];
  const visited = new Set<number>();

  function dfsPreorder(v: number): void {
    visited.add(v);
    tour.push(v);
    for (const neighbor of mstAdj.get(v)!) {
      if (!visited.has(neighbor)) dfsPreorder(neighbor);
    }
  }

  dfsPreorder(0);

  // Step 3: Compute tour distance.
  let distance = 0;
  for (let i = 0; i < tour.length - 1; i++) {
    distance += dist[tour[i]!]![tour[i + 1]!]!;
  }
  distance += dist[tour[tour.length - 1]!]![tour[0]!]!;

  return { tour, distance };
}
```

**Complexity:**

- **Time:** $O(V^2 \log V)$ — constructing the complete graph is $O(V^2)$, and Prim's algorithm on a complete graph with a binary heap is $O(E \log V) = O(V^2 \log V)$.
- **Space:** $O(V^2)$ for the adjacency list of the complete graph.

### Worked example

Consider 4 cities at the corners of a unit square:

```
  1 -------- 2
  |          |
  |          |
  0 -------- 3
```

Distance matrix (Euclidean):

| | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **0** | 0 | 1 | $\sqrt{2}$ | 1 |
| **1** | 1 | 0 | 1 | $\sqrt{2}$ |
| **2** | $\sqrt{2}$ | 1 | 0 | 1 |
| **3** | 1 | $\sqrt{2}$ | 1 | 0 |

**Step 1: MST** (using Prim's from vertex 0):

- Add edge 0–1 (weight 1)
- Add edge 1–2 (weight 1)
- Add edge 0–3 (weight 1)

MST weight = 3. MST edges: 0–1, 1–2, 0–3.

**Step 2: DFS preorder from 0:**

Visit 0 → visit 1 → visit 2 → backtrack to 1 → backtrack to 0 → visit 3 → backtrack to 0.

Preorder: [0, 1, 2, 3].

**Step 3: Tour cost:**

$d(0,1) + d(1,2) + d(2,3) + d(3,0) = 1 + 1 + 1 + 1 = 4$.

The optimal tour is also 4 (the perimeter of the square), so the approximation is exact in this case.

$\text{OPT} = 4$, MST weight = 3, and $2 \times 3 = 6 \geq 4$ — the guarantee holds.

### Christofides' algorithm: a better bound

While we implemented the 2-approximation for its simplicity, a better algorithm exists. **Christofides' algorithm** (1976) achieves a $\frac{3}{2}$-approximation:

1. Compute an MST $T$.
2. Find the set $O$ of vertices with odd degree in $T$.
3. Compute a minimum-weight perfect matching $M$ on the vertices in $O$.
4. Combine $T$ and $M$ to get an Eulerian multigraph.
5. Find an Eulerian circuit.
6. Shortcut to a Hamiltonian cycle.

The key insight is that combining the MST with a minimum perfect matching on odd-degree vertices produces an Eulerian graph (all degrees even), whose Euler tour can be shortcutted. Since the minimum matching costs at most $\frac{1}{2} \text{OPT}$ (by a pairing argument on the optimal tour), the total cost is at most $w(T) + \frac{1}{2} \text{OPT} \leq \frac{3}{2} \text{OPT}$.

Christofides' algorithm remained the best known approximation for metric TSP for nearly 50 years, until a very slight improvement was achieved by Karlin, Klein, and Oveis Gharan in 2021.

## Comparison of approximation algorithms

| Problem | Algorithm | Ratio | Time | Approach |
|---------|-----------|:-----:|------|----------|
| Vertex cover | Matching-based | 2 | $O(V + E)$ | Pick both endpoints of a maximal matching |
| Set cover | Greedy | $\ln n + 1$ | $O(\lvert U \rvert \cdot \lvert \mathcal{S} \rvert \cdot k)$ | Pick set covering most uncovered elements |
| Metric TSP | MST-based | 2 | $O(V^2 \log V)$ | MST + DFS preorder + shortcutting |
| Metric TSP | Christofides | 1.5 | $O(V^3)$ | MST + minimum matching + Euler tour |

## Beyond the algorithms in this chapter

Approximation algorithms form a rich and active area of research. Some important topics we have not covered include:

- **LP relaxation and rounding:** Many approximation algorithms work by solving a linear programming relaxation of an integer program and then rounding the fractional solution to an integer one. This technique yields tight results for problems like weighted vertex cover and MAX-SAT.

- **Semidefinite programming:** For problems like MAX-CUT, the Goemans-Williamson algorithm uses semidefinite programming to achieve an approximation ratio of approximately 0.878, which is optimal assuming the Unique Games Conjecture.

- **Primal-dual methods:** These construct both a feasible solution and a lower bound simultaneously, useful for network design problems.

- **The PCP theorem:** The celebrated PCP (Probabilistically Checkable Proofs) theorem provides the theoretical foundation for hardness of approximation results, showing that for many problems, achieving certain approximation ratios is as hard as solving the problem exactly.

## Exercises

1. **Vertex cover on trees.** Show that the minimum vertex cover of a tree can be computed exactly in polynomial time using dynamic programming. (Hint: root the tree and compute, for each vertex, the minimum cover of its subtree with and without including that vertex.) Does this contradict the NP-hardness of vertex cover?

2. **Weighted set cover.** Generalize the greedy set cover algorithm to the weighted case, where each subset $S_i$ has a cost $c_i$ and we want to minimize the total cost of selected subsets. Show that the greedy algorithm (pick the set with the smallest cost per newly covered element) achieves the same $O(\log n)$ approximation ratio.

3. **TSP triangle inequality failure.** Construct a graph with 4 vertices where the triangle inequality is violated, and show that the MST-based algorithm produces a tour whose cost exceeds $2 \cdot \text{OPT}$. Explain why the shortcutting argument fails.

4. **MAX-SAT approximation.** Consider the following simple algorithm for MAX-SAT: independently set each variable to true with probability $\frac{1}{2}$. Show that this randomized algorithm satisfies at least $\frac{m}{2}$ clauses in expectation when each clause has at least one literal, and at least $\frac{7m}{8}$ clauses when each clause has exactly 3 literals. (Here $m$ is the number of clauses.) Can you derandomize this algorithm?

5. **Tight examples.** For each of the three algorithms in this chapter, describe a family of instances where the approximation ratio approaches the proven bound. That is: find graphs where the vertex cover algorithm returns a cover of size approaching $2 \cdot \text{OPT}$, set cover instances where the greedy algorithm uses $\Omega(\log n) \cdot \text{OPT}$ sets, and metric TSP instances where the MST tour approaches $2 \cdot \text{OPT}$.

## Chapter summary

Approximation algorithms provide a principled approach to NP-hard optimization problems: polynomial-time algorithms with **provable guarantees** on solution quality.

We studied three classical examples:

- **Vertex cover 2-approximation:** Pick an arbitrary uncovered edge, add both endpoints. The selected edges form a matching, and any cover needs at least one vertex per matching edge, giving a factor-2 guarantee. Runs in $O(V + E)$ time.

- **Greedy set cover $O(\log n)$-approximation:** Repeatedly select the subset covering the most uncovered elements. A charging argument shows the greedy cost is at most $H(n)$ times optimal, where $H(n) \leq \ln n + 1$ is the harmonic number. This ratio is essentially tight: no polynomial-time algorithm can do significantly better unless P = NP.

- **Metric TSP 2-approximation via MST:** Compute a minimum spanning tree, perform a DFS preorder traversal, and return the resulting tour. The MST provides a lower bound on OPT, and the triangle inequality ensures the shortcutted tour costs at most twice the MST weight. Christofides' algorithm improves this to a $\frac{3}{2}$-approximation.

The study of approximation algorithms reveals a rich structure within NP-hard problems. Some problems (like knapsack) admit $(1 + \epsilon)$-approximations for any $\epsilon > 0$. Others (like vertex cover) admit constant-factor approximations but resist improvements below specific thresholds. Still others (like general TSP) cannot be approximated at all. Understanding where a problem falls in this landscape guides us toward the most effective algorithmic approach.
