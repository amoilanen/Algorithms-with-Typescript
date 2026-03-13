import { describe, it, expect } from 'vitest';
import { Graph, GraphMatrix } from '../../src/12-graphs-and-traversal/graph';

// ── Graph (adjacency list) ────────────────────────────────────────

describe('Graph (adjacency list)', () => {
  describe('construction', () => {
    it('should create an empty undirected graph by default', () => {
      const g = new Graph<number>();
      expect(g.directed).toBe(false);
      expect(g.vertexCount).toBe(0);
      expect(g.edgeCount).toBe(0);
    });

    it('should create a directed graph when specified', () => {
      const g = new Graph<number>(true);
      expect(g.directed).toBe(true);
    });
  });

  describe('vertices', () => {
    it('should add and check vertices', () => {
      const g = new Graph<string>();
      g.addVertex('A');
      g.addVertex('B');
      expect(g.hasVertex('A')).toBe(true);
      expect(g.hasVertex('B')).toBe(true);
      expect(g.hasVertex('C')).toBe(false);
      expect(g.vertexCount).toBe(2);
    });

    it('should handle duplicate vertex additions', () => {
      const g = new Graph<number>();
      g.addVertex(1);
      g.addVertex(1);
      expect(g.vertexCount).toBe(1);
    });

    it('should remove a vertex and its incident edges', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      g.removeVertex(1);
      expect(g.hasVertex(1)).toBe(false);
      expect(g.hasEdge(1, 2)).toBe(false);
      expect(g.hasEdge(2, 1)).toBe(false);
      expect(g.hasEdge(2, 3)).toBe(true);
      expect(g.vertexCount).toBe(2);
    });

    it('should handle removing a non-existent vertex', () => {
      const g = new Graph<number>();
      g.addVertex(1);
      g.removeVertex(99); // no-op
      expect(g.vertexCount).toBe(1);
    });

    it('should return all vertices', () => {
      const g = new Graph<string>();
      g.addVertex('X');
      g.addVertex('Y');
      g.addVertex('Z');
      expect(g.getVertices().sort()).toEqual(['X', 'Y', 'Z']);
    });
  });

  describe('edges (undirected)', () => {
    it('should add an undirected edge', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2);
      expect(g.hasEdge(1, 2)).toBe(true);
      expect(g.hasEdge(2, 1)).toBe(true);
      expect(g.edgeCount).toBe(1);
    });

    it('should auto-create vertices when adding an edge', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2);
      expect(g.hasVertex(1)).toBe(true);
      expect(g.hasVertex(2)).toBe(true);
    });

    it('should support weighted edges', () => {
      const g = new Graph<string>();
      g.addEdge('A', 'B', 5);
      expect(g.getEdgeWeight('A', 'B')).toBe(5);
      expect(g.getEdgeWeight('B', 'A')).toBe(5);
    });

    it('should default edge weight to 1', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2);
      expect(g.getEdgeWeight(1, 2)).toBe(1);
    });

    it('should update weight for existing edge', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2, 3);
      g.addEdge(1, 2, 7);
      expect(g.getEdgeWeight(1, 2)).toBe(7);
    });

    it('should remove an undirected edge', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.removeEdge(1, 2);
      expect(g.hasEdge(1, 2)).toBe(false);
      expect(g.hasEdge(2, 1)).toBe(false);
      expect(g.hasEdge(1, 3)).toBe(true);
    });

    it('should return undefined weight for non-existent edge', () => {
      const g = new Graph<number>();
      g.addVertex(1);
      expect(g.getEdgeWeight(1, 2)).toBeUndefined();
      expect(g.getEdgeWeight(99, 100)).toBeUndefined();
    });

    it('should return neighbors', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2, 10);
      g.addEdge(1, 3, 20);
      const neighbors = g.getNeighbors(1);
      expect(neighbors).toHaveLength(2);
      expect(neighbors.map(([v]) => v).sort((a, b) => a - b)).toEqual([2, 3]);
    });

    it('should return empty neighbors for non-existent vertex', () => {
      const g = new Graph<number>();
      expect(g.getNeighbors(42)).toEqual([]);
    });

    it('should return all edges without duplicates', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2, 10);
      g.addEdge(2, 3, 20);
      const edges = g.getEdges();
      expect(edges).toHaveLength(2);
    });
  });

  describe('edges (directed)', () => {
    it('should add a directed edge', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 2);
      expect(g.hasEdge(1, 2)).toBe(true);
      expect(g.hasEdge(2, 1)).toBe(false);
      expect(g.edgeCount).toBe(1);
    });

    it('should remove a directed edge', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 2);
      g.addEdge(2, 1);
      g.removeEdge(1, 2);
      expect(g.hasEdge(1, 2)).toBe(false);
      expect(g.hasEdge(2, 1)).toBe(true);
    });

    it('should return directed edges', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(1, 3);
      const edges = g.getEdges();
      expect(edges).toHaveLength(3);
    });
  });

  describe('degree', () => {
    it('should compute in-degree for directed graph', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      g.addEdge(3, 4);
      expect(g.inDegree(3)).toBe(2);
      expect(g.inDegree(1)).toBe(0);
      expect(g.inDegree(4)).toBe(1);
    });

    it('should compute out-degree', () => {
      const g = new Graph<number>(true);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(1, 4);
      expect(g.outDegree(1)).toBe(3);
      expect(g.outDegree(2)).toBe(0);
    });

    it('should return 0 for non-existent vertex', () => {
      const g = new Graph<number>(true);
      expect(g.inDegree(99)).toBe(0);
      expect(g.outDegree(99)).toBe(0);
    });

    it('should compute degree for undirected graph', () => {
      const g = new Graph<number>();
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      // For undirected, in-degree == out-degree == degree
      expect(g.inDegree(1)).toBe(2);
      expect(g.outDegree(1)).toBe(2);
    });
  });

  describe('string vertices', () => {
    it('should work with string vertices', () => {
      const g = new Graph<string>(true);
      g.addEdge('shirt', 'tie');
      g.addEdge('shirt', 'belt');
      g.addEdge('tie', 'jacket');
      g.addEdge('belt', 'jacket');
      expect(g.vertexCount).toBe(4);
      expect(g.edgeCount).toBe(4);
      expect(g.hasEdge('shirt', 'tie')).toBe(true);
      expect(g.hasEdge('tie', 'shirt')).toBe(false);
    });
  });
});

// ── GraphMatrix (adjacency matrix) ────────────────────────────────

describe('GraphMatrix', () => {
  it('should create a matrix of given size', () => {
    const gm = new GraphMatrix(4);
    expect(gm.vertexCount).toBe(4);
    expect(gm.hasEdge(0, 1)).toBe(false);
  });

  it('should add and check undirected edges', () => {
    const gm = new GraphMatrix(3);
    gm.addEdge(0, 1, 5);
    expect(gm.hasEdge(0, 1)).toBe(true);
    expect(gm.hasEdge(1, 0)).toBe(true);
    expect(gm.getEdgeWeight(0, 1)).toBe(5);
    expect(gm.getEdgeWeight(1, 0)).toBe(5);
  });

  it('should add directed edges', () => {
    const gm = new GraphMatrix(3, true);
    gm.addEdge(0, 1, 10);
    expect(gm.hasEdge(0, 1)).toBe(true);
    expect(gm.hasEdge(1, 0)).toBe(false);
  });

  it('should remove edges', () => {
    const gm = new GraphMatrix(3);
    gm.addEdge(0, 1, 5);
    gm.removeEdge(0, 1);
    expect(gm.hasEdge(0, 1)).toBe(false);
    expect(gm.hasEdge(1, 0)).toBe(false);
  });

  it('should return neighbors', () => {
    const gm = new GraphMatrix(4);
    gm.addEdge(0, 1, 2);
    gm.addEdge(0, 3, 7);
    const neighbors = gm.getNeighbors(0);
    expect(neighbors).toHaveLength(2);
    expect(neighbors.map(([v]) => v).sort()).toEqual([1, 3]);
  });

  it('should return a copy of the matrix', () => {
    const gm = new GraphMatrix(2);
    gm.addEdge(0, 1, 3);
    const m = gm.toMatrix();
    expect(m[0]![1]).toBe(3);
    // Modifying the copy shouldn't affect the original.
    m[0]![1] = 999;
    expect(gm.getEdgeWeight(0, 1)).toBe(3);
  });
});
