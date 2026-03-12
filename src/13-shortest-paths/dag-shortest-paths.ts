import { Graph } from '../12-graphs-and-traversal/graph.js';
import { topologicalSortKahn } from '../12-graphs-and-traversal/topological-sort.js';
import type { ShortestPathResult } from './dijkstra.js';

/**
 * Single-source shortest paths in a **directed acyclic graph** (DAG).
 *
 * The algorithm first computes a topological ordering of the vertices, then
 * relaxes each edge exactly once in that order. Because there are no cycles,
 * each vertex is processed after all its predecessors, guaranteeing correct
 * shortest-path distances in a single pass.
 *
 * This algorithm works with **negative edge weights** (unlike Dijkstra) and
 * is faster than Bellman-Ford for DAGs.
 *
 * ### Complexity
 * - Time:  O(V + E)
 * - Space: O(V)
 *
 * @param graph   A **directed acyclic** weighted graph.
 * @param source  The source vertex.
 * @returns A {@link ShortestPathResult} with distances and parent pointers.
 * @throws {Error} If the graph is undirected, contains a cycle, or `source`
 *                 is not in the graph.
 */
export function dagShortestPaths<T>(
  graph: Graph<T>,
  source: T,
): ShortestPathResult<T> {
  if (!graph.directed) {
    throw new Error('DAG shortest paths requires a directed graph');
  }
  if (!graph.hasVertex(source)) {
    throw new Error('Source vertex is not in the graph');
  }

  const order = topologicalSortKahn(graph);
  if (order === null) {
    throw new Error('Graph contains a cycle; DAG shortest paths requires a DAG');
  }

  const dist = new Map<T, number>();
  const parent = new Map<T, T | undefined>();

  for (const v of graph.getVertices()) {
    dist.set(v, Infinity);
  }
  dist.set(source, 0);
  parent.set(source, undefined);

  // Process vertices in topological order.
  for (const u of order) {
    const du = dist.get(u)!;
    if (du === Infinity) continue; // Unreachable from source.

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
