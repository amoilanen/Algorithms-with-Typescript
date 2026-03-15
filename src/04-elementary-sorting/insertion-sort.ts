import type { Comparator } from '../types';
import { numberComparator } from '../types';

/**
 * Sorts an array in place using the insertion sort algorithm.
 *
 * Time complexity: O(n²) worst/average, O(n) best (already sorted)
 * Space complexity: O(1)
 */
export function insertionSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  for (let i = 1; i < elements.length; i++) {
    const toInsert = elements[i]!;
    let insertIndex = i - 1;

    while (insertIndex >= 0 && comparator(toInsert, elements[insertIndex]!) < 0) {
      elements[insertIndex + 1] = elements[insertIndex]!;
      insertIndex--;
    }
    insertIndex++;
    elements[insertIndex] = toInsert;
  }
  return elements;
}
