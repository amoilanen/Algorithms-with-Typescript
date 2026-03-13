import { Graph } from '../12-graphs-and-traversal/graph';
import type { ShortestPathResult } from './dijkstra';

/**
 * Result of the Bellman-Ford algorithm.
 *
 * Extends {@link ShortestPathResult} with a flag indicating whether a
 * negative-weight cycle is reachable from the source.
 */
export interface BellmanFordResult<T> extends ShortestPathResult<T> {
  /** `true` if a negative-weight cycle is reachable from the source. */
  hasNegativeCycle: boolean;
}

/**
 * The Bellman-Ford algorithm for single-source shortest paths.
 *
 * Unlike Dijkstra's algorithm, Bellman-Ford handles **negative edge weights**
 * and detects **negative-weight cycles** reachable from the source.
 *
 * The algorithm performs V-1 relaxation passes over all edges. If any edge
 * can still be relaxed after V-1 passes, a negative-weight cycle exists.
 *
 * ### Complexity
 * - Time:  O(V * E)
 * - Space: O(V)
 *
 * @param graph   A **directed** weighted graph.
 * @param source  The source vertex.
 * @returns A {@link BellmanFordResult} with distances, parent pointers, and
 *          negative-cycle detection.
 * @throws {Error} If the graph is undirected or `source` is not in the graph.
 */
export function bellmanFord<T>(
  graph: Graph<T>,
  source: T,
): BellmanFordResult<T> {
  if (!graph.directed) {
    throw new Error(
      'Bellman-Ford is intended for directed graphs; model undirected edges ' +
        'as two directed edges instead',
    );
  }
  if (!graph.hasVertex(source)) {
    throw new Error('Source vertex is not in the graph');
  }

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
      if (du === Infinity) continue; // No path to u yet.
      for (const [v, weight] of graph.getNeighbors(u)) {
        const newDist = du + weight;
        if (newDist < dist.get(v)!) {
          dist.set(v, newDist);
          parent.set(v, u);
          changed = true;
        }
      }
    }
    // Early termination: if no distance was updated, we are done.
    if (!changed) break;
  }

  // Check for negative-weight cycles: if any edge can still be relaxed,
  // a negative cycle is reachable from the source.
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
