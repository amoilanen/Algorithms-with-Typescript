import { Graph } from '../12-graphs-and-traversal/graph.js';

/**
 * Result of the Floyd-Warshall all-pairs shortest-paths computation.
 *
 * - `dist`     — `dist[i][j]` is the shortest distance from vertex `i` to
 *                vertex `j`. `Infinity` means no path exists.
 * - `next`     — `next[i][j]` is the next vertex after `i` on the shortest
 *                path from `i` to `j`, or `-1` if no path exists.
 * - `vertices` — ordered list of vertices; index in this array corresponds
 *                to row/column indices in `dist` and `next`.
 */
export interface FloydWarshallResult<T> {
  dist: number[][];
  next: number[][];
  vertices: T[];
}

/**
 * Reconstruct the shortest path from vertex at index `i` to vertex at
 * index `j` using the `next` matrix from Floyd-Warshall.
 *
 * @returns An array of vertex indices forming the path, or `null` if no
 *          path exists.
 */
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

/**
 * The Floyd-Warshall algorithm for **all-pairs shortest paths**.
 *
 * Computes the shortest distance between every pair of vertices using
 * dynamic programming. The key recurrence is:
 *
 * ```
 * dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
 * ```
 *
 * for each intermediate vertex `k`.
 *
 * The algorithm handles **negative edge weights** but produces undefined
 * results if the graph contains a negative-weight cycle. Use the
 * `hasNegativeCycle` helper to check after running.
 *
 * ### Complexity
 * - Time:  O(V^3)
 * - Space: O(V^2)
 *
 * @param graph  A **directed** weighted graph.
 * @returns A {@link FloydWarshallResult} with the distance matrix, next-hop
 *          matrix, and the vertex-to-index mapping.
 * @throws {Error} If the graph is undirected.
 */
export function floydWarshall<T>(graph: Graph<T>): FloydWarshallResult<T> {
  if (!graph.directed) {
    throw new Error(
      'Floyd-Warshall is intended for directed graphs; model undirected ' +
        'edges as two directed edges instead',
    );
  }

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

  // Distance from every vertex to itself is 0.
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

  // DP: consider each vertex k as a potential intermediate.
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

/**
 * Check whether the Floyd-Warshall result contains a negative-weight cycle.
 *
 * A negative cycle exists if any vertex has a negative distance to itself
 * (i.e., `dist[i][i] < 0`).
 */
export function hasNegativeCycle(result: FloydWarshallResult<unknown>): boolean {
  for (let i = 0; i < result.vertices.length; i++) {
    if (result.dist[i]![i]! < 0) return true;
  }
  return false;
}
