import { describe, it, expect } from 'vitest';
import { tspBruteForce } from '../../src/21-complexity/tsp-brute-force';

describe('tspBruteForce', () => {
  // ── Single city ───────────────────────────────────────────────────

  it('returns a trivial tour for a single city', () => {
    const result = tspBruteForce([[0]]);
    expect(result.tour).toEqual([0]);
    expect(result.distance).toBe(0);
  });

  // ── Two cities ────────────────────────────────────────────────────

  it('returns the only possible tour for two cities', () => {
    const dist = [
      [0, 10],
      [10, 0],
    ];
    const result = tspBruteForce(dist);
    expect(result.tour).toEqual([0, 1]);
    expect(result.distance).toBe(20);
  });

  it('handles asymmetric distances for two cities', () => {
    const dist = [
      [0, 5],
      [15, 0],
    ];
    const result = tspBruteForce(dist);
    expect(result.tour).toEqual([0, 1]);
    expect(result.distance).toBe(20); // 5 + 15
  });

  // ── Three cities ──────────────────────────────────────────────────

  it('finds the optimal tour for three cities (symmetric)', () => {
    // Triangle: 0-1 = 10, 0-2 = 15, 1-2 = 20
    const dist = [
      [0, 10, 15],
      [10, 0, 20],
      [15, 20, 0],
    ];
    const result = tspBruteForce(dist);
    // Optimal: 0 → 1 → 2 → 0 = 10 + 20 + 15 = 45
    // Or:      0 → 2 → 1 → 0 = 15 + 20 + 10 = 45 (same by symmetry)
    expect(result.distance).toBe(45);
    expect(result.tour).toHaveLength(3);
    expect(result.tour[0]).toBe(0);
  });

  // ── Four cities (classic example) ─────────────────────────────────

  it('finds the optimal tour for four cities', () => {
    // Cities in a square: 0=(0,0), 1=(0,1), 2=(1,1), 3=(1,0)
    // Optimal tour follows the perimeter: 0→1→2→3→0 with distance 4.
    const dist = [
      [0, 1, Math.SQRT2, 1],
      [1, 0, 1, Math.SQRT2],
      [Math.SQRT2, 1, 0, 1],
      [1, Math.SQRT2, 1, 0],
    ];
    const result = tspBruteForce(dist);
    // Perimeter tour = 1 + 1 + 1 + 1 = 4
    expect(result.distance).toBeCloseTo(4, 10);
    expect(result.tour).toHaveLength(4);
    expect(result.tour[0]).toBe(0);
  });

  // ── Five cities ───────────────────────────────────────────────────

  it('finds the optimal tour for five cities', () => {
    // Complete graph with known optimal.
    const dist = [
      [0, 2, 9, 10, 7],
      [1, 0, 6, 4, 3],
      [15, 7, 0, 8, 6],
      [6, 3, 12, 0, 11],
      [10, 4, 8, 5, 0],
    ];
    const result = tspBruteForce(dist);
    expect(result.tour).toHaveLength(5);
    expect(result.tour[0]).toBe(0);

    // Verify the reported distance matches the tour.
    let computed = 0;
    for (let i = 0; i < result.tour.length - 1; i++) {
      computed += dist[result.tour[i]!]![result.tour[i + 1]!]!;
    }
    computed +=
      dist[result.tour[result.tour.length - 1]!]![result.tour[0]!]!;
    expect(result.distance).toBeCloseTo(computed, 10);
  });

  // ── Tour validity ─────────────────────────────────────────────────

  it('returns a tour that visits every city exactly once', () => {
    const dist = [
      [0, 3, 4, 2, 7],
      [3, 0, 4, 6, 3],
      [4, 4, 0, 5, 8],
      [2, 6, 5, 0, 6],
      [7, 3, 8, 6, 0],
    ];
    const result = tspBruteForce(dist);
    const sorted = [...result.tour].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4]);
  });

  it('always starts the tour at city 0', () => {
    const dist = [
      [0, 1, 2],
      [1, 0, 3],
      [2, 3, 0],
    ];
    const result = tspBruteForce(dist);
    expect(result.tour[0]).toBe(0);
  });

  // ── Distance verification ─────────────────────────────────────────

  it('reports a distance that matches manual computation of its tour', () => {
    const dist = [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ];
    const result = tspBruteForce(dist);

    let manualDist = 0;
    for (let i = 0; i < result.tour.length - 1; i++) {
      manualDist += dist[result.tour[i]!]![result.tour[i + 1]!]!;
    }
    manualDist +=
      dist[result.tour[result.tour.length - 1]!]![result.tour[0]!]!;

    expect(result.distance).toBe(manualDist);
  });

  // ── Optimality check on a known instance ──────────────────────────

  it('finds the known optimal for a classic 4-city instance', () => {
    // Distances:
    //   0→1: 10, 0→2: 15, 0→3: 20
    //   1→2: 35, 1→3: 25
    //   2→3: 30
    // All symmetric. Optimal: 0→1→3→2→0 = 10 + 25 + 30 + 15 = 80
    const dist = [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ];
    const result = tspBruteForce(dist);
    expect(result.distance).toBe(80);
  });

  // ── Error handling ────────────────────────────────────────────────

  it('throws RangeError for an empty matrix', () => {
    expect(() => tspBruteForce([])).toThrow(RangeError);
  });

  it('throws Error for a non-square matrix', () => {
    const dist = [
      [0, 1],
      [1, 0, 3],
    ];
    expect(() => tspBruteForce(dist)).toThrow(Error);
  });

  it('throws RangeError for more than 12 cities', () => {
    const n = 13;
    const dist = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => 1),
    );
    expect(() => tspBruteForce(dist)).toThrow(RangeError);
  });
});
