/**
 * Edit distance (Levenshtein distance) via dynamic programming.
 *
 * Given two strings, compute the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to transform one into
 * the other.
 *
 * @module
 */

/**
 * The type of edit operation applied to transform one string into another.
 */
export type EditOp = 'insert' | 'delete' | 'substitute' | 'match';

/**
 * A single step in the edit script.
 *
 * - `op`      — the operation type.
 * - `charA`   — the character in the source string (undefined for insert).
 * - `charB`   — the character in the target string (undefined for delete).
 * - `indexA`  — position in the source string (0-based).
 * - `indexB`  — position in the target string (0-based).
 */
export interface EditStep {
  op: EditOp;
  charA?: string;
  charB?: string;
  indexA: number;
  indexB: number;
}

/**
 * Result of the edit distance computation.
 *
 * - `distance`   — the Levenshtein distance.
 * - `operations` — the sequence of edit operations that achieves the
 *                  minimum distance, recovered by backtracking through
 *                  the DP table.
 */
export interface EditDistanceResult {
  distance: number;
  operations: EditStep[];
}

/**
 * Compute the Levenshtein edit distance between two strings and recover the
 * optimal edit script.
 *
 * Uses bottom-up tabulation. `dp[i][j]` stores the edit distance between
 * `a[0..i-1]` and `b[0..j-1]`.
 *
 * ### Recurrence
 * ```
 * dp[i][j] = dp[i-1][j-1]                          if a[i-1] === b[j-1]
 *          = 1 + min(dp[i-1][j],      // delete
 *                    dp[i][j-1],      // insert
 *                    dp[i-1][j-1])    // substitute
 * ```
 *
 * ### Complexity
 * - Time:  O(m × n) where m = a.length, n = b.length
 * - Space: O(m × n) for the DP table
 *
 * @param a  Source string.
 * @param b  Target string.
 * @returns An {@link EditDistanceResult} with the distance and the edit script.
 */
export function editDistance(a: string, b: string): EditDistanceResult {
  const m = a.length;
  const n = b.length;

  // Build the DP table.
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );

  // Base cases: transforming to/from the empty string.
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] =
          1 +
          Math.min(
            dp[i - 1]![j]!, // delete
            dp[i]![j - 1]!, // insert
            dp[i - 1]![j - 1]!, // substitute
          );
      }
    }
  }

  // Backtrack to recover the edit operations.
  const operations: EditStep[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      operations.push({
        op: 'match',
        charA: a[i - 1],
        charB: b[j - 1],
        indexA: i - 1,
        indexB: j - 1,
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i]![j] === dp[i - 1]![j - 1]! + 1) {
      operations.push({
        op: 'substitute',
        charA: a[i - 1],
        charB: b[j - 1],
        indexA: i - 1,
        indexB: j - 1,
      });
      i--;
      j--;
    } else if (j > 0 && dp[i]![j] === dp[i]![j - 1]! + 1) {
      operations.push({
        op: 'insert',
        charB: b[j - 1],
        indexA: i,
        indexB: j - 1,
      });
      j--;
    } else {
      operations.push({
        op: 'delete',
        charA: a[i - 1],
        indexA: i - 1,
        indexB: j,
      });
      i--;
    }
  }

  operations.reverse();

  return { distance: dp[m]![n]!, operations };
}
