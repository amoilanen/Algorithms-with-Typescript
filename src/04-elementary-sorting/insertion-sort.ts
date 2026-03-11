import type { Comparator } from '../types.js';
import { numberComparator } from '../types.js';

/**
 * Sorts an array using the insertion sort algorithm.
 * Returns a new sorted array; the input is not mutated.
 *
 * Time complexity: O(n²) worst/average, O(n) best (already sorted)
 * Space complexity: O(n) for the copy
 */
export function insertionSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = elements.slice(0);

  for (let i = 1; i < copy.length; i++) {
    const toInsert = copy[i]!;
    let insertIndex = i - 1;

    while (insertIndex >= 0 && comparator(toInsert, copy[insertIndex]!) < 0) {
      copy[insertIndex + 1] = copy[insertIndex]!;
      insertIndex--;
    }
    insertIndex++;
    copy[insertIndex] = toInsert;
  }
  return copy;
}
