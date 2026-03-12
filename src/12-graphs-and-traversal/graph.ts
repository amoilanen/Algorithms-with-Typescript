import type { Edge } from '../types.js';

/**
 * A generic graph supporting directed/undirected and weighted/unweighted edges.
 *
 * Vertices are identified by values of type `T` and stored in a `Map`-based
 * adjacency list. Each entry maps a vertex to a `Map` of its neighbors and
 * the corresponding edge weights (`1` for unweighted edges).
 *
 * ### Complexity (V = vertices, E = edges)
 * | Operation      | Time          |
 * |----------------|---------------|
 * | addVertex      | O(1)          |
 * | addEdge        | O(1)          |
 * | removeVertex   | O(V + E)      |
 * | removeEdge     | O(1)          |
 * | hasVertex      | O(1)          |
 * | hasEdge        | O(1)          |
 * | getNeighbors   | O(1)          |
 * | getEdgeWeight  | O(1)          |
 * | getVertices    | O(V)          |
 * | getEdges       | O(V + E)      |
 */
export class Graph<T> {
  /** Adjacency list: vertex → (neighbor → weight). */
  private adj = new Map<T, Map<T, number>>();

  /**
   * @param directed  If `true` the graph is directed; otherwise undirected.
   */
  constructor(public readonly directed = false) {}

  // ── Vertices ───────────────────────────────────────────────────

  /** Add a vertex. If it already exists this is a no-op. */
  addVertex(v: T): void {
    if (!this.adj.has(v)) {
      this.adj.set(v, new Map());
    }
  }

  /** Remove a vertex and all its incident edges. */
  removeVertex(v: T): void {
    if (!this.adj.has(v)) return;
    // Remove all edges pointing to v.
    for (const [, neighbors] of this.adj) {
      neighbors.delete(v);
    }
    this.adj.delete(v);
  }

  /** Whether the graph contains vertex `v`. */
  hasVertex(v: T): boolean {
    return this.adj.has(v);
  }

  /** Return all vertices as an array. */
  getVertices(): T[] {
    return [...this.adj.keys()];
  }

  /** Number of vertices. */
  get vertexCount(): number {
    return this.adj.size;
  }

  // ── Edges ──────────────────────────────────────────────────────

  /**
   * Add an edge from `u` to `v` with the given weight (default 1).
   * Both endpoints are added as vertices if they do not already exist.
   * If the edge already exists its weight is updated.
   * For undirected graphs the reverse edge is added automatically.
   */
  addEdge(u: T, v: T, weight = 1): void {
    this.addVertex(u);
    this.addVertex(v);
    this.adj.get(u)!.set(v, weight);
    if (!this.directed) {
      this.adj.get(v)!.set(u, weight);
    }
  }

  /** Remove the edge from `u` to `v` (and from `v` to `u` in undirected graphs). */
  removeEdge(u: T, v: T): void {
    this.adj.get(u)?.delete(v);
    if (!this.directed) {
      this.adj.get(v)?.delete(u);
    }
  }

  /** Whether an edge from `u` to `v` exists. */
  hasEdge(u: T, v: T): boolean {
    return this.adj.get(u)?.has(v) ?? false;
  }

  /** Return the weight of the edge from `u` to `v`, or `undefined` if no edge exists. */
  getEdgeWeight(u: T, v: T): number | undefined {
    return this.adj.get(u)?.get(v);
  }

  /**
   * Return the neighbors of `v` as an array of `[neighbor, weight]` pairs.
   * Returns an empty array if `v` does not exist.
   */
  getNeighbors(v: T): [T, number][] {
    const neighbors = this.adj.get(v);
    if (!neighbors) return [];
    return [...neighbors.entries()];
  }

  /**
   * Return all edges as an array of {@link Edge} objects.
   * For undirected graphs each edge appears once (with `from ≤ to` by insertion order).
   */
  getEdges(): Edge<T>[] {
    const edges: Edge<T>[] = [];
    const seen = new Set<string>();

    for (const [u, neighbors] of this.adj) {
      for (const [v, weight] of neighbors) {
        if (!this.directed) {
          // For undirected, avoid duplicates using a canonical key.
          const key = `${String(u)}-${String(v)}`;
          const reverseKey = `${String(v)}-${String(u)}`;
          if (seen.has(reverseKey)) continue;
          seen.add(key);
        }
        edges.push({ from: u, to: v, weight });
      }
    }
    return edges;
  }

  /** Number of edges. */
  get edgeCount(): number {
    let count = 0;
    for (const [, neighbors] of this.adj) {
      count += neighbors.size;
    }
    return this.directed ? count : count / 2;
  }

  /**
   * Return the in-degree of vertex `v` (number of edges pointing to `v`).
   * For undirected graphs this equals the degree.
   */
  inDegree(v: T): number {
    if (!this.adj.has(v)) return 0;
    if (!this.directed) return this.adj.get(v)!.size;
    let count = 0;
    for (const [, neighbors] of this.adj) {
      if (neighbors.has(v)) count++;
    }
    return count;
  }

  /**
   * Return the out-degree of vertex `v` (number of edges leaving `v`).
   * For undirected graphs this equals the degree.
   */
  outDegree(v: T): number {
    return this.adj.get(v)?.size ?? 0;
  }
}

// ── Adjacency Matrix Representation ──────────────────────────────

/**
 * A graph stored as an adjacency matrix of numbers.
 *
 * Vertices are identified by integer indices `0 .. n-1`. A value of
 * `Infinity` means "no edge". Any finite value is the edge weight.
 *
 * Best suited for **dense** graphs where $|E| \approx |V|^2$.
 *
 * ### Complexity
 * | Operation      | Time   |
 * |----------------|--------|
 * | addEdge        | O(1)   |
 * | removeEdge     | O(1)   |
 * | hasEdge        | O(1)   |
 * | getEdgeWeight  | O(1)   |
 * | getNeighbors   | O(V)   |
 * | addVertex      | O(V)   |
 * | removeVertex   | O(V²)  |
 * | space          | O(V²)  |
 */
export class GraphMatrix {
  private matrix: number[][];
  private n: number;

  /**
   * @param size      Number of vertices (0-indexed).
   * @param directed  If `true` the graph is directed.
   */
  constructor(
    size: number,
    public readonly directed = false,
  ) {
    this.n = size;
    this.matrix = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Infinity),
    );
  }

  /** Number of vertices. */
  get vertexCount(): number {
    return this.n;
  }

  /** Add an edge from `u` to `v` with the given weight (default 1). */
  addEdge(u: number, v: number, weight = 1): void {
    this.matrix[u]![v] = weight;
    if (!this.directed) {
      this.matrix[v]![u] = weight;
    }
  }

  /** Remove the edge from `u` to `v`. */
  removeEdge(u: number, v: number): void {
    this.matrix[u]![v] = Infinity;
    if (!this.directed) {
      this.matrix[v]![u] = Infinity;
    }
  }

  /** Whether an edge from `u` to `v` exists. */
  hasEdge(u: number, v: number): boolean {
    return this.matrix[u]![v] !== Infinity;
  }

  /** Return the weight of the edge from `u` to `v`, or `Infinity` if no edge exists. */
  getEdgeWeight(u: number, v: number): number {
    return this.matrix[u]![v]!;
  }

  /**
   * Return the neighbors of vertex `v` as an array of `[neighbor, weight]` pairs.
   */
  getNeighbors(v: number): [number, number][] {
    const result: [number, number][] = [];
    for (let i = 0; i < this.n; i++) {
      if (this.matrix[v]![i] !== Infinity) {
        result.push([i, this.matrix[v]![i]!]);
      }
    }
    return result;
  }

  /**
   * Return the raw adjacency matrix (a copy).
   */
  toMatrix(): number[][] {
    return this.matrix.map((row) => row.slice());
  }
}
