import { describe, it, expect } from 'vitest';
import { Graph } from '../../src/12-graphs-and-traversal/graph.js';
import { dfs } from '../../src/12-graphs-and-traversal/dfs.js';
import type { EdgeType } from '../../src/12-graphs-and-traversal/dfs.js';

/**
 * Build a directed graph for DFS edge classification:
 *
 *     1 → 2 → 3
 *     ↓       ↓
 *     4 → 5   6
 *         ↑   |
 *         └───┘
 */
function buildDirectedGraph(): Graph<number> {
  const g = new Graph<number>(true);
  g.addEdge(1, 2);
  g.addEdge(1, 4);
  g.addEdge(2, 3);
  g.addEdge(3, 6);
  g.addEdge(6, 5);
  g.addEdge(4, 5);
  return g;
}

describe('DFS', () => {
  describe('discovery and finish times', () => {
    it('should assign discovery and finish times to all vertices', () => {
      const g = buildDirectedGraph();
      const result = dfs(g);

      // Every vertex should have a discovery and finish time.
      for (const v of g.getVertices()) {
        expect(result.discovery.has(v)).toBe(true);
        expect(result.finish.has(v)).toBe(true);
        // discovery < finish for every vertex.
        expect(result.discovery.get(v)!).toBeLessThan(result.finish.get(v)!);
      }
    });

    it('should satisfy the parenthesis theorem', () => {
      const g = buildDirectedGraph();
      const result = dfs(g);

      // For every edge (u, v) in the DFS tree:
      // discovery[u] < discovery[v] < finish[v] < finish[u]
      for (const edge of result.edges) {
        if (edge.type === 'tree') {
          const du = result.discovery.get(edge.from)!;
          const dv = result.discovery.get(edge.to)!;
          const fv = result.finish.get(edge.to)!;
          const fu = result.finish.get(edge.from)!;
          expect(du).toBeLessThan(dv);
          expect(dv).toBeLessThan(fv);
          expect(fv).toBeLessThan(fu);
        }
      }
    });
  });

  describe('traversal order', () => {
    it('should visit all vertices', () => {
      const g = buildDirectedGraph();
      const result = dfs(g);
      expect(result.order).toHaveLength(g.vertexCount);
      // Every vertex appears exactly once.
      expect(new Set(result.order).size).toBe(g.vertexCount);
    });
  });

  describe('edge classification (directed)', () => {
    it('should classify tree edges', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      const result = dfs(g);
      const treeEdges = result.edges.filter((e) => e.type === 'tree');
      expect(treeEdges).toHaveLength(2);
    });

    it('should detect back edges (cycles)', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 1); // back edge
      const result = dfs(g);
      const backEdges = result.edges.filter((e) => e.type === 'back');
      expect(backEdges.length).toBeGreaterThanOrEqual(1);
      // The back edge should be 3→1.
      expect(backEdges.some((e) => e.from === 3 && e.to === 1)).toBe(true);
    });

    it('should detect forward edges', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(1, 3); // forward edge (1 is ancestor of 3 via 1→2→3)
      const result = dfs(g);
      // 1→3 should be classified as forward.
      const forwardEdges = result.edges.filter((e) => e.type === 'forward');
      expect(forwardEdges.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect cross edges', () => {
      const g = new Graph<number>(true);
      // DFS from 1: explore 1→2→4, then 1→3
      // Edge 3→4 is a cross edge (4 is in a different finished subtree)
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 4);
      g.addEdge(3, 4); // cross edge
      const result = dfs(g);
      const crossEdges = result.edges.filter((e) => e.type === 'cross');
      expect(crossEdges.length).toBeGreaterThanOrEqual(1);
    });

    it('should produce only tree and back edges in a simple cycle', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 1);
      const result = dfs(g);
      const edgeTypes = new Set(result.edges.map((e) => e.type));
      expect(edgeTypes).toContain('tree');
      expect(edgeTypes).toContain('back');
      expect(edgeTypes).not.toContain('forward');
      expect(edgeTypes).not.toContain('cross');
    });
  });

  describe('edge classification (undirected)', () => {
    it('should classify tree and back edges only', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 1); // creates a cycle
      const result = dfs(g);
      const edgeTypes = new Set<EdgeType>(result.edges.map((e) => e.type));
      // Only tree and back edges in undirected graphs.
      for (const t of edgeTypes) {
        expect(['tree', 'back']).toContain(t);
      }
    });

    it('should not classify parent edge as back edge', () => {
      // A tree with no cycles should have no back edges.
      const g = new Graph<number>();
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 4);
      const result = dfs(g);
      const backEdges = result.edges.filter((e) => e.type === 'back');
      expect(backEdges).toHaveLength(0);
    });
  });

  describe('DFS forest (disconnected graph)', () => {
    it('should discover all vertices in a disconnected graph', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 2);
      g.addVertex(3);
      g.addVertex(4);
      const result = dfs(g);
      expect(result.order).toHaveLength(4);
      // Multiple roots
      const roots = [...result.parent.entries()].filter(
        ([, p]) => p === undefined,
      );
      expect(roots.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('single vertex', () => {
    it('should handle a single vertex', () => {
      const g = new Graph<number>();
      g.addVertex(1);
      const result = dfs(g);
      expect(result.order).toEqual([1]);
      expect(result.discovery.get(1)).toBe(0);
      expect(result.finish.get(1)).toBe(1);
      expect(result.edges).toHaveLength(0);
    });
  });

  describe('self-loop', () => {
    it('should detect a self-loop as a back edge in directed graph', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 1);
      const result = dfs(g);
      const backEdges = result.edges.filter((e) => e.type === 'back');
      expect(backEdges).toHaveLength(1);
      expect(backEdges[0]!.from).toBe(1);
      expect(backEdges[0]!.to).toBe(1);
    });
  });

  describe('custom start order', () => {
    it('should respect a custom start order', () => {
      const g = new Graph<number>(true);
      g.addVertex(1);
      g.addVertex(2);
      g.addVertex(3);
      // No edges — order depends on start order.
      const result = dfs(g, [3, 1, 2]);
      expect(result.order).toEqual([3, 1, 2]);
    });
  });
});
