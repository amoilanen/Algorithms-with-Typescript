import { describe, it, expect } from 'vitest';
import {
  lisDP,
  lisBinarySearch,
} from '../../src/16-dynamic-programming/lis.js';

describe('longest increasing subsequence', () => {
  for (const lis of [lisDP, lisBinarySearch]) {
    describe(lis.name, () => {
      it('returns empty for empty array', () => {
        const result = lis([]);
        expect(result.length).toBe(0);
        expect(result.subsequence).toEqual([]);
      });

      it('returns single element for single-element array', () => {
        const result = lis([42]);
        expect(result.length).toBe(1);
        expect(result.subsequence).toEqual([42]);
      });

      it('handles already sorted array', () => {
        const result = lis([1, 2, 3, 4, 5]);
        expect(result.length).toBe(5);
        expect(result.subsequence).toEqual([1, 2, 3, 4, 5]);
      });

      it('handles reverse sorted array', () => {
        const result = lis([5, 4, 3, 2, 1]);
        expect(result.length).toBe(1);
      });

      it('finds LIS in a mixed array', () => {
        const result = lis([10, 9, 2, 5, 3, 7, 101, 18]);
        expect(result.length).toBe(4);
        // The returned subsequence must be strictly increasing.
        expect(isStrictlyIncreasing(result.subsequence)).toBe(true);
        // And must be a subsequence of the original.
        expect(
          isSubsequence(result.subsequence, [10, 9, 2, 5, 3, 7, 101, 18]),
        ).toBe(true);
      });

      it('handles duplicates (strictly increasing, not non-decreasing)', () => {
        const result = lis([1, 3, 3, 3, 4]);
        // Strictly increasing: [1, 3, 4] = length 3
        expect(result.length).toBe(3);
        expect(isStrictlyIncreasing(result.subsequence)).toBe(true);
      });

      it('handles all same elements', () => {
        const result = lis([7, 7, 7, 7, 7]);
        expect(result.length).toBe(1);
      });

      it('finds LIS in the classic example', () => {
        // [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15]
        // LIS length = 6 (e.g., [0, 2, 6, 9, 11, 15])
        const arr = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15];
        const result = lis(arr);
        expect(result.length).toBe(6);
        expect(isStrictlyIncreasing(result.subsequence)).toBe(true);
        expect(isSubsequence(result.subsequence, arr)).toBe(true);
      });

      it('handles two elements increasing', () => {
        const result = lis([1, 2]);
        expect(result.length).toBe(2);
        expect(result.subsequence).toEqual([1, 2]);
      });

      it('handles two elements decreasing', () => {
        const result = lis([2, 1]);
        expect(result.length).toBe(1);
      });

      it('handles negative numbers', () => {
        const result = lis([-5, -3, -1, 0, 2]);
        expect(result.length).toBe(5);
        expect(result.subsequence).toEqual([-5, -3, -1, 0, 2]);
      });
    });
  }

  describe('both implementations agree on length', () => {
    it('produces the same LIS length for various inputs', () => {
      const inputs = [
        [3, 1, 4, 1, 5, 9, 2, 6],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 1, 1, 1],
        [10, 22, 9, 33, 21, 50, 41, 60, 80],
      ];

      for (const arr of inputs) {
        expect(lisDP(arr).length).toBe(lisBinarySearch(arr).length);
      }
    });
  });
});

function isStrictlyIncreasing(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i]! <= arr[i - 1]!) return false;
  }
  return true;
}

function isSubsequence(sub: number[], seq: number[]): boolean {
  let si = 0;
  for (let i = 0; i < seq.length && si < sub.length; i++) {
    if (seq[i] === sub[si]) si++;
  }
  return si === sub.length;
}
