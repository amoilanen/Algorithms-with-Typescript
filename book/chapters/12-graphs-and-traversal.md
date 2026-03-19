# Graphs and Graph Traversal

_In the previous chapters we studied data structures — arrays, linked lists, trees, heaps, hash tables — that organize data in essentially linear or hierarchical ways. Many real-world problems, however, involve relationships that are neither linear nor hierarchical: road networks, social connections, task dependencies, web links, circuit wiring. The natural abstraction for these problems is the **graph**. In this chapter we define graphs formally, implement two standard representations, and develop two fundamental traversal algorithms — **breadth-first search (BFS)** and **depth-first search (DFS)** — that form the basis for nearly every graph algorithm in the chapters that follow. We also study **topological sorting** and **cycle detection**, two direct applications of graph traversal._

## What is a graph?

A **graph** $G = (V, E)$ consists of:

- A finite set $V$ of **vertices** (also called nodes).
- A set $E$ of **edges** (also called arcs), where each edge connects two vertices.

If every edge has a direction — going from one vertex to another — the graph is **directed** (a **digraph**). If edges have no direction, the graph is **undirected**. A **weighted** graph assigns a numeric weight to each edge; an **unweighted** graph treats all edges as having equal cost.

Key terminology:

- **Adjacent vertices:** Two vertices $u$ and $v$ are adjacent if there is an edge between them.
- **Incident edge:** An edge is incident to a vertex if the vertex is one of its endpoints.
- **Degree:** The number of edges incident to a vertex. In a directed graph, we distinguish **in-degree** (edges entering) and **out-degree** (edges leaving).
- **Path:** A sequence of vertices $v_0, v_1, \ldots, v_k$ where each consecutive pair is connected by an edge. The **length** of the path is the number of edges, $k$.
- **Simple path:** A path with no repeated vertices.
- **Cycle:** A path where $v_0 = v_k$ and $k \geq 1$. A **simple cycle** has no repeated vertices except $v_0 = v_k$.
- **Connected graph:** An undirected graph where every pair of vertices is connected by some path.
- **Connected component:** A maximal connected subgraph.
- **Strongly connected:** In a directed graph, every vertex is reachable from every other vertex.
- **DAG:** A directed acyclic graph — a directed graph with no cycles.
- **Dense graph:** A graph where $|E| \approx |V|^2$ (many edges relative to vertices).
- **Sparse graph:** A graph where $|E| \ll |V|^2$ (few edges relative to vertices). Most real-world graphs are sparse.

## Graph representations

There are two standard ways to represent a graph in memory: **adjacency lists** and **adjacency matrices**. The choice affects the time and space complexity of graph operations.

### Adjacency list

An adjacency list stores, for each vertex, a collection of its neighbors. This is the preferred representation for sparse graphs, which includes most graphs encountered in practice.

```
Graph: 1 — 2 — 3        Adjacency list:
       |       |         1: [2, 4]
       4 ——————┘         2: [1, 3]
                          3: [2, 4]
                          4: [1, 3]
```

Space: $O(V + E)$. For each vertex we store its neighbor list; the total number of entries across all lists is $2|E|$ for undirected graphs (each edge appears twice) or $|E|$ for directed graphs.

Our implementation uses a `Map`-based adjacency list. Each vertex maps to a `Map` of its neighbors and the corresponding edge weights:

```typescript
export class Graph<T> {
  private adj: Map<T, Map<T, number>> = new Map();

  constructor(public readonly directed: boolean = false) {}

  addVertex(v: T): void {
    if (!this.adj.has(v)) {
      this.adj.set(v, new Map());
    }
  }

  addEdge(u: T, v: T, weight: number = 1): void {
    this.addVertex(u);
    this.addVertex(v);
    this.adj.get(u)!.set(v, weight);
    if (!this.directed) {
      this.adj.get(v)!.set(u, weight);
    }
  }

  hasEdge(u: T, v: T): boolean {
    return this.adj.get(u)?.has(v) ?? false;
  }

  getNeighbors(v: T): [T, number][] {
    const neighbors = this.adj.get(v);
    if (!neighbors) return [];
    return [...neighbors.entries()];
  }
  // ...
}
```

Using `Map` instead of a plain array gives us $O(1)$ edge lookup and supports arbitrary vertex types — not just integers. The `directed` flag controls whether `addEdge` creates edges in both directions.

The complexity of common operations with an adjacency list:

| Operation | Time |
|-----------|------|
| Add vertex | $O(1)$ |
| Add edge | $O(1)$ |
| Remove edge | $O(1)$ |
| Check edge | $O(1)$ |
| Get neighbors | $O(1)$ |
| Remove vertex | $O(V + E)$ |
| Space | $O(V + E)$ |

### Adjacency matrix

An adjacency matrix stores the graph as a $|V| \times |V|$ matrix $M$ where $M[u][v]$ holds the weight of the edge from $u$ to $v$ (or $\infty$ if no edge exists). Vertices must be identified by integer indices $0, 1, \ldots, |V|-1$.

```
Graph: 0 — 1        Adjacency matrix:
       |   |              0    1    2
       2 ——┘         0 [  ∞    1    1  ]
                      1 [  1    ∞    1  ]
                      2 [  1    1    ∞  ]
```

Space: $\Theta(V^2)$, regardless of the number of edges. This makes the adjacency matrix inefficient for sparse graphs but convenient for dense graphs, where the space is similar to an adjacency list.

```typescript
export class GraphMatrix {
  private matrix: number[][];

  constructor(
    size: number,
    public readonly directed: boolean = false,
  ) {
    this.matrix = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Infinity),
    );
  }

  addEdge(u: number, v: number, weight: number = 1): void {
    this.matrix[u]![v] = weight;
    if (!this.directed) {
      this.matrix[v]![u] = weight;
    }
  }

  hasEdge(u: number, v: number): boolean {
    return this.matrix[u]![v] !== Infinity;
  }

  getNeighbors(v: number): [number, number][] {
    const result: [number, number][] = [];
    for (let i = 0; i < this.matrix.length; i++) {
      if (this.matrix[v]![i] !== Infinity) {
        result.push([i, this.matrix[v]![i]!]);
      }
    }
    return result;
  }
}
```

The complexity of common operations with an adjacency matrix:

| Operation | Time |
|-----------|------|
| Add edge | $O(1)$ |
| Remove edge | $O(1)$ |
| Check edge | $O(1)$ |
| Get neighbors | $O(V)$ |
| Space | $O(V^2)$ |

### When to use which?

| Criterion | Adjacency list | Adjacency matrix |
|-----------|---------------|-----------------|
| Space | $O(V + E)$ | $O(V^2)$ |
| Edge lookup | $O(1)$ with Map | $O(1)$ |
| Iterate neighbors | $O(\deg(v))$ | $O(V)$ |
| Best for | Sparse graphs | Dense graphs |
| Algorithms | BFS, DFS, Dijkstra, Kruskal | Floyd-Warshall, matrix algorithms |

Most graph algorithms iterate over the neighbors of each vertex, making the adjacency list the better choice for sparse graphs. The adjacency matrix is preferred when $|E|$ is close to $|V|^2$ or when constant-time edge lookups with integer indices are important (e.g., Floyd-Warshall in Chapter 13).

Throughout this book, we default to the adjacency list representation.

## Breadth-first search (BFS)

Breadth-first search explores a graph **level by level**: it visits all vertices at distance $d$ from the source before any vertex at distance $d + 1$. This guarantees that BFS finds the **shortest path** (fewest edges) from the source to every reachable vertex in an unweighted graph.

### The algorithm

BFS maintains a **queue** of vertices to visit. Starting from a source vertex $s$:

1. Enqueue $s$ and mark it as discovered with distance 0.
2. While the queue is not empty:
   a. Dequeue a vertex $u$.
   b. For each neighbor $v$ of $u$ that has not been discovered:
      - Mark $v$ as discovered with distance $d(u) + 1$.
      - Record $u$ as the parent of $v$.
      - Enqueue $v$.

The queue ensures that vertices are processed in the order they are discovered, which is the order of increasing distance from $s$.

### Trace-through

Consider the following undirected graph, starting BFS from vertex 1:

```
    1 — 2 — 5
    |   |
    3 — 4
```

| Step | Queue (front → back) | Process | Discover | Distance |
|------|---------------------|---------|----------|----------|
| 0 | [1] | — | 1 | d(1)=0 |
| 1 | [2, 3] | 1 | 2, 3 | d(2)=1, d(3)=1 |
| 2 | [3, 4, 5] | 2 | 4, 5 | d(4)=2, d(5)=2 |
| 3 | [4, 5] | 3 | — | (4 already discovered) |
| 4 | [5] | 4 | — | — |
| 5 | [] | 5 | — | — |

Every vertex is visited exactly once. The distances are correct: 2 and 3 are 1 edge from 1; 4 and 5 are 2 edges from 1.

### Implementation

```typescript
export interface BFSResult<T> {
  parent: Map<T, T | undefined>;
  distance: Map<T, number>;
  order: T[];
}

export function bfs<T>(graph: Graph<T>, source: T): BFSResult<T> {
  const parent = new Map<T, T | undefined>();
  const distance = new Map<T, number>();
  const order: T[] = [];

  parent.set(source, undefined);
  distance.set(source, 0);
  order.push(source);

  const queue: T[] = [source];
  let head = 0;

  while (head < queue.length) {
    const u = queue[head++]!;
    const d = distance.get(u)!;

    for (const [v] of graph.getNeighbors(u)) {
      if (!distance.has(v)) {
        distance.set(v, d + 1);
        parent.set(v, u);
        order.push(v);
        queue.push(v);
      }
    }
  }

  return { parent, distance, order };
}
```

We use an array with a `head` pointer as a simple queue (avoiding the overhead of a linked-list queue for this application). The `distance` map also serves as our "visited" set — a vertex has been discovered if and only if it has an entry in `distance`.

### Path reconstruction

The parent map produced by BFS encodes a shortest-path tree. To reconstruct the shortest path from source to target, follow parent pointers backward from the target:

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

### Complexity

- **Time:** $O(V + E)$. Every vertex is enqueued and dequeued at most once ($O(V)$), and every edge is examined at most once (once for directed, twice for undirected) ($O(E)$).
- **Space:** $O(V)$ for the queue, parent map, and distance map.

BFS is optimal for finding shortest paths in unweighted graphs. For weighted graphs, we need Dijkstra's algorithm (Chapter 13).

## Depth-first search (DFS)

Depth-first search explores a graph by going **as deep as possible** along each branch before backtracking. Where BFS explores level by level (breadth-first), DFS explores path by path (depth-first).

### The algorithm

DFS assigns two timestamps to each vertex:

- **Discovery time** $d[v]$: when the vertex is first encountered.
- **Finish time** $f[v]$: when all of $v$'s descendants have been fully explored.

Starting from a source vertex, DFS:

1. Mark the vertex as discovered (record discovery time).
2. For each undiscovered neighbor, recursively visit it.
3. Mark the vertex as finished (record finish time).

If the graph is disconnected, DFS restarts from unvisited vertices, producing a **DFS forest**.

### Trace-through

Consider the directed graph:

```
    1 → 2 → 3
    ↓       ↓
    4 → 5   6
        ↑   |
        └───┘
```

Starting DFS from vertex 1:

| Action | Vertex | Time | Stack (conceptual) |
|--------|--------|------|--------------------|
| Discover | 1 | 0 | [1] |
| Discover | 2 | 1 | [1, 2] |
| Discover | 3 | 2 | [1, 2, 3] |
| Discover | 6 | 3 | [1, 2, 3, 6] |
| Discover | 5 | 4 | [1, 2, 3, 6, 5] |
| Finish | 5 | 5 | [1, 2, 3, 6] |
| Finish | 6 | 6 | [1, 2, 3] |
| Finish | 3 | 7 | [1, 2] |
| Finish | 2 | 8 | [1] |
| Discover | 4 | 9 | [1, 4] |
| — | (5 already discovered) | — | — |
| Finish | 4 | 10 | [1] |
| Finish | 1 | 11 | [] |

The discovery and finish times satisfy the **parenthesis theorem**: for any two vertices $u$ and $v$, either the intervals $[d[u], f[u]]$ and $[d[v], f[v]]$ are entirely disjoint (neither is an ancestor of the other) or one is entirely contained within the other (one is an ancestor).

### Edge classification

During DFS on a directed graph, every edge $(u, v)$ falls into one of four categories based on the state of $v$ when the edge is explored:

| Edge type | Condition | Meaning |
|-----------|-----------|---------|
| **Tree edge** | $v$ is undiscovered | $v$ is discovered via this edge (part of the DFS tree) |
| **Back edge** | $v$ is discovered but not finished | $v$ is an ancestor of $u$ — indicates a **cycle** |
| **Forward edge** | $v$ is finished and $d[u] < d[v]$ | $v$ is a descendant of $u$ already fully explored via another path |
| **Cross edge** | $v$ is finished and $d[u] > d[v]$ | $v$ is in a different, already-finished subtree |

For **undirected** graphs, only tree edges and back edges are possible. Forward and cross edges cannot occur because every edge is traversed in both directions.

### Implementation

```typescript
export type EdgeType = 'tree' | 'back' | 'forward' | 'cross';

export interface ClassifiedEdge<T> {
  from: T;
  to: T;
  type: EdgeType;
}

export interface DFSResult<T> {
  discovery: Map<T, number>;
  finish: Map<T, number>;
  parent: Map<T, T | undefined>;
  order: T[];
  edges: ClassifiedEdge<T>[];
}

export function dfs<T>(
  graph: Graph<T>,
  startOrder?: T[],
): DFSResult<T> {
  const discovery = new Map<T, number>();
  const finish = new Map<T, number>();
  const parent = new Map<T, T | undefined>();
  const order: T[] = [];
  const edges: ClassifiedEdge<T>[] = [];
  let time = 0;

  const vertices = startOrder ?? graph.getVertices();

  function visit(u: T): void {
    discovery.set(u, time++);
    order.push(u);

    for (const [v] of graph.getNeighbors(u)) {
      if (!discovery.has(v)) {
        edges.push({ from: u, to: v, type: 'tree' });
        parent.set(v, u);
        visit(v);
      } else if (!finish.has(v)) {
        if (!graph.directed && parent.get(u) === v) continue;
        edges.push({ from: u, to: v, type: 'back' });
      } else if (graph.directed) {
        if (discovery.get(u)! < discovery.get(v)!) {
          edges.push({ from: u, to: v, type: 'forward' });
        } else {
          edges.push({ from: u, to: v, type: 'cross' });
        }
      }
    }

    finish.set(u, time++);
  }

  for (const v of vertices) {
    if (!discovery.has(v)) {
      parent.set(v, undefined);
      visit(v);
    }
  }

  return { discovery, finish, parent, order, edges };
}
```

The three-state classification (undiscovered, discovered but not finished, finished) maps directly to the colors used in textbooks: white, gray, black.

For undirected graphs, we skip the edge back to the parent — this is the same undirected edge we just traversed to reach the current vertex, not a true back edge.

### Complexity

- **Time:** $O(V + E)$. Each vertex is visited once ($O(V)$), and each edge is examined once for directed graphs or twice for undirected ($O(E)$).
- **Space:** $O(V)$ for the recursion stack, parent map, discovery and finish times. In the worst case (a path graph), the recursion depth is $O(V)$.

## Topological sort

A **topological sort** (or topological ordering) of a DAG is a linear ordering of all its vertices such that for every directed edge $(u, v)$, vertex $u$ appears before $v$ in the ordering. In other words, if there is a path from $u$ to $v$, then $u$ comes first.

Topological sort is only defined for directed acyclic graphs (DAGs). A directed graph with a cycle has no valid topological ordering — there is no way to place all vertices in a line when some edges point backward.

### Applications

- **Build systems** (Make, Bazel): compile source files in dependency order.
- **Task scheduling:** schedule jobs so that each job's prerequisites are completed first.
- **Course prerequisites:** determine a valid order to take courses.
- **Spreadsheet evaluation:** compute cells in an order that respects formula dependencies.
- **Package managers** (npm, apt): install dependencies before dependents.

### Kahn's algorithm (BFS-based)

Kahn's algorithm (1962) uses the idea that a vertex with no incoming edges can safely go first in the ordering:

1. Compute the in-degree of every vertex.
2. Add all vertices with in-degree 0 to a queue.
3. While the queue is not empty:
   a. Dequeue a vertex $u$ and add it to the result.
   b. For each neighbor $v$ of $u$, decrement $v$'s in-degree. If $v$'s in-degree becomes 0, enqueue $v$.
4. If the result contains all vertices, return it. Otherwise, the graph has a cycle.

```typescript
export function topologicalSortKahn<T>(graph: Graph<T>): T[] | null {
  const vertices = graph.getVertices();
  const inDeg = new Map<T, number>();

  for (const v of vertices) {
    inDeg.set(v, 0);
  }
  for (const v of vertices) {
    for (const [u] of graph.getNeighbors(v)) {
      inDeg.set(u, (inDeg.get(u) ?? 0) + 1);
    }
  }

  const queue: T[] = [];
  for (const [v, deg] of inDeg) {
    if (deg === 0) queue.push(v);
  }

  const order: T[] = [];
  let head = 0;

  while (head < queue.length) {
    const u = queue[head++]!;
    order.push(u);

    for (const [v] of graph.getNeighbors(u)) {
      const newDeg = inDeg.get(v)! - 1;
      inDeg.set(v, newDeg);
      if (newDeg === 0) queue.push(v);
    }
  }

  return order.length === vertices.length ? order : null;
}
```

**Cycle detection:** If the graph has a cycle, some vertices will never reach in-degree 0 and will never be enqueued. The algorithm detects this by checking whether all vertices were processed.

### DFS-based topological sort

An alternative approach uses DFS. A topological ordering is the **reverse** of the DFS finish-time order: the vertex that finishes last should appear first.

```typescript
export function topologicalSortDFS<T>(graph: Graph<T>): T[] | null {
  const vertices = graph.getVertices();

  const enum Color { White, Gray, Black }

  const color = new Map<T, Color>();
  for (const v of vertices) {
    color.set(v, Color.White);
  }

  const order: T[] = [];
  let hasCycle = false;

  function visit(u: T): void {
    if (hasCycle) return;
    color.set(u, Color.Gray);

    for (const [v] of graph.getNeighbors(u)) {
      const c = color.get(v)!;
      if (c === Color.Gray) {
        hasCycle = true;
        return;
      }
      if (c === Color.White) {
        visit(v);
        if (hasCycle) return;
      }
    }

    color.set(u, Color.Black);
    order.push(u);
  }

  for (const v of vertices) {
    if (color.get(v) === Color.White) {
      visit(v);
      if (hasCycle) return null;
    }
  }

  order.reverse();
  return order;
}
```

When we encounter a gray vertex (an ancestor on the current DFS path), we have found a back edge, which means the graph has a cycle.

### Trace-through

Consider the "dressing order" DAG:

```
undershorts → pants → shoes
                pants → belt → jacket
shirt → belt
shirt → tie → jacket
socks → shoes
watch (isolated)
```

Kahn's algorithm would start with vertices that have in-degree 0: `undershorts`, `shirt`, `socks`, `watch`. Processing them removes their outgoing edges, reducing in-degrees and producing new zero-in-degree vertices. A valid result:

```
undershorts, shirt, socks, watch, pants, tie, belt, shoes, jacket
```

DFS-based topological sort would produce a different but equally valid ordering based on which vertices are explored first.

### Complexity

Both algorithms run in $O(V + E)$ time and $O(V)$ space.

## Cycle detection

Cycle detection determines whether a graph contains a cycle. This is important for:

- Validating that a dependency graph is a DAG (and thus can be topologically sorted).
- Detecting deadlocks in resource allocation graphs.
- Identifying infinite loops in state machines.

### Directed cycle detection

A directed graph has a cycle if and only if a DFS discovers a **back edge** — an edge to a vertex that is currently being explored (gray in the three-color scheme).

```typescript
export function hasDirectedCycle<T>(graph: Graph<T>): boolean {
  const enum Color { White, Gray, Black }

  const color = new Map<T, Color>();
  for (const v of graph.getVertices()) {
    color.set(v, Color.White);
  }

  function visit(u: T): boolean {
    color.set(u, Color.Gray);

    for (const [v] of graph.getNeighbors(u)) {
      const c = color.get(v)!;
      if (c === Color.Gray) return true;
      if (c === Color.White && visit(v)) return true;
    }

    color.set(u, Color.Black);
    return false;
  }

  for (const v of graph.getVertices()) {
    if (color.get(v) === Color.White && visit(v)) {
      return true;
    }
  }
  return false;
}
```

The three colors are essential for directed cycle detection. A vertex colored gray is on the current DFS path. If we encounter a gray vertex, we have found a cycle. A black vertex (already finished) is not on the current path — an edge to a black vertex is a cross or forward edge, not evidence of a cycle.

### Undirected cycle detection

For undirected graphs, cycle detection is simpler. During DFS, if we encounter a visited vertex that is not the parent of the current vertex, we have found a cycle:

```typescript
export function hasUndirectedCycle<T>(graph: Graph<T>): boolean {
  const visited = new Set<T>();

  function visit(u: T, parent: T | undefined): boolean {
    visited.add(u);

    for (const [v] of graph.getNeighbors(u)) {
      if (!visited.has(v)) {
        if (visit(v, u)) return true;
      } else if (v !== parent) {
        return true;
      }
    }
    return false;
  }

  for (const v of graph.getVertices()) {
    if (!visited.has(v)) {
      if (visit(v, undefined)) return true;
    }
  }
  return false;
}
```

We only need two states (visited / not visited) instead of three, because in an undirected graph every non-tree edge to a visited non-parent vertex indicates a cycle. There are no forward or cross edges to worry about.

### Complexity

Both directed and undirected cycle detection run in $O(V + E)$ time and $O(V)$ space, since they are based on DFS.

## Connected components

A **connected component** of an undirected graph is a maximal set of vertices such that every pair is connected by a path. BFS or DFS can find all connected components:

```
components = 0
for each vertex v:
    if v is not visited:
        BFS(v) or DFS(v)   // marks all vertices in v's component
        components += 1
```

Each traversal from an unvisited vertex discovers one component. The total time is $O(V + E)$ since every vertex and edge is examined once across all traversals.

For directed graphs, the analogous concept is **strongly connected components** (SCCs): maximal sets of vertices where every vertex is reachable from every other vertex. Algorithms for finding SCCs (Kosaraju's, Tarjan's) build on DFS and will be discussed in later chapters.

## BFS vs. DFS

| Property | BFS | DFS |
|----------|-----|-----|
| Traversal order | Level by level | As deep as possible |
| Data structure | Queue | Stack (recursion or explicit) |
| Shortest paths (unweighted) | Yes | No |
| Edge classification (directed) | Tree, cross | Tree, back, forward, cross |
| Topological sort | Yes (Kahn's) | Yes (reverse finish order) |
| Cycle detection | Yes (via Kahn's / BFS topo sort) | Yes (back edge detection) |
| Memory | $O(V)$ — may store entire level | $O(V)$ — stack depth |
| Best for | Shortest paths, level-order | Cycle detection, topological sort, backtracking |

Both algorithms visit every vertex and edge exactly once (or twice for undirected edges), giving $O(V + E)$ time. The choice between them depends on the problem:

- Use **BFS** when you need shortest paths in an unweighted graph or want to explore vertices in order of distance.
- Use **DFS** when you need to detect cycles, classify edges, compute topological orderings, or explore all paths for backtracking algorithms.

## Summary

A **graph** $G = (V, E)$ models pairwise relationships between objects. The two standard representations — **adjacency list** ($O(V + E)$ space, efficient neighbor iteration) and **adjacency matrix** ($O(V^2)$ space, $O(1)$ edge lookup) — offer different trade-offs suited to sparse and dense graphs respectively.

**Breadth-first search** explores vertices level by level using a queue, computing shortest distances in unweighted graphs in $O(V + E)$ time. **Depth-first search** explores as deep as possible using recursion, assigning discovery and finish timestamps that enable edge classification into tree, back, forward, and cross edges.

Two important applications of DFS are **topological sorting** — producing a linear ordering of a DAG's vertices consistent with edge directions — and **cycle detection** — determining whether a graph contains a cycle by looking for back edges. Both run in $O(V + E)$ time.

These traversal algorithms form the foundation for nearly every graph algorithm in the chapters that follow. In Chapter 13, we will combine BFS ideas with the priority queue from Chapter 11 to solve the single-source shortest-path problem on weighted graphs (Dijkstra's algorithm). In Chapter 14, we will use graph traversal to find minimum spanning trees.

## Exercises

**Exercise 12.1.** Draw the adjacency list and adjacency matrix for the following directed graph. Which representation uses less space?

```
    A → B → C
    ↓       ↑
    D → E → F
```

**Exercise 12.2.** Run BFS on the following undirected graph starting from vertex $s$. Record the discovery order, the distance from $s$ to each vertex, and the BFS tree (parent pointers). Show the state of the queue at each step.

```
    s — a — b
    |       |
    c — d — e
        |
        f
```

**Exercise 12.3.** Run DFS on the graph from Exercise 12.2 (treating it as directed with edges going both ways). Record discovery and finish times for each vertex. Verify that the parenthesis theorem holds: for every pair of vertices, the intervals $[d[u], f[u]]$ and $[d[v], f[v]]$ are either disjoint or one contains the other.

**Exercise 12.4.** A **bipartite graph** is an undirected graph whose vertices can be partitioned into two sets $A$ and $B$ such that every edge connects a vertex in $A$ to a vertex in $B$. Prove that a graph is bipartite if and only if it contains no odd-length cycle. Then describe an $O(V + E)$ algorithm to determine whether a graph is bipartite, using BFS. (Hint: try to 2-color the graph level by level.)

**Exercise 12.5.** A tournament is a directed graph where every pair of vertices is connected by exactly one directed edge. Prove that every tournament has a Hamiltonian path (a path that visits every vertex exactly once). Then describe an $O(V \log V)$ algorithm to find one. (Hint: use divide-and-conquer.)
