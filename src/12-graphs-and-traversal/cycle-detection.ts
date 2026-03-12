import { Graph } from './graph.js';

/**
 * Detect whether a **directed** graph contains a cycle.
 *
 * Uses DFS with three-color marking (white / gray / black). A cycle exists
 * if and only if a back edge is encountered — i.e., an edge to a gray
 * (currently being explored) vertex.
 *
 * ### Complexity
 * - Time:  O(V + E)
 * - Space: O(V)
 *
 * @returns `true` if the directed graph contains at least one cycle.
 */
export function hasDirectedCycle<T>(graph: Graph<T>): boolean {
  if (!graph.directed) {
    throw new Error('Use hasUndirectedCycle for undirected graphs');
  }

  const enum Color {
    White,
    Gray,
    Black,
  }

  const color = new Map<T, Color>();
  for (const v of graph.getVertices()) {
    color.set(v, Color.White);
  }

  function visit(u: T): boolean {
    color.set(u, Color.Gray);

    for (const [v] of graph.getNeighbors(u)) {
      const c = color.get(v)!;
      if (c === Color.Gray) return true; // back edge → cycle
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

/**
 * Detect whether an **undirected** graph contains a cycle.
 *
 * Uses DFS. A cycle exists if we encounter a visited vertex that is not the
 * parent of the current vertex in the DFS tree.
 *
 * ### Complexity
 * - Time:  O(V + E)
 * - Space: O(V)
 *
 * @returns `true` if the undirected graph contains at least one cycle.
 */
export function hasUndirectedCycle<T>(graph: Graph<T>): boolean {
  if (graph.directed) {
    throw new Error('Use hasDirectedCycle for directed graphs');
  }

  const visited = new Set<T>();

  function visit(u: T, parent: T | undefined): boolean {
    visited.add(u);

    for (const [v] of graph.getNeighbors(u)) {
      if (!visited.has(v)) {
        if (visit(v, u)) return true;
      } else if (v !== parent) {
        // Visited neighbor that is not the parent → cycle.
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

/**
 * Convenience function: detect a cycle in either a directed or undirected
 * graph, dispatching to the appropriate algorithm.
 */
export function hasCycle<T>(graph: Graph<T>): boolean {
  return graph.directed ? hasDirectedCycle(graph) : hasUndirectedCycle(graph);
}
