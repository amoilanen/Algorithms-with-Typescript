/**
 * Matrix Chain Multiplication via dynamic programming.
 *
 * Given a chain of matrices A₁, A₂, …, Aₙ where matrix Aᵢ has dimensions
 * pᵢ₋₁ × pᵢ, determine the optimal parenthesization that minimizes the
 * total number of scalar multiplications.
 *
 * @module
 */

/**
 * Result of the matrix chain multiplication optimization.
 *
 * - `minCost`          — the minimum number of scalar multiplications.
 * - `parenthesization` — a string showing the optimal parenthesization
 *                        (e.g., "((A₁A₂)A₃)" ).
 * - `splits`           — the split table `s[i][j]` where the optimal split
 *                        for multiplying matrices i..j is at position s[i][j].
 */
export interface MatrixChainResult {
  minCost: number;
  parenthesization: string;
  splits: number[][];
}

/**
 * Find the optimal parenthesization for a chain of matrices.
 *
 * The input is an array of dimensions `dims` where `dims[i-1] × dims[i]` is
 * the dimension of the i-th matrix (1-indexed). For n matrices, `dims` has
 * n + 1 elements.
 *
 * ### Recurrence
 * ```
 * m[i][j] = 0                                            if i === j
 *         = min over i ≤ k < j of
 *             m[i][k] + m[k+1][j] + dims[i-1]·dims[k]·dims[j]
 * ```
 *
 * ### Complexity
 * - Time:  O(n³)
 * - Space: O(n²)
 *
 * @param dims  Array of matrix dimensions. For n matrices, `dims` has n + 1
 *              elements: `dims = [p₀, p₁, …, pₙ]` meaning matrix i has
 *              dimensions p_{i−1} × p_i.
 * @returns A {@link MatrixChainResult} with the minimum cost, the
 *          parenthesization string, and the split table.
 * @throws {Error} If `dims` has fewer than 2 elements (no matrices).
 */
export function matrixChainOrder(dims: number[]): MatrixChainResult {
  if (dims.length < 2) {
    throw new Error('dims must have at least 2 elements (at least one matrix)');
  }

  const n = dims.length - 1; // number of matrices

  // m[i][j] = minimum scalar multiplications for matrices i..j (1-indexed).
  const m: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  // s[i][j] = the split point for the optimal solution of matrices i..j.
  const s: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );

  // l is the chain length.
  for (let l = 2; l <= n; l++) {
    for (let i = 1; i <= n - l + 1; i++) {
      const j = i + l - 1;
      m[i]![j] = Infinity;

      for (let k = i; k < j; k++) {
        const cost =
          m[i]![k]! + m[k + 1]![j]! + dims[i - 1]! * dims[k]! * dims[j]!;
        if (cost < m[i]![j]!) {
          m[i]![j] = cost;
          s[i]![j] = k;
        }
      }
    }
  }

  function buildParens(i: number, j: number): string {
    if (i === j) return `A${i}`;
    return `(${buildParens(i, s[i]![j]!)}${buildParens(s[i]![j]! + 1, j)})`;
  }

  return {
    minCost: m[1]![n]!,
    parenthesization: buildParens(1, n),
    splits: s,
  };
}
