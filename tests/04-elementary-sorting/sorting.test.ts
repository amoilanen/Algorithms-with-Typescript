import { describe, it, expect } from 'vitest';
import { selectionSort } from '../../src/04-elementary-sorting/selection-sort.js';
import { bubbleSort } from '../../src/04-elementary-sorting/bubble-sort.js';
import { insertionSort } from '../../src/04-elementary-sorting/insertion-sort.js';

describe('elementary sorting', () => {
  for (const sortFunc of [selectionSort, insertionSort, bubbleSort]) {
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
});
