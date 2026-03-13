import type { Edge } from '../types';
import { Graph } from '../12-graphs-and-traversal/graph';
import { BinaryHeap } from '../11-heaps-and-priority-queues/binary-heap';
import type { MSTResult } from './kruskal';

/** An entry in Prim's priority queue: the candidate edge and its weight. */
interface HeapEntry<T> {
  vertex: T;
  weight: number;
  from: T;
}

/**
 * Prim's algorithm for computing a minimum spanning tree (MST) of an
 * undirected, connected, weighted graph.
 *
 * Starting from an arbitrary vertex, the algorithm maintains a frontier of
 * candidate edges and greedily adds the lightest edge that connects a new
 * vertex to the growing tree. A binary heap efficiently selects the minimum-
 * weight frontier edge at each step.
 *
 * If the graph is disconnected, the result is the MST of the connected
 * component containing the starting vertex. To obtain a full spanning forest,
 * call Prim's for each unvisited component (or use Kruskal's instead).
 *
 * ### Complexity
 * - Time:  O(E log V) with a binary heap
 * - Space: O(V + E)
 *
 * @param graph An undirected, weighted graph.
 * @param start Optional starting vertex. Defaults to the first vertex
 *              returned by `getVertices()`.
 * @returns An {@link MSTResult} containing the MST edges and total weight.
 * @throws {Error} If the graph is directed.
 * @throws {Error} If the graph has no vertices.
 * @throws {Error} If `start` is provided but not in the graph.
 */
export function prim<T>(graph: Graph<T>, start?: T): MSTResult<T> {
  if (graph.directed) {
    throw new Error('Prim\'s algorithm requires an undirected graph');
  }

  const vertices = graph.getVertices();
  if (vertices.length === 0) {
    throw new Error('Graph has no vertices');
  }

  const source = start ?? vertices[0]!;
  if (!graph.hasVertex(source)) {
    throw new Error('Start vertex is not in the graph');
  }

  const visited = new Set<T>();
  const mstEdges: Edge<T>[] = [];
  let totalWeight = 0;

  // Min-heap ordered by edge weight.
  const heap = new BinaryHeap<HeapEntry<T>>((a, b) => a.weight - b.weight);

  // Seed the heap with all edges from the source.
  visited.add(source);
  for (const [neighbor, weight] of graph.getNeighbors(source)) {
    heap.insert({ vertex: neighbor, weight, from: source });
  }

  while (!heap.isEmpty && visited.size < vertices.length) {
    const entry = heap.extract()!;

    if (visited.has(entry.vertex)) continue;

    // Add this vertex to the tree.
    visited.add(entry.vertex);
    mstEdges.push({ from: entry.from, to: entry.vertex, weight: entry.weight });
    totalWeight += entry.weight;

    // Add all edges from the newly added vertex to the frontier.
    for (const [neighbor, weight] of graph.getNeighbors(entry.vertex)) {
      if (!visited.has(neighbor)) {
        heap.insert({ vertex: neighbor, weight, from: entry.vertex });
      }
    }
  }

  return { edges: mstEdges, weight: totalWeight };
}
