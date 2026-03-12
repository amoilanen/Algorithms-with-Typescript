import { describe, it, expect } from 'vitest';
import { randomizedQuickSort } from '../../src/05-efficient-sorting/randomized-quick-sort.js';

describe('randomizedQuickSort', () => {
  it('should sort an array', () => {
    expect(randomizedQuickSort([6, 0, 4, 3, 9, 8, 7, 1, 2, 5])).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it('should sort an array that contains duplicate numbers', () => {
    expect(randomizedQuickSort([2, 4, 3, 5, 3, 5, 1, 4, 1, 2])).toEqual([
      1, 1, 2, 2, 3, 3, 4, 4, 5, 5,
    ]);
  });

  it('should return empty array when called with empty array', () => {
    expect(randomizedQuickSort([])).toEqual([]);
  });

  it('should return same array when it consists of one element', () => {
    expect(randomizedQuickSort([15])).toEqual([15]);
  });

  it('should sort array that consists of two elements', () => {
    expect(randomizedQuickSort([2, 1])).toEqual([1, 2]);
  });

  it('should return same array when it is already sorted', () => {
    expect(randomizedQuickSort([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it('should not change array that was provided as argument but create a new one', () => {
    const input = [3, 5, 1, 4, 2];

    expect(randomizedQuickSort(input)).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([3, 5, 1, 4, 2]);
  });

  it('should sort a reverse-sorted array', () => {
    expect(randomizedQuickSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });

  it('should sort an array of all identical elements', () => {
    expect(randomizedQuickSort([7, 7, 7, 7, 7])).toEqual([7, 7, 7, 7, 7]);
  });

  it('should sort a large array correctly', () => {
    const input = Array.from({ length: 1000 }, (_, i) => 1000 - i);
    const expected = Array.from({ length: 1000 }, (_, i) => i + 1);

    expect(randomizedQuickSort(input)).toEqual(expected);
  });

  it('should sort with a custom comparator (descending)', () => {
    const descending = (a: number, b: number) => b - a;

    expect(randomizedQuickSort([3, 1, 4, 1, 5, 9], descending)).toEqual([
      9, 5, 4, 3, 1, 1,
    ]);
  });

  it('should sort strings with a custom comparator', () => {
    const stringComparator = (a: string, b: string) => a.localeCompare(b);

    expect(
      randomizedQuickSort(['banana', 'apple', 'cherry'], stringComparator),
    ).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should handle negative numbers', () => {
    expect(randomizedQuickSort([-3, -1, -4, -1, -5, -9])).toEqual([
      -9, -5, -4, -3, -1, -1,
    ]);
  });
});
