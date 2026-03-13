/**
 * Metric TSP 2-approximation via minimum spanning tree.
 *
 * Given a complete graph with edge weights satisfying the **triangle
 * inequality** ($d(u, w) \leq d(u, v) + d(v, w)$ for all vertices
 * $u, v, w$), this algorithm produces a Hamiltonian cycle whose total
 * cost is at most twice the optimal.
 *
 * The approach:
 * 1. Compute an MST of the complete graph.
 * 2. Perform a DFS preorder traversal of the MST.
 * 3. The preorder ordering, with a return to the start, forms the tour.
 *
 * Because the MST cost is a lower bound on OPT (removing one edge from
 * the optimal tour yields a spanning tree), and the shortcutted DFS walk
 * costs at most twice the MST (by the triangle inequality), the tour
 * cost is at most $2 \cdot \text{OPT}$.
 *
 * Time complexity:  O(V² log V) — building the complete graph and MST.
 * Space complexity: O(V²) for the complete graph.
 *
 * @module
 */

import type { DistanceMatrix } from '../21-complexity/tsp-brute-force';
import { Graph } from '../12-graphs-and-traversal/graph';
import { prim } from '../14-minimum-spanning-trees/prim';

/**
 * Result of the metric TSP approximation.
 */
export interface MetricTSPResult {
  /** The tour as an ordered list of city indices (starting city appears
   *  at the beginning but NOT repeated at the end). */
  tour: number[];
  /** The total distance of the tour (including return to start). */
  distance: number;
}

/**
 * Compute a 2-approximate TSP tour for a metric instance.
 *
 * The distance matrix must satisfy the triangle inequality. The algorithm
 * does **not** verify this property — if it is violated, the approximation
 * guarantee does not hold (though a valid tour is still returned).
 *
 * ### Complexity
 * - Time:  O(V² log V) — constructing the complete graph is O(V²),
 *          Prim's MST is O(E log V) = O(V² log V) on a complete graph.
 * - Space: O(V²) for the adjacency list of the complete graph.
 *
 * @param dist An n×n distance matrix. `dist[i][j]` is the cost from city
 *             i to city j. Must be symmetric and satisfy the triangle inequality.
 * @returns A {@link MetricTSPResult} with the approximate tour and its distance.
 * @throws {RangeError} If the matrix is empty.
 * @throws {Error} If the matrix is not square.
 */
export function metricTSP(dist: DistanceMatrix): MetricTSPResult {
  const n = dist.length;

  if (n === 0) {
    throw new RangeError('distance matrix must not be empty');
  }

  for (let i = 0; i < n; i++) {
    if (dist[i]!.length !== n) {
      throw new Error(
        `distance matrix must be square (row ${i} has ${dist[i]!.length} columns, expected ${n})`,
      );
    }
  }

  // Trivial cases.
  if (n === 1) {
    return { tour: [0], distance: 0 };
  }

  if (n === 2) {
    return {
      tour: [0, 1],
      distance: dist[0]![1]! + dist[1]![0]!,
    };
  }

  // Build a complete undirected graph with the given distances.
  const graph = new Graph<number>(false);
  for (let i = 0; i < n; i++) {
    graph.addVertex(i);
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      graph.addEdge(i, j, dist[i]![j]!);
    }
  }

  // Step 1: Compute MST using Prim's algorithm.
  const mst = prim(graph, 0);

  // Build an adjacency list for the MST.
  const mstAdj = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    mstAdj.set(i, []);
  }
  for (const edge of mst.edges) {
    mstAdj.get(edge.from)!.push(edge.to);
    mstAdj.get(edge.to)!.push(edge.from);
  }

  // Step 2: DFS preorder traversal of the MST starting at vertex 0.
  const tour: number[] = [];
  const visited = new Set<number>();

  function dfsPreorder(v: number): void {
    visited.add(v);
    tour.push(v);
    for (const neighbor of mstAdj.get(v)!) {
      if (!visited.has(neighbor)) {
        dfsPreorder(neighbor);
      }
    }
  }

  dfsPreorder(0);

  // Step 3: Compute the total tour distance (including return to start).
  let distance = 0;
  for (let i = 0; i < tour.length - 1; i++) {
    distance += dist[tour[i]!]![tour[i + 1]!]!;
  }
  distance += dist[tour[tour.length - 1]!]![tour[0]!]!;

  return { tour, distance };
}
