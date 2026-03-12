/**
 * Knuth-Morris-Pratt (KMP) string matching.
 *
 * KMP improves on the naive approach by pre-processing the pattern into a
 * *failure function* (also called the *prefix function* or *partial-match
 * table*). When a mismatch occurs the failure function tells us the longest
 * proper prefix of the pattern that is also a suffix of the portion matched
 * so far, allowing the search to skip ahead without re-examining characters.
 *
 * Time complexity:  O(n + m) guaranteed, where n = |text| and m = |pattern|.
 * Space complexity: O(m) for the failure function.
 *
 * @module
 */

/**
 * Compute the KMP failure function (prefix function) for a pattern.
 *
 * `failure[i]` is the length of the longest proper prefix of
 * `pattern[0..i]` that is also a suffix of `pattern[0..i]`.
 *
 * @param pattern - The pattern to preprocess.
 * @returns An array of length `pattern.length` containing the failure values.
 */
export function computeFailure(pattern: string): number[] {
  const m = pattern.length;
  const failure = new Array<number>(m).fill(0);

  // k tracks the length of the current longest proper prefix/suffix
  let k = 0;

  for (let i = 1; i < m; i++) {
    // Fall back through the failure function until we find a match
    // or exhaust all prefixes
    while (k > 0 && pattern[k] !== pattern[i]) {
      k = failure[k - 1]!;
    }

    if (pattern[k] === pattern[i]) {
      k++;
    }

    failure[i] = k;
  }

  return failure;
}

/**
 * Find all occurrences of `pattern` in `text` using the KMP algorithm.
 *
 * @param text    - The text to search in.
 * @param pattern - The pattern to search for.
 * @returns An array of starting indices (0-based) where `pattern` occurs in `text`.
 */
export function kmpSearch(text: string, pattern: string): number[] {
  const n = text.length;
  const m = pattern.length;
  const result: number[] = [];

  if (m === 0) return result;
  if (m > n) return result;

  const failure = computeFailure(pattern);

  // q tracks how many characters of the pattern are currently matched
  let q = 0;

  for (let i = 0; i < n; i++) {
    // On mismatch, fall back through the failure function
    while (q > 0 && pattern[q] !== text[i]) {
      q = failure[q - 1]!;
    }

    if (pattern[q] === text[i]) {
      q++;
    }

    if (q === m) {
      // Full match found — record the starting index
      result.push(i - m + 1);
      // Continue searching for overlapping matches
      q = failure[q - 1]!;
    }
  }

  return result;
}
