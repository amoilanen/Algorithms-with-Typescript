import type { Comparator } from '../types';
import { numberComparator } from '../types';

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
 * Sorts an array in place using iterative (bottom-up) merge sort.
 *
 * Time complexity: O(n log n) in all cases
 * Space complexity: O(n) auxiliary for the merge buffer
 */
export function mergeSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  let step = 1;

  while (step < elements.length) {
    step = step * 2;
    for (let start = 0; start < elements.length; start = start + step) {
      const middle = Math.min(start + step / 2, elements.length);
      const end = Math.min(start + step, elements.length);

      merge(elements, start, middle, end, comparator);
    }
  }
  return elements;
}
