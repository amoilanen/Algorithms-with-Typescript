import { describe, it, expect } from 'vitest';
import {
  linearSearch,
  binarySearch,
} from '../../src/03-recursion-and-divide-and-conquer/binary-search.js';

describe('linearSearch', () => {
  it('should return -1 if no such element', () => {
    expect(linearSearch([2, 1, 4, 2, 3], 5)).toBe(-1);
  });

  it('should return first index at which element is found', () => {
    expect(linearSearch([5, 1, 2, 4, 2, 3, 8, 9], 2)).toBe(2);
  });
});

describe('binarySearch', () => {
  it('should return -1 if no such element', () => {
    expect(binarySearch([1, 2, 3, 4, 5], 6)).toBe(-1);
  });

  it('should find element at the beginning', () => {
    expect(binarySearch([1, 2, 3, 4, 5], 1)).toBe(0);
  });

  it('should find element at the end', () => {
    expect(binarySearch([1, 2, 3, 4, 5], 5)).toBe(4);
  });

  it('should find element in the middle', () => {
    expect(binarySearch([1, 2, 3, 4, 5], 3)).toBe(2);
  });

  it('should return -1 for empty array', () => {
    expect(binarySearch([], 1)).toBe(-1);
  });

  it('should find element in single-element array', () => {
    expect(binarySearch([7], 7)).toBe(0);
  });

  it('should return -1 when element not in single-element array', () => {
    expect(binarySearch([7], 3)).toBe(-1);
  });
});
