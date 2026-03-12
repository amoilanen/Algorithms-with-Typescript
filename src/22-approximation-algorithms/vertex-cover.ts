/**
 * Vertex cover 2-approximation algorithm.
 *
 * Given an undirected graph, a **vertex cover** is a subset of vertices
 * such that every edge has at least one endpoint in the subset. Finding the
 * minimum vertex cover is NP-hard (it is the optimization version of the
 * NP-complete VERTEX COVER decision problem).
 *
 * This module implements the classical 2-approximation: repeatedly pick an
 * arbitrary uncovered edge and add **both** endpoints to the cover. The
 * resulting cover is at most twice the size of the optimal.
 *
 * Time complexity:  O(V + E)
 * Space complexity: O(V + E)
 *
 * @module
 */

import { Graph } from '../12-graphs-and-traversal/graph.js';

/**
 * Result of the vertex cover computation.
 */
export interface VertexCoverResult<T> {
  /** The set of vertices forming the cover. */
  cover: Set<T>;
  /** The number of vertices in the cover. */
  size: number;
}

/**
 * Compute a 2-approximate minimum vertex cover of an undirected graph.
 *
 * The algorithm picks an arbitrary uncovered edge, adds both endpoints to
 * the cover, removes all edges incident to those vertices, and repeats
 * until no edges remain. Because the selected edges form a matching, the
 * optimal cover must include at least one endpoint of each, so:
 *
 * $$|C| = 2 \cdot |M| \leq 2 \cdot \text{OPT}$$
 *
 * ### Complexity
 * - Time:  O(V + E)
 * - Space: O(V + E)
 *
 * @param graph An undirected graph.
 * @returns A {@link VertexCoverResult} with the cover vertices and their count.
 * @throws {Error} If the graph is directed.
 */
export function vertexCover<T>(graph: Graph<T>): VertexCoverResult<T> {
  if (graph.directed) {
    throw new Error('Vertex cover requires an undirected graph');
  }

  const cover = new Set<T>();
  const edges = graph.getEdges();

  for (const edge of edges) {
    // If neither endpoint is already covered, add both.
    if (!cover.has(edge.from) && !cover.has(edge.to)) {
      cover.add(edge.from);
      cover.add(edge.to);
    }
  }

  return { cover, size: cover.size };
}
