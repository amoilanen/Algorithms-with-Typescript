import { describe, it, expect } from 'vitest';
import { Graph } from '../../src/12-graphs-and-traversal/graph';
import { dagShortestPaths } from '../../src/13-shortest-paths/dag-shortest-paths';
import { reconstructPath } from '../../src/13-shortest-paths/dijkstra';

describe('DAG Shortest Paths', () => {
  describe('basic DAG with positive weights', () => {
    // DAG:  s->a:5, s->b:3, a->b:2, a->c:6, b->c:7, b->d:4, c->d:1, c->e:2, d->e:7
    function buildDAG(): Graph<string> {
      const g = new Graph<string>(true);
      g.addEdge('s', 'a', 5);
      g.addEdge('s', 'b', 3);
      g.addEdge('a', 'b', 2);
      g.addEdge('a', 'c', 6);
      g.addEdge('b', 'c', 7);
      g.addEdge('b', 'd', 4);
      g.addEdge('c', 'd', 1);
      g.addEdge('c', 'e', 2);
      g.addEdge('d', 'e', 7);
      return g;
    }

    it('should find shortest distances', () => {
      const g = buildDAG();
      const { dist } = dagShortestPaths(g, 's');
      expect(dist.get('s')).toBe(0);
      expect(dist.get('a')).toBe(5);
      expect(dist.get('b')).toBe(3); // s->b
      expect(dist.get('c')).toBe(10); // s->b->c = 3+7
      expect(dist.get('d')).toBe(7); // s->b->d = 3+4
      expect(dist.get('e')).toBe(12); // s->b->c->e = 3+7+2
    });

    it('should reconstruct shortest paths', () => {
      const g = buildDAG();
      const { parent } = dagShortestPaths(g, 's');
      expect(reconstructPath(parent, 's', 'e')).toEqual([
        's',
        'b',
        'c',
        'e',
      ]);
      expect(reconstructPath(parent, 's', 'd')).toEqual(['s', 'b', 'd']);
    });
  });

  describe('DAG with negative weights', () => {
    it('should handle negative edge weights (advantage over Dijkstra)', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 5);
      g.addEdge(0, 2, 3);
      g.addEdge(1, 3, 6);
      g.addEdge(1, 2, -2); // negative edge
      g.addEdge(2, 3, 4);

      const { dist } = dagShortestPaths(g, 0);
      expect(dist.get(0)).toBe(0);
      expect(dist.get(1)).toBe(5);
      expect(dist.get(2)).toBe(3); // 0->2 is shortest
      expect(dist.get(3)).toBe(7); // 0->2->3 = 3+4 = 7
    });
  });

  describe('source in the middle of DAG', () => {
    it('should not reach vertices that have no path from source', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 2);
      g.addEdge(1, 2, 3);
      g.addEdge(2, 3, 1);

      const { dist } = dagShortestPaths(g, 1);
      expect(dist.get(0)).toBe(Infinity); // 0 is before 1 in topological order
      expect(dist.get(1)).toBe(0);
      expect(dist.get(2)).toBe(3);
      expect(dist.get(3)).toBe(4);
    });
  });

  describe('single vertex', () => {
    it('should handle a graph with a single vertex', () => {
      const g = new Graph<string>(true);
      g.addVertex('a');
      const { dist } = dagShortestPaths(g, 'a');
      expect(dist.get('a')).toBe(0);
    });
  });

  describe('linear chain', () => {
    it('should handle a simple chain', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 10);
      g.addEdge(1, 2, 20);
      g.addEdge(2, 3, 30);

      const { dist } = dagShortestPaths(g, 0);
      expect(dist.get(0)).toBe(0);
      expect(dist.get(1)).toBe(10);
      expect(dist.get(2)).toBe(30);
      expect(dist.get(3)).toBe(60);
    });
  });

  describe('error handling', () => {
    it('should throw if graph is undirected', () => {
      const g = new Graph<number>(false);
      g.addEdge(0, 1, 1);
      expect(() => dagShortestPaths(g, 0)).toThrow('directed');
    });

    it('should throw if graph has a cycle', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);
      g.addEdge(2, 0, 1); // creates a cycle
      expect(() => dagShortestPaths(g, 0)).toThrow('cycle');
    });

    it('should throw if source is not in the graph', () => {
      const g = new Graph<number>(true);
      g.addVertex(0);
      expect(() => dagShortestPaths(g, 99)).toThrow(
        'Source vertex is not in the graph',
      );
    });
  });

  describe('disconnected DAG', () => {
    it('should return Infinity for unreachable vertices', () => {
      const g = new Graph<number>(true);
      g.addEdge(0, 1, 5);
      g.addEdge(2, 3, 10); // separate component

      const { dist } = dagShortestPaths(g, 0);
      expect(dist.get(0)).toBe(0);
      expect(dist.get(1)).toBe(5);
      expect(dist.get(2)).toBe(Infinity);
      expect(dist.get(3)).toBe(Infinity);
    });
  });
});
