import { randomizedPartition } from '../05-efficient-sorting/randomized-quick-sort';
import { numberComparator } from '../types';

/**
 * Randomized quickselect: finds the k-th smallest element (0-indexed)
 * in an unordered array without fully sorting it.
 *
 * Uses random pivot selection to achieve expected O(n) time.
 * Returns the k-th smallest element. The input array may be mutated.
 *
 * @param elements - The input array (will be partially reordered in place)
 * @param k - Zero-based index of the desired order statistic
 *            (0 = minimum, elements.length - 1 = maximum)
 * @returns The k-th smallest element
 * @throws {RangeError} If k is out of bounds or array is empty
 *
 * Time complexity: O(n) expected, O(n²) worst case
 * Space complexity: O(log n) expected recursion stack
 */
export function quickselect(elements: number[], k: number): number {
  if (elements.length === 0) {
    throw new RangeError('Cannot select from an empty array');
  }
  if (k < 0 || k >= elements.length) {
    throw new RangeError(
      `k=${k} is out of bounds for array of length ${elements.length}`,
    );
  }

  return select(elements, 0, elements.length - 1, k);
}

function select(
  arr: number[],
  left: number,
  right: number,
  k: number,
): number {
  if (left === right) {
    return arr[left]!;
  }

  const pivotIndex = randomizedPartition(arr, left, right, numberComparator);

  if (k === pivotIndex) {
    return arr[pivotIndex]!;
  } else if (k < pivotIndex) {
    return select(arr, left, pivotIndex - 1, k);
  } else {
    return select(arr, pivotIndex + 1, right, k);
  }
}
