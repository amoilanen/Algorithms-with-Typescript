import { describe, it, expect } from 'vitest';
import { Graph } from '../../src/12-graphs-and-traversal/graph';
import {
  topologicalSortKahn,
  topologicalSortDFS,
} from '../../src/12-graphs-and-traversal/topological-sort';

/**
 * Build a classic DAG (dressing order from CLRS):
 *
 *   undershorts → pants → shoes
 *                 pants → belt → jacket
 *   shirt → belt
 *   shirt → tie → jacket
 *   socks → shoes
 *   watch (isolated)
 */
function buildDressingDAG(): Graph<string> {
  const g = new Graph<string>(true);
  g.addEdge('undershorts', 'pants');
  g.addEdge('pants', 'shoes');
  g.addEdge('pants', 'belt');
  g.addEdge('shirt', 'belt');
  g.addEdge('shirt', 'tie');
  g.addEdge('tie', 'jacket');
  g.addEdge('belt', 'jacket');
  g.addEdge('socks', 'shoes');
  g.addVertex('watch');
  return g;
}

/**
 * Verify that `order` is a valid topological ordering of `graph`:
 * for every edge (u, v), u appears before v.
 */
function isValidTopologicalOrder<T>(graph: Graph<T>, order: T[]): boolean {
  const position = new Map<T, number>();
  order.forEach((v, i) => position.set(v, i));

  for (const v of graph.getVertices()) {
    for (const [u] of graph.getNeighbors(v)) {
      if (position.get(v)! > position.get(u)!) {
        // v should come before u but doesn't.
        return false;
      }
    }
  }
  return true;
}

describe('Topological Sort', () => {
  for (const [name, topoSort] of [
    ["Kahn's algorithm", topologicalSortKahn],
    ['DFS-based', topologicalSortDFS],
  ] as const) {
    describe(name, () => {
      it('should produce a valid topological order for a DAG', () => {
        const g = buildDressingDAG();
        const order = topoSort(g);
        expect(order).not.toBeNull();
        expect(order!).toHaveLength(g.vertexCount);
        expect(isValidTopologicalOrder(g, order!)).toBe(true);
      });

      it('should return null for a graph with a cycle', () => {
        const g = new Graph<number>(true);
        g.addEdge(1, 2);
        g.addEdge(2, 3);
        g.addEdge(3, 1);
        expect(topoSort(g)).toBeNull();
      });

      it('should handle a single vertex', () => {
        const g = new Graph<number>(true);
        g.addVertex(1);
        const order = topoSort(g);
        expect(order).toEqual([1]);
      });

      it('should handle a linear chain', () => {
        const g = new Graph<number>(true);
        g.addEdge(1, 2);
        g.addEdge(2, 3);
        g.addEdge(3, 4);
        const order = topoSort(g);
        expect(order).toEqual([1, 2, 3, 4]);
      });

      it('should handle an empty graph (no vertices)', () => {
        const g = new Graph<number>(true);
        const order = topoSort(g);
        expect(order).toEqual([]);
      });

      it('should handle disconnected DAG components', () => {
        const g = new Graph<number>(true);
        g.addEdge(1, 2);
        g.addEdge(3, 4);
        const order = topoSort(g);
        expect(order).not.toBeNull();
        expect(order!).toHaveLength(4);
        expect(isValidTopologicalOrder(g, order!)).toBe(true);
      });

      it('should handle diamond DAG', () => {
        // 1 → 2 → 4
        // 1 → 3 → 4
        const g = new Graph<number>(true);
        g.addEdge(1, 2);
        g.addEdge(1, 3);
        g.addEdge(2, 4);
        g.addEdge(3, 4);
        const order = topoSort(g);
        expect(order).not.toBeNull();
        expect(order![0]).toBe(1);
        expect(order![order!.length - 1]).toBe(4);
        expect(isValidTopologicalOrder(g, order!)).toBe(true);
      });

      it('should detect a self-loop as a cycle', () => {
        const g = new Graph<number>(true);
        g.addEdge(1, 1);
        expect(topoSort(g)).toBeNull();
      });

      it('should throw on undirected graph', () => {
        const g = new Graph<number>(false);
        g.addEdge(1, 2);
        expect(() => topoSort(g)).toThrow('directed');
      });
    });
  }

  it('both algorithms should agree on validity', () => {
    const g = buildDressingDAG();
    const kahn = topologicalSortKahn(g);
    const dfsOrder = topologicalSortDFS(g);
    expect(kahn).not.toBeNull();
    expect(dfsOrder).not.toBeNull();
    // Both should be valid (not necessarily identical).
    expect(isValidTopologicalOrder(g, kahn!)).toBe(true);
    expect(isValidTopologicalOrder(g, dfsOrder!)).toBe(true);
  });
});
