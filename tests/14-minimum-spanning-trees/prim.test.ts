import { describe, it, expect } from 'vitest';
import { Graph } from '../../src/12-graphs-and-traversal/graph';
import { prim } from '../../src/14-minimum-spanning-trees/prim';
import { kruskal } from '../../src/14-minimum-spanning-trees/kruskal';

/**
 * Build a simple triangle:
 *    A --2-- B
 *     \     /
 *    3 \   / 1
 *       \ /
 *        C
 * MST weight = 3 (edges B-C=1 and A-B=2)
 */
function buildTriangle(): Graph<string> {
  const g = new Graph<string>(false);
  g.addEdge('A', 'B', 2);
  g.addEdge('B', 'C', 1);
  g.addEdge('A', 'C', 3);
  return g;
}

/**
 * Build a larger graph for cross-checking.
 *
 *   1 ---4--- 2
 *   |  \      |  \
 *   8    2    6    7
 *   |      \  |      \
 *   8        3 ---4--- 4
 *   | \    / |  \      /
 *   1    7  2    4   9
 *   |  /    |      \/
 *   7 ---6-- 6 --10- 5
 */
function buildLargerGraph(): Graph<number> {
  const g = new Graph<number>(false);
  g.addEdge(1, 2, 4);
  g.addEdge(1, 8, 8);
  g.addEdge(1, 3, 2);
  g.addEdge(2, 3, 6);
  g.addEdge(2, 4, 7);
  g.addEdge(3, 4, 4);
  g.addEdge(3, 6, 2);
  g.addEdge(3, 7, 7);
  g.addEdge(4, 5, 9);
  g.addEdge(5, 6, 10);
  g.addEdge(6, 7, 6);
  g.addEdge(7, 8, 1);
  return g;
}

describe('prim', () => {
  it('computes the MST of a simple triangle', () => {
    const g = buildTriangle();
    const result = prim(g);

    expect(result.weight).toBe(3);
    expect(result.edges).toHaveLength(2);
  });

  it('computes the MST of a larger graph', () => {
    const g = buildLargerGraph();
    const result = prim(g);

    expect(result.edges).toHaveLength(7);

    const computedWeight = result.edges.reduce((sum, e) => sum + e.weight, 0);
    expect(computedWeight).toBe(result.weight);

    for (const edge of result.edges) {
      expect(g.hasEdge(edge.from, edge.to)).toBe(true);
    }
  });

  it('produces the same MST weight as Kruskal on the same graph', () => {
    const g = buildLargerGraph();
    const primResult = prim(g);
    const kruskalResult = kruskal(g);

    expect(primResult.weight).toBe(kruskalResult.weight);
    expect(primResult.edges).toHaveLength(kruskalResult.edges.length);
  });

  it('handles a single vertex', () => {
    const g = new Graph<number>(false);
    g.addVertex(1);
    const result = prim(g);

    expect(result.edges).toHaveLength(0);
    expect(result.weight).toBe(0);
  });

  it('handles two connected vertices', () => {
    const g = new Graph<number>(false);
    g.addEdge(1, 2, 5);
    const result = prim(g);

    expect(result.edges).toHaveLength(1);
    expect(result.weight).toBe(5);
  });

  it('respects the start vertex parameter', () => {
    const g = buildTriangle();

    const r1 = prim(g, 'A');
    const r2 = prim(g, 'C');

    // Both should produce a valid MST with the same weight.
    expect(r1.weight).toBe(3);
    expect(r2.weight).toBe(3);
  });

  it('handles a disconnected graph (spans only the start component)', () => {
    const g = new Graph<number>(false);
    g.addEdge(1, 2, 1);
    g.addEdge(2, 3, 2);
    g.addVertex(4); // isolated vertex

    const result = prim(g, 1);

    // Only spans the component containing vertex 1.
    expect(result.edges).toHaveLength(2);
    expect(result.weight).toBe(3);
  });

  it('picks correctly among edges with equal weights', () => {
    const g = new Graph<string>(false);
    g.addEdge('A', 'B', 1);
    g.addEdge('B', 'C', 1);
    g.addEdge('A', 'C', 1);
    const result = prim(g);

    expect(result.edges).toHaveLength(2);
    expect(result.weight).toBe(2);
  });

  it('throws for a directed graph', () => {
    const g = new Graph<number>(true);
    g.addEdge(1, 2, 1);

    expect(() => prim(g)).toThrow('undirected');
  });

  it('throws for an empty graph', () => {
    const g = new Graph<number>(false);

    expect(() => prim(g)).toThrow('no vertices');
  });

  it('throws when start vertex is not in the graph', () => {
    const g = new Graph<number>(false);
    g.addVertex(1);

    expect(() => prim(g, 99)).toThrow('not in the graph');
  });

  it('handles a graph where all edges have the same weight', () => {
    const g = new Graph<number>(false);
    g.addEdge(1, 2, 5);
    g.addEdge(1, 3, 5);
    g.addEdge(1, 4, 5);
    g.addEdge(2, 3, 5);
    g.addEdge(2, 4, 5);
    g.addEdge(3, 4, 5);

    const result = prim(g);

    expect(result.edges).toHaveLength(3);
    expect(result.weight).toBe(15);
  });

  it('handles a path graph (already a tree)', () => {
    const g = new Graph<number>(false);
    g.addEdge(1, 2, 3);
    g.addEdge(2, 3, 7);
    g.addEdge(3, 4, 1);
    g.addEdge(4, 5, 4);

    const result = prim(g);

    expect(result.edges).toHaveLength(4);
    expect(result.weight).toBe(3 + 7 + 1 + 4);
  });

  it('produces same weight as Kruskal on a complete graph K5', () => {
    const g = new Graph<number>(false);
    const weights = [
      [1, 2, 3],
      [1, 3, 7],
      [1, 4, 2],
      [1, 5, 5],
      [2, 3, 1],
      [2, 4, 8],
      [2, 5, 4],
      [3, 4, 6],
      [3, 5, 9],
      [4, 5, 3],
    ] as const;
    for (const [u, v, w] of weights) {
      g.addEdge(u, v, w);
    }

    const primResult = prim(g);
    const kruskalResult = kruskal(g);

    expect(primResult.weight).toBe(kruskalResult.weight);
    expect(primResult.edges).toHaveLength(4);
    expect(kruskalResult.edges).toHaveLength(4);
  });
});
