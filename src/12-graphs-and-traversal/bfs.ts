import { Graph } from './graph.js';

/**
 * Result of a breadth-first search from a source vertex `s`.
 *
 * - `parent`   — for each discovered vertex, the vertex from which it was
 *                reached. The source maps to `undefined`.
 * - `distance` — shortest number of edges (unweighted) from `s` to each
 *                discovered vertex. Unreachable vertices are absent from
 *                the map.
 * - `order`    — vertices in the order they were first discovered.
 */
export interface BFSResult<T> {
  parent: Map<T, T | undefined>;
  distance: Map<T, number>;
  order: T[];
}

/**
 * Breadth-first search on a {@link Graph}.
 *
 * Starting from `source`, BFS explores the graph level by level, visiting all
 * vertices at distance $d$ before any vertex at distance $d + 1$. This
 * guarantees that the `distance` map contains the **shortest path distances**
 * in an unweighted graph.
 *
 * ### Complexity
 * - Time:  O(V + E)
 * - Space: O(V)
 *
 * @param graph   The graph to search.
 * @param source  The vertex to start the search from.
 * @returns A {@link BFSResult} containing parent pointers, distances, and
 *          discovery order.
 */
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

/**
 * Reconstruct the shortest path from `source` to `target` using the parent
 * map produced by {@link bfs}.
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

  // Sanity check: the path must start at the source.
  if (path[0] !== source) return null;
  return path;
}
