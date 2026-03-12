import { describe, it, expect } from 'vitest';
import { Graph } from '../../src/12-graphs-and-traversal/graph.js';
import { dijkstra, reconstructPath } from '../../src/13-shortest-paths/dijkstra.js';

describe('Dijkstra', () => {
  describe('basic directed graph', () => {
    // Classic CLRS-style example:
    //   s --10--> t --1--> x
    //   |         |        ^
    //   5         2        |
    //   v         v        |
    //   y --3---> t        |
    //   |                  |
    //   +--------9-------->x
    //   y --2--> x  (alternative)
    //
    // Let's use a concrete CLRS-like graph:
    //   s->t:10, s->y:5, t->y:2, t->x:1, y->t:3, y->x:9, x->z:4, z->x:6, z->s:7
    function buildCLRSGraph(): Graph<string> {
      const g = new Graph<string>(true);
      g.addEdge('s', 't', 10);
      g.addEdge('s', 'y', 5);
      g.addEdge('t', 'y', 2);
      g.addEdge('t', 'x', 1);
      g.addEdge('y', 't', 3);
      g.addEdge('y', 'x', 9);
      g.addEdge('x', 'z', 4);
      g.addEdge('z', 'x', 6);
      g.addEdge('z', 's', 7);
      return g;
    }

    it('should find shortest distances from source', () => {
      const g = buildCLRSGraph();
      const { dist } = dijkstra(g, 's');
      expect(dist.get('s')).toBe(0);
      expect(dist.get('y')).toBe(5);
      expect(dist.get('t')).toBe(8); // s->y->t = 5+3
      expect(dist.get('x')).toBe(9); // s->y->t->x = 5+3+1
      expect(dist.get('z')).toBe(13); // s->y->t->x->z = 5+3+1+4
    });

    it('should reconstruct shortest paths', () => {
      const g = buildCLRSGraph();
      const { parent } = dijkstra(g, 's');
      expect(reconstructPath(parent, 's', 's')).toEqual(['s']);
      expect(reconstructPath(parent, 's', 'y')).toEqual(['s', 'y']);
      expect(reconstructPath(parent, 's', 't')).toEqual(['s', 'y', 't']);
      expect(reconstructPath(parent, 's', 'x')).toEqual(['s', 'y', 't', 'x']);
      expect(reconstructPath(parent, 's', 'z')).toEqual([
        's',
        'y',
        't',
        'x',
        'z',
      ]);
    });
  });

  describe('undirected graph', () => {
    it('should work on undirected graphs', () => {
      const g = new Graph<number>();
      g.addEdge(0, 1, 4);
      g.addEdge(0, 2, 1);
      g.addEdge(2, 1, 2);
      g.addEdge(1, 3, 1);
      g.addEdge(2, 3, 5);

      const { dist } = dijkstra(g, 0);
      expect(dist.get(0)).toBe(0);
      expect(dist.get(1)).toBe(3); // 0->2->1 = 1+2
      expect(dist.get(2)).toBe(1); // 0->2
      expect(dist.get(3)).toBe(4); // 0->2->1->3 = 1+2+1
    });
  });

  describe('single vertex', () => {
    it('should handle a graph with one vertex', () => {
      const g = new Graph<string>(true);
      g.addVertex('a');
      const { dist, parent } = dijkstra(g, 'a');
      expect(dist.get('a')).toBe(0);
      expect(parent.get('a')).toBeUndefined();
    });
  });

  describe('disconnected vertices', () => {
    it('should return Infinity for unreachable vertices', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 3);
      g.addVertex(2); // isolated

      const { dist, parent } = dijkstra(g, 0);
      expect(dist.get(0)).toBe(0);
      expect(dist.get(1)).toBe(3);
      expect(dist.get(2)).toBe(Infinity);
      expect(reconstructPath(parent, 0, 2)).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should throw if source is not in the graph', () => {
      const g = new Graph<number>(true);
      g.addVertex(1);
      expect(() => dijkstra(g, 99)).toThrow('Source vertex is not in the graph');
    });
  });

  describe('multiple shortest paths', () => {
    it('should find one valid shortest path when ties exist', () => {
      const g = new Graph<string>(true);
      g.addEdge('a', 'b', 1);
      g.addEdge('a', 'c', 1);
      g.addEdge('b', 'd', 1);
      g.addEdge('c', 'd', 1);

      const { dist } = dijkstra(g, 'a');
      expect(dist.get('d')).toBe(2);
    });
  });

  describe('zero-weight edges', () => {
    it('should handle zero-weight edges correctly', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 0);
      g.addEdge(1, 2, 0);
      g.addEdge(0, 2, 1);

      const { dist } = dijkstra(g, 0);
      expect(dist.get(0)).toBe(0);
      expect(dist.get(1)).toBe(0);
      expect(dist.get(2)).toBe(0);
    });
  });

  describe('self-loop', () => {
    it('should handle self-loops without issues', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 0, 5);
      g.addEdge(0, 1, 3);

      const { dist } = dijkstra(g, 0);
      expect(dist.get(0)).toBe(0);
      expect(dist.get(1)).toBe(3);
    });
  });
});
