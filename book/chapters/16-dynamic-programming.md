# Dynamic Programming

_In the preceding chapters we met two powerful algorithm design paradigms: divide-and-conquer (Chapter 3) breaks a problem into independent subproblems, and greedy algorithms (Chapter 17) build solutions by making locally optimal choices. Dynamic programming (DP) occupies the territory between them. Like divide-and-conquer, it solves problems by combining solutions to subproblems. But unlike divide-and-conquer, those subproblems **overlap** — the same subproblem is needed by many larger subproblems. Instead of recomputing these answers, DP saves them in a table and reuses them, trading space for an often dramatic reduction in time. In this chapter we develop a systematic approach to dynamic programming and apply it to seven classic problems: Fibonacci numbers, coin change, longest common subsequence, edit distance, 0/1 knapsack, matrix chain multiplication, and the longest increasing subsequence._

## When does dynamic programming apply?

A problem is amenable to dynamic programming when it exhibits two properties:

1. **Optimal substructure.** An optimal solution to the problem contains optimal solutions to its subproblems. For example, if the shortest path from $A$ to $C$ passes through $B$, then the sub-path from $A$ to $B$ must itself be a shortest path from $A$ to $B$.

2. **Overlapping subproblems.** The recursive decomposition of the problem leads to the same subproblems being solved many times. If every subproblem were solved only once, there would be nothing to save — and a straightforward divide-and-conquer approach would suffice.

When both properties hold, we can avoid redundant computation by storing subproblem solutions in a table and looking them up rather than recomputing them.

## Memoization vs tabulation

There are two standard ways to implement dynamic programming:

### Top-down with memoization

Start from the original problem and recurse. Before computing a subproblem, check whether its solution is already cached. If so, return the cached value; otherwise, compute it, cache it, and return it. This approach is sometimes called **memoization** (from "memo" — a note to oneself).

Advantages:

- Only solves subproblems that are actually needed.
- The recursive structure mirrors the mathematical recurrence directly.

Disadvantages:

- Recursion overhead (call stack).
- Possible stack overflow on very deep recursions.

### Bottom-up with tabulation

Solve subproblems in an order such that when we need a subproblem's solution, it has already been computed. Typically this means solving subproblems from "smallest" to "largest" using iterative loops and storing results in an array or table.

Advantages:

- No recursion overhead.
- Constant per-subproblem overhead.
- Often allows space optimization (keeping only the last row or two of the table).

Disadvantages:

- Must determine a valid computation order in advance.
- May compute subproblems that are not needed for the final answer.

In practice, bottom-up tabulation is more common because it avoids stack overhead and enables space optimizations. We use it for most examples in this chapter.

## A systematic approach to DP

For each problem in this chapter, we follow a five-step recipe:

1. **Define subproblems.** Characterize the space of subproblems in terms of one or more indices (or parameters).
2. **Write the recurrence.** Express the solution to a subproblem in terms of solutions to smaller subproblems.
3. **Identify base cases.** Determine the values of the smallest subproblems directly.
4. **Determine computation order.** Choose an order in which to fill the table so that dependencies are satisfied.
5. **Recover the solution.** Extract the answer from the table, and optionally backtrack to find the actual solution (not just its value).

## Fibonacci numbers: the introductory example

The Fibonacci sequence is defined by:

$$F(0) = 0, \quad F(1) = 1, \quad F(n) = F(n-1) + F(n-2) \quad \text{for } n \geq 2$$

This is the simplest illustration of how DP transforms an exponential algorithm into a linear one.

### Naive recursion

Directly translating the recurrence into code:

```typescript
export function fibNaive(n: number): number {
  if (n < 0) throw new RangeError('n must be non-negative');
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}
```

The recursion tree for $F(5)$ shows massive redundancy:

```
                    F(5)
                  /      \
              F(4)        F(3)
            /     \       /   \
         F(3)    F(2)  F(2)  F(1)
        /   \   /  \   /  \
     F(2) F(1) F(1) F(0) F(1) F(0)
     / \
  F(1) F(0)
```

$F(3)$ is computed twice, $F(2)$ three times, and so on. The total number of calls grows exponentially — $O(2^n)$ — because the same subproblems are solved over and over.

### Top-down with memoization

Adding a cache eliminates the redundancy:

```typescript
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
```

Now each subproblem $F(k)$ is computed at most once and then looked up in $O(1)$ time, giving $O(n)$ total time and $O(n)$ space.

### Bottom-up with tabulation

We can go further by eliminating the recursion entirely. Since $F(n)$ only depends on $F(n-1)$ and $F(n-2)$, we need to store only two values at any time:

```typescript
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
```

**Complexity.** Time $O(n)$, space $O(1)$.

The progression from $O(2^n)$ time to $O(n)$ time with $O(1)$ space is the essence of dynamic programming.

## Coin change

The **coin change problem** has two variants:

1. **Minimum coins:** Given denominations $d_1, d_2, \ldots, d_k$ and a target amount $A$, find the fewest coins that sum to $A$.
2. **Count ways:** Count the number of distinct combinations of coins that sum to $A$.

### Minimum coins

**Sub-problems.** Let $dp[i]$ be the minimum number of coins needed to make amount $i$.

**Recurrence.**

$$dp[i] = \min_{d_j \leq i} \left( dp[i - d_j] + 1 \right)$$

**Base case.** $dp[0] = 0$ (zero coins to make amount zero).

**Computation order.** Fill $dp[1], dp[2], \ldots, dp[A]$ in increasing order.

```typescript
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
```

**Complexity.** Time $O(A \cdot k)$ where $A$ is the amount and $k$ is the number of denominations. Space $O(A)$.

**Example.** Denominations $\{1, 5, 6\}$, amount 11. A greedy approach would pick $6 + 5 = 11$ (2 coins), which happens to be optimal. For amount 10, however, greedy picks $6 + 1 + 1 + 1 + 1 = 10$ (5 coins), while the optimal is $5 + 5 = 10$ (2 coins). Dynamic programming always finds the minimum.

### Counting the number of ways

To count the number of distinct **combinations** (not permutations) that sum to $A$, we iterate denominations in the outer loop to avoid counting the same combination multiple times:

```typescript
export function countCoinChange(denominations: number[], amount: number): number {
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
```

**Complexity.** Time $O(A \cdot k)$, space $O(A)$.

The key subtlety is the loop order. If we iterated amounts in the outer loop and denominations in the inner loop, we would count permutations ($1 + 2$ and $2 + 1$ as separate), not combinations.

## Longest common subsequence

Given two sequences $X = \langle x_1, \ldots, x_m \rangle$ and $Y = \langle y_1, \ldots, y_n \rangle$, a **common subsequence** is a sequence that appears (in order, but not necessarily contiguously) in both $X$ and $Y$. The **longest common subsequence** (LCS) problem asks for a common subsequence of maximum length.

**Applications.** LCS is fundamental in:

- **`diff` utilities** — computing the minimal set of changes between two files.
- **Bioinformatics** — comparing DNA, RNA, or protein sequences.
- **Version control** — finding differences between file versions.

### The DP formulation

**Sub-problems.** Let $dp[i][j]$ be the length of the LCS of $X[1..i]$ and $Y[1..j]$.

**Recurrence.**

$$dp[i][j] = \begin{cases} dp[i-1][j-1] + 1 & \text{if } x_i = y_j \\ \max(dp[i-1][j],\; dp[i][j-1]) & \text{otherwise} \end{cases}$$

**Base cases.** $dp[0][j] = dp[i][0] = 0$ for all $i, j$.

**Computation order.** Fill the table row by row, left to right.

The intuition: if the last characters match, they must be part of an optimal alignment, so we include them and recurse on the remaining prefixes. If they do not match, we try dropping the last character from each sequence and take the better result.

```typescript
export function lcs<T>(a: readonly T[], b: readonly T[]): LCSResult<T> {
  const m = a.length;
  const n = b.length;

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
```

**Complexity.** Time $O(mn)$, space $O(mn)$.

**Example.** For $X = \text{ABCBDAB}$ and $Y = \text{BDCABA}$, the LCS has length 4 — one solution is BCBA.

### Space optimization

If we only need the LCS **length** (not the actual subsequence), we can reduce space to $O(\min(m, n))$ by keeping only two rows of the table at a time: the previous row and the current row.

## Edit distance

The **edit distance** (or **Levenshtein distance**) between two strings $a$ and $b$ is the minimum number of single-character operations needed to transform $a$ into $b$. The allowed operations are:

- **Insert** a character into $a$.
- **Delete** a character from $a$.
- **Substitute** one character in $a$ with another.

Edit distance is closely related to LCS — in fact, the edit distance between two strings of lengths $m$ and $n$ is $m + n - 2 \cdot \text{LCS}(a, b)$ when only insertions and deletions are allowed. With substitutions, the relationship is more nuanced.

**Applications.** Edit distance is used in spell checkers, DNA sequence alignment, natural language processing, and fuzzy string matching.

### The DP formulation

**Sub-problems.** Let $dp[i][j]$ be the edit distance between $a[1..i]$ and $b[1..j]$.

**Recurrence.**

$$dp[i][j] = \begin{cases} dp[i-1][j-1] & \text{if } a_i = b_j \\ 1 + \min\bigl(dp[i-1][j],\; dp[i][j-1],\; dp[i-1][j-1]\bigr) & \text{otherwise} \end{cases}$$

The three terms in the minimum correspond to:

- $dp[i-1][j] + 1$: delete $a_i$.
- $dp[i][j-1] + 1$: insert $b_j$.
- $dp[i-1][j-1] + 1$: substitute $a_i$ with $b_j$.

**Base cases.** $dp[i][0] = i$ (delete all characters from $a$) and $dp[0][j] = j$ (insert all characters of $b$).

```typescript
export function editDistance(a: string, b: string): EditDistanceResult {
  const m = a.length;
  const n = b.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );

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
            dp[i - 1]![j]!,      // delete
            dp[i]![j - 1]!,      // insert
            dp[i - 1]![j - 1]!,  // substitute
          );
      }
    }
  }

  // ... backtrack to recover operations ...

  return { distance: dp[m]![n]!, operations };
}
```

**Complexity.** Time $O(mn)$, space $O(mn)$.

**Example.** `kitten` → `sitting` requires 3 operations:

1. Substitute `k` → `s` (`sitten`)
2. Substitute `e` → `i` (`sittin`)
3. Insert `g` at the end (`sitting`)

### Recovering the edit script

By backtracking through the DP table from $dp[m][n]$ to $dp[0][0]$, we can recover the actual sequence of edit operations. At each cell, we determine which operation was used (match, substitute, insert, or delete) by comparing the cell's value with its neighbors. Our implementation returns an array of `EditStep` objects, each recording the operation type and the characters involved.

## 0/1 Knapsack

The **0/1 knapsack problem** models a fundamental resource allocation trade-off: given $n$ items, each with a weight $w_i$ and a value $v_i$, and a knapsack of capacity $W$, select a subset of items that maximizes total value without exceeding the capacity.

The "0/1" qualifier means each item is either taken or left — no fractions. This distinguishes it from the **fractional knapsack** problem (Chapter 17), which has a greedy solution.

### The DP formulation

**Sub-problems.** Let $dp[i][w]$ be the maximum value achievable using items $1, \ldots, i$ with capacity $w$.

**Recurrence.**

$$dp[i][w] = \begin{cases} dp[i-1][w] & \text{if } w_i > w \\ \max\bigl(dp[i-1][w],\; dp[i-1][w - w_i] + v_i\bigr) & \text{otherwise} \end{cases}$$

For each item, we choose the better of two options: skip it (value stays at $dp[i-1][w]$) or take it (add its value to the best we can do with the remaining capacity).

**Base cases.** $dp[0][w] = 0$ for all $w$ (no items, no value).

```typescript
export function knapsack(items: KnapsackItem[], capacity: number): KnapsackResult {
  if (capacity < 0) throw new RangeError('capacity must be non-negative');

  const n = items.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(capacity + 1).fill(0),
  );

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1]!;
    for (let w = 0; w <= capacity; w++) {
      dp[i]![w] = dp[i - 1]![w]!;
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

  return { maxValue: dp[n]![capacity]!, selectedItems, totalWeight };
}
```

**Complexity.** Time $O(nW)$, space $O(nW)$.

**Important caveat.** This is a **pseudo-polynomial** algorithm. The running time depends on the **numeric value** of $W$, not on the number of bits needed to represent it. If $W$ is exponentially large in the input size, the algorithm becomes exponential. This distinction is crucial when discussing NP-completeness (Chapter 21) — the 0/1 knapsack problem is NP-hard, and the pseudo-polynomial algorithm does not contradict this.

**Example.** Items: $(w=10, v=60)$, $(w=20, v=100)$, $(w=30, v=120)$. Capacity: 50. The optimal selection is items 2 and 3 (weight 50, value 220).

### Space optimization

Since row $i$ depends only on row $i-1$, we can reduce space to $O(W)$ by using a single 1D array and iterating weights in **decreasing** order (to avoid using an item twice):

```
for each item:
    for w = W down to item.weight:
        dp[w] = max(dp[w], dp[w - item.weight] + item.value)
```

However, this optimization prevents us from backtracking to recover which items were selected, since the full table is no longer available.

## Matrix chain multiplication

Given a chain of $n$ matrices $A_1, A_2, \ldots, A_n$ where matrix $A_i$ has dimensions $p_{i-1} \times p_i$, we want to parenthesize the product $A_1 A_2 \cdots A_n$ to **minimize the total number of scalar multiplications**.

Matrix multiplication is associative, so any parenthesization yields the same result. But the cost varies dramatically. For three matrices with dimensions $10 \times 20$, $20 \times 30$, $30 \times 40$:

- $(A_1 A_2) A_3$: cost $= 10 \cdot 20 \cdot 30 + 10 \cdot 30 \cdot 40 = 6000 + 12000 = 18000$
- $A_1 (A_2 A_3)$: cost $= 20 \cdot 30 \cdot 40 + 10 \cdot 20 \cdot 40 = 24000 + 8000 = 32000$

The first parenthesization is nearly twice as fast.

### The DP formulation

**Sub-problems.** Let $m[i][j]$ be the minimum number of scalar multiplications needed to compute the product $A_i A_{i+1} \cdots A_j$.

**Recurrence.**

$$m[i][j] = \min_{i \leq k < j} \left( m[i][k] + m[k+1][j] + p_{i-1} \cdot p_k \cdot p_j \right)$$

The idea: split the chain at position $k$, compute the two sub-chains optimally, and add the cost of multiplying the resulting two matrices.

**Base cases.** $m[i][i] = 0$ (a single matrix requires no multiplication).

**Computation order.** Solve by increasing chain length $\ell = j - i + 1$.

```typescript
export function matrixChainOrder(dims: number[]): MatrixChainResult {
  if (dims.length < 2) {
    throw new Error('dims must have at least 2 elements (at least one matrix)');
  }

  const n = dims.length - 1;

  const m: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  const s: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );

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

  return {
    minCost: m[1]![n]!,
    parenthesization: buildParens(s, 1, n),
    splits: s,
  };
}
```

**Complexity.** Time $O(n^3)$, space $O(n^2)$.

The split table $s$ records where the optimal split occurs for each sub-chain. We use it to reconstruct the optimal parenthesization recursively:

```typescript
function buildParens(s: number[][], i: number, j: number): string {
  if (i === j) return `A${i}`;
  return `(${buildParens(s, i, s[i]![j]!)}${buildParens(s, s[i]![j]! + 1, j)})`;
}
```

**Example.** The classic CLRS example with dimensions $[30, 35, 15, 5, 10, 20, 25]$ yields an optimal cost of 15,125 scalar multiplications.

## Longest increasing subsequence

Given a sequence of numbers $a_1, a_2, \ldots, a_n$, the **longest increasing subsequence** (LIS) is the longest subsequence $a_{i_1}, a_{i_2}, \ldots, a_{i_k}$ such that $i_1 < i_2 < \cdots < i_k$ and $a_{i_1} < a_{i_2} < \cdots < a_{i_k}$.

**Applications.** LIS appears in patience sorting, version tracking, and computational geometry (longest chain of points dominated by each other).

### O(n²) dynamic programming

**Sub-problems.** Let $dp[i]$ be the length of the longest increasing subsequence ending at position $i$.

**Recurrence.**

$$dp[i] = 1 + \max_{j < i,\; a_j < a_i} dp[j]$$

(If no such $j$ exists, $dp[i] = 1$.)

**Base cases.** $dp[i] = 1$ for all $i$ (each element is an increasing subsequence of length 1 by itself).

```typescript
export function lisDP(arr: readonly number[]): LISResult {
  const n = arr.length;
  if (n === 0) return { length: 0, subsequence: [] };

  const dp = new Array<number>(n).fill(1);
  const parent = new Array<number>(n).fill(-1);

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j]! < arr[i]! && dp[j]! + 1 > dp[i]!) {
        dp[i] = dp[j]! + 1;
        parent[i] = j;
      }
    }
  }

  // Find the index where the LIS ends.
  let bestLen = 0;
  let bestIdx = 0;
  for (let i = 0; i < n; i++) {
    if (dp[i]! > bestLen) {
      bestLen = dp[i]!;
      bestIdx = i;
    }
  }

  // Backtrack to recover the subsequence.
  const subsequence: number[] = [];
  let idx = bestIdx;
  while (idx !== -1) {
    subsequence.push(arr[idx]!);
    idx = parent[idx]!;
  }
  subsequence.reverse();

  return { length: bestLen, subsequence };
}
```

**Complexity.** Time $O(n^2)$, space $O(n)$.

### O(n log n) patience sorting

We can improve to $O(n \log n)$ using a technique inspired by the card game Patience. Maintain an array `tails` where `tails[i]` is the smallest tail element of all increasing subsequences of length $i + 1$ found so far.

For each element in the input:

- **Binary search** for the leftmost position in `tails` where `tails[pos] >= val`.
- Replace `tails[pos]` with `val` (or extend `tails` if `val` is larger than all current tails).

The key invariant is that `tails` is always sorted, which is what makes binary search possible.

```typescript
export function lisBinarySearch(arr: readonly number[]): LISResult {
  const n = arr.length;
  if (n === 0) return { length: 0, subsequence: [] };

  const tails: number[] = [];
  const tailIndices: number[] = [];
  const parent = new Array<number>(n).fill(-1);

  for (let i = 0; i < n; i++) {
    const val = arr[i]!;

    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (tails[mid]! < val) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    tails[lo] = val;
    tailIndices[lo] = i;

    if (lo > 0) {
      parent[i] = tailIndices[lo - 1]!;
    }
  }

  // Backtrack to recover the subsequence.
  const length = tails.length;
  const subsequence: number[] = [];
  let idx = tailIndices[length - 1]!;
  for (let k = 0; k < length; k++) {
    subsequence.push(arr[idx]!);
    idx = parent[idx]!;
  }
  subsequence.reverse();

  return { length, subsequence };
}
```

**Complexity.** Time $O(n \log n)$, space $O(n)$.

**Example.** For the sequence $[0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15]$, the LIS has length 6. One such subsequence is $[0, 2, 6, 9, 11, 15]$.

## Summary of DP problems

| Problem | Sub-problem space | Recurrence | Time | Space |
|---------|------------------|------------|------|-------|
| Fibonacci | $F(n)$ | $F(n) = F(n-1) + F(n-2)$ | $O(n)$ | $O(1)$ |
| Min coin change | $dp[i]$: min coins for amount $i$ | $dp[i] = 1 + \min dp[i-d_j]$ | $O(Ak)$ | $O(A)$ |
| LCS | $dp[i][j]$: LCS of prefixes | match or skip | $O(mn)$ | $O(mn)$ |
| Edit distance | $dp[i][j]$: edit dist of prefixes | match, sub, ins, del | $O(mn)$ | $O(mn)$ |
| 0/1 Knapsack | $dp[i][w]$: best value, items $1..i$, cap $w$ | take or skip item $i$ | $O(nW)$ | $O(nW)$ |
| Matrix chain | $m[i][j]$: min cost for $A_i \cdots A_j$ | split at $k$ | $O(n^3)$ | $O(n^2)$ |
| LIS | $dp[i]$: LIS ending at $i$ | extend from $j < i$ | $O(n \log n)$ | $O(n)$ |

## Exercises

1. **Rod cutting.** Given a rod of length $n$ and a price table $p[1..n]$ where $p[i]$ is the price of a rod of length $i$, find the maximum revenue obtainable by cutting the rod into pieces. Write the recurrence, implement both top-down and bottom-up solutions, and analyze their complexity.

2. **Subset sum.** Given a set of positive integers $S$ and a target $T$, determine whether there exists a subset of $S$ that sums to $T$. Define the subproblems, write the recurrence, and implement a tabulated solution. What is the relationship between this problem and 0/1 knapsack?

3. **Counting LCS.** Modify the LCS algorithm to count the **number of distinct** longest common subsequences (not just find one). What changes are needed in the recurrence and the table?

4. **Weighted edit distance.** Generalize the edit distance algorithm so that insertions, deletions, and substitutions can have different costs (not all equal to 1). For example, in DNA alignment, a substitution between similar nucleotides might cost less than one between dissimilar nucleotides. Implement this generalization and verify it on a test case.

5. **LIS and LCS connection.** Prove that the LIS problem can be reduced to LCS by computing the LCS of the original sequence and its sorted version. Is this reduction efficient? When would you prefer the $O(n \log n)$ patience-sorting approach over the LCS-based approach?

## Chapter summary

Dynamic programming transforms problems with exponential brute-force solutions into efficient polynomial-time algorithms by exploiting **optimal substructure** and **overlapping subproblems**. The key insight is simple: do not recompute — remember. Whether through top-down memoization or bottom-up tabulation, DP systematically stores solutions to subproblems and builds toward the final answer.

We saw this principle in action across seven problems: from the elementary Fibonacci sequence (which illustrates the core idea) to sophisticated optimization problems like matrix chain multiplication and the knapsack problem. Each problem followed the same five-step recipe: define subproblems, write the recurrence, identify base cases, determine computation order, and recover the solution.

In the next chapter, we turn to **greedy algorithms** — a complementary design paradigm that, when applicable, yields even simpler and more efficient solutions than DP. The key challenge with greedy algorithms is proving that the locally optimal choice at each step leads to a globally optimal solution — a property that holds for some problems but not others. Understanding when to use DP and when to use greedy is one of the most important skills in algorithm design.
