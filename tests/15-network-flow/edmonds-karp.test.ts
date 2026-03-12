import { describe, it, expect } from 'vitest';
import { edmondsKarp } from '../../src/15-network-flow/edmonds-karp.js';

/**
 * Helper: build a simple two-path flow network.
 *
 *   s ──10──▶ A ──10──▶ t
 *   s ──10──▶ B ──10──▶ t
 *
 * Max flow = 20 (both paths carry 10).
 */
function twoPathNetwork() {
  return [
    { from: 's', to: 'A', capacity: 10 },
    { from: 'A', to: 't', capacity: 10 },
    { from: 's', to: 'B', capacity: 10 },
    { from: 'B', to: 't', capacity: 10 },
  ];
}

/**
 * Helper: build the classic CLRS-style flow network (Figure 26.1 variant).
 *
 *          16         12
 *   s ──────▶ A ──────▶ t
 *   │         │ ▲       ▲
 *   │13    4 │ │ 9    │ 20
 *   ▼         ▼ │       │
 *   B ──────▶ C ──────▶ D
 *      14         7
 *
 * Additional edges not shown in ASCII:
 *   s → B: 13,  A → C: 4 (not 10),  A → B: 4 (back),
 *   we'll use a standard example.
 *
 * Simplified CLRS Figure 26.6:
 *   s → v1: 16
 *   s → v2: 13
 *   v1 → v2: 4
 *   v1 → v3: 12
 *   v2 → v1: 10
 *   v2 → v4: 14
 *   v3 → v2: 9
 *   v3 → t:  20
 *   v4 → v3: 7
 *   v4 → t:  4
 *
 * Max flow = 23.
 */
function clrsFlowNetwork() {
  return [
    { from: 's', to: 'v1', capacity: 16 },
    { from: 's', to: 'v2', capacity: 13 },
    { from: 'v1', to: 'v2', capacity: 4 },
    { from: 'v1', to: 'v3', capacity: 12 },
    { from: 'v2', to: 'v1', capacity: 10 },
    { from: 'v2', to: 'v4', capacity: 14 },
    { from: 'v3', to: 'v2', capacity: 9 },
    { from: 'v3', to: 't', capacity: 20 },
    { from: 'v4', to: 'v3', capacity: 7 },
    { from: 'v4', to: 't', capacity: 4 },
  ];
}

/**
 * Helper: build a single-path network.
 *
 *   s ──5──▶ A ──3──▶ B ──8──▶ t
 *
 * Max flow = 3 (bottleneck at A→B).
 */
function singlePathNetwork() {
  return [
    { from: 's', to: 'A', capacity: 5 },
    { from: 'A', to: 'B', capacity: 3 },
    { from: 'B', to: 't', capacity: 8 },
  ];
}

/**
 * Helper: diamond-shaped network.
 *
 *       ┌──10──▶ A ──10──┐
 *   s ──┤                 ├──▶ t
 *       └──10──▶ B ──10──┘
 *                │
 *        A ──1──▶ B  (cross edge)
 *
 *   s → A: 10
 *   s → B: 10
 *   A → t: 10
 *   B → t: 10
 *   A → B: 1
 *
 * Max flow = 20 (cross edge doesn't help since both paths are saturated).
 */
function diamondNetwork() {
  return [
    { from: 's', to: 'A', capacity: 10 },
    { from: 's', to: 'B', capacity: 10 },
    { from: 'A', to: 't', capacity: 10 },
    { from: 'B', to: 't', capacity: 10 },
    { from: 'A', to: 'B', capacity: 1 },
  ];
}

describe('edmondsKarp', () => {
  it('throws if source equals sink', () => {
    expect(() => edmondsKarp([], 's', 's')).toThrow('Source and sink must be different');
  });

  it('returns 0 flow when source and sink are disconnected', () => {
    const edges = [
      { from: 's', to: 'A', capacity: 10 },
      { from: 'B', to: 't', capacity: 10 },
    ];
    const result = edmondsKarp(edges, 's', 't');
    expect(result.maxFlow).toBe(0);
  });

  it('computes max flow on a single-path network', () => {
    const result = edmondsKarp(singlePathNetwork(), 's', 't');
    expect(result.maxFlow).toBe(3);
  });

  it('computes max flow on a two-path network', () => {
    const result = edmondsKarp(twoPathNetwork(), 's', 't');
    expect(result.maxFlow).toBe(20);
  });

  it('computes max flow on the CLRS-style network', () => {
    const result = edmondsKarp(clrsFlowNetwork(), 's', 't');
    expect(result.maxFlow).toBe(23);
  });

  it('computes max flow on a diamond network', () => {
    const result = edmondsKarp(diamondNetwork(), 's', 't');
    expect(result.maxFlow).toBe(20);
  });

  it('handles a single edge', () => {
    const edges = [{ from: 's', to: 't', capacity: 42 }];
    const result = edmondsKarp(edges, 's', 't');
    expect(result.maxFlow).toBe(42);
  });

  it('handles zero-capacity edges', () => {
    const edges = [
      { from: 's', to: 'A', capacity: 0 },
      { from: 'A', to: 't', capacity: 10 },
    ];
    const result = edmondsKarp(edges, 's', 't');
    expect(result.maxFlow).toBe(0);
  });

  it('returns valid flow assignment on each edge', () => {
    const result = edmondsKarp(clrsFlowNetwork(), 's', 't');

    for (const fe of result.flowEdges) {
      // Flow must be non-negative and not exceed capacity.
      expect(fe.flow).toBeGreaterThanOrEqual(0);
      expect(fe.flow).toBeLessThanOrEqual(fe.capacity);
    }

    // Verify flow conservation: for each internal vertex, flow in = flow out.
    const inFlow = new Map<string, number>();
    const outFlow = new Map<string, number>();

    for (const fe of result.flowEdges) {
      const fromStr = String(fe.from);
      const toStr = String(fe.to);
      outFlow.set(fromStr, (outFlow.get(fromStr) ?? 0) + fe.flow);
      inFlow.set(toStr, (inFlow.get(toStr) ?? 0) + fe.flow);
    }

    // Internal vertices: not source 's' or sink 't'.
    const allVertices = new Set([...inFlow.keys(), ...outFlow.keys()]);
    for (const v of allVertices) {
      if (v === 's' || v === 't') continue;
      const inF = inFlow.get(v) ?? 0;
      const outF = outFlow.get(v) ?? 0;
      expect(inF).toBe(outF);
    }

    // Total flow out of source = max flow.
    expect(outFlow.get('s')! - (inFlow.get('s') ?? 0)).toBe(result.maxFlow);
  });

  it('computes a valid min-cut', () => {
    const network = clrsFlowNetwork();
    const result = edmondsKarp(network, 's', 't');

    // Source should be in the min-cut set, sink should not.
    expect(result.minCut.has('s')).toBe(true);
    expect(result.minCut.has('t')).toBe(false);

    // The capacity of edges crossing the cut should equal the max flow.
    let cutCapacity = 0;
    for (const { from, to, capacity } of network) {
      if (result.minCut.has(from) && !result.minCut.has(to)) {
        cutCapacity += capacity;
      }
    }
    expect(cutCapacity).toBe(result.maxFlow);
  });

  it('handles multiple augmenting paths correctly', () => {
    // Network requiring multiple augmenting paths.
    //
    //   s ──3──▶ A ──2──▶ t
    //   s ──2──▶ B ──3──▶ t
    //            A ──1──▶ B
    //
    // Max flow = 5.
    const edges = [
      { from: 's', to: 'A', capacity: 3 },
      { from: 's', to: 'B', capacity: 2 },
      { from: 'A', to: 't', capacity: 2 },
      { from: 'B', to: 't', capacity: 3 },
      { from: 'A', to: 'B', capacity: 1 },
    ];
    const result = edmondsKarp(edges, 's', 't');
    expect(result.maxFlow).toBe(5);
  });

  it('handles a network with anti-parallel edges', () => {
    // Two vertices with edges in both directions.
    const edges = [
      { from: 's', to: 'A', capacity: 10 },
      { from: 'A', to: 's', capacity: 5 },
      { from: 'A', to: 't', capacity: 10 },
    ];
    const result = edmondsKarp(edges, 's', 't');
    expect(result.maxFlow).toBe(10);
  });

  it('handles numeric vertex identifiers', () => {
    //   0 ──7──▶ 1 ──5──▶ 3
    //   0 ──4──▶ 2 ──6──▶ 3
    //            1 ──3──▶ 2
    //
    // Paths: 0→1→3 (5), 0→2→3 (4), 0→1→2→3 (2). Max flow = 11.
    const edges = [
      { from: 0, to: 1, capacity: 7 },
      { from: 0, to: 2, capacity: 4 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 6 },
      { from: 1, to: 2, capacity: 3 },
    ];
    const result = edmondsKarp(edges, 0, 3);
    expect(result.maxFlow).toBe(11);
  });

  it('handles a network where flow must be rerouted via reverse edges', () => {
    // This network demonstrates the need for reverse edges in the residual graph.
    //
    //   s ──1──▶ A ──1──▶ C ──1──▶ t
    //            │                 ▲
    //            1                 1
    //            ▼                 │
    //            B ───────1───────▶ t
    //
    //   But also: s ──1──▶ B
    //
    // After first augmenting s→A→C→t (flow 1), the path s→B→t is needed.
    // With B→t we get flow 1 more.
    // Total max flow should be 2.
    const edges = [
      { from: 's', to: 'A', capacity: 1 },
      { from: 's', to: 'B', capacity: 1 },
      { from: 'A', to: 'C', capacity: 1 },
      { from: 'B', to: 'C', capacity: 1 },
      { from: 'C', to: 't', capacity: 2 },
    ];
    const result = edmondsKarp(edges, 's', 't');
    expect(result.maxFlow).toBe(2);
  });
});
