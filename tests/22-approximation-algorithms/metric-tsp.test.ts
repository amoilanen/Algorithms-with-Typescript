import { describe, it, expect } from 'vitest';
import { metricTSP } from '../../src/22-approximation-algorithms/metric-tsp.js';
import { tspBruteForce } from '../../src/21-complexity/tsp-brute-force.js';

describe('metricTSP', () => {
  // ── Helper ─────────────────────────────────────────────────────────

  /** Build a symmetric distance matrix from (x, y) coordinates. */
  function euclideanMatrix(points: [number, number][]): number[][] {
    const n = points.length;
    const dist: number[][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => 0),
    );
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const dx = points[i]![0] - points[j]![0];
        const dy = points[i]![1] - points[j]![1];
        dist[i]![j] = Math.sqrt(dx * dx + dy * dy);
      }
    }
    return dist;
  }

  /** Compute the cost of a tour given a distance matrix. */
  function tourCost(tour: number[], dist: readonly (readonly number[])[]): number {
    let cost = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      cost += dist[tour[i]!]![tour[i + 1]!]!;
    }
    cost += dist[tour[tour.length - 1]!]![tour[0]!]!;
    return cost;
  }

  // ── Trivial cases ──────────────────────────────────────────────────

  it('returns a trivial tour for a single city', () => {
    const result = metricTSP([[0]]);
    expect(result.tour).toEqual([0]);
    expect(result.distance).toBe(0);
  });

  it('returns the only tour for two cities', () => {
    const dist = [
      [0, 10],
      [10, 0],
    ];
    const result = metricTSP(dist);
    expect(result.tour).toEqual([0, 1]);
    expect(result.distance).toBe(20);
  });

  // ── Valid tour properties ──────────────────────────────────────────

  it('visits every city exactly once', () => {
    const dist = euclideanMatrix([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0.5, 0.5],
    ]);
    const result = metricTSP(dist);
    const sorted = [...result.tour].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4]);
  });

  it('always starts the tour at city 0', () => {
    const dist = euclideanMatrix([
      [0, 0],
      [3, 0],
      [3, 4],
    ]);
    const result = metricTSP(dist);
    expect(result.tour[0]).toBe(0);
  });

  it('reports a distance matching its tour', () => {
    const dist = euclideanMatrix([
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
      [0, 1],
    ]);
    const result = metricTSP(dist);
    const computed = tourCost(result.tour, dist);
    expect(result.distance).toBeCloseTo(computed, 10);
  });

  // ── Approximation guarantee (≤ 2 × OPT) ───────────────────────────

  it('produces a tour at most 2x optimal for a triangle', () => {
    const dist = euclideanMatrix([
      [0, 0],
      [1, 0],
      [0.5, Math.sqrt(3) / 2],
    ]);
    const optimal = tspBruteForce(dist);
    const approx = metricTSP(dist);

    expect(approx.distance).toBeLessThanOrEqual(2 * optimal.distance + 1e-9);
  });

  it('produces a tour at most 2x optimal for a square', () => {
    const dist = euclideanMatrix([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ]);
    const optimal = tspBruteForce(dist);
    const approx = metricTSP(dist);

    expect(approx.distance).toBeLessThanOrEqual(2 * optimal.distance + 1e-9);
  });

  it('produces a tour at most 2x optimal for 5 cities', () => {
    const dist = euclideanMatrix([
      [0, 0],
      [2, 0],
      [3, 1],
      [1, 3],
      [-1, 1],
    ]);
    const optimal = tspBruteForce(dist);
    const approx = metricTSP(dist);

    expect(approx.distance).toBeLessThanOrEqual(2 * optimal.distance + 1e-9);
  });

  it('produces a tour at most 2x optimal for 6 cities in a hexagon', () => {
    const points: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (2 * Math.PI * i) / 6;
      points.push([Math.cos(angle), Math.sin(angle)]);
    }
    const dist = euclideanMatrix(points);
    const optimal = tspBruteForce(dist);
    const approx = metricTSP(dist);

    expect(approx.distance).toBeLessThanOrEqual(2 * optimal.distance + 1e-9);
  });

  it('produces a tour at most 2x optimal for 8 random metric cities', () => {
    // Deterministic "random" points for reproducibility.
    const points: [number, number][] = [
      [0, 0],
      [3, 4],
      [6, 1],
      [2, 7],
      [8, 3],
      [5, 5],
      [1, 3],
      [7, 7],
    ];
    const dist = euclideanMatrix(points);
    const optimal = tspBruteForce(dist);
    const approx = metricTSP(dist);

    expect(approx.distance).toBeLessThanOrEqual(2 * optimal.distance + 1e-9);
  });

  // ── Collinear points ───────────────────────────────────────────────

  it('handles collinear points correctly', () => {
    const dist = euclideanMatrix([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ]);
    const optimal = tspBruteForce(dist);
    const approx = metricTSP(dist);

    expect(approx.distance).toBeLessThanOrEqual(2 * optimal.distance + 1e-9);
    // Verify it's a valid tour.
    const sorted = [...approx.tour].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3]);
  });

  // ── Error handling ─────────────────────────────────────────────────

  it('throws RangeError for an empty matrix', () => {
    expect(() => metricTSP([])).toThrow(RangeError);
  });

  it('throws Error for a non-square matrix', () => {
    const dist = [
      [0, 1],
      [1, 0, 3],
    ];
    expect(() => metricTSP(dist)).toThrow(Error);
  });
});
