import type { Comparator } from '../types';
import { numberComparator } from '../types';

/**
 * Sorts an array using the bubble sort algorithm.
 * Returns a new sorted array; the input is not mutated.
 *
 * Time complexity: O(n²) worst/average, O(n) best (already sorted)
 * Space complexity: O(n) for the copy
 */
export function bubbleSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = elements.slice(0);
  let wasSwapped = true;

  while (wasSwapped) {
    wasSwapped = false;
    for (let i = 1; i < copy.length; i++) {
      if (comparator(copy[i - 1]!, copy[i]!) > 0) {
        const temp = copy[i - 1]!;
        copy[i - 1] = copy[i]!;
        copy[i] = temp;
        wasSwapped = true;
      }
    }
  }
  return copy;
}
