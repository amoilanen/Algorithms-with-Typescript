import { Graph } from './graph';

/**
 * Topological sort of a directed acyclic graph (DAG) using **Kahn's
 * algorithm** (BFS-based).
 *
 * The algorithm repeatedly removes vertices with in-degree 0 and appends
 * them to the result. If the result contains fewer vertices than the graph,
 * the graph has a cycle and no topological ordering exists.
 *
 * ### Complexity
 * - Time:  O(V + E)
 * - Space: O(V)
 *
 * @param graph  A **directed** graph.
 * @returns A topological ordering of the vertices, or `null` if the graph
 *          contains a cycle.
 * @throws {Error} If the graph is undirected.
 */
export function topologicalSortKahn<T>(graph: Graph<T>): T[] | null {
  if (!graph.directed) {
    throw new Error('Topological sort is only defined for directed graphs');
  }

  const vertices = graph.getVertices();
  const inDeg = new Map<T, number>();

  // Initialize in-degrees.
  for (const v of vertices) {
    inDeg.set(v, 0);
  }
  for (const v of vertices) {
    for (const [u] of graph.getNeighbors(v)) {
      inDeg.set(u, (inDeg.get(u) ?? 0) + 1);
    }
  }

  // Seed the queue with all vertices of in-degree 0.
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

  // If we didn't process all vertices the graph has a cycle.
  return order.length === vertices.length ? order : null;
}

/**
 * Topological sort of a DAG using **DFS**.
 *
 * Performs a full DFS and returns vertices in reverse finish-time order.
 * If a back edge is encountered the graph has a cycle and no topological
 * ordering exists.
 *
 * ### Complexity
 * - Time:  O(V + E)
 * - Space: O(V)
 *
 * @param graph  A **directed** graph.
 * @returns A topological ordering of the vertices, or `null` if the graph
 *          contains a cycle.
 * @throws {Error} If the graph is undirected.
 */
export function topologicalSortDFS<T>(graph: Graph<T>): T[] | null {
  if (!graph.directed) {
    throw new Error('Topological sort is only defined for directed graphs');
  }

  const vertices = graph.getVertices();

  const enum Color {
    White,
    Gray,
    Black,
  }

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
