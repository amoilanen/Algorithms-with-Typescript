/**
 * Naive (brute-force) string matching.
 *
 * Slides the pattern across the text one position at a time and compares
 * character by character. Simple to implement but inefficient for large
 * inputs because it does not exploit information from prior comparisons.
 *
 * Time complexity:  O(n·m) worst case, where n = |text| and m = |pattern|.
 * Space complexity: O(1) beyond the output array.
 *
 * @module
 */

/**
 * Find all occurrences of `pattern` in `text` using brute-force comparison.
 *
 * @param text    - The text to search in.
 * @param pattern - The pattern to search for.
 * @returns An array of starting indices (0-based) where `pattern` occurs in `text`.
 */
export function naiveMatch(text: string, pattern: string): number[] {
  const n = text.length;
  const m = pattern.length;
  const result: number[] = [];

  if (m === 0) return result;
  if (m > n) return result;

  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    while (j < m && text[i + j] === pattern[j]) {
      j++;
    }
    if (j === m) {
      result.push(i);
    }
  }

  return result;
}
