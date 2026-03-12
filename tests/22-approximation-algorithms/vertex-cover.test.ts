import { describe, it, expect } from 'vitest';
import { vertexCover } from '../../src/22-approximation-algorithms/vertex-cover.js';
import { Graph } from '../../src/12-graphs-and-traversal/graph.js';

describe('vertexCover', () => {
  // ── Helper ─────────────────────────────────────────────────────────

  /** Verify that every edge has at least one endpoint in the cover. */
  function verifyCover<T>(graph: Graph<T>, cover: Set<T>): void {
    for (const edge of graph.getEdges()) {
      expect(
        cover.has(edge.from) || cover.has(edge.to),
        `Edge ${String(edge.from)}-${String(edge.to)} is not covered`,
      ).toBe(true);
    }
  }

  // ── Basic cases ────────────────────────────────────────────────────

  it('covers all edges in a triangle', () => {
    const g = new Graph<number>(false);
    g.addEdge(0, 1);
    g.addEdge(1, 2);
    g.addEdge(0, 2);

    const result = vertexCover(g);
    verifyCover(g, result.cover);
    expect(result.size).toBe(result.cover.size);
    // Optimal is 2 (any two vertices). 2-approx ≤ 4, but triangle
    // matching can pick at most 1 edge → cover size = 2.
  });

  it('covers all edges in a path graph', () => {
    // 0 — 1 — 2 — 3
    const g = new Graph<number>(false);
    g.addEdge(0, 1);
    g.addEdge(1, 2);
    g.addEdge(2, 3);

    const result = vertexCover(g);
    verifyCover(g, result.cover);
  });

  it('covers all edges in a star graph', () => {
    // Center = 0, leaves = 1..4
    const g = new Graph<number>(false);
    for (let i = 1; i <= 4; i++) {
      g.addEdge(0, i);
    }

    const result = vertexCover(g);
    verifyCover(g, result.cover);
  });

  it('covers a complete graph K4', () => {
    const g = new Graph<number>(false);
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        g.addEdge(i, j);
      }
    }

    const result = vertexCover(g);
    verifyCover(g, result.cover);
  });

  it('covers a bipartite graph', () => {
    // Left: 0, 1    Right: 2, 3, 4
    // Edges: 0-2, 0-3, 1-3, 1-4
    const g = new Graph<number>(false);
    g.addEdge(0, 2);
    g.addEdge(0, 3);
    g.addEdge(1, 3);
    g.addEdge(1, 4);

    const result = vertexCover(g);
    verifyCover(g, result.cover);
  });

  // ── Approximation ratio ────────────────────────────────────────────

  it('produces a cover at most 2x optimal on a known instance', () => {
    // Path: 0 — 1 — 2 — 3 — 4
    // Optimal vertex cover: {1, 3} (size 2)
    // 2-approx guarantee: size ≤ 4
    const g = new Graph<number>(false);
    g.addEdge(0, 1);
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    g.addEdge(3, 4);

    const result = vertexCover(g);
    verifyCover(g, result.cover);
    expect(result.size).toBeLessThanOrEqual(4); // ≤ 2 * OPT(2)
  });

  it('produces a cover at most 2x optimal on a cycle', () => {
    // Cycle: 0 — 1 — 2 — 3 — 0
    // Optimal: {0, 2} or {1, 3} → OPT = 2
    // 2-approx: ≤ 4
    const g = new Graph<number>(false);
    g.addEdge(0, 1);
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    g.addEdge(3, 0);

    const result = vertexCover(g);
    verifyCover(g, result.cover);
    expect(result.size).toBeLessThanOrEqual(4);
  });

  it('produces a cover at most 2x optimal on a larger instance', () => {
    // K_{3,3} bipartite: left {0,1,2}, right {3,4,5}
    // Optimal: either side → OPT = 3
    // 2-approx: ≤ 6
    const g = new Graph<number>(false);
    for (let i = 0; i < 3; i++) {
      for (let j = 3; j < 6; j++) {
        g.addEdge(i, j);
      }
    }

    const result = vertexCover(g);
    verifyCover(g, result.cover);
    expect(result.size).toBeLessThanOrEqual(6);
  });

  // ── Edge cases ─────────────────────────────────────────────────────

  it('returns an empty cover for a graph with no edges', () => {
    const g = new Graph<number>(false);
    g.addVertex(0);
    g.addVertex(1);
    g.addVertex(2);

    const result = vertexCover(g);
    expect(result.size).toBe(0);
    expect(result.cover.size).toBe(0);
  });

  it('returns an empty cover for an empty graph', () => {
    const g = new Graph<number>(false);
    const result = vertexCover(g);
    expect(result.size).toBe(0);
  });

  it('covers a single edge', () => {
    const g = new Graph<number>(false);
    g.addEdge(0, 1);

    const result = vertexCover(g);
    verifyCover(g, result.cover);
    expect(result.size).toBe(2);
  });

  it('works with string vertices', () => {
    const g = new Graph<string>(false);
    g.addEdge('a', 'b');
    g.addEdge('b', 'c');
    g.addEdge('c', 'd');

    const result = vertexCover(g);
    verifyCover(g, result.cover);
  });

  // ── Error handling ─────────────────────────────────────────────────

  it('throws for a directed graph', () => {
    const g = new Graph<number>(true);
    g.addEdge(0, 1);
    expect(() => vertexCover(g)).toThrow('undirected');
  });
});
