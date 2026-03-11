import type { Comparator } from '../types.js';
import { numberComparator } from '../types.js';

/**
 * Merges two sorted subarrays within arr in place:
 *   arr[start..middle) and arr[middle..end)
 */
export function merge<T>(
  arr: T[],
  start: number,
  middle: number,
  end: number,
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): void {
  const sorted: T[] = [];
  let i = start;
  let j = middle;

  while (i < middle && j < end) {
    if (comparator(arr[i]!, arr[j]!) <= 0) {
      sorted.push(arr[i]!);
      i++;
    } else {
      sorted.push(arr[j]!);
      j++;
    }
  }
  while (i < middle) {
    sorted.push(arr[i]!);
    i++;
  }
  while (j < end) {
    sorted.push(arr[j]!);
    j++;
  }

  i = start;
  while (i < end) {
    arr[i] = sorted[i - start]!;
    i++;
  }
}

/**
 * Sorts an array using iterative (bottom-up) merge sort.
 * Returns a new sorted array; the input is not mutated.
 *
 * Time complexity: O(n log n) in all cases
 * Space complexity: O(n)
 */
export function mergeSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = elements.slice(0);
  let step = 1;

  while (step < copy.length) {
    step = step * 2;
    for (let start = 0; start < copy.length; start = start + step) {
      const middle = Math.min(start + step / 2, copy.length);
      const end = Math.min(start + step, copy.length);

      merge(copy, start, middle, end, comparator);
    }
  }
  return copy;
}
