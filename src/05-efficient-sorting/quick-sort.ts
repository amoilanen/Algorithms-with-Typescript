import type { Comparator } from '../types.js';
import { numberComparator } from '../types.js';

/**
 * Partitions arr[start..end] around the middle element as pivot.
 * Returns the final index of the pivot, or undefined if indices are invalid.
 */
export function partition<T>(
  arr: T[],
  start: number,
  end: number,
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): number | undefined {
  if (start > end || end >= arr.length || start < 0 || end < 0) {
    return undefined;
  }

  const middleIndex = Math.floor((start + end) / 2);
  let storeIndex = start;

  // Move pivot to end
  const pivotTemp = arr[middleIndex]!;
  arr[middleIndex] = arr[end]!;
  arr[end] = pivotTemp;

  for (let i = start; i < end; i++) {
    if (comparator(arr[i]!, arr[end]!) < 0) {
      const temp = arr[storeIndex]!;
      arr[storeIndex] = arr[i]!;
      arr[i] = temp;
      storeIndex++;
    }
  }

  // Move pivot to its final position
  const temp = arr[storeIndex]!;
  arr[storeIndex] = arr[end]!;
  arr[end] = temp;

  return storeIndex;
}

function sort<T>(
  arr: T[],
  start: number,
  end: number,
  comparator: Comparator<T>,
): void {
  if (start < end) {
    const partitionIndex = partition(arr, start, end, comparator)!;
    sort(arr, start, partitionIndex - 1, comparator);
    sort(arr, partitionIndex + 1, end, comparator);
  }
}

/**
 * Sorts an array using the quicksort algorithm with middle-element pivot.
 * Returns a new sorted array; the input is not mutated.
 *
 * Time complexity: O(n²) worst case, O(n log n) average
 * Space complexity: O(n) for the copy + O(log n) recursion stack
 */
export function quickSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = elements.slice(0);

  sort(copy, 0, copy.length - 1, comparator);
  return copy;
}
