/**
 * Maximum bipartite matching via reduction to maximum flow.
 *
 * Given a bipartite graph with left vertices L and right vertices R, we
 * construct a flow network by adding a **super-source** connected to every
 * vertex in L (capacity 1) and a **super-sink** connected from every vertex
 * in R (capacity 1). Each original edge (u, v) with u ∈ L and v ∈ R gets
 * capacity 1. The maximum flow in this network equals the size of the
 * maximum matching.
 *
 * The reduction preserves the structure of the matching: each augmenting path
 * in the flow network corresponds to either adding a new matched edge or
 * swapping an existing one (an augmenting path in matching terminology).
 *
 * ### Complexity
 * - Time:  O(V · E) — Edmonds-Karp on a unit-capacity network terminates
 *          in O(V) augmenting path iterations, each taking O(E) via BFS.
 *          More precisely, O(E · √V) via Hopcroft-Karp, but we use the
 *          simpler Edmonds-Karp reduction here.
 * - Space: O(V + E) for the flow network.
 *
 * @module
 */

import { edmondsKarp } from './edmonds-karp.js';

/**
 * Result of the maximum bipartite matching computation.
 *
 * - `size`    — the number of matched pairs.
 * - `matches` — the matched pairs as `[left, right]` tuples.
 */
export interface BipartiteMatchingResult<L, R> {
  size: number;
  matches: [L, R][];
}

/** Wrapper type for super-source/super-sink vertices in the flow network. */
type FlowVertex<L, R> =
  | { kind: 'source' }
  | { kind: 'sink' }
  | { kind: 'left'; value: L }
  | { kind: 'right'; value: R };

/**
 * Compute the maximum bipartite matching.
 *
 * @param left   Array of left-side vertices.
 * @param right  Array of right-side vertices.
 * @param edges  Array of `[leftVertex, rightVertex]` pairs representing edges
 *               in the bipartite graph.
 * @returns A {@link BipartiteMatchingResult} with the matching size and pairs.
 */
export function bipartiteMatching<L, R>(
  left: L[],
  right: R[],
  edges: [L, R][],
): BipartiteMatchingResult<L, R> {
  // Create tagged vertices for the flow network to avoid name collisions.
  const source: FlowVertex<L, R> = { kind: 'source' };
  const sink: FlowVertex<L, R> = { kind: 'sink' };

  // Map left and right vertices to their tagged representations.
  const leftVertices = new Map<L, FlowVertex<L, R>>();
  const rightVertices = new Map<R, FlowVertex<L, R>>();

  for (const l of left) {
    leftVertices.set(l, { kind: 'left', value: l });
  }
  for (const r of right) {
    rightVertices.set(r, { kind: 'right', value: r });
  }

  // Build the flow network edges.
  const flowEdges: { from: FlowVertex<L, R>; to: FlowVertex<L, R>; capacity: number }[] = [];

  // Source → each left vertex (capacity 1).
  for (const lv of leftVertices.values()) {
    flowEdges.push({ from: source, to: lv, capacity: 1 });
  }

  // Each right vertex → sink (capacity 1).
  for (const rv of rightVertices.values()) {
    flowEdges.push({ from: rv, to: sink, capacity: 1 });
  }

  // Each bipartite edge: left → right (capacity 1).
  for (const [l, r] of edges) {
    const lv = leftVertices.get(l);
    const rv = rightVertices.get(r);
    if (lv && rv) {
      flowEdges.push({ from: lv, to: rv, capacity: 1 });
    }
  }

  // Run Edmonds-Karp on the flow network.
  const result = edmondsKarp(flowEdges, source, sink);

  // Extract the matching from flow edges: edges from left to right with flow = 1.
  const matches: [L, R][] = [];
  for (const fe of result.flowEdges) {
    if (
      fe.flow === 1 &&
      (fe.from as FlowVertex<L, R>).kind === 'left' &&
      (fe.to as FlowVertex<L, R>).kind === 'right'
    ) {
      matches.push([
        (fe.from as FlowVertex<L, R> & { kind: 'left'; value: L }).value,
        (fe.to as FlowVertex<L, R> & { kind: 'right'; value: R }).value,
      ]);
    }
  }

  return { size: result.maxFlow, matches };
}
