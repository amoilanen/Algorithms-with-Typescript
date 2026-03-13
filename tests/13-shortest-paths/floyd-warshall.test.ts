import { describe, it, expect } from 'vitest';
import { Graph } from '../../src/12-graphs-and-traversal/graph';
import {
  floydWarshall,
  reconstructPathFW,
  hasNegativeCycle,
} from '../../src/13-shortest-paths/floyd-warshall';

describe('Floyd-Warshall', () => {
  /** Helper: look up dist[from][to] using vertex labels. */
  function getDist(
    result: ReturnType<typeof floydWarshall>,
    from: string,
    to: string,
  ): number {
    const i = result.vertices.indexOf(from);
    const j = result.vertices.indexOf(to);
    return result.dist[i]![j]!;
  }

  /** Helper: reconstruct path using vertex labels. */
  function getPath(
    result: ReturnType<typeof floydWarshall>,
    from: string,
    to: string,
  ): string[] | null {
    const i = result.vertices.indexOf(from);
    const j = result.vertices.indexOf(to);
    const indices = reconstructPathFW(result.next, i, j);
    if (indices === null) return null;
    return indices.map((idx) => result.vertices[idx]!);
  }

  describe('small complete graph', () => {
    //  1 --3--> 2
    //  |        |
    //  8        1
    //  v        v
    //  4 <--2-- 3
    //  Plus: 1->3:7 (longer, so shortest is 1->2->3 = 4)
    function buildGraph(): Graph<string> {
      const g = new Graph<string>(true);
      g.addEdge('1', '2', 3);
      g.addEdge('1', '3', 7);
      g.addEdge('1', '4', 8);
      g.addEdge('2', '3', 1);
      g.addEdge('3', '4', 2);
      return g;
    }

    it('should compute all-pairs shortest distances', () => {
      const result = floydWarshall(buildGraph());
      expect(getDist(result, '1', '1')).toBe(0);
      expect(getDist(result, '1', '2')).toBe(3);
      expect(getDist(result, '1', '3')).toBe(4); // 1->2->3 = 3+1
      expect(getDist(result, '1', '4')).toBe(6); // 1->2->3->4 = 3+1+2
      expect(getDist(result, '2', '3')).toBe(1);
      expect(getDist(result, '2', '4')).toBe(3); // 2->3->4 = 1+2
      expect(getDist(result, '3', '4')).toBe(2);
    });

    it('should return Infinity for unreachable pairs', () => {
      const result = floydWarshall(buildGraph());
      expect(getDist(result, '4', '1')).toBe(Infinity);
      expect(getDist(result, '2', '1')).toBe(Infinity);
    });

    it('should reconstruct shortest paths', () => {
      const result = floydWarshall(buildGraph());
      expect(getPath(result, '1', '4')).toEqual(['1', '2', '3', '4']);
      expect(getPath(result, '1', '3')).toEqual(['1', '2', '3']);
      expect(getPath(result, '1', '1')).toEqual(['1']);
    });

    it('should return null for unreachable paths', () => {
      const result = floydWarshall(buildGraph());
      expect(getPath(result, '4', '1')).toBeNull();
    });
  });

  describe('negative weights (no negative cycle)', () => {
    it('should handle negative edge weights correctly', () => {
      const g = new Graph<string>(true);
      g.addEdge('a', 'b', 1);
      g.addEdge('b', 'c', -3);
      g.addEdge('a', 'c', 2);

      const result = floydWarshall(g);
      expect(hasNegativeCycle(result)).toBe(false);
      expect(getDist(result, 'a', 'c')).toBe(-2); // a->b->c = 1+(-3)
    });
  });

  describe('negative cycle detection', () => {
    it('should detect a negative-weight cycle', () => {
      const g = new Graph<string>(true);
      g.addEdge('a', 'b', 1);
      g.addEdge('b', 'c', -2);
      g.addEdge('c', 'a', -1); // cycle: a->b->c->a = 1+(-2)+(-1) = -2

      const result = floydWarshall(g);
      expect(hasNegativeCycle(result)).toBe(true);
    });

    it('should not flag a positive cycle', () => {
      const g = new Graph<string>(true);
      g.addEdge('a', 'b', 3);
      g.addEdge('b', 'c', 2);
      g.addEdge('c', 'a', 1);

      const result = floydWarshall(g);
      expect(hasNegativeCycle(result)).toBe(false);
    });
  });

  describe('single vertex', () => {
    it('should handle a single vertex', () => {
      const g = new Graph<string>(true);
      g.addVertex('x');

      const result = floydWarshall(g);
      expect(getDist(result, 'x', 'x')).toBe(0);
    });
  });

  describe('two vertices', () => {
    it('should handle two connected vertices', () => {
      const g = new Graph<string>(true);
      g.addEdge('a', 'b', 5);

      const result = floydWarshall(g);
      expect(getDist(result, 'a', 'b')).toBe(5);
      expect(getDist(result, 'b', 'a')).toBe(Infinity);
    });
  });

  describe('parallel edges (shorter wins)', () => {
    it('should take the shortest when there are multiple edges', () => {
      const g = new Graph<string>(true);
      g.addEdge('a', 'b', 10);
      g.addEdge('a', 'b', 3); // overwrites to shorter weight

      const result = floydWarshall(g);
      expect(getDist(result, 'a', 'b')).toBe(3);
    });
  });

  describe('error handling', () => {
    it('should throw if graph is undirected', () => {
      const g = new Graph<string>(false);
      g.addEdge('a', 'b', 1);
      expect(() => floydWarshall(g)).toThrow('directed');
    });
  });

  describe('diamond graph', () => {
    it('should find shortest path through longer route if cheaper', () => {
      //   a --1--> b --1--> d
      //   |                 ^
      //   +--10--> c --1---+
      const g = new Graph<string>(true);
      g.addEdge('a', 'b', 1);
      g.addEdge('b', 'd', 1);
      g.addEdge('a', 'c', 10);
      g.addEdge('c', 'd', 1);

      const result = floydWarshall(g);
      expect(getDist(result, 'a', 'd')).toBe(2); // a->b->d
      expect(getPath(result, 'a', 'd')).toEqual(['a', 'b', 'd']);
    });
  });
});
