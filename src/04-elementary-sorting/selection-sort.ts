import type { Comparator } from '../types';
import { numberComparator } from '../types';

/**
 * Sorts an array in place using the selection sort algorithm.
 *
 * Time complexity: O(n²) in all cases
 * Space complexity: O(1)
 */
export function selectionSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  for (let i = 0; i < elements.length - 1; i++) {
    let remainingMinimum = elements[i]!;
    let indexToSwap = -1;

    for (let j = i + 1; j < elements.length; j++) {
      if (comparator(elements[j]!, remainingMinimum) < 0) {
        remainingMinimum = elements[j]!;
        indexToSwap = j;
      }
    }
    if (indexToSwap >= 0) {
      elements[indexToSwap] = elements[i]!;
      elements[i] = remainingMinimum;
    }
  }
  return elements;
}
