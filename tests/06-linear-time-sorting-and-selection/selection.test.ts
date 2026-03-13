import { describe, it, expect } from 'vitest';
import { quickselect } from '../../src/06-linear-time-sorting-and-selection/quickselect';
import { medianOfMedians } from '../../src/06-linear-time-sorting-and-selection/median-of-medians';

describe('selection algorithms', () => {
  for (const selectFunc of [quickselect, medianOfMedians]) {
    describe(selectFunc.name, () => {
      it('should find the minimum (k=0)', () => {
        expect(selectFunc([3, 1, 4, 1, 5, 9, 2, 6], 0)).toBe(1);
      });

      it('should find the maximum (k=n-1)', () => {
        const arr = [3, 1, 4, 1, 5, 9, 2, 6];
        expect(selectFunc(arr, arr.length - 1)).toBe(9);
      });

      it('should find the median', () => {
        // sorted: [1, 2, 3, 4, 5] → median at index 2 is 3
        expect(selectFunc([3, 5, 1, 4, 2], 2)).toBe(3);
      });

      it('should find any k-th element', () => {
        const arr = [7, 3, 9, 1, 5];
        // sorted: [1, 3, 5, 7, 9]
        expect(selectFunc(arr, 0)).toBe(1);
        expect(selectFunc(arr, 1)).toBe(3);
        expect(selectFunc(arr, 2)).toBe(5);
        expect(selectFunc(arr, 3)).toBe(7);
        expect(selectFunc(arr, 4)).toBe(9);
      });

      it('should handle single element array', () => {
        expect(selectFunc([42], 0)).toBe(42);
      });

      it('should handle two element array', () => {
        expect(selectFunc([5, 3], 0)).toBe(3);
        expect(selectFunc([5, 3], 1)).toBe(5);
      });

      it('should handle array with duplicates', () => {
        const arr = [3, 3, 3, 1, 1, 2, 2];
        // sorted: [1, 1, 2, 2, 3, 3, 3]
        expect(selectFunc(arr, 0)).toBe(1);
        expect(selectFunc(arr, 1)).toBe(1);
        expect(selectFunc(arr, 2)).toBe(2);
        expect(selectFunc(arr, 3)).toBe(2);
        expect(selectFunc(arr, 4)).toBe(3);
        expect(selectFunc(arr, 5)).toBe(3);
        expect(selectFunc(arr, 6)).toBe(3);
      });

      it('should handle all identical elements', () => {
        expect(selectFunc([5, 5, 5, 5, 5], 2)).toBe(5);
      });

      it('should handle already sorted array', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        expect(selectFunc(arr, 4)).toBe(5);
      });

      it('should handle reverse sorted array', () => {
        const arr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        expect(selectFunc(arr, 4)).toBe(5);
      });

      it('should not mutate the input array', () => {
        const input = [5, 3, 8, 1, 9, 2];
        selectFunc(input, 3);
        expect(input).toEqual([5, 3, 8, 1, 9, 2]);
      });

      it('should throw RangeError for empty array', () => {
        expect(() => selectFunc([], 0)).toThrow(RangeError);
      });

      it('should throw RangeError for k out of bounds', () => {
        expect(() => selectFunc([1, 2, 3], -1)).toThrow(RangeError);
        expect(() => selectFunc([1, 2, 3], 3)).toThrow(RangeError);
        expect(() => selectFunc([1, 2, 3], 100)).toThrow(RangeError);
      });

      it('should handle larger arrays correctly', () => {
        // Create array [0, 1, 2, ..., 49] in shuffled order
        const arr = Array.from({ length: 50 }, (_, i) => i);
        // Simple Fisher-Yates shuffle (deterministic seed not needed; we test result)
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j]!, arr[i]!];
        }

        // Every k-th element should be k
        for (let k = 0; k < 50; k++) {
          expect(selectFunc(arr, k)).toBe(k);
        }
      });
    });
  }
});
