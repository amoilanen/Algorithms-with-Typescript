import { describe, it, expect } from 'vitest';
import { bipartiteMatching } from '../../src/15-network-flow/bipartite-matching.js';

describe('bipartiteMatching', () => {
  it('finds a perfect matching in a simple bipartite graph', () => {
    // L = {1, 2, 3}, R = {A, B, C}
    // Edges: 1-A, 2-B, 3-C  →  perfect matching of size 3.
    const result = bipartiteMatching(
      [1, 2, 3],
      ['A', 'B', 'C'],
      [
        [1, 'A'],
        [2, 'B'],
        [3, 'C'],
      ],
    );

    expect(result.size).toBe(3);
    expect(result.matches).toHaveLength(3);

    // Verify each left vertex is matched exactly once.
    const matchedLeft = new Set(result.matches.map(([l]) => l));
    const matchedRight = new Set(result.matches.map(([, r]) => r));
    expect(matchedLeft.size).toBe(3);
    expect(matchedRight.size).toBe(3);
  });

  it('finds a maximum matching when perfect matching is not possible', () => {
    // L = {1, 2, 3}, R = {A, B}
    // All left vertices connect to all right vertices.
    // Maximum matching = 2 (limited by |R|).
    const result = bipartiteMatching(
      [1, 2, 3],
      ['A', 'B'],
      [
        [1, 'A'],
        [1, 'B'],
        [2, 'A'],
        [2, 'B'],
        [3, 'A'],
        [3, 'B'],
      ],
    );

    expect(result.size).toBe(2);
    expect(result.matches).toHaveLength(2);

    // Each matched right vertex should appear exactly once.
    const matchedRight = new Set(result.matches.map(([, r]) => r));
    expect(matchedRight.size).toBe(2);
  });

  it('returns empty matching when no edges exist', () => {
    const result = bipartiteMatching([1, 2, 3], ['A', 'B', 'C'], []);

    expect(result.size).toBe(0);
    expect(result.matches).toHaveLength(0);
  });

  it('returns empty matching when left set is empty', () => {
    const result = bipartiteMatching([], ['A', 'B'], []);
    expect(result.size).toBe(0);
    expect(result.matches).toHaveLength(0);
  });

  it('returns empty matching when right set is empty', () => {
    const result = bipartiteMatching([1, 2], [], []);
    expect(result.size).toBe(0);
    expect(result.matches).toHaveLength(0);
  });

  it('handles a single left and single right vertex', () => {
    const result = bipartiteMatching([1], ['A'], [[1, 'A']]);
    expect(result.size).toBe(1);
    expect(result.matches).toEqual([[1, 'A']]);
  });

  it('finds maximum matching when augmenting paths are needed', () => {
    // Classic example requiring augmenting path rerouting.
    //
    // L = {1, 2, 3}
    // R = {A, B, C}
    // Edges: 1-A, 2-A, 2-B, 3-B, 3-C
    //
    // Greedy might match 1-A, 2-B leaving 3 unmatched.
    // But the maximum matching is 3: 1-A, 2-B, 3-C  or  2-A, 3-B, ... etc.
    // Actually: 1-A, 2-B, 3-C has size 3.
    // Without rerouting: 1-A, then 2 can only go to A or B.
    //   If 2→A conflicts with 1→A, must reroute: 1→A switched, 2→A, 1→? No.
    //   Better: 1→A, 2→B, 3→C = perfect matching.
    const result = bipartiteMatching(
      [1, 2, 3],
      ['A', 'B', 'C'],
      [
        [1, 'A'],
        [2, 'A'],
        [2, 'B'],
        [3, 'B'],
        [3, 'C'],
      ],
    );

    expect(result.size).toBe(3);
  });

  it('correctly finds matching when rerouting is essential', () => {
    // L = {1, 2}
    // R = {A, B}
    // Edges: 1-A, 1-B, 2-A
    //
    // Greedy matching 1→A leaves 2 unmatched (2 only connects to A).
    // Augmenting path: 2→A→1→B yields matching {2-A, 1-B} of size 2.
    const result = bipartiteMatching(
      [1, 2],
      ['A', 'B'],
      [
        [1, 'A'],
        [1, 'B'],
        [2, 'A'],
      ],
    );

    expect(result.size).toBe(2);
    expect(result.matches).toHaveLength(2);

    // Verify each vertex is matched at most once.
    const matchedLeft = result.matches.map(([l]) => l);
    const matchedRight = result.matches.map(([, r]) => r);
    expect(new Set(matchedLeft).size).toBe(2);
    expect(new Set(matchedRight).size).toBe(2);
  });

  it('handles disconnected left vertices (no edges from some)', () => {
    // L = {1, 2, 3}, R = {A, B}
    // Only vertex 1 has edges.
    const result = bipartiteMatching(
      [1, 2, 3],
      ['A', 'B'],
      [
        [1, 'A'],
        [1, 'B'],
      ],
    );

    expect(result.size).toBe(1);
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]![0]).toBe(1);
  });

  it('finds a larger perfect matching', () => {
    // 5×5 bipartite graph with a perfect matching along the diagonal.
    const left = [1, 2, 3, 4, 5];
    const right = ['A', 'B', 'C', 'D', 'E'] as const;
    const edges: [number, string][] = [
      // Diagonal (perfect matching).
      [1, 'A'],
      [2, 'B'],
      [3, 'C'],
      [4, 'D'],
      [5, 'E'],
      // Some extra edges.
      [1, 'B'],
      [2, 'C'],
      [3, 'D'],
      [4, 'E'],
      [5, 'A'],
    ];

    const result = bipartiteMatching(left, [...right], edges);
    expect(result.size).toBe(5);
    expect(result.matches).toHaveLength(5);

    // Every left and right vertex should be matched.
    const matchedLeft = new Set(result.matches.map(([l]) => l));
    const matchedRight = new Set(result.matches.map(([, r]) => r));
    expect(matchedLeft).toEqual(new Set(left));
    expect(matchedRight).toEqual(new Set(right));
  });

  it('verifies that matched edges exist in the original edge set', () => {
    const edges: [number, string][] = [
      [1, 'A'],
      [2, 'B'],
      [3, 'A'],
      [3, 'C'],
    ];

    const result = bipartiteMatching([1, 2, 3], ['A', 'B', 'C'], edges);

    // Each matched pair must correspond to an original edge.
    const edgeSet = new Set(edges.map(([l, r]) => `${l}-${r}`));
    for (const [l, r] of result.matches) {
      expect(edgeSet.has(`${l}-${r}`)).toBe(true);
    }
  });

  it('handles a complete bipartite graph K(3,3)', () => {
    const left = [1, 2, 3];
    const right = ['A', 'B', 'C'];
    const edges: [number, string][] = [];
    for (const l of left) {
      for (const r of right) {
        edges.push([l, r]);
      }
    }

    const result = bipartiteMatching(left, right, edges);
    expect(result.size).toBe(3); // Perfect matching exists in K(3,3).
  });

  it('handles edges to non-existent vertices gracefully', () => {
    // Edge references a right vertex 'Z' not in the right set.
    const result = bipartiteMatching(
      [1, 2],
      ['A', 'B'],
      [
        [1, 'A'],
        [2, 'Z' as string], // 'Z' is not in right set
        [2, 'B'],
      ],
    );

    // 'Z' edge is ignored; matching is 1-A, 2-B.
    expect(result.size).toBe(2);
  });
});
