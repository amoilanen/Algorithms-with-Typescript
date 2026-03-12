/**
 * 0/1 Knapsack problem via dynamic programming.
 *
 * Given a set of items, each with a weight and a value, determine the subset
 * of items to include in a knapsack of fixed capacity so that the total value
 * is maximized without exceeding the capacity.
 *
 * @module
 */

/**
 * An item that can be placed into the knapsack.
 */
export interface KnapsackItem {
  weight: number;
  value: number;
}

/**
 * Result of the 0/1 knapsack computation.
 *
 * - `maxValue`      — the maximum total value achievable.
 * - `selectedItems` — indices of the items selected (0-based), sorted in
 *                     ascending order.
 * - `totalWeight`   — the total weight of the selected items.
 */
export interface KnapsackResult {
  maxValue: number;
  selectedItems: number[];
  totalWeight: number;
}

/**
 * Solve the 0/1 knapsack problem using bottom-up tabulation.
 *
 * `dp[i][w]` stores the maximum value achievable using items `0..i-1` with
 * capacity `w`.
 *
 * ### Recurrence
 * ```
 * dp[i][w] = dp[i-1][w]                                    if items[i-1].weight > w
 *          = max(dp[i-1][w], dp[i-1][w - items[i-1].weight] + items[i-1].value)
 * ```
 *
 * ### Complexity
 * - Time:  O(n × W) where n = number of items, W = capacity
 * - Space: O(n × W) for the DP table
 *
 * Note: This is a pseudo-polynomial algorithm — polynomial in the numeric
 * value of W, not in the number of bits needed to represent it.
 *
 * @param items     Array of items with weight and value.
 * @param capacity  Maximum weight capacity (non-negative integer).
 * @returns A {@link KnapsackResult} with the optimal value, selected items,
 *          and total weight.
 * @throws {RangeError} If `capacity` is negative.
 */
export function knapsack(
  items: KnapsackItem[],
  capacity: number,
): KnapsackResult {
  if (capacity < 0) throw new RangeError('capacity must be non-negative');

  const n = items.length;

  // Build the DP table.
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(capacity + 1).fill(0),
  );

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1]!;
    for (let w = 0; w <= capacity; w++) {
      // Don't take item i.
      dp[i]![w] = dp[i - 1]![w]!;

      // Take item i if it fits and improves the value.
      if (item.weight <= w) {
        const withItem = dp[i - 1]![w - item.weight]! + item.value;
        if (withItem > dp[i]![w]!) {
          dp[i]![w] = withItem;
        }
      }
    }
  }

  // Backtrack to find which items were selected.
  const selectedItems: number[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i]![w] !== dp[i - 1]![w]) {
      selectedItems.push(i - 1);
      w -= items[i - 1]!.weight;
    }
  }
  selectedItems.reverse();

  const totalWeight = selectedItems.reduce(
    (sum, idx) => sum + items[idx]!.weight,
    0,
  );

  return {
    maxValue: dp[n]![capacity]!,
    selectedItems,
    totalWeight,
  };
}
