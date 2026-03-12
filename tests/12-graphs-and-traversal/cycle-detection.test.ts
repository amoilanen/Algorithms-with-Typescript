import { describe, it, expect } from 'vitest';
import { Graph } from '../../src/12-graphs-and-traversal/graph.js';
import {
  hasDirectedCycle,
  hasUndirectedCycle,
  hasCycle,
} from '../../src/12-graphs-and-traversal/cycle-detection.js';

describe('hasDirectedCycle', () => {
  it('should detect a simple cycle', () => {
    const g = new Graph<number>(true);
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    g.addEdge(3, 1);
    expect(hasDirectedCycle(g)).toBe(true);
  });

  it('should return false for a DAG', () => {
    const g = new Graph<number>(true);
    g.addEdge(1, 2);
    g.addEdge(1, 3);
    g.addEdge(2, 4);
    g.addEdge(3, 4);
    expect(hasDirectedCycle(g)).toBe(false);
  });

  it('should detect a self-loop', () => {
    const g = new Graph<number>(true);
    g.addEdge(1, 1);
    expect(hasDirectedCycle(g)).toBe(true);
  });

  it('should return false for a single vertex', () => {
    const g = new Graph<number>(true);
    g.addVertex(1);
    expect(hasDirectedCycle(g)).toBe(false);
  });

  it('should return false for empty graph', () => {
    const g = new Graph<number>(true);
    expect(hasDirectedCycle(g)).toBe(false);
  });

  it('should detect cycle in one component of disconnected graph', () => {
    const g = new Graph<number>(true);
    g.addEdge(1, 2);
    g.addEdge(3, 4);
    g.addEdge(4, 5);
    g.addEdge(5, 3); // cycle in {3,4,5}
    expect(hasDirectedCycle(g)).toBe(true);
  });

  it('should return false for a linear chain', () => {
    const g = new Graph<number>(true);
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    g.addEdge(3, 4);
    expect(hasDirectedCycle(g)).toBe(false);
  });

  it('should handle two-vertex cycle', () => {
    const g = new Graph<number>(true);
    g.addEdge(1, 2);
    g.addEdge(2, 1);
    expect(hasDirectedCycle(g)).toBe(true);
  });

  it('should throw on undirected graph', () => {
    const g = new Graph<number>(false);
    expect(() => hasDirectedCycle(g)).toThrow();
  });
});

describe('hasUndirectedCycle', () => {
  it('should detect a triangle cycle', () => {
    const g = new Graph<number>();
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    g.addEdge(3, 1);
    expect(hasUndirectedCycle(g)).toBe(true);
  });

  it('should return false for a tree (no cycles)', () => {
    const g = new Graph<number>();
    g.addEdge(1, 2);
    g.addEdge(1, 3);
    g.addEdge(2, 4);
    g.addEdge(2, 5);
    expect(hasUndirectedCycle(g)).toBe(false);
  });

  it('should return false for a single vertex', () => {
    const g = new Graph<number>();
    g.addVertex(1);
    expect(hasUndirectedCycle(g)).toBe(false);
  });

  it('should return false for two vertices connected by one edge', () => {
    const g = new Graph<number>();
    g.addEdge(1, 2);
    expect(hasUndirectedCycle(g)).toBe(false);
  });

  it('should detect cycle in square graph', () => {
    const g = new Graph<number>();
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    g.addEdge(3, 4);
    g.addEdge(4, 1);
    expect(hasUndirectedCycle(g)).toBe(true);
  });

  it('should detect cycle in one component of disconnected graph', () => {
    const g = new Graph<number>();
    // Component 1: tree
    g.addEdge(1, 2);
    // Component 2: cycle
    g.addEdge(3, 4);
    g.addEdge(4, 5);
    g.addEdge(5, 3);
    expect(hasUndirectedCycle(g)).toBe(true);
  });

  it('should return false for isolated vertices', () => {
    const g = new Graph<number>();
    g.addVertex(1);
    g.addVertex(2);
    g.addVertex(3);
    expect(hasUndirectedCycle(g)).toBe(false);
  });

  it('should throw on directed graph', () => {
    const g = new Graph<number>(true);
    expect(() => hasUndirectedCycle(g)).toThrow();
  });
});

describe('hasCycle (convenience)', () => {
  it('should dispatch to directed cycle detection', () => {
    const g = new Graph<number>(true);
    g.addEdge(1, 2);
    g.addEdge(2, 1);
    expect(hasCycle(g)).toBe(true);
  });

  it('should dispatch to undirected cycle detection', () => {
    const g = new Graph<number>();
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    g.addEdge(3, 1);
    expect(hasCycle(g)).toBe(true);
  });

  it('should return false for acyclic directed graph', () => {
    const g = new Graph<number>(true);
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    expect(hasCycle(g)).toBe(false);
  });

  it('should return false for acyclic undirected graph', () => {
    const g = new Graph<number>();
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    expect(hasCycle(g)).toBe(false);
  });
});
