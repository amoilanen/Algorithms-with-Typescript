import { countingSortByDigit } from './counting-sort';

/**
 * LSD (Least Significant Digit) radix sort for non-negative integers.
 * Uses counting sort as a stable subroutine to sort digit by digit,
 * from the least significant to the most significant.
 *
 * Returns a new sorted array; the input is not mutated.
 *
 * Time complexity: O(d(n + k)) where d = number of digits, k = radix (10)
 * Space complexity: O(n + k)
 */
export function radixSort(elements: number[]): number[] {
  if (elements.length <= 1) {
    return elements.slice(0);
  }

  const max = Math.max(...elements);

  let result = elements.slice(0);

  // Process each digit position from least significant to most significant
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    result = countingSortByDigit(result, exp);
  }

  return result;
}
