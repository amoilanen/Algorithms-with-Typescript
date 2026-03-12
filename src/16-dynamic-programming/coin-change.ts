/**
 * Dynamic programming solutions to the coin change problem.
 *
 * Given a set of coin denominations and a target amount, determine the minimum
 * number of coins needed to make that amount, and count the total number of
 * distinct ways to make change.
 *
 * @module
 */

/**
 * Result of the minimum-coins computation.
 *
 * - `minCoins` — the fewest coins needed, or `-1` if the amount cannot be made.
 * - `coins`    — the actual coins used (one valid combination), or an empty
 *                array if the amount cannot be made.
 */
export interface MinCoinsResult {
  minCoins: number;
  coins: number[];
}

/**
 * Find the minimum number of coins needed to make the given `amount`.
 *
 * Uses bottom-up tabulation. `dp[i]` stores the fewest coins needed to make
 * amount `i`. For each amount, we try every denomination and take the best.
 *
 * ### Complexity
 * - Time:  O(amount × denominations.length)
 * - Space: O(amount)
 *
 * @param denominations  Positive integer coin values.
 * @param amount         Non-negative target amount.
 * @returns A {@link MinCoinsResult} with the minimum count and the coins used.
 * @throws {RangeError} If `amount` is negative.
 */
export function minCoinChange(
  denominations: number[],
  amount: number,
): MinCoinsResult {
  if (amount < 0) throw new RangeError('amount must be non-negative');
  if (amount === 0) return { minCoins: 0, coins: [] };

  const dp = new Array<number>(amount + 1).fill(Infinity);
  const parent = new Array<number>(amount + 1).fill(-1);

  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of denominations) {
      if (coin <= i && dp[i - coin]! + 1 < dp[i]!) {
        dp[i] = dp[i - coin]! + 1;
        parent[i] = coin;
      }
    }
  }

  if (dp[amount] === Infinity) {
    return { minCoins: -1, coins: [] };
  }

  // Backtrack to recover the coins used.
  const coins: number[] = [];
  let remaining = amount;
  while (remaining > 0) {
    coins.push(parent[remaining]!);
    remaining -= parent[remaining]!;
  }

  return { minCoins: dp[amount]!, coins };
}

/**
 * Count the number of distinct ways to make change for the given `amount`.
 *
 * Uses bottom-up tabulation. `dp[i]` counts the number of combinations (not
 * permutations) that sum to `i`. By iterating denominations in the outer loop,
 * each combination is counted exactly once.
 *
 * ### Complexity
 * - Time:  O(amount × denominations.length)
 * - Space: O(amount)
 *
 * @param denominations  Positive integer coin values.
 * @param amount         Non-negative target amount.
 * @returns The number of distinct ways to make change.
 * @throws {RangeError} If `amount` is negative.
 */
export function countCoinChange(
  denominations: number[],
  amount: number,
): number {
  if (amount < 0) throw new RangeError('amount must be non-negative');

  const dp = new Array<number>(amount + 1).fill(0);
  dp[0] = 1; // one way to make 0: use no coins

  for (const coin of denominations) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = dp[i]! + dp[i - coin]!;
    }
  }

  return dp[amount]!;
}
