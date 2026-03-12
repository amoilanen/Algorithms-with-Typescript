/**
 * Three implementations of the Fibonacci sequence to illustrate the
 * progression from naive recursion to dynamic programming.
 *
 * The Fibonacci numbers are defined by the recurrence:
 *   F(0) = 0,  F(1) = 1,  F(n) = F(n − 1) + F(n − 2)  for n ≥ 2.
 *
 * @module
 */

/**
 * Compute the n-th Fibonacci number using naive recursion.
 *
 * This directly mirrors the mathematical definition but recomputes the same
 * subproblems an exponential number of times.
 *
 * ### Complexity
 * - Time:  O(2ⁿ) — each call branches into two sub-calls.
 * - Space: O(n) — maximum call-stack depth.
 *
 * @param n  A non-negative integer.
 * @returns  The n-th Fibonacci number.
 * @throws {RangeError} If n is negative.
 */
export function fibNaive(n: number): number {
  if (n < 0) throw new RangeError('n must be non-negative');
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

/**
 * Compute the n-th Fibonacci number using top-down dynamic programming
 * (memoization).
 *
 * A cache stores previously computed values so that each subproblem is solved
 * at most once.
 *
 * ### Complexity
 * - Time:  O(n) — each of the n + 1 subproblems is computed once.
 * - Space: O(n) — for the memoization table and the call stack.
 *
 * @param n  A non-negative integer.
 * @returns  The n-th Fibonacci number.
 * @throws {RangeError} If n is negative.
 */
export function fibMemo(n: number): number {
  if (n < 0) throw new RangeError('n must be non-negative');

  const memo = new Map<number, number>();

  function fib(k: number): number {
    if (k <= 1) return k;
    const cached = memo.get(k);
    if (cached !== undefined) return cached;
    const result = fib(k - 1) + fib(k - 2);
    memo.set(k, result);
    return result;
  }

  return fib(n);
}

/**
 * Compute the n-th Fibonacci number using bottom-up dynamic programming
 * (tabulation).
 *
 * Iterates from the base cases upward, storing only the two most recent
 * values. This eliminates recursion overhead and minimizes memory usage.
 *
 * ### Complexity
 * - Time:  O(n)
 * - Space: O(1)
 *
 * @param n  A non-negative integer.
 * @returns  The n-th Fibonacci number.
 * @throws {RangeError} If n is negative.
 */
export function fibTabulated(n: number): number {
  if (n < 0) throw new RangeError('n must be non-negative');
  if (n <= 1) return n;

  let prev2 = 0;
  let prev1 = 1;

  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}
