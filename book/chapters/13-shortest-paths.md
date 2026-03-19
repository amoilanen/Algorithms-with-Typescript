# Shortest Paths

_In Chapter 12 we introduced BFS, which finds shortest paths in **unweighted** graphs — that is, paths with the fewest edges. Most real-world graphs, however, carry weights on their edges: travel times on a road map, latencies in a network, costs in a supply chain. In this chapter we study algorithms that find shortest paths in **weighted** graphs, where the length of a path is the sum of its edge weights rather than the number of edges. We present four algorithms, each suited to different settings: Dijkstra's algorithm for graphs with non-negative weights, Bellman-Ford for graphs that may have negative weights, a linear-time algorithm for DAGs, and Floyd-Warshall for computing shortest paths between all pairs of vertices._

## The shortest-path problem

Given a weighted directed graph $G = (V, E)$ with edge-weight function $w : E \to \mathbb{R}$ and a source vertex $s$, the **single-source shortest-paths** problem asks: for every vertex $v \in V$, what is the minimum-weight path from $s$ to $v$?

The **weight** of a path $p = \langle v_0, v_1, \ldots, v_k \rangle$ is

$$w(p) = \sum_{i=1}^{k} w(v_{i-1}, v_i)$$

The **shortest-path weight** from $s$ to $v$ is

$$\delta(s, v) = \begin{cases} \min \{ w(p) : s \overset{p}{\leadsto} v \} & \text{if a path exists} \\ \infty & \text{otherwise} \end{cases}$$

A **shortest path** from $s$ to $v$ is any path $p$ with $w(p) = \delta(s, v)$.

### Negative weights and negative cycles

When all edge weights are non-negative, shortest paths are well-defined. When negative-weight edges exist, a complication arises: a **negative-weight cycle** — a cycle whose total weight is negative — can be traversed repeatedly to make path weights arbitrarily negative. If such a cycle is reachable from the source, shortest-path distances are undefined for any vertex reachable from the cycle.

We will carefully note which algorithms handle negative weights and which detect negative cycles.

### Relaxation

All single-source shortest-path algorithms share a common operation: **relaxation**. For each vertex $v$ we maintain an estimate $d[v]$ of the shortest-path weight from the source (initially $\infty$ for all vertices except the source, which is $0$). Relaxing an edge $(u, v)$ checks whether the path through $u$ offers a shorter route to $v$:

```
Relax(u, v, w):
    if d[u] + w(u, v) < d[v]:
        d[v] = d[u] + w(u, v)
        parent[v] = u
```

The algorithms in this chapter differ in the **order** and **number of times** they relax edges.

### Shared result type

Our implementations share a common result type representing shortest-path distances and predecessor pointers:

```typescript
export interface ShortestPathResult<T> {
  dist: Map<T, number>;
  parent: Map<T, T | undefined>;
}
```

The `parent` map allows us to reconstruct the actual shortest path from source to any target:

```typescript
export function reconstructPath<T>(
  parent: Map<T, T | undefined>,
  source: T,
  target: T,
): T[] | null {
  if (!parent.has(target)) return null;

  const path: T[] = [];
  let current: T | undefined = target;
  while (current !== undefined) {
    path.push(current);
    current = parent.get(current);
  }
  path.reverse();

  if (path[0] !== source) return null;
  return path;
}
```

This is the same backtracking technique we used for BFS path reconstruction in Chapter 12: we follow parent pointers from the target back to the source, then reverse the result.

## Dijkstra's algorithm

Dijkstra's algorithm (1959) solves the single-source shortest-paths problem for graphs with **non-negative** edge weights. It is the workhorse algorithm for shortest paths in practice — used in GPS navigation, network routing (OSPF), and countless other applications.

### Intuition

The key insight is greedy: among all vertices whose shortest-path distance is not yet finalized, the one with the smallest current estimate $d[v]$ already has the correct shortest-path distance. Why? Because all edge weights are non-negative, so any other path to $v$ must pass through a vertex with a distance estimate at least as large, making the total at least as long.

This is exactly analogous to BFS, except that instead of a FIFO queue (which processes vertices in order of number of edges), we use a **priority queue** ordered by distance estimates.

### Algorithm

1. Initialize $d[s] = 0$ and $d[v] = \infty$ for all other vertices.
2. Insert the source into a min-priority queue with priority $0$.
3. While the priority queue is not empty:
   a. Extract the vertex $u$ with the smallest priority.
   b. If $u$ has already been visited, skip it.
   c. Mark $u$ as visited.
   d. For each neighbor $v$ of $u$, relax the edge $(u, v)$. If the distance improves, insert $v$ into the priority queue with the new distance.

### Implementation

```typescript
import { Graph } from '../12-graphs-and-traversal/graph.js';
import { PriorityQueue } from '../11-heaps-and-priority-queues/priority-queue.js';

export function dijkstra<T>(
  graph: Graph<T>,
  source: T,
): ShortestPathResult<T> {
  const dist = new Map<T, number>();
  const parent = new Map<T, T | undefined>();
  const visited = new Set<T>();

  for (const v of graph.getVertices()) {
    dist.set(v, Infinity);
  }
  dist.set(source, 0);
  parent.set(source, undefined);

  const pq = new PriorityQueue<T>();
  pq.enqueue(source, 0);

  while (!pq.isEmpty) {
    const u = pq.dequeue()!;

    if (visited.has(u)) continue;
    visited.add(u);

    for (const [v, weight] of graph.getNeighbors(u)) {
      const newDist = dist.get(u)! + weight;
      if (newDist < dist.get(v)!) {
        dist.set(v, newDist);
        parent.set(v, u);
        pq.enqueue(v, newDist);
      }
    }
  }

  return { dist, parent };
}
```

**Implementation note:** Rather than implementing an explicit decrease-key operation, we insert a new entry into the priority queue whenever we find a shorter path. The `visited` set ensures we process each vertex only once — duplicate entries for already-visited vertices are simply skipped. This is a common practical optimization often called the "lazy Dijkstra" approach, and it does not affect correctness.

### Trace-through

Consider the following directed graph with source $s$:

| Edge | Weight |
|------|--------|
| s → t | 10 |
| s → y | 5 |
| t → y | 2 |
| t → x | 1 |
| y → t | 3 |
| y → x | 9 |
| x → z | 4 |
| z → x | 6 |
| z → s | 7 |

Step-by-step execution from source $s$:

| Step | Extract | $d[s]$ | $d[t]$ | $d[y]$ | $d[x]$ | $d[z]$ | Action |
|------|---------|--------|--------|--------|--------|--------|--------|
| Init | — | 0 | $\infty$ | $\infty$ | $\infty$ | $\infty$ | Enqueue $s$ with priority 0 |
| 1 | $s$ | **0** | 10 | 5 | $\infty$ | $\infty$ | Relax $s \to t$ and $s \to y$ |
| 2 | $y$ | 0 | 8 | **5** | 14 | $\infty$ | Relax $y \to t$ (5+3=8 < 10) and $y \to x$ (5+9=14) |
| 3 | $t$ | 0 | **8** | 5 | 9 | $\infty$ | Relax $t \to x$ (8+1=9 < 14) |
| 4 | $x$ | 0 | 8 | 5 | **9** | 13 | Relax $x \to z$ (9+4=13) |
| 5 | $z$ | 0 | 8 | 5 | 9 | **13** | Done (z → s: 13+7=20 > 0, no update) |

Final shortest-path distances: $d[s]=0$, $d[y]=5$, $d[t]=8$, $d[x]=9$, $d[z]=13$.

### Complexity

- **Time:** $O((V + E) \log V)$ with a binary heap. Each vertex is extracted at most once ($O(V \log V)$ total). Each edge triggers at most one priority queue insertion ($O(E \log V)$ total).
- **Space:** $O(V + E)$ for the graph plus $O(V)$ for the priority queue and distance maps.

With a Fibonacci heap, the time complexity improves to $O(V \log V + E)$, but Fibonacci heaps are complex to implement and have high constant factors. For most practical purposes, the binary-heap version is preferred.

### Correctness argument

Dijkstra's algorithm is correct when all edge weights are non-negative. The proof relies on the following loop invariant: when a vertex $u$ is extracted from the priority queue, $d[u] = \delta(s, u)$.

**Sketch:** Suppose for contradiction that $u$ is the first vertex extracted with $d[u] > \delta(s, u)$. Consider the true shortest path from $s$ to $u$. Let $(x, y)$ be the first edge on this path where $x$ has already been finalized but $y$ has not. When $x$ was finalized, edge $(x, y)$ was relaxed, so $d[y] \leq \delta(s, y) \leq \delta(s, u) < d[u]$. But then $y$ would have been extracted before $u$, contradicting our choice of $u$. (This inequality relies on non-negative weights: each edge on the subpath from $y$ to $u$ contributes a non-negative amount.)

### When Dijkstra fails

With negative edge weights, the greedy assumption breaks down. A vertex $u$ may be extracted with a distance estimate that is later revealed to be too high, because a path through a later-discovered vertex with a negative edge reaches $u$ more cheaply. For this reason, Dijkstra's algorithm produces incorrect results on graphs with negative edges.

## Bellman-Ford algorithm

The Bellman-Ford algorithm (1958) solves the single-source shortest-paths problem for graphs with **arbitrary** edge weights — including negative weights. It also detects negative-weight cycles reachable from the source.

### Algorithm

1. Initialize $d[s] = 0$ and $d[v] = \infty$ for all other vertices.
2. Repeat $|V| - 1$ times: relax every edge in the graph.
3. Check for negative cycles: scan all edges once more. If any edge can still be relaxed, the graph has a negative-weight cycle reachable from the source.

Why $|V| - 1$ iterations? A shortest path in a graph with no negative cycles has at most $|V| - 1$ edges (it is a simple path). In iteration $i$, the algorithm correctly computes shortest paths that use at most $i$ edges. After $|V| - 1$ iterations, all shortest paths (with up to $|V| - 1$ edges) are correctly computed.

### Implementation

```typescript
import { Graph } from '../12-graphs-and-traversal/graph.js';

export interface BellmanFordResult<T> extends ShortestPathResult<T> {
  hasNegativeCycle: boolean;
}

export function bellmanFord<T>(
  graph: Graph<T>,
  source: T,
): BellmanFordResult<T> {
  const vertices = graph.getVertices();
  const dist = new Map<T, number>();
  const parent = new Map<T, T | undefined>();

  for (const v of vertices) {
    dist.set(v, Infinity);
  }
  dist.set(source, 0);
  parent.set(source, undefined);

  // Relax all edges V-1 times.
  const V = vertices.length;
  for (let i = 0; i < V - 1; i++) {
    let changed = false;
    for (const u of vertices) {
      const du = dist.get(u)!;
      if (du === Infinity) continue;
      for (const [v, weight] of graph.getNeighbors(u)) {
        const newDist = du + weight;
        if (newDist < dist.get(v)!) {
          dist.set(v, newDist);
          parent.set(v, u);
          changed = true;
        }
      }
    }
    if (!changed) break; // Early termination
  }

  // Check for negative-weight cycles.
  let hasNegativeCycle = false;
  for (const u of vertices) {
    const du = dist.get(u)!;
    if (du === Infinity) continue;
    for (const [v, weight] of graph.getNeighbors(u)) {
      if (du + weight < dist.get(v)!) {
        hasNegativeCycle = true;
        break;
      }
    }
    if (hasNegativeCycle) break;
  }

  return { dist, parent, hasNegativeCycle };
}
```

**Early termination:** If no distance estimate changes in an entire pass, all distances are final and we can stop early. This optimization does not improve the worst-case complexity but can significantly speed up the algorithm on graphs where shortest paths have few edges.

### Trace-through

Consider the CLRS example graph (directed, with negative edges):

| Edge | Weight |
|------|--------|
| s → t | 6 |
| s → y | 7 |
| t → x | 5 |
| t → y | 8 |
| t → z | −4 |
| y → x | −3 |
| y → z | 9 |
| x → t | −2 |
| z → s | 2 |
| z → x | 7 |

Running Bellman-Ford from source $s$, after all passes converge:

| Vertex | $d[v]$ | Shortest path from $s$ |
|--------|--------|------------------------|
| s | 0 | — |
| t | 2 | s → y → x → t |
| x | 4 | s → y → x |
| y | 7 | s → y |
| z | −2 | s → y → x → t → z |

The shortest path to $z$ has weight $-2$, using two negative edges ($y \to x$ and $t \to z$).

### Complexity

- **Time:** $O(V \cdot E)$. The outer loop runs at most $V - 1$ times, and each iteration examines all $E$ edges.
- **Space:** $O(V)$ for distances and parent pointers.

### Negative cycle detection

The check in the final pass is both necessary and sufficient. If a negative cycle is reachable from the source, then after $V - 1$ relaxation passes, at least one edge on the cycle can still be relaxed — because traversing the cycle one more time would further decrease the distance. Conversely, if no edge can be relaxed, then $d[v] = \delta(s, v)$ for all reachable vertices and no negative cycle exists.

## DAG shortest paths

When the input graph is a **directed acyclic graph** (DAG), we can find shortest paths in $O(V + E)$ time — even with negative edge weights. The idea is simple: process vertices in **topological order**.

### Algorithm

1. Compute a topological ordering of the DAG (using Kahn's algorithm or DFS, as described in Chapter 12).
2. Initialize $d[s] = 0$ and $d[v] = \infty$ for all other vertices.
3. For each vertex $u$ in topological order: relax all outgoing edges of $u$.

Since vertices are processed in topological order, when we relax the edges of $u$, all vertices that could provide a shorter path to $u$ have already been processed. Every edge is relaxed exactly once.

### Implementation

```typescript
import { Graph } from '../12-graphs-and-traversal/graph.js';
import { topologicalSortKahn }
  from '../12-graphs-and-traversal/topological-sort.js';

export function dagShortestPaths<T>(
  graph: Graph<T>,
  source: T,
): ShortestPathResult<T> {
  const order = topologicalSortKahn(graph);
  if (order === null) {
    throw new Error(
      'Graph contains a cycle; DAG shortest paths requires a DAG',
    );
  }

  const dist = new Map<T, number>();
  const parent = new Map<T, T | undefined>();

  for (const v of graph.getVertices()) {
    dist.set(v, Infinity);
  }
  dist.set(source, 0);
  parent.set(source, undefined);

  for (const u of order) {
    const du = dist.get(u)!;
    if (du === Infinity) continue;

    for (const [v, weight] of graph.getNeighbors(u)) {
      const newDist = du + weight;
      if (newDist < dist.get(v)!) {
        dist.set(v, newDist);
        parent.set(v, u);
      }
    }
  }

  return { dist, parent };
}
```

### Why this works

A topological order guarantees that for every edge $(u, v)$, vertex $u$ is processed before $v$. When we process $u$ and relax its outgoing edges, $d[u]$ is already optimal — all predecessors of $u$ in the graph have already been processed. Therefore, each edge is relaxed exactly once, and after processing all vertices, $d[v] = \delta(s, v)$ for every reachable vertex.

This argument does not require non-negative weights. Even if edge $(u, v)$ has a negative weight, when we process $u$ we have the correct $d[u]$, so the relaxation computes the correct contribution of this edge.

### Applications

DAG shortest paths are useful for:

- **Critical path analysis** (PERT/CPM): find the longest path in a project task graph to determine the minimum project duration. (Use negated weights to convert longest-path to shortest-path.)
- **Dynamic programming on DAGs:** many DP problems can be modeled as shortest or longest paths in a DAG.
- **Pipeline scheduling:** determine minimum latency through a pipeline of processing stages.

### Complexity

- **Time:** $O(V + E)$ — topological sort takes $O(V + E)$, and relaxing all edges takes $O(V + E)$.
- **Space:** $O(V)$.

This is asymptotically optimal: we must examine every edge at least once, and there are $O(V + E)$ edges and vertices.

## Floyd-Warshall algorithm

The previous three algorithms solve the **single-source** shortest-paths problem: shortest paths from one specific source vertex. The **Floyd-Warshall algorithm** (1962) solves a different problem: **all-pairs shortest paths** — the shortest distance between every pair of vertices simultaneously.

Of course, we could run Dijkstra's algorithm $|V|$ times (once from each vertex) to get all-pairs shortest paths in $O(V(V + E) \log V)$ time. But Floyd-Warshall uses a different approach based on dynamic programming that runs in $O(V^3)$ time, which is simpler to implement and competitive for dense graphs where $E \approx V^2$.

### The dynamic programming formulation

Define $d^{(k)}[i][j]$ as the shortest-path weight from vertex $i$ to vertex $j$ using only vertices $\{1, 2, \ldots, k\}$ as intermediate vertices. The recurrence is:

$$d^{(k)}[i][j] = \min\bigl(d^{(k-1)}[i][j],\;\; d^{(k-1)}[i][k] + d^{(k-1)}[k][j]\bigr)$$

In words: the shortest path from $i$ to $j$ through vertices $\{1, \ldots, k\}$ either avoids vertex $k$ entirely (first term) or goes through $k$ (second term).

**Base case:** $d^{(0)}[i][j] = w(i, j)$ if edge $(i, j)$ exists, $\infty$ if not, and $0$ if $i = j$.

**Final answer:** $d^{(V)}[i][j] = \delta(i, j)$ for all pairs $(i, j)$.

### Space optimization

The three nested loops can update the matrix in place. When computing $d^{(k)}$, the values $d^{(k-1)}[i][k]$ and $d^{(k-1)}[k][j]$ are not modified by including vertex $k$ as an intermediate (setting $i = k$ or $j = k$ doesn't change the result). Therefore, we need only a single 2D matrix rather than $V$ copies.

### Implementation

```typescript
import { Graph } from '../12-graphs-and-traversal/graph.js';

export interface FloydWarshallResult<T> {
  dist: number[][];
  next: number[][];
  vertices: T[];
}

export function floydWarshall<T>(
  graph: Graph<T>,
): FloydWarshallResult<T> {
  const vertices = graph.getVertices();
  const V = vertices.length;
  const indexOf = new Map<T, number>();
  for (let i = 0; i < V; i++) {
    indexOf.set(vertices[i]!, i);
  }

  // Initialize distance and next-hop matrices.
  const dist: number[][] = Array.from({ length: V }, () =>
    Array.from({ length: V }, () => Infinity),
  );
  const next: number[][] = Array.from({ length: V }, () =>
    Array.from({ length: V }, () => -1),
  );

  for (let i = 0; i < V; i++) {
    dist[i]![i] = 0;
    next[i]![i] = i;
  }

  // Seed with direct edges.
  for (const v of vertices) {
    const u = indexOf.get(v)!;
    for (const [neighbor, weight] of graph.getNeighbors(v)) {
      const w = indexOf.get(neighbor)!;
      if (weight < dist[u]![w]!) {
        dist[u]![w] = weight;
        next[u]![w] = w;
      }
    }
  }

  // DP: consider each vertex k as intermediate.
  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        const through_k = dist[i]![k]! + dist[k]![j]!;
        if (through_k < dist[i]![j]!) {
          dist[i]![j] = through_k;
          next[i]![j] = next[i]![k]!;
        }
      }
    }
  }

  return { dist, next, vertices };
}
```

The `next` matrix tracks the first hop on the shortest path from $i$ to $j$, enabling path reconstruction:

```typescript
export function reconstructPathFW(
  next: number[][],
  i: number,
  j: number,
): number[] | null {
  if (next[i]![j] === -1) return null;

  const path = [i];
  let current = i;
  while (current !== j) {
    current = next[current]![j]!;
    if (current === -1) return null;
    path.push(current);
  }
  return path;
}
```

### Negative cycle detection

After running Floyd-Warshall, a negative-weight cycle exists if and only if some diagonal entry is negative: $d[i][i] < 0$ for some vertex $i$. This means there is a path from $i$ back to $i$ with negative total weight.

```typescript
export function hasNegativeCycle(
  result: FloydWarshallResult<unknown>,
): boolean {
  for (let i = 0; i < result.vertices.length; i++) {
    if (result.dist[i]![i]! < 0) return true;
  }
  return false;
}
```

### Complexity

- **Time:** $O(V^3)$ — three nested loops, each iterating over $V$ vertices.
- **Space:** $O(V^2)$ for the distance and next-hop matrices.

For dense graphs ($E = \Theta(V^2)$), this matches running Dijkstra $V$ times: $O(V \cdot (V + V^2) \log V) = O(V^3 \log V)$, so Floyd-Warshall is actually faster. For sparse graphs, running Dijkstra from each vertex is preferable.

## Choosing the right algorithm

| Algorithm | Weights | Negative cycles | Source | Time | Space |
|-----------|---------|-----------------|--------|------|-------|
| Dijkstra | $\geq 0$ | N/A | Single | $O((V+E) \log V)$ | $O(V)$ |
| Bellman-Ford | Any | Detects | Single | $O(V \cdot E)$ | $O(V)$ |
| DAG shortest paths | Any | N/A (no cycles) | Single | $O(V + E)$ | $O(V)$ |
| Floyd-Warshall | Any | Detects | All pairs | $O(V^3)$ | $O(V^2)$ |

Decision guide:

- **Non-negative weights, single source:** Use **Dijkstra**. It is the fastest single-source algorithm for this common case.
- **Negative weights possible, single source:** Use **Bellman-Ford**. It handles negative weights and detects negative cycles.
- **DAG with any weights, single source:** Use **DAG shortest paths**. It is the fastest possible, running in linear time.
- **All-pairs shortest paths, dense graph:** Use **Floyd-Warshall**. Simple to implement and efficient for dense graphs.
- **All-pairs shortest paths, sparse graph:** Run **Dijkstra** from each vertex ($O(V(V+E) \log V)$), or use Johnson's algorithm (which combines Bellman-Ford reweighting with Dijkstra) for $O(V^2 \log V + VE)$.

## Summary

The **shortest-path problem** asks for minimum-weight paths in weighted graphs. Four algorithms address different variants of this problem.

**Dijkstra's algorithm** uses a greedy strategy with a priority queue, extracting vertices in order of increasing distance. It runs in $O((V + E) \log V)$ time but requires non-negative edge weights. It is the standard choice for road networks, routing protocols, and other practical applications.

**Bellman-Ford** relaxes every edge $V - 1$ times, running in $O(VE)$ time. It handles negative edge weights and detects negative-weight cycles. It is slower than Dijkstra but more general.

**DAG shortest paths** exploits the absence of cycles by processing vertices in topological order, achieving optimal $O(V + E)$ time. It handles negative weights and is useful for scheduling and critical-path analysis.

**Floyd-Warshall** computes all-pairs shortest paths using dynamic programming in $O(V^3)$ time and $O(V^2)$ space. It handles negative weights and detects negative cycles. It is simple to implement and efficient for dense graphs.

All four algorithms use **relaxation** as the core operation. They differ in the order of relaxations (greedy by distance, repeated over all edges, topological order, or systematic DP over intermediate vertices) and the resulting time-space trade-offs. In Chapter 14, we will see a related problem — finding **minimum spanning trees** — that also uses edge relaxation but optimizes a different objective.

## Exercises

**Exercise 13.1.** Run Dijkstra's algorithm on the following undirected graph from source $a$. Show the state of the priority queue and the distance estimates after each extraction.

```
    a ---3--- b ---1--- c
    |         |         |
    7         2         5
    |         |         |
    d ---4--- e ---6--- f
```

**Exercise 13.2.** Explain why Dijkstra's algorithm produces incorrect results on the following graph with source $s$:

```
    s --2--> a --(-5)--> b
    |                    ^
    +--------1---------->+
```

Show the incorrect distances Dijkstra computes and the correct distances.

**Exercise 13.3.** Run Bellman-Ford on the graph from Exercise 13.2 and verify that it produces the correct shortest-path distances. How many relaxation passes are needed before the algorithm converges?

**Exercise 13.4.** Consider a directed graph representing course prerequisites at a university. Each edge $(u, v)$ has a weight representing the "effort" of completing course $v$ after $u$. Give an $O(V + E)$ algorithm to find the minimum-effort path from a starting course to a target course. What property of this graph makes this possible?

**Exercise 13.5.** The **transitive closure** of a directed graph $G = (V, E)$ is a graph $G^* = (V, E^*)$ where $(u, v) \in E^*$ if and only if there is a path from $u$ to $v$ in $G$. Show how to compute the transitive closure using Floyd-Warshall. What is the time complexity? Can you modify the algorithm to use Boolean operations (AND, OR) instead of arithmetic for a constant-factor speedup?
