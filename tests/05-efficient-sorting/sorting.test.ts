import { describe, it, expect } from 'vitest';
import {
  mergeSort,
  merge,
} from '../../src/05-efficient-sorting/merge-sort.js';
import {
  quickSort,
  partition,
} from '../../src/05-efficient-sorting/quick-sort.js';
import { heapSort } from '../../src/05-efficient-sorting/heap-sort.js';

describe('efficient sorting', () => {
  for (const sortFunc of [mergeSort, heapSort, quickSort]) {
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

      it('should not change array that was provided as argument but create a new one', () => {
        const input = [3, 5, 1, 4, 2];

        expect(sortFunc(input)).toEqual([1, 2, 3, 4, 5]);
        expect(input).toEqual([3, 5, 1, 4, 2]);
      });
    });
  }

  describe('merge', () => {
    it('should merge two presorted subarrays of equal length', () => {
      const arr = [1, 3, 5, 8, 2, 4, 6, 7];

      merge(arr, 0, 4, 8);
      expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should merge two presorted subarrays of different length', () => {
      const arr = [1, 3, 5, 6, 2, 4];

      merge(arr, 0, 4, 6);
      expect(arr).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should merge two presorted sub-arrays one of which consists of one element', () => {
      const arr = [1, 3, 4, 5, 2];

      merge(arr, 0, 4, 5);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should merge two presorted sub-arrays one of which is empty', () => {
      const arr = [1, 2, 3, 4];

      merge(arr, 0, 4, 4);
      expect(arr).toEqual([1, 2, 3, 4]);
    });

    it('should merge two presorted sub-arrays one of which starts with non-zero index', () => {
      const arr = [5, 8, 3, 1, 2, 6, 4, 7];

      merge(arr, 4, 6, 8);
      expect(arr).toEqual([5, 8, 3, 1, 2, 4, 6, 7]);
    });
  });

  describe('partition', () => {
    it('should partition by element in the middle', () => {
      const arr = [9, 7, 8, 1, 4, 2, 5, 6, 3];

      expect(partition(arr, 0, arr.length - 1)).toBe(3);
      expect(arr).toEqual([1, 3, 2, 4, 7, 8, 5, 6, 9]);
    });

    it('should partition one element array', () => {
      const arr = [9];

      expect(partition(arr, 0, 0)).toBe(0);
      expect(arr).toEqual([9]);
    });

    it('should partition empty array', () => {
      const arr: number[] = [];

      expect(partition(arr, 0, 0)).toBe(undefined);
      expect(arr).toEqual([]);
    });

    it('should not partition by negative indexes', () => {
      const arr = [9, 7, 8, 1, 4, 2, 5, 6, 3];

      expect(partition(arr, -5, -1)).toBe(undefined);
      expect(arr).toEqual([9, 7, 8, 1, 4, 2, 5, 6, 3]);
    });

    it('should not partition if start index is equal to end index', () => {
      const arr = [9, 7, 8, 1, 4, 2, 5, 6, 3];

      expect(partition(arr, 6, 6)).toBe(6);
      expect(arr).toEqual([9, 7, 8, 1, 4, 2, 5, 6, 3]);
    });

    it('should not partition if start index is greater than end index', () => {
      const arr = [9, 7, 8, 1, 4, 2, 5, 6, 3];

      expect(partition(arr, 7, 6)).toBe(undefined);
      expect(arr).toEqual([9, 7, 8, 1, 4, 2, 5, 6, 3]);
    });

    it('should partition if start and end index in the middle of array', () => {
      const arr = [9, 7, 8, 1, 4, 2, 5, 6, 3];

      expect(partition(arr, 2, 6)).toBe(4);
      expect(arr).toEqual([9, 7, 1, 2, 4, 8, 5, 6, 3]);
    });
  });
});
