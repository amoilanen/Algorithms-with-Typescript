import { describe, it, expect } from 'vitest';
import { Graph } from '../../src/12-graphs-and-traversal/graph';
import { bfs, reconstructPath } from '../../src/12-graphs-and-traversal/bfs';

/**
 * Build a small undirected graph:
 *
 *     1 — 2 — 5
 *     |   |
 *     3 — 4
 */
function buildUndirectedGraph(): Graph<number> {
  const g = new Graph<number>();
  g.addEdge(1, 2);
  g.addEdge(1, 3);
  g.addEdge(2, 4);
  g.addEdge(2, 5);
  g.addEdge(3, 4);
  return g;
}

/**
 * Build a small directed graph:
 *
 *     A → B → D
 *     ↓   ↓
 *     C → E
 */
function buildDirectedGraph(): Graph<string> {
  const g = new Graph<string>(true);
  g.addEdge('A', 'B');
  g.addEdge('A', 'C');
  g.addEdge('B', 'D');
  g.addEdge('B', 'E');
  g.addEdge('C', 'E');
  return g;
}

describe('BFS', () => {
  describe('undirected graph', () => {
    it('should compute shortest distances from source', () => {
      const g = buildUndirectedGraph();
      const result = bfs(g, 1);
      expect(result.distance.get(1)).toBe(0);
      expect(result.distance.get(2)).toBe(1);
      expect(result.distance.get(3)).toBe(1);
      expect(result.distance.get(4)).toBe(2);
      expect(result.distance.get(5)).toBe(2);
    });

    it('should set parent pointers', () => {
      const g = buildUndirectedGraph();
      const result = bfs(g, 1);
      expect(result.parent.get(1)).toBeUndefined();
      expect(result.parent.get(2)).toBe(1);
      expect(result.parent.get(3)).toBe(1);
      // 4 can be reached from 2 or 3; both are distance 1 from source
      expect([2, 3]).toContain(result.parent.get(4));
    });

    it('should record discovery order', () => {
      const g = buildUndirectedGraph();
      const result = bfs(g, 1);
      expect(result.order[0]).toBe(1);
      expect(result.order).toHaveLength(5);
    });
  });

  describe('directed graph', () => {
    it('should compute shortest distances', () => {
      const g = buildDirectedGraph();
      const result = bfs(g, 'A');
      expect(result.distance.get('A')).toBe(0);
      expect(result.distance.get('B')).toBe(1);
      expect(result.distance.get('C')).toBe(1);
      expect(result.distance.get('D')).toBe(2);
      expect(result.distance.get('E')).toBe(2);
    });
  });

  describe('single vertex', () => {
    it('should handle a graph with one vertex', () => {
      const g = new Graph<number>();
      g.addVertex(1);
      const result = bfs(g, 1);
      expect(result.distance.get(1)).toBe(0);
      expect(result.order).toEqual([1]);
    });
  });

  describe('disconnected graph', () => {
    it('should not discover unreachable vertices', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2);
      g.addVertex(3);
      g.addVertex(4);
      const result = bfs(g, 1);
      expect(result.distance.has(1)).toBe(true);
      expect(result.distance.has(2)).toBe(true);
      expect(result.distance.has(3)).toBe(false);
      expect(result.distance.has(4)).toBe(false);
      expect(result.order).toHaveLength(2);
    });
  });

  describe('graph with cycle', () => {
    it('should handle cycles correctly', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 1);
      const result = bfs(g, 1);
      expect(result.distance.get(1)).toBe(0);
      expect(result.distance.get(2)).toBe(1);
      expect(result.distance.get(3)).toBe(1);
    });
  });
});

describe('reconstructPath', () => {
  it('should reconstruct shortest path', () => {
    const g = buildUndirectedGraph();
    const result = bfs(g, 1);
    const path = reconstructPath(result.parent, 1, 5);
    expect(path).not.toBeNull();
    expect(path![0]).toBe(1);
    expect(path![path!.length - 1]).toBe(5);
    // Path length = distance + 1
    expect(path!.length).toBe(result.distance.get(5)! + 1);
  });

  it('should return path of length 1 for source to source', () => {
    const g = buildUndirectedGraph();
    const result = bfs(g, 1);
    const path = reconstructPath(result.parent, 1, 1);
    expect(path).toEqual([1]);
  });

  it('should return null for unreachable target', () => {
    const g = new Graph<number>();
    g.addEdge(1, 2);
    g.addVertex(3);
    const result = bfs(g, 1);
    const path = reconstructPath(result.parent, 1, 3);
    expect(path).toBeNull();
  });

  it('should reconstruct path in directed graph', () => {
    const g = buildDirectedGraph();
    const result = bfs(g, 'A');
    const path = reconstructPath(result.parent, 'A', 'D');
    expect(path).toEqual(['A', 'B', 'D']);
  });
});
