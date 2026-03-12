/**
 * Fractional knapsack problem solved by the greedy strategy: sort items
 * by value-to-weight ratio and greedily pack the most valuable items
 * first, taking fractions when necessary.
 *
 * @module
 */

/**
 * An item that can be placed into the knapsack.
 */
export interface FractionalKnapsackItem {
  weight: number;
  value: number;
}

/**
 * Describes how much of a particular item was packed.
 *
 * - `index`    — the 0-based index of the item in the original array.
 * - `fraction` — the fraction taken, in (0, 1].
 * - `weight`   — the actual weight placed into the knapsack.
 * - `value`    — the actual value obtained from this item.
 */
export interface PackedItem {
  index: number;
  fraction: number;
  weight: number;
  value: number;
}

/**
 * Result of the fractional knapsack computation.
 *
 * - `maxValue`     — the maximum total value achievable.
 * - `totalWeight`  — the total weight of items packed.
 * - `packedItems`  — details about each item (or fraction) packed, sorted
 *                    by descending value-to-weight ratio.
 */
export interface FractionalKnapsackResult {
  maxValue: number;
  totalWeight: number;
  packedItems: PackedItem[];
}

/**
 * Solve the fractional knapsack problem.
 *
 * Unlike the 0/1 knapsack (which is NP-hard), the fractional variant
 * admits a greedy O(n log n) solution: sort items by value/weight ratio
 * in descending order and take as much as possible of each item.
 *
 * ### Complexity
 * - Time:  O(n log n) — dominated by sorting
 * - Space: O(n)
 *
 * @param items     Array of items with weight and value. Not mutated.
 *                  Weights must be positive; values must be non-negative.
 * @param capacity  Maximum weight capacity (must be non-negative).
 * @returns A {@link FractionalKnapsackResult} with the optimal packing.
 * @throws {RangeError} If `capacity` is negative, or any item has
 *         non-positive weight or negative value.
 */
export function fractionalKnapsack(
  items: readonly FractionalKnapsackItem[],
  capacity: number,
): FractionalKnapsackResult {
  if (capacity < 0) {
    throw new RangeError('capacity must be non-negative');
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    if (item.weight <= 0) {
      throw new RangeError(
        `item ${i} weight must be positive, got ${item.weight}`,
      );
    }
    if (item.value < 0) {
      throw new RangeError(
        `item ${i} value must be non-negative, got ${item.value}`,
      );
    }
  }

  // Build indexed array and sort by value/weight ratio descending.
  const indexed = items.map((item, i) => ({
    index: i,
    weight: item.weight,
    value: item.value,
    ratio: item.value / item.weight,
  }));
  indexed.sort((a, b) => b.ratio - a.ratio);

  const packedItems: PackedItem[] = [];
  let remaining = capacity;
  let totalValue = 0;
  let totalWeight = 0;

  for (const item of indexed) {
    if (remaining <= 0) break;

    if (item.weight <= remaining) {
      // Take the whole item.
      packedItems.push({
        index: item.index,
        fraction: 1,
        weight: item.weight,
        value: item.value,
      });
      remaining -= item.weight;
      totalValue += item.value;
      totalWeight += item.weight;
    } else {
      // Take a fraction of the item.
      const fraction = remaining / item.weight;
      const fractionalValue = item.value * fraction;
      packedItems.push({
        index: item.index,
        fraction,
        weight: remaining,
        value: fractionalValue,
      });
      totalValue += fractionalValue;
      totalWeight += remaining;
      remaining = 0;
    }
  }

  return { maxValue: totalValue, totalWeight, packedItems };
}
