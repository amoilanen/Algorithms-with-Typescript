# Efficient Sorting

_In Chapter 4 we proved that any comparison-based sorting algorithm must make $\Omega(n \log n)$ comparisons in the worst case. The three elementary algorithms we studied — bubble sort, selection sort, and insertion sort — fall short of this bound, requiring $\Theta(n^2)$ time. In this chapter we meet three algorithms that close the gap: merge sort, quicksort, and heapsort. All three achieve $O(n \log n)$ time and are, in different senses, asymptotically optimal. They use the divide-and-conquer strategy from Chapter 3, but apply it in very different ways — merge sort divides trivially and combines carefully, quicksort divides carefully and combines trivially, and heapsort uses a heap data structure to repeatedly extract the maximum. We also study randomized quicksort, which uses random pivot selection to guarantee expected $O(n \log n)$ performance on every input._

## Merge sort

Merge sort is the most straightforward application of divide-and-conquer to sorting. The idea is simple: split the array in half, recursively sort each half, and then merge the two sorted halves into a single sorted array.

### The algorithm

The recursive (top-down) formulation of merge sort is:

1. If the array has zero or one elements, it is already sorted. Return.
2. Divide the array into two halves of roughly equal size.
3. Recursively sort each half.
4. Merge the two sorted halves into a single sorted array using an efficient $O(n)$ merge procedure.

Notice that the divide step (step 2) does no real work — it simply computes a midpoint. The recursive sort (step 3) keeps splitting until it reaches single-element subarrays, which are trivially sorted. All the real work happens in the merge step (step 4). Since the recursive splitting always ends the same way — $n$ individual elements — we can skip it entirely and work bottom-up:

1. Start with $n$ runs of length 1 (each individual element is a trivially sorted run).
2. Set the run length $w = 1$.
3. While $w < n$:
   - Merge each adjacent pair of sorted runs of length $w$ into a sorted run of length $2w$ using an efficient $O(w)$ merge procedure.
   - Double the run length: $w = 2w$.

This bottom-up formulation performs exactly the same merges as the recursive version but avoids the $O(\log n)$ recursion stack. It is the version we will implement.

The key insight shared by both formulations is that merging two sorted arrays of total length $n$ takes $O(n)$ time: we scan both arrays from left to right, always taking the smaller of the two current elements.

### The merge procedure

The merge step is the heart of the algorithm. Given an array `arr` and indices `start`, `middle`, and `end`, we merge the sorted subarrays `arr[start..middle)` and `arr[middle..end)` into a single sorted subarray `arr[start..end)`.

```typescript
export function merge<T>(
  arr: T[],
  start: number,
  middle: number,
  end: number,
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): void {
  const sorted: T[] = [];
  let i = start;
  let j = middle;

  while (i < middle && j < end) {
    if (comparator(arr[i]!, arr[j]!) <= 0) {
      sorted.push(arr[i]!);
      i++;
    } else {
      sorted.push(arr[j]!);
      j++;
    }
  }
  while (i < middle) {
    sorted.push(arr[i]!);
    i++;
  }
  while (j < end) {
    sorted.push(arr[j]!);
    j++;
  }

  i = start;
  while (i < end) {
    arr[i] = sorted[i - start]!;
    i++;
  }
}
```

The comparison `<= 0` (rather than `< 0`) ensures _stability_: when two elements are equal, the one from the left subarray comes first, preserving original order.

### Tracing the merge procedure

To understand how merge works step by step, let us trace through two small examples.

**Example 1:** merge the sorted subarrays $[2, 8]$ and $[4, 5]$.

We initialize two pointers: $i$ at the start of the left subarray and $j$ at the start of the right subarray. At each step, we compare the elements at $i$ and $j$, take the smaller one into the auxiliary array `sorted`, and advance the corresponding pointer. When one subarray is exhausted, we append the remainder of the other.

| # | `arr[i]` | `arr[j]` | Comparison | Action | `sorted` |
|---|----------|----------|------------|--------|----------|
| 1 | 2 | 4 | $2 \leq 4$? Yes | Take 2 from left, $i$++ | $[2]$ |
| 2 | 8 | 4 | $8 \leq 4$? No | Take 4 from right, $j$++ | $[2, 4]$ |
| 3 | 8 | 5 | $8 \leq 5$? No | Take 5 from right, $j$++ | $[2, 4, 5]$ |
| 4 | 8 | — | Right exhausted | Append remaining from left | $[2, 4, 5, 8]$ |

The right subarray is exhausted after step 3 (both of its elements have been taken). The remaining element from the left subarray (8) is appended. The auxiliary array `sorted` = $[2, 4, 5, 8]$ is then copied back into the corresponding positions of the original array.

**Example 2:** merge the sorted subarrays $[1, 3, 6]$ and $[2]$.

| # | `arr[i]` | `arr[j]` | Comparison | Action | `sorted` |
|---|----------|----------|------------|--------|----------|
| 1 | 1 | 2 | $1 \leq 2$? Yes | Take 1 from left, $i$++ | $[1]$ |
| 2 | 3 | 2 | $3 \leq 2$? No | Take 2 from right, $j$++ | $[1, 2]$ |
| 3 | 3 | — | Right exhausted | Append remaining from left | $[1, 2, 3, 6]$ |

The right subarray has only one element. After it is taken in step 2, the right subarray is exhausted and we append the remaining elements from the left subarray (3 and 6) in order. The merge procedure handles subarrays of unequal length naturally — the two "cleanup" loops in the code (lines 43–50) append whichever subarray still has remaining elements.

### Tracing through an example

Let us sort $A = [38, 27, 43, 3, 9, 82, 10]$ using the bottom-up approach.

**The divide phase is implicit.** Had we used the recursive (top-down) formulation, the algorithm would begin by splitting the array in half through recursive calls, producing the following tree of subproblems:

```
                [38, 27, 43, 3, 9, 82, 10]
               /                          \
        [38, 27, 43, 3]             [9, 82, 10]
        /            \               /        \
    [38, 27]      [43, 3]       [9, 82]     [10]
    /     \       /     \       /     \
  [38]   [27]  [43]    [3]   [9]   [82]
```

As discussed above, this divide phase performs no useful work — it merely determines which subarrays to merge. Our bottom-up implementation skips it entirely, starting from single-element runs and doubling the run length each iteration.

**Iteration 1** (`step = 2`): merge pairs of 1-element runs into sorted 2-element runs.

Merge of $[38]$ and $[27]$ — `merge(arr, 0, 1, 2)`:

| # | `arr[i]` | `arr[j]` | Comparison | Action | `sorted` |
|---|----------|----------|------------|--------|----------|
| 1 | 38 | 27 | $38 \leq 27$? No | Take 27 from right, $j$++ | $[27]$ |
| 2 | 38 | — | Right exhausted | Append remaining from left | $[27, 38]$ |

Merge of $[43]$ and $[3]$ — `merge(arr, 2, 3, 4)`:

| # | `arr[i]` | `arr[j]` | Comparison | Action | `sorted` |
|---|----------|----------|------------|--------|----------|
| 1 | 43 | 3 | $43 \leq 3$? No | Take 3 from right, $j$++ | $[3]$ |
| 2 | 43 | — | Right exhausted | Append remaining from left | $[3, 43]$ |

Merge of $[9]$ and $[82]$ — `merge(arr, 4, 5, 6)`:

| # | `arr[i]` | `arr[j]` | Comparison | Action | `sorted` |
|---|----------|----------|------------|--------|----------|
| 1 | 9 | 82 | $9 \leq 82$? Yes | Take 9 from left, $i$++ | $[9]$ |
| 2 | — | 82 | Left exhausted | Append remaining from right | $[9, 82]$ |

The element 10 at index 6 has no partner to merge with (the array has odd length), so it remains as a 1-element run.

Array after iteration 1: $[\underbrace{27, 38},\ \underbrace{3, 43},\ \underbrace{9, 82},\ \underbrace{10}]$.

**Iteration 2** (`step = 4`): merge pairs of 2-element runs into sorted 4-element runs.

Merge of $[27, 38]$ and $[3, 43]$ — `merge(arr, 0, 2, 4)`:

| # | `arr[i]` | `arr[j]` | Comparison | Action | `sorted` |
|---|----------|----------|------------|--------|----------|
| 1 | 27 | 3 | $27 \leq 3$? No | Take 3 from right, $j$++ | $[3]$ |
| 2 | 27 | 43 | $27 \leq 43$? Yes | Take 27 from left, $i$++ | $[3, 27]$ |
| 3 | 38 | 43 | $38 \leq 43$? Yes | Take 38 from left, $i$++ | $[3, 27, 38]$ |
| 4 | — | 43 | Left exhausted | Append remaining from right | $[3, 27, 38, 43]$ |

Merge of $[9, 82]$ and $[10]$ — `merge(arr, 4, 6, 7)`:

| # | `arr[i]` | `arr[j]` | Comparison | Action | `sorted` |
|---|----------|----------|------------|--------|----------|
| 1 | 9 | 10 | $9 \leq 10$? Yes | Take 9 from left, $i$++ | $[9]$ |
| 2 | 82 | 10 | $82 \leq 10$? No | Take 10 from right, $j$++ | $[9, 10]$ |
| 3 | 82 | — | Right exhausted | Append remaining from left | $[9, 10, 82]$ |

Array after iteration 2: $[\underbrace{3, 27, 38, 43},\ \underbrace{9, 10, 82}]$.

**Iteration 3** (`step = 8`): merge the two remaining runs into a single sorted array.

Merge of $[3, 27, 38, 43]$ and $[9, 10, 82]$ — `merge(arr, 0, 4, 7)`:

| # | `arr[i]` | `arr[j]` | Comparison | Action | `sorted` |
|---|----------|----------|------------|--------|----------|
| 1 | 3 | 9 | $3 \leq 9$? Yes | Take 3 from left, $i$++ | $[3]$ |
| 2 | 27 | 9 | $27 \leq 9$? No | Take 9 from right, $j$++ | $[3, 9]$ |
| 3 | 27 | 10 | $27 \leq 10$? No | Take 10 from right, $j$++ | $[3, 9, 10]$ |
| 4 | 27 | 82 | $27 \leq 82$? Yes | Take 27 from left, $i$++ | $[3, 9, 10, 27]$ |
| 5 | 38 | 82 | $38 \leq 82$? Yes | Take 38 from left, $i$++ | $[3, 9, 10, 27, 38]$ |
| 6 | 43 | 82 | $43 \leq 82$? Yes | Take 43 from left, $i$++ | $[3, 9, 10, 27, 38, 43]$ |
| 7 | — | 82 | Left exhausted | Append remaining from right | $[3, 9, 10, 27, 38, 43, 82]$ |

Array after iteration 3: $[\underbrace{3, 9, 10, 27, 38, 43, 82}_{\text{sorted}}]$.

Result: $[3, 9, 10, 27, 38, 43, 82]$.

Notice how the bottom-up approach performs exactly the same merges that the recursive version would, but in a simple iterative pattern: each iteration doubles the run length, and the algorithm terminates after $\lceil \log_2 7 \rceil = 3$ iterations. The total number of element comparisons across all merges is 14 — fewer than the $n(n-1)/2 = 21$ comparisons that an elementary $O(n^2)$ algorithm would make on the same input. The difference is modest here, but it grows rapidly with input size: merge sort makes $O(n \log n)$ comparisons versus $O(n^2)$, so for large $n$ the savings are enormous.

### Bottom-up implementation

Here is the bottom-up formulation described above, which performs the same merges as the recursive version but avoids the recursion stack.

```typescript
export function mergeSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  let step = 1;

  while (step < elements.length) {
    step = step * 2;
    for (let start = 0; start < elements.length; start = start + step) {
      const middle = Math.min(start + step / 2, elements.length);
      const end = Math.min(start + step, elements.length);

      merge(elements, start, middle, end, comparator);
    }
  }
  return elements;
}
```

The bottom-up approach has the same time complexity as the recursive version but avoids the $O(\log n)$ recursion stack overhead.

### Correctness

**Claim.** The merge procedure merges two sorted subarrays into a single sorted subarray.

At each step of the main loop, we choose the smaller of the two current front elements. Since both subarrays are sorted, the current front element of each is the smallest remaining element in that subarray. Therefore, the smaller of the two fronts is the smallest remaining element overall. After the main loop, one subarray is exhausted. Every remaining element in the other subarray is greater than or equal to the last element placed into the merged result (otherwise it would have been chosen earlier), and these remaining elements are already sorted among themselves, so appending them preserves the sorted order. The result is a sorted permutation of all elements from both subarrays. The `<= 0` comparison ensures that equal elements from the left subarray come first, preserving stability.

**Claim.** Merge sort correctly sorts the array.

We argue by induction on the run length.

_Base case._ In the first iteration (`step = 2`), each merge operates on runs of length 1, which are trivially sorted. By the merge claim above, each merge produces a sorted run of length 2.

_Inductive step._ Assume that after iteration $k$ every run has length $2^k$ and is sorted. In iteration $k + 1$, the merge procedure combines each pair of sorted runs of length $2^k$ into a sorted run of length $2^{k+1}$, which is sorted by the merge claim.

After $\lceil \log_2 n \rceil$ iterations, the entire array is a single sorted run. $\square$

### Complexity analysis

**Time.** At each level of the merge tree, the total work across all merges is $O(n)$ (each element is compared and copied once). The number of levels is $\lceil \log_2 n \rceil$. Therefore:

$$T(n) = O(n \log n).$$

This holds in the best case, worst case, and average case — merge sort is _not_ adaptive to the input's presortedness.

The same result follows from the recurrence for the recursive version:

$$T(n) = 2T(n/2) + O(n), \quad T(1) = O(1).$$

By the Master Theorem (case 2, with $a = 2$, $b = 2$, $f(n) = O(n)$), we get $T(n) = O(n \log n)$.

_Exact worst-case comparison count._ While $O(n \log n)$ captures the growth rate, we can pin down the exact number of comparisons. The key observation is that merging two sorted arrays of sizes $a$ and $b$ requires at most $a + b - 1$ comparisons in the worst case — when the elements are fully interleaved, so we must exhaust both arrays before the merge is complete. (In the best case, all elements of one array are smaller than all elements of the other, requiring only $\min(a, b)$ comparisons.)

For $n = 2^k$, every split is perfectly even and the recursion tree has $k = \log_2 n$ levels of merging. At level $j$ (counting from the bottom), there are $n / 2^j$ merges, each combining two arrays of size $2^{j-1}$ with at most $2^j - 1$ comparisons:

$$\frac{n}{2^j}\,(2^j - 1) = n - \frac{n}{2^j}.$$

Summing over all $k$ levels:

$$W(n) = \sum_{j=1}^{k}\!\left(n - \frac{n}{2^j}\right) = nk - n\!\sum_{j=1}^{k}\frac{1}{2^j} = nk - n\!\left(1 - \frac{1}{2^k}\right) = nk - n + 1.$$

Since $k = \log_2 n$, this gives $W(2^k) = n\log_2 n - n + 1$. For general $n$, the exact worst-case count satisfies the recurrence $W(n) = W(\lfloor n/2\rfloor) + W(\lceil n/2\rceil) + (n - 1)$ with $W(1) = 0$. A straightforward strong induction shows that the solution is:

$$\boxed{W(n) = n\lceil\log_2 n\rceil - 2^{\lceil\log_2 n\rceil} + 1.}$$

The leading term is $n\log_2 n$ with coefficient exactly **1** — not a hidden Big-O constant, but a precise value. We will use this fact in the quicksort section to make an exact comparison between quicksort's average-case and merge sort's worst-case comparison counts.

For completeness: the best-case comparison count (when every merge encounters one subarray entirely smaller than the other, requiring only $\min(a,b)$ comparisons) is roughly half the worst case. For $n = 2^k$, each of the $k$ levels contributes $n/2$ comparisons, giving $B(n) = \frac{n}{2}\log_2 n$. Both best and worst case are $\Theta(n \log n)$, but the leading coefficients differ — $\frac{1}{2}$ versus $1$.

**Space.** The merge procedure uses an auxiliary array of size up to $n$ to hold merged elements during each merge. The bottom-up version uses no recursion stack; the recursive version would add $O(\log n)$ stack frames. The total auxiliary space is $O(n)$.

### Properties

| Property | Merge sort |
|----------|-----------|
| Worst-case time | $\Theta(n \log n)$ |
| Best-case time | $\Theta(n \log n)$ |
| Average-case time | $\Theta(n \log n)$ |
| Space | $O(n)$ auxiliary |
| Stable | Yes |
| Adaptive | No |

## Quicksort

Quicksort, invented by Tony Hoare in 1959, takes the opposite approach from merge sort. Where merge sort divides trivially (split in half) and combines carefully (merge), quicksort divides carefully (partition) and combines trivially (the subarrays are already in the right place).

The idea: choose a _pivot_ element, rearrange the array so that all elements less than the pivot come before it and all elements greater come after it, then recursively sort the two partitions.

### The algorithm

The recursive formulation of quicksort is:

1. If the array has zero or one elements, it is already sorted. Return.
2. Choose a _pivot_ element from the array.
3. _Partition_ the array: rearrange elements so that all elements less than the pivot come before it and all elements greater come after it. The pivot is now in its correct final position.
4. Recursively sort the subarray of elements before the pivot.
5. Recursively sort the subarray of elements after the pivot.

Notice that the combine step is trivial — there is nothing to do after the recursive calls, because the partitioning has already placed every element on the correct side of the pivot. All the real work happens in the partition step (step 3). The quality of the pivot choice (step 2) determines performance. Since the pivot itself is placed in its final position and does not participate in either recursive call, the two subarrays together contain $n - 1$ elements. An ideal pivot splits them into two roughly equal halves, which results in the $O(n \log n)$ running time for the algorithm, while a poor pivot that lands at one extreme produces one subarray of size $n - 1$ and one of size 0, which results in the $O(n^2)$ running time for the algorithm.

### The partition procedure

The partition step rearranges `arr[start..end]` around a pivot element and returns the pivot's final index. After partitioning:
- All elements to the left of the pivot are $\leq$ the pivot.
- All elements to the right are $\geq$ the pivot.
- The pivot is in its correct final position.

Our implementation chooses the middle element as the pivot, then uses the Lomuto partition scheme: scan from left, moving elements smaller than the pivot to the front.

```typescript
export function partition<T>(
  arr: T[],
  start: number,
  end: number,
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): number | undefined {
  if (start > end || end >= arr.length || start < 0 || end < 0) {
    return undefined;
  }

  const middleIndex = Math.floor((start + end) / 2);
  let storeIndex = start;

  // Move pivot to end
  const pivotTemp = arr[middleIndex]!;
  arr[middleIndex] = arr[end]!;
  arr[end] = pivotTemp;

  for (let i = start; i < end; i++) {
    if (comparator(arr[i]!, arr[end]!) < 0) {
      const temp = arr[storeIndex]!;
      arr[storeIndex] = arr[i]!;
      arr[i] = temp;
      storeIndex++;
    }
  }

  // Move pivot to its final position
  const temp = arr[storeIndex]!;
  arr[storeIndex] = arr[end]!;
  arr[end] = temp;

  return storeIndex;
}
```

The pivot is first swapped to the end, then `storeIndex` tracks the boundary between elements known to be less than the pivot and elements not yet examined. After the scan, the pivot is swapped into `storeIndex`, its correct position.

### The Lomuto partition scheme in detail

The Lomuto partition scheme (named after Nico Lomuto and popularized by Jon Bentley) is an elegant single-pass algorithm that partitions an array around a pivot using two indices: `storeIndex` and `i`. The pivot is first moved to the end of the array, and then the scan pointer `i` advances from left to right, examining each element exactly once.

At every point during the scan, the array is divided into four regions. The two pointers `storeIndex` and `i` carve out the boundaries:

$$[\underbrace{a_{\text{start}}, \ldots, a_{\text{storeIndex}-1}}_{\text{< pivot}},\ \underbrace{a_{\text{storeIndex}}, \ldots, a_{i-1}}_{\text{≥ pivot}},\ \underbrace{a_{i}, \ldots, a_{\text{end}-1}}_{\text{not yet examined}},\ \underbrace{a_{\text{end}}}_{\text{pivot}}]$$

- **`arr[start..storeIndex-1]`** — elements already classified as _less than_ the pivot.
- **`arr[storeIndex..i-1]`** — elements already classified as _greater than or equal to_ the pivot. This region may be **empty**: at the very beginning of the scan `storeIndex = i = start`, and it remains empty as long as every element examined so far is less than the pivot (because each such element advances both `i` and `storeIndex`). The region grows only when the scan encounters an element $\geq$ pivot — that element stays in place and `i` advances past it while `storeIndex` does not.
- **`arr[i..end-1]`** — elements _not yet examined_.
- **`arr[end]`** — the pivot itself (parked at the end).

On each step, the scan pointer `i` examines one element:

- If `arr[i] < pivot`: swap `arr[i]` with `arr[storeIndex]` and advance both `i` and `storeIndex`. This grows the "less than" region by one. If the "≥ pivot" region is non-empty, the swap moves its first element into the position just vacated by `arr[i]`, keeping it in the "≥ pivot" region. If the "≥ pivot" region is empty (`storeIndex = i`), the element is effectively swapped with itself — a no-op — and both pointers advance together.
- If `arr[i] ≥ pivot`: advance `i` only. The element stays where it is, and `storeIndex` does not move, so the element becomes part of the "≥ pivot" region. This is also the moment when `storeIndex` and `i` diverge (if they were still equal).

When the scan is complete (`i = end`), the "not examined" region is empty. We swap the pivot from `arr[end]` into `arr[storeIndex]` — the boundary between the two classified regions — placing it in its correct final position.

**Tracing the Lomuto scheme.** Let us trace the partition of $[8, 3, 5, 1, 4, 2]$ (indices 0–5) with the middle element as pivot. The middle index is $\lfloor (0 + 5)/2 \rfloor = 2$, so the pivot is $A[2] = 5$. Swap it to the end:

$[8, 3, \underline{2}, 1, 4, \underline{5}]$

Now scan with `storeIndex = 0`. At each step, we show the four regions of the array. Elements in the "less than" region are shown in **bold**, elements in the "greater or equal" region are shown in _italics_, and the pivot is underlined.

**Initial state** (`storeIndex = 0`, `i = 0`):

$$[\underbrace{\vphantom{8}}_{ < 5}\underbrace{8, 3, 2, 1, 4}_{\text{not examined}},\ \underline{5}]$$

**Step 1** (`i = 0`): $A[0] = 8$. Is $8 < 5$? No. Do nothing.

$$[\underbrace{\vphantom{8}}_{ < 5}\underbrace{_8}_{\geq 5},\underbrace{3, 2, 1, 4}_{\text{not examined}},\ \underline{5}]$$

`storeIndex` stays at 0.

**Step 2** (`i = 1`): $A[1] = 3$. Is $3 < 5$? Yes. Swap $A[0]$ and $A[1]$:

$$[\underbrace{\mathbf{3}}_{ < 5},\underbrace{_8}_{\geq 5},\underbrace{2, 1, 4}_{\text{not examined}},\ \underline{5}]$$

`storeIndex` advances to 1.

**Step 3** (`i = 2`): $A[2] = 2$. Is $2 < 5$? Yes. Swap $A[1]$ and $A[2]$:

$$[\underbrace{\mathbf{3, 2}}_{ < 5},\underbrace{_8}_{\geq 5},\underbrace{1, 4}_{\text{not examined}},\ \underline{5}]$$

`storeIndex` advances to 2.

**Step 4** (`i = 3`): $A[3] = 1$. Is $1 < 5$? Yes. Swap $A[2]$ and $A[3]$:

$$[\underbrace{\mathbf{3, 2, 1}}_{ < 5},\underbrace{_8}_{\geq 5},\underbrace{4}_{\text{not examined}},\ \underline{5}]$$

`storeIndex` advances to 3.

**Step 5** (`i = 4`): $A[4] = 4$. Is $4 < 5$? Yes. Swap $A[3]$ and $A[4]$:

$$[\underbrace{\mathbf{3, 2, 1, 4}}_{ < 5},\underbrace{_8}_{\geq 5},\underbrace{\vphantom{8}}_{\text{not examined}}\ \underline{5}]$$

`storeIndex` advances to 4.

**Place pivot:** Swap $A[\text{storeIndex}] = A[4]$ with $A[\text{end}] = A[5]$:

$$[\underbrace{3, 2, 1, 4}_{ < 5},\ \underline{5},\ \underbrace{8}_{\geq 5}]$$

The pivot 5 is now at index 4, its correct sorted position. Every element to its left is less than 5, and every element to its right is greater than or equal to 5.

Notice how the "greater or equal" region (just the element 8 in this example) gets pushed rightward one position each time a smaller element is swapped into the "less than" region. The `storeIndex` pointer always marks the exact boundary: everything before it is less than the pivot, everything from it onward (up to the scan pointer) is greater or equal.

This detailed trace also serves as an informal correctness argument for the Lomuto scheme. At every step, the four-region invariant is maintained: elements before `storeIndex` are less than the pivot, elements from `storeIndex` to `i - 1` are greater than or equal, elements from `i` onward have not yet been examined, and the pivot sits at the end. When the scan completes, the "not examined" region is empty, so swapping the pivot into `storeIndex` places it at the exact boundary between the "less than" and "greater or equal" regions — its correct final position. Note also that the scan examines each of the $n - 1$ non-pivot elements exactly once, performing at most one swap per element, so the partition procedure runs in $\Theta(n)$ time.

Now that we understand how a single partition call rearranges an array around a pivot, we can see how quicksort uses this operation repeatedly to sort an entire array. Each partition places one element — the pivot — in its correct final position and divides the remaining elements into two subproblems. The following example traces the full recursive process, showing how successive partitions progressively sort the array.

### Tracing through an example

Let us sort $A = [7, 2, 1, 6, 8, 5, 3, 4]$ with middle-element pivot selection. Since we have already traced the Lomuto partition scheme step-by-step in the previous section, here we skip the inner details of each partition call and focus on the recursive structure of quicksort — which subarray is partitioned at each step, which pivot is chosen, and how the array evolves toward the sorted order.

In the array snapshots below, elements already in their **final sorted positions** are shown in **bold**, and the pivot just placed by the current partition is underlined.

The full recursion tree (each node shows the subarray and the pivot chosen):

```
                  [7, 2, 1, 6, 8, 5, 3, 4]  pivot 6
                  /                        \
       [2, 1, 4, 5, 3]  pivot 4         [8, 7]  pivot 8
        /            \                   /
   [2, 1, 3]  pivot 1  [5]          [7]
        \
      [3, 2]  pivot 3
       /
     [2]
```

**Partition 1** — full array, indices 0–7.

The middle index is $\lfloor (0 + 7)/2 \rfloor = 3$, so the pivot is $A[3] = 6$. Partition places 6 at index 5:

$$[2, 1, 4, 5, 3, \underline{\mathbf{6}}, 8, 7]$$

The pivot 6 is now in its final position. Two subproblems remain: the left subarray $[2, 1, 4, 5, 3]$ (indices 0–4) and the right subarray $[8, 7]$ (indices 6–7).

**Partition 2** — left subarray, indices 0–4: $[2, 1, 4, 5, 3]$.

The middle index is $\lfloor (0 + 4)/2 \rfloor = 2$, so the pivot is $A[2] = 4$. Partition places 4 at index 3:

$$[2, 1, 3, \underline{\mathbf{4}}, 5, \mathbf{6}, 8, 7]$$

The pivot 4 is now in its final position. Left subproblem: $[2, 1, 3]$ (indices 0–2). Right subproblem: $[5]$ (index 4) — a single element, already in place and sorted as an array consisting of a single element.

**Partition 3** — subarray, indices 0–2: $[2, 1, 3]$.

The middle index is $\lfloor (0 + 2)/2 \rfloor = 1$, so the pivot is $A[1] = 1$. Partition places 1 at index 0:

$$[\underline{\mathbf{1}}, 3, 2, \mathbf{4}, \mathbf{5}, \mathbf{6}, 8, 7]$$

The pivot 1 is now in its final position. Left subproblem: empty. Right subproblem: $[3, 2]$ (indices 1–2).

**Partition 4** — subarray, indices 1–2: $[3, 2]$.

The middle index is $\lfloor (1 + 2)/2 \rfloor = 1$, so the pivot is $A[1] = 3$. Partition places 3 at index 2:

$$[\mathbf{1}, 2, \underline{\mathbf{3}}, \mathbf{4}, \mathbf{5}, \mathbf{6}, 8, 7]$$

The pivot 3 is now in its final position. Left subproblem: $[2]$ (index 1) — a single element, already in place and sorted as an array consisting of a single element. Right subproblem: empty. The entire left side of the original array is now sorted: $[\mathbf{1}, \mathbf{2}, \mathbf{3}, \mathbf{4}, \mathbf{5}, \mathbf{6}, \ldots]$.

**Partition 5** — right subarray, indices 6–7: $[8, 7]$.

The middle index is $\lfloor (6 + 7)/2 \rfloor = 6$, so the pivot is $A[6] = 8$. Partition places 8 at index 7:

$$[\mathbf{1}, \mathbf{2}, \mathbf{3}, \mathbf{4}, \mathbf{5}, \mathbf{6}, 7, \underline{\mathbf{8}}]$$

The pivot 8 is now in its final position. Left subproblem: $[7]$ (index 6) — a single element, already in place and sorted as an array consisting of a single element. Right subproblem: empty.

All subproblems have reached the base case. Result: $[\mathbf{1, 2, 3, 4, 5, 6, 7, 8}]$.

Notice that quicksort performed five partitions to sort eight elements, placing one pivot in its final position each time. The three remaining elements ($2$, $5$, and $7$) reached their final positions by ending up in base-case subarrays of size 1.

### Implementation

```typescript
function sort<T>(
  arr: T[],
  start: number,
  end: number,
  comparator: Comparator<T>,
): void {
  if (start < end) {
    const partitionIndex = partition(arr, start, end, comparator)!;
    sort(arr, start, partitionIndex - 1, comparator);
    sort(arr, partitionIndex + 1, end, comparator);
  }
}

export function quickSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  sort(elements, 0, elements.length - 1, comparator);
  return elements;
}
```

### Correctness

**Claim.** After `partition(arr, start, end)`, the pivot is in its correct final sorted position.

The partition loop moves all elements less than the pivot to positions before `storeIndex`, and leaves elements greater than or equal to the pivot after `storeIndex`. The pivot is then placed at `storeIndex`. Every element before it is smaller, every element after it is at least as large — this is exactly where the pivot belongs in the sorted output.

**Claim.** Quicksort correctly sorts the array.

We argue by strong induction on the subarray size.

_Base case._ A subarray of size 0 or 1 is trivially sorted. Quicksort returns it unchanged, so the claim holds.

_Inductive step._ Assume that quicksort correctly sorts all subarrays of size less than $k$, for some $k > 1$. For a subarray of size $k$, partition places the pivot in its final correct position, with all elements $<$ pivot to its left and all elements $\geq$ pivot to its right. Both the left and right subarrays have size strictly less than $k$, so by the inductive hypothesis quicksort correctly sorts each of them. Since every element in the left subarray is $\leq$ pivot $\leq$ every element in the right subarray, and both subarrays are themselves sorted, the entire array of size $k$ is sorted. $\square$

### Complexity analysis

The performance of quicksort depends on the quality of the partition — how evenly the pivot divides the array.

**Best case.** If the pivot always lands in the middle, each partition splits the array into two roughly equal halves. The recurrence is the same as merge sort:

$$T(n) = 2T(n/2) + O(n) = O(n \log n).$$

**Worst case.** If the pivot always lands at one extreme (the smallest or largest element), one partition has $n - 1$ elements and the other has 0. The recurrence becomes:

$$T(n) = T(n - 1) + O(n) = O(n^2).$$

This worst case occurs with our middle-element pivot when the input is specially constructed, and with the first-element or last-element pivot strategies on already-sorted or reverse-sorted input.

**Average case.** On a random permutation with any fixed pivot strategy, the expected running time is $O(n \log n)$. Intuitively, even moderately unbalanced partitions (say, 1:9 splits) only add a constant factor to the recursion depth: the shorter side shrinks by a factor of 10, and $\log_{10} n = O(\log n)$. A careful analysis (presented below) shows that the exact expected number of comparisons is $2(n+1)H_n - 4n \approx 1.39\,n\log_2 n$, where $H_n$ is the $n$th harmonic number. Recall from the merge sort section that merge sort's exact worst-case comparison count is $n \lceil\log_2 n\rceil - 2^{\lceil\log_2 n\rceil} + 1$, whose leading term is $n\log_2 n$ with coefficient exactly 1. The ratio of the two leading terms is $1.39 / 1 = 1.39$, so quicksort's average case uses only about **39% more comparisons** than merge sort's worst case — a remarkably small penalty for an algorithm whose constant-factor advantages (in-place operation, cache friendliness) often make it faster in practice.

---

> **A note to the reader.** Understanding _where_ the exact formula $2(n+1)H_n - 4n$ comes from and why it behaves as $n\log n$ is not required for the rest of this book — only the conclusion that quicksort makes $\Theta(n \log n)$ expected comparisons matters. The derivation below is provided for the sake of completeness. If the algebra feels heavy, feel free to skip ahead to the Space analysis and return to this section later or skip it altogether.

_Setting up the recurrence._ Suppose we are sorting $n$ elements and each of the $n$ elements is equally likely to end up as the pivot (this is the case for a random permutation with a fixed pivot-selection rule such as "pick the first element" or "pick the middle element"). The partition step compares the pivot to every other element, making exactly $n - 1$ comparisons. After partitioning, the pivot lands in some position $k$ (where $0 \leq k \leq n - 1$), leaving a left subarray of size $k$ and a right subarray of size $n - 1 - k$. Since every position is equally likely, each value of $k$ occurs with probability $1/n$. Let $C(n)$ denote the expected number of comparisons to sort $n$ elements. We get:

$$\mathbb{E}[C(n)] = (n - 1) + \frac{1}{n} \sum_{k=0}^{n-1} \bigl[\mathbb{E}[C(k)] + \mathbb{E}[C(n - 1 - k)]\bigr].$$

The term $(n - 1)$ counts the comparisons in the partition step. The sum averages over all $n$ equally likely pivot positions: when the pivot lands at position $k$, we recursively sort subarrays of sizes $k$ and $n - 1 - k$.

_Simplifying._ Notice that as $k$ ranges from $0$ to $n - 1$, the value $n - 1 - k$ ranges from $n - 1$ down to $0$ — the same set of values in reverse. Therefore, $\sum_{k=0}^{n-1} \mathbb{E}[C(n - 1 - k)] = \sum_{k=0}^{n-1} \mathbb{E}[C(k)]$, and the recurrence becomes:

$$\mathbb{E}[C(n)] = (n - 1) + \frac{2}{n} \sum_{k=0}^{n-1} \mathbb{E}[C(k)].$$

_Solving the recurrence._ This is a classic recurrence that is solved by the "multiply both sides by $n$" trick to eliminate the fraction:

$$n\,\mathbb{E}[C(n)] = n(n - 1) + 2 \sum_{k=0}^{n-1} \mathbb{E}[C(k)].$$

Write the same equation for $n - 1$:

$$(n - 1)\,\mathbb{E}[C(n - 1)] = (n - 1)(n - 2) + 2 \sum_{k=0}^{n-2} \mathbb{E}[C(k)].$$

Subtracting the second from the first cancels the entire sum except its last term:

$$n\,\mathbb{E}[C(n)] - (n - 1)\,\mathbb{E}[C(n - 1)] = 2(n - 1) + 2\,\mathbb{E}[C(n - 1)].$$

Collecting $\mathbb{E}[C(n-1)]$ on the right:

$$n\,\mathbb{E}[C(n)] = (n + 1)\,\mathbb{E}[C(n - 1)] + 2(n - 1).$$

Dividing both sides by $n(n + 1)$:

$$\frac{\mathbb{E}[C(n)]}{n + 1} = \frac{\mathbb{E}[C(n - 1)]}{n} + \frac{2(n - 1)}{n(n + 1)}.$$

Now define $a_n = \mathbb{E}[C(n)]/(n + 1)$. The recurrence becomes $a_n = a_{n-1} + \frac{2(n-1)}{n(n+1)}$, which _telescopes_ — we can unroll it all the way down to the base case $a_1 = 0$:

$$a_n = \sum_{m=2}^{n} \frac{2(m - 1)}{m(m + 1)}.$$

_Where the harmonic numbers arise._ We decompose the summand using partial fractions:

$$\frac{2(m - 1)}{m(m + 1)} = \frac{2}{m + 1} - \frac{2}{m(m + 1)} = \frac{2}{m + 1} - \frac{2}{m} + \frac{2}{m + 1} = \frac{4}{m + 1} - \frac{2}{m}.$$

Summing from $m = 2$ to $n$:

$$a_n = 4\sum_{m=2}^{n}\frac{1}{m + 1} - 2\sum_{m=2}^{n}\frac{1}{m} = 4\sum_{j=3}^{n+1}\frac{1}{j} - 2\sum_{m=2}^{n}\frac{1}{m}.$$

Both sums are closely related to the harmonic number $H_n = \sum_{k=1}^{n} 1/k$, but neither starts at $k = 1$ — the first runs from $j = 3$ and the second from $m = 2$. We express each in terms of $H_n$ by adding and subtracting the missing initial terms.

For the first sum, add and subtract the $j = 1$ and $j = 2$ terms to complete the harmonic sum up to $n + 1$:

$$\sum_{j=3}^{n+1}\frac{1}{j} = \left(\sum_{j=1}^{n+1}\frac{1}{j}\right) - 1 - \frac{1}{2} = H_{n+1} - \frac{3}{2}.$$

For the second sum, add and subtract the $m = 1$ term:

$$\sum_{m=2}^{n}\frac{1}{m} = \left(\sum_{m=1}^{n}\frac{1}{m}\right) - 1 = H_n - 1.$$

Substituting back:

$$a_n = 4\!\left(H_{n+1} - \tfrac{3}{2}\right) - 2(H_n - 1) = 4H_{n+1} - 6 - 2H_n + 2 = 4H_{n+1} - 2H_n - 4.$$

Finally, use the identity $H_{n+1} = H_n + \frac{1}{n+1}$ to write everything in terms of $H_n$:

$$a_n = 4\!\left(H_n + \tfrac{1}{n+1}\right) - 2H_n - 4 = 2H_n + \frac{4}{n+1} - 4.$$

Multiplying back by $(n + 1)$ (recall $a_n = \mathbb{E}[C(n)]/(n+1)$):

$$\mathbb{E}[C(n)] = (n+1)\!\left(2H_n + \frac{4}{n+1} - 4\right) = 2(n+1)H_n + 4 - 4(n+1) = 2(n+1)H_n - 4n.$$

$$\boxed{\mathbb{E}[C(n)] = 2(n + 1)H_n - 4n.}$$

This is the _exact_ expected number of comparisons. The harmonic number $H_n = 1 + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{n}$ arises naturally because the telescoping recurrence produces a sum of reciprocals — each "level" of the recursion contributes a term proportional to $1/k$, and these $1/k$ terms accumulate into a harmonic sum.

_Approximating._ It is a well-known result from analysis that the harmonic number satisfies $H_n = \ln n + \gamma + O(1/n)$, where $\gamma \approx 0.5772$ is the Euler–Mascheroni constant. We omit the proof of this fact and simply use the result. Therefore:

$$\mathbb{E}[C(n)] \approx 2n \ln n \approx 2n \cdot \frac{\log_2 n}{\log_2 e} = \frac{2}{\log_2 e}\, n \log_2 n \approx 1.39\, n \log_2 n.$$

The factor $2/\log_2 e \approx 1.39$ arises from converting between natural logarithm and base-2 logarithm. $\square$

---

**Space.** Quicksort sorts in place. The recursion stack has depth $O(\log n)$ in the best case but $O(n)$ in the worst case. Tail-call optimization or explicit stack management can limit the worst-case stack depth to $O(\log n)$ by always recursing on the smaller partition first.

### Properties

| Property | Quicksort |
|----------|-----------|
| Worst-case time | $\Theta(n^2)$ |
| Best-case time | $\Theta(n \log n)$ |
| Average-case time | $\Theta(n \log n)$ |
| Space | $O(\log n)$ stack (in-place) |
| Stable | No |
| Adaptive | No |

### Why quicksort is fast in practice

Despite its $O(n^2)$ worst case, quicksort is often the fastest comparison sort in practice. Several factors contribute:

1. **Cache friendliness.** Quicksort's partition scan accesses elements sequentially, which is excellent for CPU cache performance. Merge sort accesses two separate subarrays during merge, which can cause more cache misses.

2. **Small constant factor.** Quicksort performs fewer data movements than merge sort — partitioning swaps elements in place, while merging copies elements to an auxiliary array and back.

3. **No auxiliary memory.** Quicksort needs only $O(\log n)$ stack space, while merge sort needs $O(n)$ auxiliary space. Less memory allocation means less overhead.

4. **Adaptable.** In practice, quicksort implementations use several optimizations:

   - **Insertion sort for small subarrays.** When a subarray shrinks below a threshold (typically 10–20 elements), the algorithm switches to insertion sort, which has lower overhead for small inputs.

   - **Median-of-three pivot selection.** Instead of picking a single element (e.g., the middle or first) as the pivot, the algorithm examines three elements — typically the first, middle, and last — and chooses their _median_ as the pivot. For example, given first = 8, middle = 5, last = 2, the median is 5. Because the median of three samples is far less likely to be an extreme value than a single arbitrary pick, this strategy produces more balanced partitions and dramatically reduces the probability of hitting the $O(n^2)$ worst case — particularly on already-sorted or reverse-sorted inputs, which are the classic worst cases for naive pivot strategies.

   - **Three-way partitioning (Dutch National Flag).** Standard Lomuto or Hoare partitioning splits the array into two regions: elements $<$ pivot and elements $\geq$ pivot. When many elements are equal to the pivot, those duplicates still end up in recursive calls even though they are already in their correct relative position. Three-way partitioning instead splits the array into _three_ regions — elements less than the pivot, elements _equal_ to the pivot, and elements greater than the pivot. The equal-to-pivot region is excluded from both recursive calls, since those elements are already in their final positions. This makes a large difference when the input has many duplicate values: in the extreme case of all-equal elements, a single partition call finishes the entire array in $O(n)$ time, whereas standard two-way partitioning would degrade to $O(n^2)$.

## Heapsort

Heapsort uses a _binary heap_ to sort an array in place. A binary heap is an array-based data structure that maintains a partial ordering — not fully sorted, but structured enough to find the maximum (or minimum) in $O(1)$ time and restore order in $O(\log n)$ time after a removal.

### The binary heap

A _max-heap_ is a complete binary tree stored in an array where every node's value is greater than or equal to its children's values. For a node at index $i$ (zero-based):

- Left child: $2i + 1$
- Right child: $2i + 2$
- Parent: $\lfloor (i - 1) / 2 \rfloor$

The max-heap property ensures that the root (index 0) holds the largest element.

### Heapify

The `heapify` operation takes a node whose children are both valid max-heaps but whose own value may violate the heap property, and "sinks" it down to restore the property:

```typescript
function heapify<T>(
  arr: T[],
  heapSize: number,
  index: number,
  comparator: Comparator<T>,
): void {
  const left = 2 * index + 1;
  const right = 2 * index + 2;
  let indexOfMaximum = index;

  for (const subTreeRootIndex of [left, right]) {
    if (
      subTreeRootIndex < heapSize &&
      comparator(arr[subTreeRootIndex]!, arr[indexOfMaximum]!) > 0
    ) {
      indexOfMaximum = subTreeRootIndex;
    }
  }
  if (indexOfMaximum !== index) {
    const temp = arr[index]!;
    arr[index] = arr[indexOfMaximum]!;
    arr[indexOfMaximum] = temp;
    heapify(arr, heapSize, indexOfMaximum, comparator);
  }
}
```

The element at `index` is compared with its children. If a child is larger, the element is swapped with the largest child, and the process repeats in that child's subtree. Each step moves down one level, so heapify runs in $O(\log n)$ time (the height of the tree).

### Building a heap

We can convert an unordered array into a max-heap by calling `heapify` on every non-leaf node, bottom-up:

```typescript
function buildHeap<T>(
  arr: T[],
  heapSize: number,
  comparator: Comparator<T>,
): void {
  const lastNonLeafIndex = Math.floor((heapSize + 1) / 2) - 1;

  for (let i = lastNonLeafIndex; i >= 0; i--) {
    heapify(arr, heapSize, i, comparator);
  }
}
```

**Why bottom-up?** The leaves (the bottom half of the array) are trivially valid heaps. By processing nodes from the bottom up, each call to `heapify` encounters a node whose children are already valid heaps — exactly the precondition heapify requires.

**Why $O(n)$ and not $O(n \log n)$?** A naive analysis says: $n/2$ calls to heapify, each costing $O(\log n)$, giving $O(n \log n)$. But this overestimates. Most nodes are near the bottom and sink only a few levels. The precise cost is:

$$\sum_{h=0}^{\lfloor \log n \rfloor} \left\lceil \frac{n}{2^{h+1}} \right\rceil \cdot O(h) = O\!\left(n \sum_{h=0}^{\infty} \frac{h}{2^h}\right) = O(n \cdot 2) = O(n).$$

The series $\sum_{h=0}^{\infty} h/2^h = 2$ converges, so building a heap takes linear time.

### The heapsort algorithm

1. Build a max-heap from the input array: $O(n)$.
2. Repeat for $i = n - 1, n - 2, \ldots, 1$:
   - Swap the root (maximum) with element $i$.
   - Reduce the heap size by 1 (element $i$ is now in its final position).
   - Call heapify on the root to restore the heap property.

```typescript
export function heapSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  let heapSize = elements.length;

  buildHeap(elements, heapSize, comparator);
  for (let i = elements.length - 1; i > 0; i--) {
    const temp = elements[0]!;
    elements[0] = elements[i]!;
    elements[i] = temp;
    heapSize--;
    heapify(elements, heapSize, 0, comparator);
  }
  return elements;
}
```

### Tracing through an example

Let us sort $A = [4, 10, 3, 5, 1]$.

**Build max-heap:**

Starting array (as a tree):

```
        4
       / \
     10    3
    / \
   5   1
```

Process non-leaf nodes bottom-up. Node at index 1 (value 10): children are 5, 1. 10 is already larger — no change. Node at index 0 (value 4): children are 10, 3. Swap 4 with 10. Then heapify the subtree: 4 vs children 5, 1 → swap with 5.

```
        10            10
       / \           / \
      4    3   →    5    3
     / \           / \
    5   1         4   1
```

Max-heap: $[10, 5, 3, 4, 1]$.

**Extract-max loop:**

| # | Swap | Array after swap | Heapify root | Result |
|---|------|-----------------|-------------|--------|
| 1 | $A[0] \leftrightarrow A[4]$ | [$\underline{1}$, 5, 3, 4, **10**] | $[5, 4, 3, 1]$ | $[5, 4, 3, 1, 10]$ |
| 2 | $A[0] \leftrightarrow A[3]$ | [$\underline{1}$, 4, 3, **5**, 10] | $[4, 1, 3]$ | $[4, 1, 3, 5, 10]$ |
| 3 | $A[0] \leftrightarrow A[2]$ | [$\underline{3}$, 1, **4**, 5, 10] | $[3, 1]$ | $[3, 1, 4, 5, 10]$ |
| 4 | $A[0] \leftrightarrow A[1]$ | [$\underline{1}$, **3**, 4, 5, 10] | $[1]$ | $[1, 3, 4, 5, 10]$ |

Result: $[1, 3, 4, 5, 10]$.

### Correctness

**Invariant:** At the start of each iteration $i$ of the extract-max loop:
- $A[0..i]$ is a max-heap containing the $i + 1$ smallest elements.
- $A[i+1..n-1]$ contains the $n - i - 1$ largest elements, in sorted order.

**Initialization.** After `buildHeap`, the entire array is a max-heap and the sorted suffix is empty.

**Maintenance.** The root $A[0]$ is the largest element in the heap $A[0..i]$. Swapping it with $A[i]$ places it in the correct position (it is the $(i+1)$th largest overall). Reducing the heap size and calling heapify restores the heap property on $A[0..i-1]$.

**Termination.** When $i = 0$, the heap contains a single element (the minimum), which is trivially in its correct position. The array is sorted. $\square$

### Complexity analysis

**Time.** Building the heap takes $O(n)$. The extract-max loop runs $n - 1$ times, each iteration performing a swap and a heapify costing $O(\log n)$. Total:

$$T(n) = O(n) + (n - 1) \cdot O(\log n) = O(n \log n).$$

This holds for all inputs — heapsort is not adaptive.

**Space.** Heapsort sorts in place. The only auxiliary space is $O(1)$ for temporary variables.

### Properties

| Property | Heapsort |
|----------|----------|
| Worst-case time | $\Theta(n \log n)$ |
| Best-case time | $\Theta(n \log n)$ |
| Average-case time | $\Theta(n \log n)$ |
| Space | $O(1)$ in-place |
| Stable | No |
| Adaptive | No |

## Randomized quicksort

Deterministic quicksort's performance depends on the pivot choice. A fixed strategy — first element, last element, middle element — can always be defeated by a carefully constructed input that forces $O(n^2)$ behavior. Randomized quicksort eliminates this vulnerability by choosing the pivot _uniformly at random_.

### Motivation

Consider a sorting library used by millions of applications. An adversary who knows the pivot-selection strategy can craft inputs that trigger worst-case behavior, leading to denial-of-service attacks. By choosing the pivot randomly, we ensure that no input is consistently bad — the algorithm's expected performance is $O(n \log n)$ for _every_ input, regardless of how it was constructed.

This is a powerful guarantee. It shifts the source of randomness from the input (which an adversary controls) to the algorithm (which the adversary cannot predict).

### The algorithm

Randomized quicksort is identical to standard quicksort, except that the partition step selects a random element as the pivot instead of a fixed one:

```typescript
function randomizedPartition<T>(
  arr: T[],
  start: number,
  end: number,
  comparator: Comparator<T>,
): number {
  // Choose a random pivot index in [start, end]
  const randomIndex = start + Math.floor(Math.random() * (end - start + 1));
  let storeIndex = start;

  // Move pivot to end
  const pivotTemp = arr[randomIndex]!;
  arr[randomIndex] = arr[end]!;
  arr[end] = pivotTemp;

  for (let i = start; i < end; i++) {
    if (comparator(arr[i]!, arr[end]!) < 0) {
      const temp = arr[storeIndex]!;
      arr[storeIndex] = arr[i]!;
      arr[i] = temp;
      storeIndex++;
    }
  }

  // Move pivot to its final position
  const temp = arr[storeIndex]!;
  arr[storeIndex] = arr[end]!;
  arr[end] = temp;

  return storeIndex;
}

export function randomizedQuickSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  sort(elements, 0, elements.length - 1, comparator);
  return elements;
}
```

The only change from deterministic quicksort is the line that computes the pivot index: `Math.floor(Math.random() * (end - start + 1))` instead of `Math.floor((start + end) / 2)`.

### Expected running time

**Theorem 5.1.** The expected number of comparisons made by randomized quicksort on any input of size $n$ is at most $2n \ln n = O(n \log n)$.

**Proof sketch.** Let $z_1 < z_2 < \cdots < z_n$ be the elements of the input in sorted order. Define the indicator random variable $X_{ij}$ as 1 if $z_i$ and $z_j$ are ever compared during the execution, and 0 otherwise.

The total number of comparisons is:

$$C = \sum_{i=1}^{n-1} \sum_{j=i+1}^{n} X_{ij}.$$

By linearity of expectation:

$$\mathbb{E}[C] = \sum_{i=1}^{n-1} \sum_{j=i+1}^{n} \Pr[z_i \text{ and } z_j \text{ are compared}].$$

Now, $z_i$ and $z_j$ are compared if and only if one of them is chosen as the pivot before any element in $\{z_i, z_{i+1}, \ldots, z_j\}$. Since we choose pivots uniformly at random, the probability that $z_i$ or $z_j$ is chosen first among these $j - i + 1$ elements is $2 / (j - i + 1)$.

Therefore:

$$\mathbb{E}[C] = \sum_{i=1}^{n-1} \sum_{j=i+1}^{n} \frac{2}{j - i + 1} = \sum_{i=1}^{n-1} \sum_{k=2}^{n-i+1} \frac{2}{k} \leq \sum_{i=1}^{n-1} 2H_n = 2(n - 1)H_n \leq 2n \ln n.$$

where $H_n = \sum_{k=1}^{n} 1/k \leq \ln n + 1$ is the $n$th harmonic number. $\square$

This expected bound holds for _every_ input — it is not an average over random inputs. Even on an adversarial input, randomized quicksort makes $O(n \log n)$ expected comparisons.

### Worst case

The worst case of $O(n^2)$ still exists in theory: if the random choices happen to always pick the smallest or largest element as pivot. However, the probability of this occurring is astronomically small. For $n = 1000$, the probability of consistently terrible pivots through all recursive calls is effectively zero.

### Properties

| Property | Randomized quicksort |
|----------|---------------------|
| Worst-case time | $O(n^2)$ (extremely unlikely) |
| Expected time | $O(n \log n)$ for all inputs |
| Space | $O(\log n)$ expected stack depth |
| Stable | No |

## Comparison of efficient sorting algorithms

We have now studied four $O(n \log n)$ sorting algorithms. Let us compare them across the dimensions that matter in practice.

### Time complexity

| Algorithm | Best case | Average case | Worst case |
|-----------|-----------|-------------|------------|
| Merge sort | $\Theta(n \log n)$ | $\Theta(n \log n)$ | $\Theta(n \log n)$ |
| Quicksort | $\Theta(n \log n)$ | $\Theta(n \log n)$ | $\Theta(n^2)$ |
| Randomized quicksort | $\Theta(n \log n)$ | $O(n \log n)$ expected | $O(n^2)$ |
| Heapsort | $\Theta(n \log n)$ | $\Theta(n \log n)$ | $\Theta(n \log n)$ |

Merge sort and heapsort provide _guaranteed_ $O(n \log n)$ performance. Quicksort has a theoretical $O(n^2)$ worst case, but randomization makes this practically irrelevant. In terms of constant factors, quicksort (including randomized) typically makes the fewest comparisons on average — about $1.39\, n \log_2 n$ versus merge sort's $n \log_2 n$ comparisons, but with lower overhead per comparison.

### Space complexity

| Algorithm | Auxiliary space |
|-----------|----------------|
| Merge sort | $O(n)$ |
| Quicksort | $O(\log n)$ stack |
| Randomized quicksort | $O(\log n)$ expected stack |
| Heapsort | $O(1)$ |

Heapsort is the clear winner for space: it sorts truly in place with $O(1)$ extra memory. Quicksort needs $O(\log n)$ stack space (or $O(n)$ in the worst case without tail-call optimization). Merge sort needs $O(n)$ for the auxiliary merge array.

### Stability

| Algorithm | Stable? |
|-----------|---------|
| Merge sort | Yes |
| Quicksort | No |
| Randomized quicksort | No |
| Heapsort | No |

Merge sort is the only stable $O(n \log n)$ algorithm among the four. This makes it the default choice when stability is required — for example, in database sorting or when composing sorts on multiple keys.

### Cache performance

Quicksort has the best cache performance among the four. Its partition scan accesses elements sequentially, making excellent use of CPU cache lines. Merge sort accesses two separate subarrays during merge, which can cause cache misses when the subarrays are far apart in memory. Heapsort has the worst cache performance: heap navigation accesses elements at indices $i$, $2i + 1$, and $2i + 2$, which jump around the array unpredictably for large arrays.

### Practical recommendations

- **General-purpose sorting:** Randomized quicksort (or a tuned variant) is the standard choice. Most standard library sort functions (including V8's `Array.prototype.sort` for large arrays) are based on quicksort variants.

- **Guaranteed worst-case performance:** Use merge sort or heapsort. Merge sort is preferred when stability is needed; heapsort when memory is constrained.

- **Small arrays:** Insertion sort (from Chapter 4) outperforms all of the above for small arrays (typically $n < 10\text{–}20$) due to its minimal overhead. Practical quicksort implementations switch to insertion sort for small subarrays.

- **Hybrid algorithms:** The best practical sorts combine multiple algorithms. Timsort (Python, Java) combines merge sort with insertion sort. Introsort (C++ STL) starts with quicksort, switches to heapsort if the recursion depth exceeds $2\log n$ (to guarantee $O(n \log n)$ worst case), and uses insertion sort for small subarrays.

## Chapter summary

In this chapter we studied four efficient comparison-based sorting algorithms:

- **Merge sort** divides the array in half, sorts each half recursively, and merges the sorted halves. It runs in $\Theta(n \log n)$ time in all cases but requires $O(n)$ auxiliary space. It is stable.

- **Quicksort** partitions the array around a pivot, placing it in its correct position, then recursively sorts the two partitions. It runs in $O(n \log n)$ average time with excellent cache performance, but has $O(n^2)$ worst-case time with a fixed pivot strategy.

- **Heapsort** builds a max-heap and repeatedly extracts the maximum to build the sorted array from right to left. It runs in $\Theta(n \log n)$ time in all cases and uses $O(1)$ auxiliary space, but has poor cache performance.

- **Randomized quicksort** eliminates quicksort's vulnerability to adversarial inputs by choosing pivots uniformly at random. It achieves $O(n \log n)$ expected time on _every_ input.

All four algorithms achieve the $\Omega(n \log n)$ lower bound proved in Chapter 4. In the next chapter, we explore a different question: can we sort _faster_ than $O(n \log n)$ by using information beyond pairwise comparisons?

## Exercises

**Exercise 5.1.** Trace through the merge sort algorithm on the input $[12, 11, 13, 5, 6, 7]$. Show the state of the array after each merge operation in the bottom-up approach.

**Exercise 5.2.** Merge sort's merge procedure uses $O(n)$ auxiliary space. Can we merge two sorted subarrays in place (using $O(1)$ extra space) while maintaining $O(n)$ time? Explain why this is difficult. (Hint: in-place merge algorithms exist, but they either sacrifice time complexity to $O(n \log n)$ or are extremely complex.)

**Exercise 5.3.** Consider quicksort with the "first element" pivot strategy. Give an input of size $n$ that causes $\Theta(n^2)$ behavior. Then give a different input that causes $\Theta(n \log n)$ behavior. What input causes the worst case for the "middle element" strategy used in our implementation?

**Exercise 5.4.** Prove that the expected recursion depth of randomized quicksort is $O(\log n)$. (Hint: at each level, with constant probability the pivot falls in the middle half of the array. How many levels until the subproblem size drops to 1?)

**Exercise 5.5.** Heapsort is not stable. Give a concrete example of an array with duplicate values where heapsort changes the relative order of equal elements. Why does the "swap root with last element" step destroy stability?
