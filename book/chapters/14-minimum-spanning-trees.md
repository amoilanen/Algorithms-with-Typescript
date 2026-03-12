# Minimum Spanning Trees

_In Chapter 13 we found shortest paths — the lightest routes between specific pairs of vertices. A different but equally important problem arises when we want to connect **all** vertices of a graph as cheaply as possible: laying cable between cities, wiring components on a circuit board, or clustering data points. The answer is a **minimum spanning tree (MST)**. In this chapter we define the MST problem, establish the theoretical foundation — the **cut property** and **cycle property** — that makes greedy algorithms correct, and present two classic algorithms: **Kruskal's algorithm**, which sorts edges and uses a Union-Find data structure, and **Prim's algorithm**, which grows a tree from a single vertex using a priority queue._

## The minimum spanning tree problem

Let $G = (V, E)$ be a connected, undirected graph with edge-weight function $w : E \to \mathbb{R}$. A **spanning tree** of $G$ is a subgraph $T = (V, E_T)$ that:

1. includes every vertex of $G$,
2. is connected, and
3. is acyclic (a tree).

Any spanning tree of a graph with $V$ vertices has exactly $V - 1$ edges. A **minimum spanning tree** is a spanning tree whose total edge weight

$$w(T) = \sum_{e \in E_T} w(e)$$

is minimized over all spanning trees of $G$. An MST is not necessarily unique — a graph can have multiple spanning trees with the same minimum total weight — but the minimum weight itself is unique.

If $G$ is disconnected, no spanning tree exists; instead we can find a **minimum spanning forest**, a collection of MSTs, one for each connected component.

### Where MSTs appear

Minimum spanning trees arise naturally in many settings:

- **Network design.** Connecting cities with the least total cable, pipe, or road.
- **Cluster analysis.** Removing the $k - 1$ most expensive edges from an MST partitions data into $k$ clusters (single-linkage clustering).
- **Approximation algorithms.** The MST provides a 2-approximation for the metric Travelling Salesman Problem (Chapter 22).
- **Image segmentation.** Treating pixels as vertices and pixel differences as edge weights, the MST captures the structure of an image.

## Theoretical foundation

Both Kruskal's and Prim's algorithms are greedy — they build the MST by making locally optimal edge choices. The **cut property** and **cycle property** guarantee that these local choices lead to a globally optimal solution.

### Cuts and light edges

A **cut** $(S, V \setminus S)$ of a graph $G = (V, E)$ is a partition of the vertex set into two non-empty subsets. An edge **crosses** the cut if its endpoints are in different subsets. A cut **respects** a set $A$ of edges if no edge in $A$ crosses the cut. A **light edge** of a cut is a crossing edge with minimum weight among all crossing edges.

### The cut property

**Theorem (Cut Property).** Let $A$ be a subset of some MST of $G$, and let $(S, V \setminus S)$ be any cut that respects $A$. Let $e = (u, v)$ be a light edge crossing the cut. Then $A \cup \{e\}$ is a subset of some MST.

_Proof sketch._ Let $T$ be an MST containing $A$. If $T$ already contains $e$, we are done. Otherwise, adding $e$ to $T$ creates a cycle. This cycle must contain another edge $e'$ crossing the cut (since $e$ crosses it and the cycle returns to the same side). Because $e$ is a light edge, $w(e) \leq w(e')$. The tree $T' = T - \{e'\} + \{e\}$ is a spanning tree with $w(T') \leq w(T)$, so $T'$ is also an MST containing $A \cup \{e\}$. $\square$

### The cycle property

**Theorem (Cycle Property).** Let $C$ be any cycle in $G$, and let $e$ be the unique heaviest edge in $C$ (strictly heavier than all other edges in $C$). Then $e$ does not belong to any MST.

_Proof sketch._ Suppose for contradiction that some MST $T$ contains $e$. Removing $e$ from $T$ splits $T$ into two components. Since $C$ is a cycle, there exists another edge $e'$ in $C$ connecting these two components. We have $w(e') < w(e)$, so replacing $e$ with $e'$ yields a spanning tree with smaller weight — contradicting the minimality of $T$. $\square$

The cut property tells us which edges are **safe** to add; the cycle property tells us which edges are **safe to exclude**. Both Kruskal's and Prim's algorithms are instantiations of a generic greedy MST strategy that repeatedly applies the cut property.

## Union-Find: the key data structure for Kruskal's algorithm

Kruskal's algorithm needs to efficiently determine whether adding an edge creates a cycle. This reduces to asking: "Are vertices $u$ and $v$ in the same connected component?" The **Union-Find** (also called **Disjoint Set Union**) data structure answers this question in nearly constant time.

Union-Find maintains a collection of disjoint sets and supports three operations:

- **makeSet(x)** — create a singleton set $\{x\}$.
- **find(x)** — return the representative (root) of the set containing $x$.
- **union(x, y)** — merge the sets containing $x$ and $y$.

### Union by rank

Each set is stored as a rooted tree. The **rank** of a node is an upper bound on its height. When merging two sets, we attach the shorter tree beneath the taller one, keeping the overall tree shallow:

```
union(x, y):
    rootX = find(x)
    rootY = find(y)
    if rootX == rootY: return           // already in same set
    if rank[rootX] < rank[rootY]:
        parent[rootX] = rootY
    else if rank[rootX] > rank[rootY]:
        parent[rootY] = rootX
    else:
        parent[rootY] = rootX
        rank[rootX] = rank[rootX] + 1
```

Without path compression, union by rank alone guarantees $O(\log n)$ time per `find`.

### Path compression

During a `find` operation, we make every node on the path from $x$ to the root point directly to the root. This "flattens" the tree, speeding up subsequent queries:

```
find(x):
    root = x
    while parent[root] != root:
        root = parent[root]
    // Compress: point every node on the path to root
    while x != root:
        next = parent[x]
        parent[x] = root
        x = next
    return root
```

### Combined complexity

With both path compression and union by rank, any sequence of $m$ operations on $n$ elements runs in $O(m \cdot \alpha(n))$ time, where $\alpha$ is the **inverse Ackermann function**. This function grows so slowly that $\alpha(n) \leq 4$ for any $n$ up to $2^{2^{2^{65536}}}$ — far beyond the number of atoms in the observable universe. For all practical purposes, each operation is $O(1)$.

### Implementation

```typescript
export class UnionFind<T> {
  private parent = new Map<T, T>();
  private rank = new Map<T, number>();
  private _componentCount = 0;

  makeSet(x: T): void {
    if (this.parent.has(x)) return;
    this.parent.set(x, x);
    this.rank.set(x, 0);
    this._componentCount++;
  }

  find(x: T): T {
    let root = x;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!;
    }
    // Path compression.
    let current = x;
    while (current !== root) {
      const next = this.parent.get(current)!;
      this.parent.set(current, root);
      current = next;
    }
    return root;
  }

  union(x: T, y: T): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    const rankX = this.rank.get(rootX)!;
    const rankY = this.rank.get(rootY)!;
    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }
    this._componentCount--;
    return true;
  }

  connected(x: T, y: T): boolean {
    return this.find(x) === this.find(y);
  }

  get componentCount(): number {
    return this._componentCount;
  }
}
```

We will revisit Union-Find in greater depth in Chapter 18, including a more thorough discussion of the amortized analysis and additional applications such as dynamic connectivity.

## Kruskal's algorithm

Kruskal's algorithm (1956) builds the MST by processing edges in order of increasing weight. For each edge, it checks whether the edge connects two different components; if so, it adds the edge to the MST and merges the components.

### Algorithm

```
Kruskal(G):
    sort edges of G by weight (ascending)
    initialize Union-Find with all vertices
    MST = {}
    for each edge (u, v, w) in sorted order:
        if find(u) != find(v):        // u and v in different components
            MST = MST ∪ {(u, v, w)}
            union(u, v)
    return MST
```

### Why it works

Each time Kruskal's adds an edge $(u, v)$, the two components containing $u$ and $v$ define a cut: $S$ is the component containing $u$, and $V \setminus S$ contains $v$. Edge $(u, v)$ is the lightest crossing edge (since we process edges in sorted order and all lighter crossing edges have already been processed — either added or rejected because they were within a single component). By the cut property, adding $(u, v)$ is safe.

### Trace through an example

Consider this weighted graph:

```
    A ---4--- B
    |  \      |  \
    8    2    6    7
    |      \  |      \
    H        C ---4--- D
    |       / |
    1     7   2
    |    /    |
    G ---6--- F
```

Sorted edges: $(G,H,1)$, $(A,C,2)$, $(C,F,2)$, $(A,B,4)$, $(C,D,4)$, $(B,C,6)$, $(F,G,6)$, $(B,D,7)$, $(C,G,7)$, $(A,H,8)$.

| Step | Edge | Weight | Action | Components |
|------|------|--------|--------|------------|
| 1 | $(G,H)$ | 1 | Add | $\{G,H\}$, $\{A\}$, $\{B\}$, $\{C\}$, $\{D\}$, $\{F\}$ |
| 2 | $(A,C)$ | 2 | Add | $\{G,H\}$, $\{A,C\}$, $\{B\}$, $\{D\}$, $\{F\}$ |
| 3 | $(C,F)$ | 2 | Add | $\{G,H\}$, $\{A,C,F\}$, $\{B\}$, $\{D\}$ |
| 4 | $(A,B)$ | 4 | Add | $\{G,H\}$, $\{A,B,C,F\}$, $\{D\}$ |
| 5 | $(C,D)$ | 4 | Add | $\{G,H\}$, $\{A,B,C,D,F\}$ |
| 6 | $(B,C)$ | 6 | Reject | $B$ and $C$ in same component |
| 7 | $(F,G)$ | 6 | Add | $\{A,B,C,D,F,G,H\}$ |

After adding 6 edges (which is $V - 1$ for our 7-vertex graph), the MST is complete with total weight $1 + 2 + 2 + 4 + 4 + 6 = 19$.

### Implementation

```typescript
import type { Edge } from '../types.js';
import { Graph } from '../12-graphs-and-traversal/graph.js';
import { UnionFind } from '../18-disjoint-sets/union-find.js';

export interface MSTResult<T> {
  edges: Edge<T>[];
  weight: number;
}

export function kruskal<T>(graph: Graph<T>): MSTResult<T> {
  const vertices = graph.getVertices();
  const edges = graph.getEdges();

  // Sort edges by weight (ascending).
  edges.sort((a, b) => a.weight - b.weight);

  // Initialize Union-Find with all vertices.
  const uf = new UnionFind<T>();
  for (const v of vertices) {
    uf.makeSet(v);
  }

  const mstEdges: Edge<T>[] = [];
  let totalWeight = 0;

  for (const edge of edges) {
    if (!uf.connected(edge.from, edge.to)) {
      uf.union(edge.from, edge.to);
      mstEdges.push(edge);
      totalWeight += edge.weight;

      // An MST of V vertices has exactly V - 1 edges.
      if (mstEdges.length === vertices.length - 1) break;
    }
  }

  return { edges: mstEdges, weight: totalWeight };
}
```

### Complexity

- **Time:** $O(E \log E)$ for sorting, plus $O(E \cdot \alpha(V))$ for the union-find operations. Since $\log E = O(\log V)$ (because $E \leq V^2$), the total is $O(E \log V)$.
- **Space:** $O(V + E)$ for the edge list and union-find structure.

Kruskal's algorithm is particularly well-suited for **sparse** graphs, where $E$ is much smaller than $V^2$, and for situations where the edges are already available as a sorted list (e.g., from an external data source).

## Prim's algorithm

Prim's algorithm (1957, independently discovered by Jarnik in 1930) takes a different approach: it grows the MST from a single starting vertex, always adding the lightest edge that connects the tree to a new vertex.

### Algorithm

```
Prim(G, start):
    initialize priority queue PQ
    visited = {start}
    insert all edges from start into PQ
    MST = {}
    while PQ is not empty and |MST| < |V| - 1:
        (u, v, w) = PQ.extractMin()      // lightest frontier edge
        if v in visited: continue         // already in tree
        visited = visited ∪ {v}
        MST = MST ∪ {(u, v, w)}
        for each edge (v, x, w') where x not in visited:
            PQ.insert((v, x, w'))
    return MST
```

### Why it works

At each step, the set of visited vertices defines one side of a cut, and the unvisited vertices form the other side. The priority queue ensures that we always select a light edge crossing this cut. By the cut property, this edge is safe to add.

### Trace through an example

Using the same graph as before, starting from vertex $A$:

| Step | Extract | Weight | Add to tree | Frontier edges added |
|------|---------|--------|-------------|---------------------|
| 0 | — | — | start at $A$ | $(A,B,4)$, $(A,C,2)$, $(A,H,8)$ |
| 1 | $(A,C)$ | 2 | $C$ | $(C,B,6)$, $(C,D,4)$, $(C,F,2)$, $(C,G,7)$ |
| 2 | $(C,F)$ | 2 | $F$ | $(F,G,6)$ |
| 3 | $(A,B)$ | 4 | $B$ | $(B,D,7)$ |
| 4 | $(C,D)$ | 4 | $D$ | — |
| 5 | $(F,G)$ | 6 | $G$ | $(G,H,1)$ |
| 6 | $(G,H)$ | 1 | $H$ | — |

MST weight: $2 + 2 + 4 + 4 + 6 + 1 = 19$ — the same as Kruskal's result.

Notice that the edges may be added in a different order than Kruskal's, but the total weight is identical.

### Implementation

```typescript
import type { Edge } from '../types.js';
import { Graph } from '../12-graphs-and-traversal/graph.js';
import { BinaryHeap } from '../11-heaps-and-priority-queues/binary-heap.js';

interface HeapEntry<T> {
  vertex: T;
  weight: number;
  from: T;
}

export function prim<T>(graph: Graph<T>, start?: T): MSTResult<T> {
  const vertices = graph.getVertices();
  const source = start ?? vertices[0]!;

  const visited = new Set<T>();
  const mstEdges: Edge<T>[] = [];
  let totalWeight = 0;

  // Min-heap ordered by edge weight.
  const heap = new BinaryHeap<HeapEntry<T>>(
    (a, b) => a.weight - b.weight,
  );

  // Seed the heap with all edges from the source.
  visited.add(source);
  for (const [neighbor, weight] of graph.getNeighbors(source)) {
    heap.insert({ vertex: neighbor, weight, from: source });
  }

  while (!heap.isEmpty && visited.size < vertices.length) {
    const entry = heap.extract()!;
    if (visited.has(entry.vertex)) continue;

    // Add this vertex to the tree.
    visited.add(entry.vertex);
    mstEdges.push({
      from: entry.from,
      to: entry.vertex,
      weight: entry.weight,
    });
    totalWeight += entry.weight;

    // Add frontier edges from the newly added vertex.
    for (const [neighbor, weight] of graph.getNeighbors(entry.vertex)) {
      if (!visited.has(neighbor)) {
        heap.insert({ vertex: neighbor, weight, from: entry.vertex });
      }
    }
  }

  return { edges: mstEdges, weight: totalWeight };
}
```

Our implementation uses a binary heap directly (rather than the `PriorityQueue` wrapper) for efficiency. Each edge may be inserted into the heap, and stale entries (edges to already-visited vertices) are simply discarded on extraction.

### Complexity

- **Time:** $O(E \log V)$ with a binary heap. Each of the $E$ edges is inserted into the heap (at most once), and each insertion/extraction costs $O(\log V)$. With a Fibonacci heap, this improves to $O(E + V \log V)$, which is better for dense graphs.
- **Space:** $O(V + E)$ for the visited set and the heap.

Prim's algorithm is well-suited for **dense** graphs, especially with a Fibonacci heap. For sparse graphs, Kruskal's is often simpler and equally efficient.

## Kruskal's vs. Prim's

| Feature | Kruskal's | Prim's |
|---------|-----------|--------|
| Strategy | Global edge sorting | Local vertex growing |
| Data structure | Union-Find | Priority queue (heap) |
| Time (binary heap) | $O(E \log V)$ | $O(E \log V)$ |
| Time (Fibonacci heap) | — | $O(E + V \log V)$ |
| Best for | Sparse graphs | Dense graphs |
| Parallelism | Edges can be processed in parallel (with concurrent union-find) | Inherently sequential |
| Disconnected graphs | Produces spanning forest naturally | Spans only one component per call |
| Simplicity | Very simple to implement | Slightly more complex |

Both algorithms produce MSTs of identical total weight. When the graph is sparse ($E = O(V)$), Kruskal's is often preferred for its simplicity. When the graph is dense ($E = \Theta(V^2)$) and a Fibonacci heap is available, Prim's has a theoretical edge.

## Correctness and uniqueness

### When is the MST unique?

An MST is unique if and only if every cut of the graph has a unique light edge. Equivalently, if all edge weights are distinct, the MST is unique. When edges share weights, there may be multiple MSTs, but they all have the same total weight.

### Verifying an MST

Given a claimed MST, we can verify it in $O(E \cdot \alpha(V))$ time by checking:

1. The tree has exactly $V - 1$ edges.
2. The tree spans all vertices (use union-find or BFS/DFS).
3. For every non-tree edge $(u, v)$, the weight of $(u, v)$ is at least as large as the maximum edge weight on the path from $u$ to $v$ in the tree (cycle property).

## Exercises

**Exercise 14.1.** Run Kruskal's algorithm on the following weighted graph. Show the state of the Union-Find structure after each edge addition and the final MST.

```
    1 ---5--- 2 ---3--- 3
    |         |         |
    6         2         7
    |         |         |
    4 ---4--- 5 ---1--- 6
```

**Exercise 14.2.** Run Prim's algorithm on the same graph from Exercise 14.1, starting from vertex 1. Show the contents of the priority queue after each step.

**Exercise 14.3.** Prove that if all edge weights are distinct, the minimum spanning tree is unique. (_Hint: assume two distinct MSTs exist and derive a contradiction using the cycle property._)

**Exercise 14.4.** A **bottleneck spanning tree** is a spanning tree that minimizes the weight of its maximum-weight edge. Prove that every MST is a bottleneck spanning tree. Is the converse true?

**Exercise 14.5.** You are given a connected, weighted, undirected graph $G$ and its MST $T$. A new edge $(u, v, w)$ is added to $G$. Describe an efficient algorithm to update the MST. What is the time complexity? (_Hint: adding the new edge to $T$ creates exactly one cycle._)

## Summary

A **minimum spanning tree** of a connected, undirected, weighted graph is a spanning tree with minimum total edge weight. The **cut property** guarantees that the lightest edge crossing any cut is safe to include, while the **cycle property** guarantees that the heaviest edge in any cycle is safe to exclude.

**Kruskal's algorithm** sorts all edges by weight and greedily adds edges that do not create a cycle, using a **Union-Find** data structure for efficient cycle detection. It runs in $O(E \log V)$ time and naturally produces a spanning forest for disconnected graphs.

**Prim's algorithm** grows the MST from a single vertex, always adding the lightest edge connecting the tree to a new vertex, using a **priority queue** to select the minimum-weight frontier edge. It also runs in $O(E \log V)$ with a binary heap, improving to $O(E + V \log V)$ with a Fibonacci heap.

Both algorithms are greedy, both are correct by the cut property, and both produce MSTs of identical total weight. Kruskal's is typically preferred for sparse graphs and for its simplicity; Prim's is preferred for dense graphs, especially when a Fibonacci heap is available. The Union-Find data structure introduced here — with path compression and union by rank — achieves near-constant amortized time per operation and will reappear in Chapter 18 and in the approximation algorithms of Chapter 22.
