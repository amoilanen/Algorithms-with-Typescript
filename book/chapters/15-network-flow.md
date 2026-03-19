# Network Flow

_In Chapters 12–14 we studied graphs from the perspective of connectivity and distance — traversals, shortest paths, and spanning trees. In this chapter we shift focus to a fundamentally different question: **how much "stuff" can we push through a network?** Imagine oil flowing through a pipeline, data packets traversing a computer network, or goods moving through a supply chain. Each link has a limited capacity, and we want to maximize the total throughput from a designated **source** to a designated **sink**. This is the **maximum flow** problem, one of the most versatile tools in combinatorial optimization. We develop the **Ford-Fulkerson method**, prove the celebrated **max-flow min-cut theorem**, and implement the efficient **Edmonds-Karp** variant that guarantees polynomial running time. We then show how maximum flow solves the **maximum bipartite matching** problem — assigning jobs to workers, students to schools, or organs to patients._

## Flow networks

A **flow network** is a directed graph $G = (V, E)$ in which each edge $(u, v) \in E$ has a non-negative **capacity** $c(u, v) \geq 0$. Two distinguished vertices are the **source** $s$ and the **sink** $t$, where $s \neq t$. We assume that every vertex lies on some path from $s$ to $t$ (otherwise it is irrelevant to the flow problem).

If $(u, v) \notin E$, we define $c(u, v) = 0$ for convenience.

### Flows

A **flow** in $G$ is a function $f : V \times V \to \mathbb{R}$ satisfying two constraints:

1. **Capacity constraint.** For all $u, v \in V$:
$$0 \leq f(u, v) \leq c(u, v)$$

2. **Flow conservation.** For every vertex $u \in V \setminus \{s, t\}$:
$$\sum_{v \in V} f(v, u) = \sum_{v \in V} f(u, v)$$

In words, the flow into any internal vertex equals the flow out of it — flow is neither created nor destroyed except at the source and sink.

The **value** of a flow $f$ is the net flow leaving the source:

$$|f| = \sum_{v \in V} f(s, v) - \sum_{v \in V} f(v, s)$$

The **maximum flow problem** asks: find a flow $f$ of maximum value $|f|$.

### Where network flow appears

Network flow arises in a remarkable variety of applications:

- **Transportation and logistics.** Routing goods through a supply chain with capacity-limited links.
- **Computer networks.** Maximizing data throughput between two hosts.
- **Bipartite matching.** Assigning workers to jobs, students to projects, or doctors to hospitals (we cover this later in the chapter).
- **Image segmentation.** Partitioning an image into foreground and background by finding a minimum cut.
- **Baseball elimination.** Determining whether a team has been mathematically eliminated from contention.
- **Project selection.** Choosing which projects to fund when some projects depend on others.

The power of network flow lies not just in the max-flow problem itself, but in the large number of combinatorial problems that **reduce** to it.

## The Ford-Fulkerson method

The Ford-Fulkerson method (1956) is a general strategy for computing maximum flow. It repeatedly finds **augmenting paths** — paths from source to sink along which more flow can be pushed — and increases the flow until no augmenting path remains.

### Residual graphs

Given a flow network $G$ and a flow $f$, the **residual graph** $G_f$ has the same vertex set as $G$ and contains two types of edges for each original edge $(u, v)$:

1. **Forward edge** $(u, v)$ with residual capacity $c_f(u, v) = c(u, v) - f(u, v)$, representing unused capacity that can still carry more flow.

2. **Reverse edge** $(v, u)$ with residual capacity $c_f(v, u) = f(u, v)$, representing flow that can be "cancelled" — pushed back — to reroute it through a better path.

An edge appears in $G_f$ only if its residual capacity is positive.

### Augmenting paths

An **augmenting path** is a simple path from $s$ to $t$ in the residual graph $G_f$. The **bottleneck capacity** of the path is the minimum residual capacity along its edges:

$$c_f(p) = \min_{(u,v) \in p} c_f(u, v)$$

We can increase the flow by $c_f(p)$ by pushing flow along the augmenting path: for each forward edge, increase the flow; for each reverse edge, decrease the flow on the corresponding original edge.

### The Ford-Fulkerson algorithm

```
FordFulkerson(G, s, t):
    Initialize f(u, v) = 0 for all (u, v)
    while there exists an augmenting path p in G_f:
        c_f(p) = min residual capacity along p
        for each edge (u, v) in p:
            if (u, v) is a forward edge:
                f(u, v) = f(u, v) + c_f(p)
            else:  // (u, v) is a reverse edge
                f(v, u) = f(v, u) - c_f(p)
    return f
```

The method is correct but does not specify **how** to find the augmenting path. Different choices lead to different running times. With arbitrary path selection and irrational capacities, Ford-Fulkerson may not even terminate. The **Edmonds-Karp** variant fixes this by using BFS.

## The max-flow min-cut theorem

Before presenting Edmonds-Karp, let us establish the theoretical foundation that justifies the Ford-Fulkerson approach.

### Cuts

A **cut** $(S, T)$ of a flow network is a partition of $V$ into two sets $S$ and $T = V \setminus S$ such that $s \in S$ and $t \in T$. The **capacity** of a cut is the sum of capacities of edges crossing from $S$ to $T$:

$$c(S, T) = \sum_{u \in S} \sum_{v \in T} c(u, v)$$

Note that we only count edges from $S$ to $T$, not from $T$ to $S$.

The **net flow across a cut** is:

$$f(S, T) = \sum_{u \in S} \sum_{v \in T} f(u, v) - \sum_{u \in S} \sum_{v \in T} f(v, u)$$

A key lemma: for any flow $f$ and any cut $(S, T)$, the net flow across the cut equals the value of the flow: $f(S, T) = |f|$. This follows from flow conservation at internal vertices.

Since the flow across any cut cannot exceed the cut's capacity, we get:

$$|f| = f(S, T) \leq c(S, T)$$

This holds for **every** cut — so the maximum flow is at most the minimum cut capacity.

### The theorem

**Theorem (Max-Flow Min-Cut).** In any flow network, the following three conditions are equivalent:

1. $f$ is a maximum flow.
2. The residual graph $G_f$ contains no augmenting path from $s$ to $t$.
3. $|f| = c(S, T)$ for some cut $(S, T)$.

_Proof sketch._ $(1 \Rightarrow 2)$: If an augmenting path existed, we could increase the flow, contradicting maximality. $(2 \Rightarrow 3)$: If no augmenting path exists, define $S$ as the set of vertices reachable from $s$ in $G_f$. Since $t \notin S$, $(S, V \setminus S)$ is a valid cut. Every edge from $S$ to $V \setminus S$ must be saturated (otherwise the endpoint would be reachable), and every edge from $V \setminus S$ to $S$ must carry zero flow (otherwise the reverse edge would be in $G_f$). Therefore $f(S, T) = c(S, T)$. $(3 \Rightarrow 1)$: Since $|f| \leq c(S, T)$ for all cuts, equality with some cut implies $f$ is maximum. $\square$

This theorem has a profound consequence: **the maximum flow through a network equals the minimum capacity of any cut separating source from sink**. It also tells us that when the Ford-Fulkerson method terminates (no augmenting path exists), the flow is guaranteed to be maximum. As a bonus, the source-side vertices reachable in the final residual graph give us the minimum cut.

## Edmonds-Karp algorithm

The Edmonds-Karp algorithm (1972) is a refinement of Ford-Fulkerson that uses **breadth-first search** (BFS) to find augmenting paths. By always choosing a **shortest** augmenting path (fewest edges), it guarantees termination in $O(VE)$ augmenting path iterations, giving a total running time of $O(VE^2)$.

### Why shortest augmenting paths?

The key insight is that when we always augment along shortest paths, the distances in the residual graph never decrease over successive iterations. More precisely:

**Lemma.** Let $\delta_f(s, v)$ denote the shortest-path distance (number of edges) from $s$ to $v$ in the residual graph $G_f$. If Edmonds-Karp augments flow $f$ to obtain flow $f'$, then $\delta_{f'}(s, v) \geq \delta_f(s, v)$ for all $v$.

This monotonicity property, combined with the observation that each augmenting path saturates at least one edge (which then temporarily disappears from the residual graph), yields:

**Theorem.** The Edmonds-Karp algorithm performs at most $O(VE)$ augmenting path iterations.

Since each BFS takes $O(V + E)$ time, the total running time is $O(VE^2)$. For dense graphs this is $O(V^5)$; for sparse graphs it is $O(V^2 E)$.

### Pseudocode

```
EdmondsKarp(G, s, t):
    Initialize f(u, v) = 0 for all (u, v)
    repeat:
        // BFS in residual graph to find shortest augmenting path
        parent = BFS(G_f, s, t)
        if t is not reachable: break

        // Find bottleneck capacity
        bottleneck = infinity
        v = t
        while v != s:
            u = parent[v]
            bottleneck = min(bottleneck, c_f(u, v))
            v = u

        // Augment flow along the path
        v = t
        while v != s:
            u = parent[v]
            push bottleneck units of flow along (u, v)
            v = u

        maxFlow = maxFlow + bottleneck

    return maxFlow
```

### Trace through an example

Consider the following flow network (based on the classic CLRS example):

| Edge | Capacity |
|------|----------|
| s → v1 | 16 |
| s → v2 | 13 |
| v1 → v2 | 4 |
| v1 → v3 | 12 |
| v2 → v1 | 10 |
| v2 → v4 | 14 |
| v3 → v2 | 9 |
| v3 → t | 20 |
| v4 → v3 | 7 |
| v4 → t | 4 |

**Iteration 1.** BFS finds the shortest path s → v1 → v3 → t (3 edges). Bottleneck = min(16, 12, 20) = 12. Push 12 units. Total flow = 12.

After augmentation, the residual graph has:
- s → v1: residual 4 (was 16, used 12)
- v1 → v3: residual 0 (saturated)
- v3 → v1: residual 12 (reverse edge)
- v3 → t: residual 8 (was 20, used 12)

**Iteration 2.** BFS finds s → v2 → v4 → t (3 edges). Bottleneck = min(13, 14, 4) = 4. Push 4 units. Total flow = 16.

**Iteration 3.** BFS finds s → v2 → v4 → v3 → t (4 edges). Bottleneck = min(9, 10, 7, 8) = 7. Push 7 units. Total flow = 23.

After iteration 3, no augmenting path exists in the residual graph. The **maximum flow is 23**.

The minimum cut is $S = \{s, v1, v2, v4\}$, $T = \{v3, t\}$. The cut edges and their capacities are:

| Cut edge | Capacity |
|----------|----------|
| v1 → v3 | 12 |
| v4 → v3 | 7 |
| v4 → t | 4 |
| **Total** | **23** |

This confirms the max-flow min-cut theorem: the minimum cut capacity equals the maximum flow.

### TypeScript implementation

Our implementation uses a self-contained residual graph structure with efficient integer-keyed maps. Vertices of any type are supported — each vertex is assigned a unique integer ID, and edge capacities are stored in a compact map keyed by Cantor-paired vertex IDs.

The result type captures the max flow value, the per-edge flow assignment, and the min-cut:

```typescript
export interface FlowEdge<T> {
  from: T;
  to: T;
  capacity: number;
  flow: number;
}

export interface MaxFlowResult<T> {
  maxFlow: number;
  flowEdges: FlowEdge<T>[];
  minCut: Set<T>;
}
```

The core algorithm follows the Edmonds-Karp approach — BFS for augmenting paths, bottleneck computation, and flow augmentation:

```typescript
export function edmondsKarp<T>(
  edges: { from: T; to: T; capacity: number }[],
  source: T,
  sink: T,
): MaxFlowResult<T> {
  if (source === sink) {
    throw new Error('Source and sink must be different vertices');
  }

  const residual = new ResidualGraph<T>();
  residual.addVertex(source);
  residual.addVertex(sink);
  for (const { from, to, capacity } of edges) {
    residual.addEdge(from, to, capacity);
  }

  let maxFlow = 0;

  while (true) {
    const parent = residual.bfs(source, sink);
    if (parent === null) break;

    // Find the bottleneck capacity along the path.
    let bottleneck = Infinity;
    let v: T = sink;
    while (v !== source) {
      const u = parent.get(v) as T;
      bottleneck = Math.min(
        bottleneck,
        residual.getResidualCapacity(u, v),
      );
      v = u;
    }

    // Augment flow along the path.
    v = sink;
    while (v !== source) {
      const u = parent.get(v) as T;
      residual.pushFlow(u, v, bottleneck);
      v = u;
    }

    maxFlow += bottleneck;
  }

  // The min-cut is the set of vertices reachable from the source
  // in the final residual graph (BFS from source with no path to sink).
  const minCut = residual.reachableFrom(source);
  const flowEdges = residual.getFlowEdges();

  return { maxFlow, flowEdges, minCut };
}
```

The residual graph internally maps each vertex to a sequential integer ID and uses Cantor pairing to compute a single numeric key for each edge. This ensures correct behavior even when vertices are objects (where `String()` would not produce unique keys).

After termination, the algorithm computes the **minimum cut** by running BFS from the source in the final residual graph. The set of reachable vertices forms the source side $S$ of the min-cut — exactly as prescribed by the max-flow min-cut theorem.

### Complexity analysis

- **Time:** $O(VE^2)$. Each BFS takes $O(V + E)$. The number of augmenting path iterations is bounded by $O(VE)$ because: (a) distances in the residual graph never decrease; and (b) after at most $O(E)$ augmentations at a given distance, some critical edge is permanently saturated, increasing the distance. Since distances are bounded by $O(V)$, we get $O(VE)$ iterations total.

- **Space:** $O(V + E)$ for the residual graph, adjacency lists, and BFS data structures.

## Application: maximum bipartite matching

One of the most elegant applications of network flow is solving the **maximum bipartite matching** problem.

### The matching problem

A **bipartite graph** $G = (L \cup R, E)$ has two disjoint vertex sets $L$ (left) and $R$ (right), with edges only between $L$ and $R$. A **matching** is a subset $M \subseteq E$ such that no vertex appears in more than one edge of $M$. A **maximum matching** is a matching of largest possible size.

Bipartite matching models many real-world assignment problems:

- **Job assignment.** $L$ = workers, $R$ = jobs, edge $(w, j)$ means worker $w$ is qualified for job $j$. Maximum matching assigns the most workers to jobs.
- **Course enrollment.** $L$ = students, $R$ = courses. Maximum matching enrolls the most students.
- **Organ donation.** $L$ = donors, $R$ = recipients. Maximum matching saves the most lives.

### Reduction to max flow

We reduce bipartite matching to max flow by constructing a flow network:

1. Add a **super-source** $s$ and a **super-sink** $t$.
2. For each left vertex $l \in L$, add edge $(s, l)$ with capacity 1.
3. For each right vertex $r \in R$, add edge $(r, t)$ with capacity 1.
4. For each bipartite edge $(l, r) \in E$, add edge $(l, r)$ with capacity 1.

```
            1        1       1
    s ────▶ L1 ────▶ R1 ────▶ t
    │   1        ╲        1   ▲
    ├──▶ L2 ──────▶ R2 ──────┤
    │   1     1 ╲        1    │
    └──▶ L3 ────▶ R3 ────────┘
            1        1
```

**Why it works.** Since all capacities are 1, any integer flow corresponds to a matching:

- Capacity-1 edges from $s$ to $L$ ensure each left vertex sends at most 1 unit of flow — it is matched to at most one right vertex.
- Capacity-1 edges from $R$ to $t$ ensure each right vertex receives at most 1 unit — it is matched to at most one left vertex.
- An edge $(l, r)$ carries flow 1 if and only if $l$ is matched to $r$.

The **integrality theorem** for network flow guarantees that when all capacities are integers, there exists a maximum flow that is also integral. Therefore the maximum flow value equals the maximum matching size.

### TypeScript implementation

```typescript
export interface BipartiteMatchingResult<L, R> {
  size: number;
  matches: [L, R][];
}

export function bipartiteMatching<L, R>(
  left: L[],
  right: R[],
  edges: [L, R][],
): BipartiteMatchingResult<L, R> {
  const source = { kind: 'source' };
  const sink = { kind: 'sink' };

  const leftVertices = new Map<L, FlowVertex>();
  const rightVertices = new Map<R, FlowVertex>();

  for (const l of left)
    leftVertices.set(l, { kind: 'left', value: l });
  for (const r of right)
    rightVertices.set(r, { kind: 'right', value: r });

  const flowEdges = [];

  for (const lv of leftVertices.values())
    flowEdges.push({ from: source, to: lv, capacity: 1 });
  for (const rv of rightVertices.values())
    flowEdges.push({ from: rv, to: sink, capacity: 1 });
  for (const [l, r] of edges) {
    const lv = leftVertices.get(l);
    const rv = rightVertices.get(r);
    if (lv && rv)
      flowEdges.push({ from: lv, to: rv, capacity: 1 });
  }

  const result = edmondsKarp(flowEdges, source, sink);

  const matches = [];
  for (const fe of result.flowEdges) {
    if (fe.flow === 1
        && fe.from.kind === 'left'
        && fe.to.kind === 'right') {
      matches.push([fe.from.value, fe.to.value]);
    }
  }

  return { size: result.maxFlow, matches };
}
```

The implementation uses tagged vertex objects (`{ kind: 'left', value: l }`) to prevent name collisions between left vertices, right vertices, the source, and the sink. Since our Edmonds-Karp implementation uses identity-based vertex comparison (via `Map`), these object vertices are compared by reference — exactly what we need.

### Complexity analysis

In the constructed flow network, $|V| = |L| + |R| + 2$ and $|E| = |L| + |R| + |E_{\text{bipartite}}|$. With unit capacities, Edmonds-Karp terminates in $O(V)$ augmenting path iterations (since each augmentation increases the flow by 1 and the maximum flow is at most $\min(|L|, |R|)$), giving:

- **Time:** $O(V \cdot E)$ where $V = |L| + |R|$ and $E$ is the number of bipartite edges.
- **Space:** $O(V + E)$ for the flow network.

### Trace through an example

Consider assigning workers to jobs:

| Worker | Qualified for |
|--------|---------------|
| Alice  | Job 1, Job 2  |
| Bob    | Job 1          |
| Carol  | Job 2, Job 3  |

The bipartite graph has $L = \{\text{Alice}, \text{Bob}, \text{Carol}\}$ and $R = \{\text{Job 1}, \text{Job 2}, \text{Job 3}\}$.

**Iteration 1.** BFS finds s → Alice → Job1 → t. Push 1 unit. Flow = 1.

**Iteration 2.** BFS finds s → Bob → Job1, but Job1 → t is saturated. Through the reverse edge (Job1 → Alice, residual capacity 1), BFS discovers the path: s → Bob → Job1 → Alice → Job2 → t. Push 1 unit. Flow = 2.

This rerouting is the power of augmenting paths in matching: Bob "steals" Job 1 from Alice, and Alice is reassigned to Job 2.

**Iteration 3.** BFS finds s → Carol → Job3 → t. Push 1 unit. Flow = 3.

**Result:** Maximum matching of size 3: {Bob → Job 1, Alice → Job 2, Carol → Job 3}.

Notice how the algorithm found a perfect matching even though a greedy approach (match Alice → Job 1 first) would have left Bob unmatched. The augmenting path through reverse edges enabled the rerouting.

## Beyond Edmonds-Karp

The Edmonds-Karp algorithm is a clean, practical choice for many applications, but faster max-flow algorithms exist:

| Algorithm | Time complexity | Notes |
|-----------|----------------|-------|
| Ford-Fulkerson (DFS) | $O(E \cdot f^*)$ | $f^*$ = max flow value; not polynomial |
| Edmonds-Karp (BFS) | $O(VE^2)$ | Polynomial; simple to implement |
| Dinic's algorithm | $O(V^2 E)$ | Uses blocking flows; faster in practice |
| Push-relabel | $O(V^2 E)$ or $O(V^3)$ | No augmenting paths; local operations |
| Orlin's algorithm | $O(VE)$ | Optimal for sparse graphs |

For bipartite matching specifically, **Hopcroft-Karp** achieves $O(E \sqrt{V})$ by finding multiple augmenting paths simultaneously.

In practice, Edmonds-Karp and Dinic's are the most commonly implemented. Dinic's algorithm is particularly effective on unit-capacity networks (like bipartite matching), where it achieves $O(E \sqrt{V})$ — matching Hopcroft-Karp.

## Summary

In this chapter we studied network flow — a rich framework for maximizing throughput in capacity-constrained networks.

- A **flow network** is a directed graph with edge capacities, a source, and a sink. A **flow** assigns values to edges satisfying capacity and conservation constraints.
- The **Ford-Fulkerson method** finds maximum flow by iteratively discovering **augmenting paths** in the **residual graph** and pushing flow along them.
- The **max-flow min-cut theorem** proves that the maximum flow equals the minimum cut capacity — a deep duality result that connects optimization (max flow) with combinatorics (min cut).
- **Edmonds-Karp** uses BFS to find shortest augmenting paths, guaranteeing $O(VE^2)$ time. This polynomial bound makes it practical for moderately sized networks.
- **Maximum bipartite matching** reduces elegantly to max flow: add a super-source and super-sink with unit-capacity edges, and the max flow equals the maximum matching size. The integrality theorem ensures integer solutions.
- The min-cut computed as a by-product of max flow identifies the source-reachable vertices in the final residual graph — useful for applications like image segmentation and network reliability analysis.

Network flow is one of the most versatile tools in algorithm design. Many problems that seem unrelated — assignment, scheduling, connectivity, and partitioning — can be modeled as flow problems and solved efficiently with the algorithms in this chapter.

## Exercises

**Exercise 15.1.** Consider the following flow network with edges: s → A (capacity 5), s → B (capacity 3), A → t (capacity 4), A → C (capacity 2), B → C (capacity 5), C → t (capacity 6).

(a) Find the maximum flow by tracing Edmonds-Karp (BFS-based augmenting paths).
(b) Identify the minimum cut and verify that its capacity equals the max flow.
(c) What is the flow assignment on each edge?

**Exercise 15.2.** Prove that in any flow network, the total flow into the sink equals the total flow out of the source. (Hint: sum the flow conservation constraints over all vertices except $s$ and $t$.)

**Exercise 15.3.** A company has 4 workers and 4 tasks. The qualification matrix is:

| | Task A | Task B | Task C | Task D |
|---|---|---|---|---|
| Worker 1 | Yes | Yes | | |
| Worker 2 | | Yes | Yes | |
| Worker 3 | Yes | | Yes | Yes |
| Worker 4 | | | | Yes |

(a) Model this as a bipartite matching problem and find the maximum matching.
(b) Is a perfect matching possible? If so, find one. If not, explain why.

**Exercise 15.4.** Modify the Edmonds-Karp algorithm to handle **lower bounds** on edge flows: each edge $(u, v)$ has both a capacity $c(u, v)$ and a minimum flow requirement $\ell(u, v)$, so $\ell(u, v) \leq f(u, v) \leq c(u, v)$. Describe how to transform this into a standard max-flow problem. (Hint: introduce excess supply and demand at vertices based on the lower bounds.)

**Exercise 15.5.** König's theorem states that in a bipartite graph, the size of the maximum matching equals the size of the minimum vertex cover. Using the max-flow min-cut theorem applied to the bipartite matching reduction, prove König's theorem. (Hint: show how the minimum cut in the flow network corresponds to a minimum vertex cover in the bipartite graph.)
