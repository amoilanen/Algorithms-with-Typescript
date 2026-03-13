import { describe, it, expect } from 'vitest';
import { subsetSum } from '../../src/21-complexity/subset-sum';

describe('subsetSum', () => {
  // ── Basic solvable instances ──────────────────────────────────────

  it('finds a subset that sums to the target', () => {
    const result = subsetSum([3, 7, 1, 8, -3], 11);
    expect(result.found).toBe(true);
    expect(result.subset.reduce((a, b) => a + b, 0)).toBe(11);
  });

  it('finds a single-element subset', () => {
    const result = subsetSum([1, 2, 3, 4, 5], 5);
    expect(result.found).toBe(true);
    expect(result.subset.reduce((a, b) => a + b, 0)).toBe(5);
  });

  it('finds the entire set as a subset', () => {
    const result = subsetSum([1, 2, 3], 6);
    expect(result.found).toBe(true);
    expect(result.subset.reduce((a, b) => a + b, 0)).toBe(6);
  });

  it('works with negative numbers', () => {
    const result = subsetSum([5, -2, 3, -1], 2);
    expect(result.found).toBe(true);
    expect(result.subset.reduce((a, b) => a + b, 0)).toBe(2);
  });

  it('works with duplicates', () => {
    const result = subsetSum([3, 3, 3], 6);
    expect(result.found).toBe(true);
    expect(result.subset.reduce((a, b) => a + b, 0)).toBe(6);
  });

  // ── Unsolvable instances ──────────────────────────────────────────

  it('returns not found when no subset sums to the target', () => {
    const result = subsetSum([1, 2, 3], 7);
    expect(result.found).toBe(false);
    expect(result.subset).toEqual([]);
  });

  it('returns not found for all-positive set with negative target', () => {
    const result = subsetSum([1, 2, 3], -1);
    expect(result.found).toBe(false);
    expect(result.subset).toEqual([]);
  });

  // ── Edge cases ────────────────────────────────────────────────────

  it('returns found with empty subset when target is 0', () => {
    const result = subsetSum([1, 2, 3], 0);
    expect(result.found).toBe(true);
    expect(result.subset).toEqual([]);
  });

  it('returns found with empty subset when set is empty and target is 0', () => {
    const result = subsetSum([], 0);
    expect(result.found).toBe(true);
    expect(result.subset).toEqual([]);
  });

  it('returns not found when set is empty and target is non-zero', () => {
    const result = subsetSum([], 5);
    expect(result.found).toBe(false);
    expect(result.subset).toEqual([]);
  });

  it('handles a single element equal to target', () => {
    const result = subsetSum([7], 7);
    expect(result.found).toBe(true);
    expect(result.subset).toEqual([7]);
  });

  it('handles a single element not equal to target', () => {
    const result = subsetSum([7], 3);
    expect(result.found).toBe(false);
    expect(result.subset).toEqual([]);
  });

  // ── Returned subset verification ──────────────────────────────────

  it('returns elements that are actually in the input', () => {
    const nums = [10, 20, 30, 40, 50];
    const result = subsetSum(nums, 60);
    expect(result.found).toBe(true);
    // Every element in subset should exist in nums.
    const available = [...nums];
    for (const val of result.subset) {
      const idx = available.indexOf(val);
      expect(idx).toBeGreaterThanOrEqual(0);
      available.splice(idx, 1);
    }
  });

  // ── Guard against oversized input ─────────────────────────────────

  it('throws RangeError for arrays larger than 30 elements', () => {
    const big = Array.from({ length: 31 }, (_, i) => i);
    expect(() => subsetSum(big, 100)).toThrow(RangeError);
  });

  // ── Slightly larger instance ──────────────────────────────────────

  it('solves a 20-element instance', () => {
    const nums = Array.from({ length: 20 }, (_, i) => i + 1);
    // Sum of 1..20 = 210. Target = 105 (half) should be solvable.
    const result = subsetSum(nums, 105);
    expect(result.found).toBe(true);
    expect(result.subset.reduce((a, b) => a + b, 0)).toBe(105);
  });
});
