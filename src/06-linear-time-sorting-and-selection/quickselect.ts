/**
 * Randomized quickselect: finds the k-th smallest element (0-indexed)
 * in an unordered array without fully sorting it.
 *
 * Uses random pivot selection to achieve expected O(n) time.
 * Returns the k-th smallest element. The input is not mutated.
 *
 * @param elements - The input array
 * @param k - Zero-based index of the desired order statistic
 *            (0 = minimum, elements.length - 1 = maximum)
 * @returns The k-th smallest element
 * @throws {RangeError} If k is out of bounds or array is empty
 *
 * Time complexity: O(n) expected, O(n²) worst case
 * Space complexity: O(n) for the copy + O(log n) expected recursion stack
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

  const copy = elements.slice(0);
  return select(copy, 0, copy.length - 1, k);
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

  const pivotIndex = randomizedPartition(arr, left, right);

  if (k === pivotIndex) {
    return arr[pivotIndex]!;
  } else if (k < pivotIndex) {
    return select(arr, left, pivotIndex - 1, k);
  } else {
    return select(arr, pivotIndex + 1, right, k);
  }
}

/**
 * Partitions arr[left..right] around a randomly chosen pivot.
 * Returns the final index of the pivot element.
 */
function randomizedPartition(
  arr: number[],
  left: number,
  right: number,
): number {
  // Choose random pivot and move it to the end
  const randomIndex = left + Math.floor(Math.random() * (right - left + 1));
  swap(arr, randomIndex, right);

  const pivot = arr[right]!;
  let storeIndex = left;

  for (let i = left; i < right; i++) {
    if (arr[i]! <= pivot) {
      swap(arr, i, storeIndex);
      storeIndex++;
    }
  }

  swap(arr, storeIndex, right);
  return storeIndex;
}

function swap(arr: number[], i: number, j: number): void {
  const tmp = arr[i]!;
  arr[i] = arr[j]!;
  arr[j] = tmp;
}
