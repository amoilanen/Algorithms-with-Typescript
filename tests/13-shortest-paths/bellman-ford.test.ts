import { describe, it, expect } from 'vitest';
import { Graph } from '../../src/12-graphs-and-traversal/graph';
import { bellmanFord } from '../../src/13-shortest-paths/bellman-ford';
import { reconstructPath } from '../../src/13-shortest-paths/dijkstra';

describe('Bellman-Ford', () => {
  describe('positive weights', () => {
    it('should find shortest paths in a graph with positive weights', () => {
      const g = new Graph<string>(true);
      g.addEdge('s', 't', 6);
      g.addEdge('s', 'y', 7);
      g.addEdge('t', 'x', 5);
      g.addEdge('t', 'y', 8);
      g.addEdge('t', 'z', -4);
      g.addEdge('y', 'x', -3);
      g.addEdge('y', 'z', 9);
      g.addEdge('x', 't', -2);
      g.addEdge('z', 's', 2);
      g.addEdge('z', 'x', 7);

      const { dist, hasNegativeCycle } = bellmanFord(g, 's');
      expect(hasNegativeCycle).toBe(false);
      expect(dist.get('s')).toBe(0);
      expect(dist.get('t')).toBe(2); // s->y->x->t = 7+(-3)+(-2) = 2
      expect(dist.get('x')).toBe(4); // s->y->x = 7+(-3) = 4
      expect(dist.get('y')).toBe(7); // s->y
      expect(dist.get('z')).toBe(-2); // s->y->x->t->z = 7+(-3)+(-2)+(-4) = -2
    });
  });

  describe('negative weights', () => {
    it('should handle negative edge weights correctly', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 4);
      g.addEdge(0, 2, 5);
      g.addEdge(1, 2, -3);
      g.addEdge(2, 3, 4);

      const { dist, hasNegativeCycle } = bellmanFord(g, 0);
      expect(hasNegativeCycle).toBe(false);
      expect(dist.get(0)).toBe(0);
      expect(dist.get(1)).toBe(4);
      expect(dist.get(2)).toBe(1); // 0->1->2 = 4+(-3) = 1
      expect(dist.get(3)).toBe(5); // 0->1->2->3 = 4+(-3)+4 = 5
    });
  });

  describe('negative cycle detection', () => {
    it('should detect a negative-weight cycle', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, -1);
      g.addEdge(2, 0, -1); // cycle: 0->1->2->0 with total weight -1

      const { hasNegativeCycle } = bellmanFord(g, 0);
      expect(hasNegativeCycle).toBe(true);
    });

    it('should not detect a cycle when cycle weight is positive', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 2);
      g.addEdge(1, 2, 3);
      g.addEdge(2, 0, 1); // cycle: 0->1->2->0 with total weight 6

      const { hasNegativeCycle } = bellmanFord(g, 0);
      expect(hasNegativeCycle).toBe(false);
    });

    it('should not detect an unreachable negative cycle', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 5);
      // Negative cycle: 2->3->2
      g.addEdge(2, 3, -1);
      g.addEdge(3, 2, -1);

      const { hasNegativeCycle, dist } = bellmanFord(g, 0);
      // The negative cycle is not reachable from source 0.
      expect(hasNegativeCycle).toBe(false);
      expect(dist.get(0)).toBe(0);
      expect(dist.get(1)).toBe(5);
      expect(dist.get(2)).toBe(Infinity);
    });
  });

  describe('path reconstruction', () => {
    it('should reconstruct shortest paths', () => {
      const g = new Graph<string>(true);
      g.addEdge('a', 'b', 4);
      g.addEdge('a', 'c', 2);
      g.addEdge('c', 'b', 1);
      g.addEdge('b', 'd', 3);

      const { parent } = bellmanFord(g, 'a');
      expect(reconstructPath(parent, 'a', 'a')).toEqual(['a']);
      expect(reconstructPath(parent, 'a', 'b')).toEqual(['a', 'c', 'b']); // 2+1=3 < 4
      expect(reconstructPath(parent, 'a', 'd')).toEqual(['a', 'c', 'b', 'd']);
    });
  });

  describe('single vertex', () => {
    it('should handle a graph with one vertex', () => {
      const g = new Graph<number>(true);
      g.addVertex(0);

      const { dist, hasNegativeCycle } = bellmanFord(g, 0);
      expect(hasNegativeCycle).toBe(false);
      expect(dist.get(0)).toBe(0);
    });
  });

  describe('disconnected vertices', () => {
    it('should return Infinity for unreachable vertices', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 3);
      g.addVertex(2);

      const { dist } = bellmanFord(g, 0);
      expect(dist.get(2)).toBe(Infinity);
    });
  });

  describe('error handling', () => {
    it('should throw if graph is undirected', () => {
      const g = new Graph<number>(false);
      g.addEdge(0, 1, 1);
      expect(() => bellmanFord(g, 0)).toThrow('directed');
    });

    it('should throw if source is not in the graph', () => {
      const g = new Graph<number>(true);
      g.addVertex(0);
      expect(() => bellmanFord(g, 99)).toThrow(
        'Source vertex is not in the graph',
      );
    });
  });
});
