import type { Comparator } from '../types';
import { numberComparator } from '../types';

/**
 * Sorts an array in place using bubble sort with early termination.
 * Stops as soon as a complete pass makes no swaps.
 *
 * Time complexity: O(n²) worst/average, O(n) best (already sorted)
 * Space complexity: O(1)
 */
export function bubbleSortOptimized<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  let n = elements.length;
  let wasSwapped = true;

  while (wasSwapped) {
    wasSwapped = false;
    for (let i = 1; i < n; i++) {
      if (comparator(elements[i - 1]!, elements[i]!) > 0) {
        const temp = elements[i - 1]!;
        elements[i - 1] = elements[i]!;
        elements[i] = temp;
        wasSwapped = true;
      }
    }
    n--;
  }
  return elements;
}
