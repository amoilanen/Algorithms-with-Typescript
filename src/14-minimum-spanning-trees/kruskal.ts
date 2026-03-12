import type { Edge } from '../types.js';
import { Graph } from '../12-graphs-and-traversal/graph.js';
import { UnionFind } from '../18-disjoint-sets/union-find.js';

/**
 * Result of a minimum spanning tree computation.
 *
 * - `edges`  — the edges forming the MST.
 * - `weight` — the total weight of the MST.
 */
export interface MSTResult<T> {
  edges: Edge<T>[];
  weight: number;
}

/**
 * Kruskal's algorithm for computing a minimum spanning tree (MST) of an
 * undirected, connected, weighted graph.
 *
 * The algorithm sorts all edges by weight and greedily adds the lightest
 * edge that does not create a cycle, using a Union-Find data structure to
 * efficiently detect cycles.
 *
 * If the graph is disconnected, the result is a **minimum spanning forest**
 * covering all connected components.
 *
 * ### Complexity
 * - Time:  O(E log E) — dominated by the sort; union-find operations are
 *          nearly O(1) amortized.
 * - Space: O(V + E)
 *
 * @param graph An undirected, weighted graph.
 * @returns An {@link MSTResult} containing the MST edges and total weight.
 * @throws {Error} If the graph is directed.
 */
export function kruskal<T>(graph: Graph<T>): MSTResult<T> {
  if (graph.directed) {
    throw new Error('Kruskal\'s algorithm requires an undirected graph');
  }

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
    // If the endpoints are in different components, adding this edge
    // does not create a cycle.
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
