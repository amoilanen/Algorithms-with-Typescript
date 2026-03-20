/**
 * Stable counting sort for non-negative integers.
 * Returns a new sorted array; the input is not mutated.
 *
 * Unlike comparison-based sorts, counting sort operates on integer keys
 * and achieves O(n + k) time where k is the range of input values.
 *
 * Time complexity: O(n + k) where k = max element value
 * Space complexity: O(n + k)
 */
export function countingSort(elements: number[]): number[] {
  if (elements.length <= 1) {
    return elements.slice(0);
  }

  const max = Math.max(...elements);
  const counts = new Array<number>(max + 1).fill(0);

  // Count occurrences
  for (const val of elements) {
    counts[val]!++;
  }

  // Compute prefix sums (cumulative counts)
  for (let i = 1; i <= max; i++) {
    counts[i]! += counts[i - 1]!;
  }

  // Build output array in reverse for stability
  const output = new Array<number>(elements.length);
  for (let i = elements.length - 1; i >= 0; i--) {
    const val = elements[i]!;
    counts[val]!--;
    output[counts[val]!] = val;
  }

  return output;
}

/**
 * Counting sort that operates on a specific digit position.
 * Used as a stable subroutine for radix sort.
 *
 * @param elements - Array of non-negative integers
 * @param position - The exponent (power of 10) representing the digit position
 * @returns A new array sorted by the specified digit
 */
export function countingSortByDigit(
  elements: number[],
  position: number,
): number[] {
  const n = elements.length;
  if (n <= 1) {
    return elements.slice(0);
  }

  const output = new Array<number>(n);
  const counts = new Array<number>(10).fill(0);

  // Count occurrences of each digit at the given position
  for (const val of elements) {
    const digit = Math.floor(val / position) % 10;
    counts[digit]!++;
  }

  // Compute prefix sums
  for (let i = 1; i < 10; i++) {
    counts[i]! += counts[i - 1]!;
  }

  // Build output in reverse for stability
  for (let i = n - 1; i >= 0; i--) {
    const val = elements[i]!;
    const digit = Math.floor(val / position) % 10;
    counts[digit]!--;
    output[counts[digit]!] = val;
  }

  return output;
}
