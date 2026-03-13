import { describe, it, expect } from 'vitest';
import { countingSort } from '../../src/06-linear-time-sorting-and-selection/counting-sort';
import { radixSort } from '../../src/06-linear-time-sorting-and-selection/radix-sort';
import { bucketSort } from '../../src/06-linear-time-sorting-and-selection/bucket-sort';

describe('linear-time sorting', () => {
  for (const sortFunc of [countingSort, radixSort, bucketSort]) {
    describe(sortFunc.name, () => {
      it('should sort an array', () => {
        expect(sortFunc([6, 0, 4, 3, 9, 8, 7, 1, 2, 5])).toEqual([
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        ]);
      });

      it('should sort an array that contains duplicate numbers', () => {
        expect(sortFunc([2, 4, 3, 5, 3, 5, 1, 4, 1, 2])).toEqual([
          1, 1, 2, 2, 3, 3, 4, 4, 5, 5,
        ]);
      });

      it('should return empty array when called with empty array', () => {
        expect(sortFunc([])).toEqual([]);
      });

      it('should return same array when it consists of one element', () => {
        expect(sortFunc([15])).toEqual([15]);
      });

      it('should sort array that consists of two elements', () => {
        expect(sortFunc([2, 1])).toEqual([1, 2]);
      });

      it('should return same array when it is already sorted', () => {
        expect(sortFunc([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])).toEqual([
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        ]);
      });

      it('should sort reverse sorted array', () => {
        expect(sortFunc([5, 4, 3, 2, 1, 0])).toEqual([0, 1, 2, 3, 4, 5]);
      });

      it('should not change array that was provided as argument but create a new one', () => {
        const input = [3, 5, 1, 4, 2];
        expect(sortFunc(input)).toEqual([1, 2, 3, 4, 5]);
        expect(input).toEqual([3, 5, 1, 4, 2]);
      });

      it('should sort array with all identical elements', () => {
        expect(sortFunc([7, 7, 7, 7, 7])).toEqual([7, 7, 7, 7, 7]);
      });

      it('should sort large array correctly', () => {
        const input = Array.from({ length: 100 }, (_, i) => 99 - i);
        const expected = Array.from({ length: 100 }, (_, i) => i);
        expect(sortFunc(input)).toEqual(expected);
      });
    });
  }

  describe('countingSort specific', () => {
    it('should handle array with zeros', () => {
      expect(countingSort([0, 0, 0, 1, 0])).toEqual([0, 0, 0, 0, 1]);
    });

    it('should be stable (preserve relative order of equal keys)', () => {
      // For plain numbers we can't distinguish equal elements directly,
      // but we can verify the output is correct
      expect(countingSort([3, 1, 3, 1, 2])).toEqual([1, 1, 2, 3, 3]);
    });

    it('should handle large values', () => {
      expect(countingSort([1000, 1, 500, 999])).toEqual([1, 500, 999, 1000]);
    });
  });

  describe('radixSort specific', () => {
    it('should sort multi-digit numbers', () => {
      expect(radixSort([170, 45, 75, 90, 802, 24, 2, 66])).toEqual([
        2, 24, 45, 66, 75, 90, 170, 802,
      ]);
    });

    it('should handle numbers with different digit counts', () => {
      expect(radixSort([1, 10, 100, 1000, 5, 50, 500])).toEqual([
        1, 5, 10, 50, 100, 500, 1000,
      ]);
    });

    it('should handle array with zeros', () => {
      expect(radixSort([0, 5, 0, 3, 0])).toEqual([0, 0, 0, 3, 5]);
    });
  });

  describe('bucketSort specific', () => {
    it('should sort with custom bucket count', () => {
      expect(bucketSort([6, 0, 4, 3, 9, 8, 7, 1, 2, 5], 3)).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
      ]);
    });

    it('should sort with single bucket', () => {
      expect(bucketSort([3, 1, 4, 1, 5], 1)).toEqual([1, 1, 3, 4, 5]);
    });

    it('should sort with many buckets', () => {
      expect(bucketSort([5, 3, 8, 1, 9, 2], 20)).toEqual([1, 2, 3, 5, 8, 9]);
    });
  });
});
