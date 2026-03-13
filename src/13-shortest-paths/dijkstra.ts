import { Graph } from '../12-graphs-and-traversal/graph';
import { PriorityQueue } from '../11-heaps-and-priority-queues/priority-queue';

/**
 * Result of a single-source shortest-paths computation.
 *
 * - `dist`   — shortest distance from the source to each reachable vertex.
 *              Unreachable vertices map to `Infinity`.
 * - `parent` — predecessor on the shortest path. The source maps to `undefined`.
 *              Unreachable vertices are absent from the map.
 */
export interface ShortestPathResult<T> {
  dist: Map<T, number>;
  parent: Map<T, T | undefined>;
}

/**
 * Reconstruct the shortest path from `source` to `target` using the parent
 * map produced by a shortest-path algorithm.
 *
 * @returns The path as an array of vertices from `source` to `target`, or
 *          `null` if `target` is unreachable.
 */
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

/**
 * Dijkstra's algorithm for single-source shortest paths in graphs with
 * **non-negative** edge weights.
 *
 * Uses a priority queue to greedily explore the closest unvisited vertex.
 * The algorithm maintains a set of "finalized" vertices for which the
 * shortest distance is known and repeatedly relaxes outgoing edges.
 *
 * ### Complexity
 * - Time:  O((V + E) log V) with a binary-heap priority queue
 * - Space: O(V)
 *
 * @param graph   A weighted graph (directed or undirected) with non-negative
 *                edge weights. Negative weights produce **undefined** behavior.
 * @param source  The source vertex.
 * @returns A {@link ShortestPathResult} with distances and parent pointers.
 * @throws {Error} If `source` is not in the graph.
 */
export function dijkstra<T>(graph: Graph<T>, source: T): ShortestPathResult<T> {
  if (!graph.hasVertex(source)) {
    throw new Error('Source vertex is not in the graph');
  }

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
