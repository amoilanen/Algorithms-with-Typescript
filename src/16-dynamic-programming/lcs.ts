/**
 * Longest Common Subsequence (LCS) via dynamic programming.
 *
 * Given two sequences, find the longest subsequence present in both.
 * A subsequence is a sequence that can be derived from another sequence by
 * deleting some or no elements without changing the order of the remaining
 * elements.
 *
 * @module
 */

/**
 * Result of the LCS computation.
 *
 * - `length`       — length of the longest common subsequence.
 * - `subsequence`  — one such longest common subsequence (recovered via
 *                    backtracking through the DP table).
 */
export interface LCSResult<T> {
  length: number;
  subsequence: T[];
}

/**
 * Compute the longest common subsequence of two arrays.
 *
 * Uses bottom-up tabulation with a 2D table. `dp[i][j]` stores the length of
 * the LCS of `a[0..i-1]` and `b[0..j-1]`.
 *
 * ### Recurrence
 * ```
 * dp[i][j] = dp[i-1][j-1] + 1             if a[i-1] === b[j-1]
 *          = max(dp[i-1][j], dp[i][j-1])   otherwise
 * ```
 *
 * ### Complexity
 * - Time:  O(m × n) where m = a.length, n = b.length
 * - Space: O(m × n) for the DP table
 *
 * @param a  First sequence.
 * @param b  Second sequence.
 * @returns A {@link LCSResult} with the LCS length and the actual subsequence.
 */
export function lcs<T>(a: readonly T[], b: readonly T[]): LCSResult<T> {
  const m = a.length;
  const n = b.length;

  // Build the DP table.
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  // Backtrack to recover the subsequence.
  const subsequence: T[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      subsequence.push(a[i - 1]!);
      i--;
      j--;
    } else if (dp[i - 1]![j]! > dp[i]![j - 1]!) {
      i--;
    } else {
      j--;
    }
  }
  subsequence.reverse();

  return { length: dp[m]![n]!, subsequence };
}

/**
 * Convenience overload for computing the LCS of two strings.
 *
 * @param a  First string.
 * @param b  Second string.
 * @returns A {@link LCSResult} over characters, with the subsequence as an
 *          array of single characters.
 */
export function lcsString(a: string, b: string): LCSResult<string> {
  return lcs([...a], [...b]);
}
