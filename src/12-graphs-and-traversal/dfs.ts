import { Graph } from './graph';

/**
 * Classification of an edge discovered during DFS.
 *
 * - `tree`    — edge to a newly discovered vertex (part of the DFS forest).
 * - `back`    — edge to an ancestor in the DFS tree (indicates a cycle in
 *               directed graphs).
 * - `forward` — edge to a descendant already discovered via another path
 *               (directed graphs only).
 * - `cross`   — edge to a vertex in a different, already-finished subtree
 *               (directed graphs only).
 */
export type EdgeType = 'tree' | 'back' | 'forward' | 'cross';

/**
 * A classified edge discovered during DFS.
 */
export interface ClassifiedEdge<T> {
  from: T;
  to: T;
  type: EdgeType;
}

/**
 * Result of a depth-first search on a graph.
 *
 * - `discovery`  — maps each vertex to the time it was first discovered.
 * - `finish`     — maps each vertex to the time its exploration completed.
 * - `parent`     — maps each vertex to its parent in the DFS forest
 *                  (`undefined` for roots).
 * - `order`      — vertices in discovery order.
 * - `edges`      — all edges classified by type.
 */
export interface DFSResult<T> {
  discovery: Map<T, number>;
  finish: Map<T, number>;
  parent: Map<T, T | undefined>;
  order: T[];
  edges: ClassifiedEdge<T>[];
}

/**
 * Depth-first search on a {@link Graph}.
 *
 * Explores the graph by going as deep as possible along each branch before
 * backtracking. Assigns discovery and finish timestamps to every vertex and
 * classifies every edge.
 *
 * If the graph is disconnected (or a directed graph with multiple source
 * components), all vertices are still visited — the algorithm restarts from
 * unvisited vertices as needed, producing a DFS **forest**.
 *
 * ### Edge classification (directed graphs)
 *
 * | Edge type | Condition (when exploring u → v) |
 * |-----------|----------------------------------|
 * | tree      | v has not been discovered         |
 * | back      | v is discovered but not finished (ancestor of u) |
 * | forward   | v is finished and discovered after u |
 * | cross     | v is finished and discovered before u |
 *
 * For **undirected** graphs only tree and back edges are possible.
 *
 * ### Complexity
 * - Time:  O(V + E)
 * - Space: O(V)
 *
 * @param graph       The graph to search.
 * @param startOrder  Optional array specifying the order in which source
 *                    vertices are considered. Useful for algorithms that
 *                    require a specific vertex ordering (e.g., DFS-based
 *                    topological sort uses reverse finish-time order for
 *                    the second pass of Kosaraju's algorithm).
 *                    Defaults to the order returned by `graph.getVertices()`.
 */
export function dfs<T>(graph: Graph<T>, startOrder?: T[]): DFSResult<T> {
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
        // Tree edge.
        edges.push({ from: u, to: v, type: 'tree' });
        parent.set(v, u);
        visit(v);
      } else if (!finish.has(v)) {
        // v is discovered but not finished → back edge.
        // For undirected graphs, skip the trivial "back edge" to the parent.
        if (!graph.directed && parent.get(u) === v) continue;
        edges.push({ from: u, to: v, type: 'back' });
      } else if (graph.directed) {
        // v is already finished.
        if (discovery.get(u)! < discovery.get(v)!) {
          edges.push({ from: u, to: v, type: 'forward' });
        } else {
          edges.push({ from: u, to: v, type: 'cross' });
        }
      }
      // For undirected graphs, finished + not-parent edges are not classified
      // (they are the reverse traversal of an already-classified tree edge).
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
