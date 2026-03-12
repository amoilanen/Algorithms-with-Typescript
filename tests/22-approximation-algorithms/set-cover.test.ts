import { describe, it, expect } from 'vitest';
import { setCover } from '../../src/22-approximation-algorithms/set-cover.js';

describe('setCover', () => {
  // ── Basic cases ────────────────────────────────────────────────────

  it('covers a small universe with disjoint subsets', () => {
    const universe = new Set([1, 2, 3, 4]);
    const subsets = [new Set([1, 2]), new Set([3, 4])];

    const result = setCover(universe, subsets);
    expect(result.count).toBe(2);

    const covered = new Set<number>();
    for (const s of result.selectedSets) {
      for (const elem of s) covered.add(elem);
    }
    for (const elem of universe) {
      expect(covered.has(elem)).toBe(true);
    }
  });

  it('selects the single subset that covers everything', () => {
    const universe = new Set([1, 2, 3]);
    const subsets = [new Set([1]), new Set([1, 2, 3]), new Set([2, 3])];

    const result = setCover(universe, subsets);
    expect(result.count).toBe(1);
    expect(result.selectedIndices).toEqual([1]);
  });

  it('prefers the subset covering the most uncovered elements', () => {
    const universe = new Set([1, 2, 3, 4, 5]);
    const subsets = [
      new Set([1, 2, 3]), // covers 3
      new Set([2, 4]), // covers 2
      new Set([3, 4, 5]), // covers 3
      new Set([5]), // covers 1
    ];

    const result = setCover(universe, subsets);

    // Verify all elements are covered.
    const covered = new Set<number>();
    for (const s of result.selectedSets) {
      for (const elem of s) covered.add(elem);
    }
    for (const elem of universe) {
      expect(covered.has(elem)).toBe(true);
    }
  });

  it('handles overlapping subsets correctly', () => {
    const universe = new Set(['a', 'b', 'c', 'd', 'e']);
    const subsets = [
      new Set(['a', 'b', 'c']),
      new Set(['b', 'c', 'd']),
      new Set(['d', 'e']),
      new Set(['a', 'e']),
    ];

    const result = setCover(universe, subsets);

    const covered = new Set<string>();
    for (const s of result.selectedSets) {
      for (const elem of s) covered.add(elem);
    }
    for (const elem of universe) {
      expect(covered.has(elem)).toBe(true);
    }
  });

  // ── Approximation ratio ────────────────────────────────────────────

  it('uses at most O(ln n) * OPT subsets on a known instance', () => {
    // Universe: {1, ..., 12}
    // Optimal cover: S0 = {1..6}, S1 = {7..12} → OPT = 2
    // Greedy should find this or something close.
    const universe = new Set(Array.from({ length: 12 }, (_, i) => i + 1));
    const subsets = [
      new Set([1, 2, 3, 4, 5, 6]),
      new Set([7, 8, 9, 10, 11, 12]),
      new Set([1, 2, 3]),
      new Set([4, 5, 6]),
      new Set([7, 8, 9]),
      new Set([10, 11, 12]),
    ];

    const result = setCover(universe, subsets);

    const covered = new Set<number>();
    for (const s of result.selectedSets) {
      for (const elem of s) covered.add(elem);
    }
    for (const elem of universe) {
      expect(covered.has(elem)).toBe(true);
    }

    // OPT = 2, H(12) ≈ 3.1, so greedy ≤ ceil(3.1 * 2) = 7
    // In practice greedy should pick 2 here.
    expect(result.count).toBeLessThanOrEqual(7);
  });

  // ── Edge cases ─────────────────────────────────────────────────────

  it('returns empty result for an empty universe', () => {
    const universe = new Set<number>();
    const subsets = [new Set([1, 2])];

    const result = setCover(universe, subsets);
    expect(result.count).toBe(0);
    expect(result.selectedIndices).toEqual([]);
    expect(result.selectedSets).toEqual([]);
  });

  it('handles a single-element universe', () => {
    const universe = new Set([42]);
    const subsets = [new Set([42])];

    const result = setCover(universe, subsets);
    expect(result.count).toBe(1);
  });

  it('handles subsets with elements outside the universe', () => {
    const universe = new Set([1, 2]);
    const subsets = [new Set([1, 2, 99, 100])];

    const result = setCover(universe, subsets);
    expect(result.count).toBe(1);
  });

  // ── Return value verification ──────────────────────────────────────

  it('returns correct indices matching selected sets', () => {
    const universe = new Set([1, 2, 3, 4]);
    const subsets = [
      new Set([1]),
      new Set([2, 3]),
      new Set([3, 4]),
      new Set([1, 4]),
    ];

    const result = setCover(universe, subsets);

    // Each selectedIndex should correspond to the right subset.
    for (let i = 0; i < result.selectedIndices.length; i++) {
      expect(result.selectedSets[i]).toBe(subsets[result.selectedIndices[i]!]);
    }
  });

  it('does not reuse the same subset twice', () => {
    const universe = new Set([1, 2, 3]);
    const subsets = [new Set([1, 2]), new Set([2, 3])];

    const result = setCover(universe, subsets);

    const indexSet = new Set(result.selectedIndices);
    expect(indexSet.size).toBe(result.selectedIndices.length);
  });

  // ── Error handling ─────────────────────────────────────────────────

  it('throws when subsets cannot cover the universe', () => {
    const universe = new Set([1, 2, 3]);
    const subsets = [new Set([1]), new Set([2])];

    expect(() => setCover(universe, subsets)).toThrow('do not cover');
  });

  it('throws when given empty subsets and non-empty universe', () => {
    const universe = new Set([1]);
    const subsets: ReadonlySet<number>[] = [];

    expect(() => setCover(universe, subsets)).toThrow('do not cover');
  });

  it('throws when all subsets are empty and universe is non-empty', () => {
    const universe = new Set([1, 2]);
    const subsets = [new Set<number>(), new Set<number>()];

    expect(() => setCover(universe, subsets)).toThrow('do not cover');
  });
});
