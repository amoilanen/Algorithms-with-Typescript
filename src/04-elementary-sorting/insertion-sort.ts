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

/** In-place insertion sort on a subarray arr[left..right]. */
export function insertionSortRange(
  arr: number[],
  left: number,
  right: number,
): void {
  for (let i = left + 1; i <= right; i++) {
    const key = arr[i]!;
    let j = i - 1;
    while (j >= left && arr[j]! > key) {
      arr[j + 1] = arr[j]!;
      j--;
    }
    arr[j + 1] = key;
  }
}
