# Linear-Time Sorting and Selection

_In Chapter 4 we proved a lower bound: every comparison-based sorting algorithm must make $\Omega(n \log n)$ comparisons in the worst case. The efficient algorithms of Chapter 5 — merge sort, quicksort, heapsort — all meet this bound, and none can beat it. But what if we are willing to go beyond pairwise comparisons? If we know something about the structure of the keys — for instance, that they are integers in a bounded range — we can exploit that structure to sort in linear time. In this chapter we study three such algorithms: counting sort, radix sort, and bucket sort. We also turn to a related problem — selection — and present two algorithms that find the $k$th smallest element in $O(n)$ time without sorting: randomized quickselect and the deterministic median-of-medians algorithm._

## Breaking the comparison lower bound

The $\Omega(n \log n)$ lower bound from Chapter 4 applies to comparison-based sorting: algorithms that learn about the input only by comparing pairs of elements. The decision-tree argument shows that any comparison-based algorithm must traverse a binary tree of height at least $\log_2(n!) = \Theta(n \log n)$, because there are $n!$ possible permutations and each leaf of the decision tree corresponds to one permutation.

This lower bound does _not_ apply if we use operations other than comparisons. If the keys are integers, we can look at individual digits. If the keys are bounded, we can use them as array indices. These non-comparison-based operations give us additional information that comparison-based algorithms cannot access, and this is what allows us to sort faster.

The trade-off is generality: comparison-based sorting works for any totally ordered type, while the algorithms in this chapter require specific key structure (integers, bounded range, uniform distribution).

## Counting sort

Counting sort is the simplest linear-time sorting algorithm. It works for non-negative integer keys in a known range $[0, k]$ and sorts by _counting_ how many times each value appears.

### The algorithm

1. Create an array `counts` of size $k + 1$, initialized to zeros.
2. For each element in the input, increment `counts[element]`.
3. Compute prefix sums: replace each `counts[i]` with the sum of all counts for values $\leq i$. After this step, `counts[i]` tells us the position _after_ the last occurrence of value $i$ in the sorted output.
4. Walk the input array _in reverse_, placing each element at position `counts[element] - 1` and decrementing the count. Walking in reverse ensures stability.

### Implementation

```typescript
export function countingSort(elements: number[]): number[] {
  if (elements.length <= 1) {
    return elements.slice(0);
  }

  const max = Math.max(...elements);
  const counts = new Array<number>(max + 1).fill(0);

  // Count occurrences
  for (const val of elements) {
    counts[val]!++;
  }

  // Compute prefix sums (cumulative counts)
  for (let i = 1; i <= max; i++) {
    counts[i]! += counts[i - 1]!;
  }

  // Build output array in reverse for stability
  const output = new Array<number>(elements.length);
  for (let i = elements.length - 1; i >= 0; i--) {
    const val = elements[i]!;
    counts[val]!--;
    output[counts[val]!] = val;
  }

  return output;
}
```

### Tracing through an example

Let us sort $A = [4, 2, 2, 8, 3, 3, 1]$.

**Step 1–2: Count occurrences.** The maximum value is 8, so we create `counts` of size 9:

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|-------|---|---|---|---|---|---|---|---|---|
| Count | 0 | 1 | 2 | 2 | 1 | 0 | 0 | 0 | 1 |

**Step 3: Prefix sums.** Each entry becomes the cumulative count:

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|-------|---|---|---|---|---|---|---|---|---|
| Prefix sum | 0 | 1 | 3 | 5 | 6 | 6 | 6 | 6 | 7 |

The prefix sum tells us: 0 elements are $\leq 0$, 1 element is $\leq 1$, 3 elements are $\leq 2$, and so on.

**Step 4: Place elements (reverse scan).**

| $i$ | $A[i]$ | `counts[A[i]]` before | Output position | `counts[A[i]]` after |
|-----|--------|----------------------|-----------------|---------------------|
| 6 | 1 | 1 | 0 | 0 |
| 5 | 3 | 5 | 4 | 4 |
| 4 | 3 | 4 | 3 | 3 |
| 3 | 8 | 7 | 6 | 6 |
| 2 | 2 | 3 | 2 | 2 |
| 1 | 2 | 2 | 1 | 1 |
| 0 | 4 | 6 | 5 | 5 |

Result: $[1, 2, 2, 3, 3, 4, 8]$.

Notice that the two 2s and the two 3s appear in the same relative order as in the input — counting sort is _stable_.

### Stability

Counting sort's stability is not an accident; it is a consequence of scanning the input in reverse during the placement step. When we encounter the last occurrence of a value (scanning right to left), we place it at the highest available position for that value. The second-to-last occurrence goes one position earlier, and so on. This preserves the original relative order among elements with equal keys.

Stability matters when sorting records by one key while preserving order on another, and it is essential for counting sort's role as a subroutine in radix sort.

### Complexity analysis

**Time.** The algorithm makes four passes:
1. Finding the maximum: $O(n)$.
2. Counting occurrences: $O(n)$.
3. Computing prefix sums: $O(k)$.
4. Placing elements in the output: $O(n)$.

Total: $O(n + k)$, where $k$ is the maximum value.

**Space.** The `counts` array uses $O(k)$ space, and the output array uses $O(n)$ space. Total: $O(n + k)$.

**When is counting sort practical?** When $k = O(n)$, counting sort runs in $O(n)$ time and is excellent. When $k \gg n$ (for example, sorting 10 numbers in the range $[0, 10^9]$), the $O(k)$ space and time become prohibitive, and a comparison-based sort would be faster.

### Properties

| Property | Counting sort |
|----------|--------------|
| Time | $O(n + k)$ |
| Space | $O(n + k)$ |
| Stable | Yes |
| In-place | No |
| Key type | Non-negative integers in $[0, k]$ |

## Radix sort

Radix sort extends counting sort to handle integers with many digits. Instead of sorting on the entire key at once (which would require a `counts` array as large as the key range), radix sort processes one digit at a time, from least significant to most significant.

### The algorithm

1. Find the maximum element to determine the number of digits $d$.
2. For each digit position from least significant to most significant:
   - Sort the array by that digit using a stable sort (counting sort restricted to digits 0–9).

The key insight is that we must process digits from _least_ significant to _most_ significant, and each digit sort must be _stable_. After sorting by the units digit, elements with the same units digit are in a consistent order. When we then sort by the tens digit, stability ensures that elements with the same tens digit remain sorted by their units digit — and so on.

### Why least significant digit first?

It may seem counterintuitive to start with the least significant digit. Consider sorting $[329, 457, 657, 839, 436, 720, 355]$. If we sorted by the most significant digit first, we would get groups starting with 3, 4, 6, 7. But then sorting by the next digit within each group is exactly the original problem on smaller arrays — we have made no progress toward a linear-time algorithm.

LSD radix sort avoids this by exploiting stability. After sorting by digit $i$, the relative order of elements that agree on digit $i$ is determined by the previous passes on digits $0, 1, \ldots, i-1$. When we sort by digit $i + 1$, stability preserves this order among elements with the same digit at position $i + 1$.

### Implementation

The digit-level sorting subroutine is a specialized counting sort that operates on a single digit position:

```typescript
export function countingSortByDigit(
  elements: number[],
  exp: number,
): number[] {
  const n = elements.length;
  if (n <= 1) {
    return elements.slice(0);
  }

  const output = new Array<number>(n);
  const counts = new Array<number>(10).fill(0);

  // Count occurrences of each digit at position exp
  for (const val of elements) {
    const digit = Math.floor(val / exp) % 10;
    counts[digit]!++;
  }

  // Compute prefix sums
  for (let i = 1; i < 10; i++) {
    counts[i]! += counts[i - 1]!;
  }

  // Build output in reverse for stability
  for (let i = n - 1; i >= 0; i--) {
    const val = elements[i]!;
    const digit = Math.floor(val / exp) % 10;
    counts[digit]!--;
    output[counts[digit]!] = val;
  }

  return output;
}
```

The main radix sort function calls this subroutine for each digit position:

```typescript
export function radixSort(elements: number[]): number[] {
  if (elements.length <= 1) {
    return elements.slice(0);
  }

  const max = Math.max(...elements);

  let result = elements.slice(0);

  // Process each digit position from least significant to most significant
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    result = countingSortByDigit(result, exp);
  }

  return result;
}
```

### Tracing through an example

Sort $A = [170, 45, 75, 90, 802, 24, 2, 66]$.

**Pass 1: Sort by units digit** ($\text{exp} = 1$):

| Element | Units digit |
|---------|------------|
| 170 | 0 |
| 45 | 5 |
| 75 | 5 |
| 90 | 0 |
| 802 | 2 |
| 24 | 4 |
| 2 | 2 |
| 66 | 6 |

After stable sort by units digit: $[170, 90, 802, 2, 24, 45, 75, 66]$.

**Pass 2: Sort by tens digit** ($\text{exp} = 10$):

| Element | Tens digit |
|---------|-----------|
| 170 | 7 |
| 90 | 9 |
| 802 | 0 |
| 2 | 0 |
| 24 | 2 |
| 45 | 4 |
| 75 | 7 |
| 66 | 6 |

After stable sort by tens digit: $[802, 2, 24, 45, 66, 170, 75, 90]$.

Notice that 802 and 2 both have tens digit 0, and they remain in the order established by Pass 1 (802 before 2) thanks to stability.

**Pass 3: Sort by hundreds digit** ($\text{exp} = 100$):

| Element | Hundreds digit |
|---------|---------------|
| 802 | 8 |
| 2 | 0 |
| 24 | 0 |
| 45 | 0 |
| 66 | 0 |
| 170 | 1 |
| 75 | 0 |
| 90 | 0 |

After stable sort by hundreds digit: $[2, 24, 45, 66, 75, 90, 170, 802]$.

Result: $[2, 24, 45, 66, 75, 90, 170, 802]$. Sorted!

### Correctness

**Claim.** After $i$ passes of LSD radix sort, the array is sorted with respect to the last $i$ digits.

**Proof by induction.** After the first pass, the array is sorted by the units digit (the counting sort is correct). Assume after $i$ passes the array is sorted by the last $i$ digits. Consider two elements $a$ and $b$ after pass $i + 1$:

- If $a$ and $b$ differ in digit $i + 1$: the sort on digit $i + 1$ places them correctly.
- If $a$ and $b$ have the same digit at position $i + 1$: since the sort is _stable_, their relative order is preserved from the previous pass, which (by hypothesis) ordered them correctly by their last $i$ digits.

In both cases, the elements are correctly ordered by their last $i + 1$ digits. $\square$

### Complexity analysis

**Time.** Radix sort makes $d$ passes, where $d$ is the number of digits in the maximum element. Each pass is a counting sort with $k = 10$ (the radix), which takes $O(n + 10) = O(n)$ time. Total:

$$T(n) = O(d \cdot n) = O(dn).$$

For $d = O(1)$ (bounded number of digits), this is $O(n)$. More generally, if the values are in the range $[0, n^c - 1]$ for some constant $c$, then $d = O(c \log_{10} n) = O(\log n)$, and radix sort runs in $O(n \log n)$ — no better than comparison sort. Radix sort achieves true linear time only when $d$ is bounded by a constant independent of $n$.

**Space.** Each counting sort pass uses $O(n + 10) = O(n)$ auxiliary space.

### Properties

| Property | Radix sort |
|----------|-----------|
| Time | $O(dn)$ where $d$ = number of digits |
| Space | $O(n)$ |
| Stable | Yes |
| Key type | Non-negative integers |

## Bucket sort

Bucket sort works well when the input is drawn from a _uniform distribution_ over a known range. It distributes elements into equal-width buckets, sorts each bucket individually (typically with insertion sort), and concatenates the sorted buckets.

### The algorithm

1. Determine the range $[\min, \max]$ of the input.
2. Create $n$ empty buckets spanning the range.
3. Place each element in its bucket: element $x$ goes to bucket $\lfloor (x - \min) / (\max - \min) \cdot (n - 1) \rfloor$.
4. Sort each bucket using insertion sort.
5. Concatenate all buckets.

### Implementation

```typescript
export function bucketSort(
  elements: number[],
  bucketCount?: number,
): number[] {
  const n = elements.length;
  if (n <= 1) {
    return elements.slice(0);
  }

  const max = Math.max(...elements);
  const min = Math.min(...elements);

  // If all elements are the same, return a copy
  if (max === min) {
    return elements.slice(0);
  }

  const numBuckets = bucketCount ?? n;
  const range = max - min;

  // Create empty buckets
  const buckets: number[][] = [];
  for (let i = 0; i < numBuckets; i++) {
    buckets.push([]);
  }

  // Distribute elements into buckets
  for (const val of elements) {
    let index = Math.floor(
      ((val - min) / range) * (numBuckets - 1)
    );
    if (index >= numBuckets) {
      index = numBuckets - 1;
    }
    buckets[index]!.push(val);
  }

  // Sort each bucket using insertion sort and concatenate
  const result: number[] = [];
  for (const bucket of buckets) {
    insertionSortInPlace(bucket);
    for (const val of bucket) {
      result.push(val);
    }
  }

  return result;
}
```

The subroutine `insertionSortInPlace` is efficient for the small bucket sizes expected under uniform distribution:

```typescript
function insertionSortInPlace(arr: number[]): void {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]!;
    let j = i - 1;
    while (j >= 0 && arr[j]! > key) {
      arr[j + 1] = arr[j]!;
      j--;
    }
    arr[j + 1] = key;
  }
}
```

### Tracing through an example

Sort $A = [0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68]$ using 10 buckets.

Here the range is $[0.12, 0.94]$, so each bucket covers an interval of width roughly $0.082$.

| Bucket | Elements |
|--------|----------|
| 0 | [0.17, 0.12] |
| 1 | [0.26, 0.21, 0.23] |
| 3 | [0.39] |
| 6 | [0.72, 0.68] |
| 8 | [0.78] |
| 9 | [0.94] |

After sorting each bucket and concatenating: $[0.12, 0.17, 0.21, 0.23, 0.26, 0.39, 0.68, 0.72, 0.78, 0.94]$.

### Complexity analysis

**Expected time under uniform distribution.** If $n$ elements are drawn independently and uniformly from $[0, 1)$, then with $n$ buckets each element lands in a random bucket. The expected number of elements per bucket is 1. By a balls-into-bins argument, the expected total cost of sorting all buckets is:

$$\sum_{i=0}^{n-1} O\bigl(\mathbb{E}[n_i^2]\bigr)$$

where $n_i$ is the number of elements in bucket $i$. Since each element independently falls into bucket $i$ with probability $1/n$, we have $\mathbb{E}[n_i] = 1$ and $\mathbb{E}[n_i^2] = 2 - 1/n$. Summing over $n$ buckets:

$$\sum_{i=0}^{n-1} O(2 - 1/n) = O(n).$$

Including the $O(n)$ distribution and concatenation steps, the total expected time is $O(n)$.

**Worst case.** If all elements fall into one bucket, we pay $O(n^2)$ for insertion sort on that bucket. This happens when the distribution is far from uniform.

**Space.** The buckets collectively hold $n$ elements, plus $O(n)$ for the bucket array structure. Total: $O(n)$.

### Properties

| Property | Bucket sort |
|----------|------------|
| Expected time | $O(n)$ (uniform distribution) |
| Worst-case time | $O(n^2)$ |
| Space | $O(n)$ |
| Stable | Yes (with stable per-bucket sort) |
| Key type | Numeric keys in a known range |

## Comparison of linear-time sorts

| Algorithm | Time | Space | Stable | Assumptions |
|-----------|------|-------|--------|-------------|
| Counting sort | $O(n + k)$ | $O(n + k)$ | Yes | Integer keys in $[0, k]$ |
| Radix sort | $O(dn)$ | $O(n)$ | Yes | Integer keys with $d$ digits |
| Bucket sort | $O(n)$ expected | $O(n)$ | Yes | Uniformly distributed keys |

All three algorithms achieve linear time under specific conditions. Counting sort is simplest and best when the key range $k$ is not much larger than $n$. Radix sort extends counting sort to larger ranges by processing one digit at a time. Bucket sort is ideal for floating-point data with a known, roughly uniform distribution.

None of these algorithms contradicts the $\Omega(n \log n)$ comparison lower bound — they bypass it by using non-comparison operations (indexing into an array by key value, extracting digits).

## The selection problem

We now turn to a different problem. Given an unsorted array of $n$ elements and an integer $k$ (with $0 \leq k < n$), find the $k$th smallest element — the element that would be at index $k$ if the array were sorted.

Special cases include:
- $k = 0$: the minimum (trivially solvable in $O(n)$).
- $k = n - 1$: the maximum.
- $k = \lfloor n/2 \rfloor$: the median.

The naive approach is to sort the array ($O(n \log n)$) and return the element at index $k$. Can we do better? Yes — we can solve the selection problem in $O(n)$ time.

## Quickselect

Quickselect (also known as Hoare's selection algorithm) is the selection analogue of quicksort. Like quicksort, it partitions the array around a pivot. But unlike quicksort, it only recurses into _one_ side — the side that contains the desired element.

### The algorithm

1. Choose a random pivot and partition the array.
2. If the pivot lands at position $k$, we are done.
3. If $k < $ pivot's position, recurse on the left partition.
4. If $k > $ pivot's position, recurse on the right partition.

### Implementation

```typescript
export function quickselect(
  elements: number[],
  k: number,
): number {
  if (elements.length === 0) {
    throw new RangeError('Cannot select from an empty array');
  }
  if (k < 0 || k >= elements.length) {
    throw new RangeError(
      `k=${k} is out of bounds for array of length ${elements.length}`,
    );
  }

  const copy = elements.slice(0);
  return select(copy, 0, copy.length - 1, k);
}

function select(
  arr: number[],
  left: number,
  right: number,
  k: number,
): number {
  if (left === right) {
    return arr[left]!;
  }

  const pivotIndex = randomizedPartition(arr, left, right);

  if (k === pivotIndex) {
    return arr[pivotIndex]!;
  } else if (k < pivotIndex) {
    return select(arr, left, pivotIndex - 1, k);
  } else {
    return select(arr, pivotIndex + 1, right, k);
  }
}
```

The `randomizedPartition` function is identical to the one used in randomized quicksort: choose a random element, swap it to the end, partition using the Lomuto scheme.

### Tracing through an example

Find the 3rd smallest element ($k = 2$, zero-indexed) in $A = [7, 3, 9, 1, 5]$.

The sorted array would be $[1, 3, 5, 7, 9]$, so the answer is 5.

**Iteration 1:** Suppose the random pivot is 7 (index 0). After partitioning: $[3, 1, 5, 7, 9]$, pivot at index 3.

We want $k = 2 < 3$, so recurse on the left partition $[3, 1, 5]$ (indices 0–2).

**Iteration 2:** Suppose the random pivot is 1 (index 1 of the subarray). After partitioning: $[1, 3, 5, 7, 9]$, pivot at index 0.

We want $k = 2 > 0$, so recurse on the right partition $[3, 5]$ (indices 1–2).

**Iteration 3:** Suppose the random pivot is 5 (index 2). After partitioning: $[1, 3, 5, 7, 9]$, pivot at index 2.

We want $k = 2 = 2$. Done! Return $A[2] = 5$.

### Complexity analysis

**Expected time.** The analysis is similar to randomized quicksort. With a random pivot, the expected partition splits the array roughly in half. But unlike quicksort, we recurse into only one partition, so the expected work at each level halves:

$$\mathbb{E}[T(n)] = n + \mathbb{E}[T(n/2)] \approx n + n/2 + n/4 + \cdots = 2n = O(n).$$

More precisely, the expected number of comparisons is at most $4n$ (by an analysis similar to the randomized quicksort proof, summing indicator random variables over pairs).

**Worst case.** If the pivot always lands at one extreme, we have:

$$T(n) = n + T(n - 1) = O(n^2).$$

This is the same worst case as quicksort, but it is extremely unlikely with random pivots.

### Properties

| Property | Quickselect |
|----------|------------|
| Expected time | $O(n)$ |
| Worst-case time | $O(n^2)$ |
| Space | $O(n)$ for copy + $O(\log n)$ expected stack |
| Deterministic | No (randomized) |

## Median of medians

Can we achieve $O(n)$ _worst-case_ selection? The answer is yes, using a clever pivot-selection strategy called _median of medians_ (also known as BFPRT, after its five inventors: Blum, Floyd, Pratt, Rivest, and Tarjan, 1973).

The idea: instead of choosing a random pivot, choose a pivot that is _guaranteed_ to be near the median, ensuring that each partition eliminates a constant fraction of the elements.

### The algorithm

1. Divide the $n$ elements into groups of 5.
2. Find the median of each group by sorting (5 elements can be sorted in constant time).
3. Recursively compute the median of these $\lceil n/5 \rceil$ medians.
4. Use this "median of medians" as the pivot for partitioning.
5. Recurse into the appropriate partition (just like quickselect).

### Why groups of 5?

The choice of 5 is not arbitrary. It is the smallest odd group size that makes the recurrence work out to $O(n)$. The median of medians is guaranteed to be larger than at least $3 \cdot \lceil n/10 \rceil - 2$ elements and smaller than at least $3 \cdot \lceil n/10 \rceil - 2$ elements. This means each recursive call operates on at most roughly $7n/10$ elements.

Here is why: the median of medians is larger than the medians of half the groups (roughly $n/10$ groups), and each of those medians is larger than 2 elements in its group. Therefore, the pivot is larger than at least $3n/10$ elements. By symmetry, it is also smaller than at least $3n/10$ elements. The worst-case partition is therefore at most $7n/10$.

### Implementation

```typescript
export function medianOfMedians(
  elements: number[],
  k: number,
): number {
  if (elements.length === 0) {
    throw new RangeError('Cannot select from an empty array');
  }
  if (k < 0 || k >= elements.length) {
    throw new RangeError(
      `k=${k} is out of bounds for array of length ${elements.length}`,
    );
  }

  const copy = elements.slice(0);
  return selectMoM(copy, 0, copy.length - 1, k);
}
```

The core recursive function:

```typescript
function selectMoM(
  arr: number[],
  left: number,
  right: number,
  k: number,
): number {
  // Base case: small enough to sort directly
  if (right - left < 5) {
    insertionSortRange(arr, left, right);
    return arr[k]!;
  }

  // Step 1: Divide into groups of 5, find median of each
  const numGroups = Math.ceil((right - left + 1) / 5);
  for (let i = 0; i < numGroups; i++) {
    const groupLeft = left + i * 5;
    const groupRight = Math.min(groupLeft + 4, right);

    insertionSortRange(arr, groupLeft, groupRight);

    const medianIndex =
      groupLeft + Math.floor((groupRight - groupLeft) / 2);
    swap(arr, medianIndex, left + i);
  }

  // Step 2: Recursively find the median of the medians
  const medianOfMediansIndex =
    left + Math.floor((numGroups - 1) / 2);
  selectMoM(arr, left, left + numGroups - 1, medianOfMediansIndex);

  // Step 3: Partition around the median of medians
  const pivotIndex = partitionAroundPivot(
    arr, left, right, medianOfMediansIndex
  );

  if (k === pivotIndex) {
    return arr[pivotIndex]!;
  } else if (k < pivotIndex) {
    return selectMoM(arr, left, pivotIndex - 1, k);
  } else {
    return selectMoM(arr, pivotIndex + 1, right, k);
  }
}
```

### Tracing through an example

Find the median ($k = 7$, zero-indexed) in:

$A = [12, 3, 5, 7, 19, 26, 4, 1, 8, 15, 20, 11, 9, 2, 6]$.

The sorted array is $[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 19, 20, 26]$, so the answer at $k=7$ is 8.

**Step 1: Divide into groups of 5 and find medians.**

| Group | Elements | Sorted | Median |
|-------|----------|--------|--------|
| 1 | [12, 3, 5, 7, 19] | [3, 5, 7, 12, 19] | 7 |
| 2 | [26, 4, 1, 8, 15] | [1, 4, 8, 15, 26] | 8 |
| 3 | [20, 11, 9, 2, 6] | [2, 6, 9, 11, 20] | 9 |

**Step 2: Median of medians.** The medians are $[7, 8, 9]$. The median of this group is 8.

**Step 3: Partition around 8.** Using 8 as the pivot, elements $< 8$ go left, elements $> 8$ go right:

$[\underbrace{3, 5, 7, 4, 1, 2, 6}_{< 8},\ \underline{8},\ \underbrace{12, 19, 26, 15, 20, 11, 9}_{> 8}]$

The pivot lands at index 7. We want $k = 7$, and the pivot is at index 7. Done! Return 8.

### Complexity analysis

**Time.** Let $T(n)$ be the worst-case time for selecting from $n$ elements.

The algorithm does the following work:
- Sorting $\lceil n/5 \rceil$ groups of 5: $O(n)$ total.
- Finding the median of medians: $T(\lceil n/5 \rceil)$.
- Partitioning: $O(n)$.
- Recursing into the larger partition: at most $T(7n/10)$.

This gives the recurrence:

$$T(n) \leq T(n/5) + T(7n/10) + O(n).$$

We claim $T(n) = O(n)$. To verify, assume $T(n) \leq cn$ for some constant $c$. Then:

$$T(n) \leq cn/5 + 7cn/10 + an = cn(1/5 + 7/10) + an = 9cn/10 + an = cn$$

provided $c \geq 10a$. Since $1/5 + 7/10 = 9/10 < 1$, the two recursive calls together operate on a shrinking fraction of the input, and the algorithm runs in $O(n)$ time.

**Space.** The recursion has depth $O(\log n)$ (each level reduces the problem by a constant factor), so the stack space is $O(\log n)$. Combined with the $O(n)$ copy, total space is $O(n)$.

### Practical considerations

While the median-of-medians algorithm is a beautiful theoretical result — it proved that deterministic linear-time selection is possible — it is rarely used in practice. The constant factor hidden in the $O(n)$ is large (roughly 5–10× slower than randomized quickselect for typical inputs). Randomized quickselect is almost always faster in practice because:

1. It avoids the overhead of computing medians of groups.
2. Random pivots are usually good enough.
3. The probability of quadratic behavior is astronomically small.

The practical value of median of medians is primarily as a _fallback_: some implementations (e.g., the `introselect` algorithm in C++ STL) start with quickselect and switch to median of medians if the recursion depth grows too large, guaranteeing worst-case $O(n)$ while maintaining fast average-case performance.

### Properties

| Property | Median of medians |
|----------|------------------|
| Worst-case time | $O(n)$ |
| Space | $O(n)$ |
| Deterministic | Yes |
| Practical | Slower than quickselect due to large constants |

## Chapter summary

In this chapter we studied algorithms that break the $\Omega(n \log n)$ comparison-based sorting barrier and solve the selection problem in linear time:

- **Counting sort** sorts non-negative integers in $O(n + k)$ time by counting occurrences and computing prefix sums. It is stable and serves as a building block for radix sort.

- **Radix sort** extends counting sort to handle integers with multiple digits, sorting digit by digit from least significant to most significant. It runs in $O(dn)$ time where $d$ is the number of digits. The key requirement is a stable subroutine sort.

- **Bucket sort** distributes elements into buckets, sorts each bucket, and concatenates. Under a uniform distribution, the expected time is $O(n)$. Its worst case is $O(n^2)$ when all elements land in one bucket.

- **Quickselect** finds the $k$th smallest element in expected $O(n)$ time by partitioning around a random pivot and recursing into one side. It is the practical algorithm of choice for selection.

- **Median of medians** achieves worst-case $O(n)$ selection through a carefully chosen pivot: the median of group medians. While theoretically optimal, its large constant factor makes it slower than randomized quickselect in practice.

The linear-time sorting algorithms teach an important lesson: algorithmic lower bounds depend on the model of computation. The $\Omega(n \log n)$ bound is real for comparison-based sorting, but by stepping outside the comparison model — using integers as array indices, extracting digits — we can do better. The selection algorithms show that finding a single order statistic is fundamentally easier than fully sorting, requiring only $O(n)$ time regardless of the method.

## Exercises

**Exercise 6.1.** Trace through counting sort on the input $[3, 0, 1, 3, 1, 0, 2, 3]$. Show the `counts` array after each step (counting, prefix sums, placement). Verify that the sort is stable by tracking the original indices of elements with value 3.

**Exercise 6.2.** Radix sort processes digits from least significant to most significant, using a _stable_ sort at each step. What goes wrong if we process digits from most significant to least significant? Give a concrete example where MSD radix sort (without special handling) produces incorrect output.

**Exercise 6.3.** Counting sort uses $O(k)$ space for the counts array, where $k$ is the maximum value. If we need to sort $n$ integers in the range $[0, n^2)$, we could use counting sort directly with $k = n^2$, or we could use radix sort with a base-$n$ representation (2 digits). Compare the time and space complexity of both approaches.

**Exercise 6.4.** Consider a modification of quickselect where, instead of choosing a random pivot, we always choose the first element as the pivot. Describe an input of size $n$ for which this modified quickselect takes $\Theta(n^2)$ time to find the median. Then describe an input for which it takes $\Theta(n)$ time.

**Exercise 6.5.** The median-of-medians algorithm divides elements into groups of 5. What happens if we use groups of 3 instead? Set up the recurrence and show that it does _not_ solve to $O(n)$. What about groups of 7? (Hint: compute the fraction of elements guaranteed to be eliminated at each step for each group size.)
