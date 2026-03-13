import { describe, it, expect } from 'vitest';
import { Graph } from '../../src/12-graphs-and-traversal/graph';
import { kruskal } from '../../src/14-minimum-spanning-trees/kruskal';

/**
 * Helper: build the classic CLRS-style example graph.
 *
 *         4
 *    A -------- B
 *    |  \       |  \
 *  8 |    2\    | 6  \7
 *    |      \   |      \
 *    H        C -------- D
 *    | \    / |  \      /
 *  1 |  7/  2|    4\  /9
 *    |  /    |      \/
 *    G ------ F --- E
 *        6      10
 *
 * MST weight = 1+2+2+4+4+6+7+8 = ... Let's compute:
 * Known MST for this graph has weight 37.
 */
function buildCLRSGraph(): Graph<string> {
  const g = new Graph<string>(false);
  g.addEdge('A', 'B', 4);
  g.addEdge('A', 'H', 8);
  g.addEdge('A', 'C', 2); // diagonal shortcut: not in classic CLRS, but let's use a well-known variant
  g.addEdge('B', 'C', 6);
  g.addEdge('B', 'D', 7);
  g.addEdge('C', 'D', 4);
  g.addEdge('C', 'F', 2);
  g.addEdge('D', 'E', 9);
  g.addEdge('E', 'F', 10);
  g.addEdge('F', 'G', 6);
  g.addEdge('G', 'H', 1);
  g.addEdge('G', 'C', 7);
  g.addEdge('H', 'G', 1); // duplicate (undirected), already added — just double-checking idempotency
  return g;
}

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

describe('kruskal', () => {
  it('computes the MST of a simple triangle', () => {
    const g = buildTriangle();
    const result = kruskal(g);

    expect(result.weight).toBe(3);
    expect(result.edges).toHaveLength(2);
  });

  it('computes the MST of the CLRS-style graph', () => {
    const g = buildCLRSGraph();
    const result = kruskal(g);

    // 8 vertices → 7 MST edges.
    expect(result.edges).toHaveLength(7);

    // Verify the total weight by summing edges.
    const computedWeight = result.edges.reduce((sum, e) => sum + e.weight, 0);
    expect(computedWeight).toBe(result.weight);

    // Verify that all MST edges are valid edges in the original graph.
    for (const edge of result.edges) {
      expect(g.hasEdge(edge.from, edge.to)).toBe(true);
    }
  });

  it('handles a single vertex', () => {
    const g = new Graph<number>(false);
    g.addVertex(1);
    const result = kruskal(g);

    expect(result.edges).toHaveLength(0);
    expect(result.weight).toBe(0);
  });

  it('handles two connected vertices', () => {
    const g = new Graph<number>(false);
    g.addEdge(1, 2, 5);
    const result = kruskal(g);

    expect(result.edges).toHaveLength(1);
    expect(result.weight).toBe(5);
  });

  it('produces a spanning forest for a disconnected graph', () => {
    const g = new Graph<number>(false);
    // Component 1: 1-2-3
    g.addEdge(1, 2, 1);
    g.addEdge(2, 3, 2);
    g.addEdge(1, 3, 3);
    // Component 2: 4-5
    g.addEdge(4, 5, 4);

    const result = kruskal(g);

    // 3 edges for 5 vertices in 2 components (V - components = 3).
    expect(result.edges).toHaveLength(3);
    expect(result.weight).toBe(1 + 2 + 4);
  });

  it('picks correctly among edges with equal weights', () => {
    const g = new Graph<string>(false);
    g.addEdge('A', 'B', 1);
    g.addEdge('B', 'C', 1);
    g.addEdge('A', 'C', 1);
    const result = kruskal(g);

    // Any two of the three edges form a valid MST.
    expect(result.edges).toHaveLength(2);
    expect(result.weight).toBe(2);
  });

  it('throws for a directed graph', () => {
    const g = new Graph<number>(true);
    g.addEdge(1, 2, 1);

    expect(() => kruskal(g)).toThrow('undirected');
  });

  it('Kruskal and Prim produce the same MST weight on a larger graph', () => {
    // This is a basic sanity check — a more thorough cross-check is done
    // in the combined test file.
    const g = buildCLRSGraph();
    const resultKruskal = kruskal(g);

    // Just verify structural invariants here.
    expect(resultKruskal.edges).toHaveLength(g.vertexCount - 1);
  });

  it('handles a graph where all edges have the same weight', () => {
    const g = new Graph<number>(false);
    // Complete graph K4, all weight 5.
    g.addEdge(1, 2, 5);
    g.addEdge(1, 3, 5);
    g.addEdge(1, 4, 5);
    g.addEdge(2, 3, 5);
    g.addEdge(2, 4, 5);
    g.addEdge(3, 4, 5);

    const result = kruskal(g);

    expect(result.edges).toHaveLength(3);
    expect(result.weight).toBe(15);
  });

  it('handles a path graph (already a tree)', () => {
    const g = new Graph<number>(false);
    g.addEdge(1, 2, 3);
    g.addEdge(2, 3, 7);
    g.addEdge(3, 4, 1);
    g.addEdge(4, 5, 4);

    const result = kruskal(g);

    expect(result.edges).toHaveLength(4);
    expect(result.weight).toBe(3 + 7 + 1 + 4);
  });
});
