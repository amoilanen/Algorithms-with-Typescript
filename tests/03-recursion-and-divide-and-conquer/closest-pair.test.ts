import { describe, it, expect } from 'vitest';
import {
  closestPair,
  distance,
} from '../../src/03-recursion-and-divide-and-conquer/closest-pair';
import type { Point } from '../../src/03-recursion-and-divide-and-conquer/closest-pair';

describe('distance', () => {
  it('should return 0 for the same point', () => {
    expect(distance({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(0);
  });

  it('should compute distance along x-axis', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 0 })).toBe(3);
  });

  it('should compute distance along y-axis', () => {
    expect(distance({ x: 0, y: 0 }, { x: 0, y: 4 })).toBe(4);
  });

  it('should compute Euclidean distance for a 3-4-5 triangle', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

describe('closestPair', () => {
  it('should throw for fewer than 2 points', () => {
    expect(() => closestPair([])).toThrow('At least 2 points are required');
    expect(() => closestPair([{ x: 0, y: 0 }])).toThrow(
      'At least 2 points are required',
    );
  });

  it('should find the closest pair with exactly 2 points', () => {
    const result = closestPair([
      { x: 0, y: 0 },
      { x: 3, y: 4 },
    ]);
    expect(result.distance).toBe(5);
  });

  it('should find the closest pair with 3 points', () => {
    const result = closestPair([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 10, y: 0 },
    ]);
    expect(result.distance).toBe(1);
    // The pair should be (0,0) and (1,0)
    const pair = [result.p1, result.p2].sort((a, b) => a.x - b.x);
    expect(pair[0]).toEqual({ x: 0, y: 0 });
    expect(pair[1]).toEqual({ x: 1, y: 0 });
  });

  it('should handle collinear points on the x-axis', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 15, y: 0 },
      { x: 16, y: 0 },
    ];
    const result = closestPair(points);
    expect(result.distance).toBe(1);
  });

  it('should handle collinear points on the y-axis', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 0, y: 3 },
      { x: 0, y: 7 },
      { x: 0, y: 7.5 },
      { x: 0, y: 20 },
    ];
    const result = closestPair(points);
    expect(result.distance).toBeCloseTo(0.5);
  });

  it('should find the closest pair in a classic textbook example', () => {
    // Points spread across the plane with one close pair
    const points: Point[] = [
      { x: 2, y: 3 },
      { x: 12, y: 30 },
      { x: 40, y: 50 },
      { x: 5, y: 1 },
      { x: 12, y: 10 },
      { x: 3, y: 4 },
    ];
    const result = closestPair(points);
    // (2,3) and (3,4) are distance √2 ≈ 1.414
    expect(result.distance).toBeCloseTo(Math.sqrt(2));
    const pair = [result.p1, result.p2].sort((a, b) => a.x - b.x);
    expect(pair[0]).toEqual({ x: 2, y: 3 });
    expect(pair[1]).toEqual({ x: 3, y: 4 });
  });

  it('should handle the closest pair spanning the dividing line', () => {
    // Construct a case where the closest pair straddles the midpoint
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
    ];
    // Closest pair is (4,0) and (5,0) at distance 1
    const result = closestPair(points);
    expect(result.distance).toBe(1);
  });

  it('should handle duplicate points (distance 0)', () => {
    const points: Point[] = [
      { x: 1, y: 1 },
      { x: 5, y: 5 },
      { x: 3, y: 3 },
      { x: 3, y: 3 },
      { x: 9, y: 9 },
    ];
    const result = closestPair(points);
    expect(result.distance).toBe(0);
    expect(result.p1).toEqual({ x: 3, y: 3 });
    expect(result.p2).toEqual({ x: 3, y: 3 });
  });

  it('should handle negative coordinates', () => {
    const points: Point[] = [
      { x: -10, y: -10 },
      { x: -3, y: -4 },
      { x: -3, y: -3 },
      { x: 5, y: 5 },
      { x: 20, y: 20 },
    ];
    const result = closestPair(points);
    expect(result.distance).toBe(1);
    const pair = [result.p1, result.p2].sort((a, b) => a.y - b.y);
    expect(pair[0]).toEqual({ x: -3, y: -4 });
    expect(pair[1]).toEqual({ x: -3, y: -3 });
  });

  it('should agree with brute force on a larger random set', () => {
    // Generate 50 random points and verify the divide-and-conquer result
    // matches a brute-force computation
    const rng = mulberry32(42); // seeded for reproducibility
    const points: Point[] = Array.from({ length: 50 }, () => ({
      x: rng() * 1000 - 500,
      y: rng() * 1000 - 500,
    }));

    const result = closestPair(points);

    // Brute force check
    let minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = distance(points[i]!, points[j]!);
        if (d < minDist) {
          minDist = d;
        }
      }
    }

    expect(result.distance).toBeCloseTo(minDist);
  });

  it('should handle points in a grid pattern', () => {
    const points: Point[] = [];
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        points.push({ x, y });
      }
    }
    const result = closestPair(points);
    // All adjacent grid points are distance 1 apart
    expect(result.distance).toBe(1);
  });

  it('should not mutate the input array', () => {
    const points: Point[] = [
      { x: 5, y: 1 },
      { x: 2, y: 3 },
      { x: 8, y: 7 },
      { x: 1, y: 9 },
    ];
    const original = points.map((p) => ({ ...p }));
    closestPair(points);
    expect(points).toEqual(original);
  });
});

/**
 * Simple seeded PRNG (Mulberry32) for reproducible random tests.
 */
function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
