# Efficient Sorting

_In Chapter 4 we proved that any comparison-based sorting algorithm must make $\Omega(n \log n)$ comparisons in the worst case. The three elementary algorithms we studied — bubble sort, selection sort, and insertion sort — fall short of this bound, requiring $\Theta(n^2)$ time. In this chapter we meet three algorithms that close the gap: merge sort, quicksort, and heapsort. All three achieve $O(n \log n)$ time and are, in different senses, asymptotically optimal. They use the divide-and-conquer strategy from Chapter 3, but apply it in very different ways — merge sort divides trivially and combines carefully, quicksort divides carefully and combines trivially, and heapsort uses a heap data structure to repeatedly extract the maximum. We also study randomized quicksort, which uses random pivot selection to guarantee expected $O(n \log n)$ performance on every input._

## Merge sort

Merge sort is the most straightforward application of divide-and-conquer to sorting. The idea is simple: split the array in half, recursively sort each half, and then merge the two sorted halves into a single sorted array.

### The algorithm

1. If the array has zero or one elements, it is already sorted. Return.
2. Divide the array into two halves of roughly equal size.
3. Recursively sort each half.
4. Merge the two sorted halves into a single sorted array.

The key insight is that merging two sorted arrays of total length $n$ takes $O(n)$ time: we scan both arrays from left to right, always taking the smaller of the two current elements.

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

### Tracing through an example

Let us sort $A = [38, 27, 43, 3, 9, 82, 10]$.

**Divide phase** (conceptual; our bottom-up implementation avoids this):

```
                [38, 27, 43, 3, 9, 82, 10]
               /                          \
        [38, 27, 43, 3]             [9, 82, 10]
        /            \               /        \
    [38, 27]      [43, 3]       [9, 82]     [10]
    /     \       /     \       /     \
  [38]   [27]  [43]    [3]   [9]   [82]
```

**Merge phase:**

| Step | Left | Right | Merged |
|------|------|-------|--------|
| 1 | [38] | [27] | [27, 38] |
| 2 | [43] | [3] | [3, 43] |
| 3 | [27, 38] | [3, 43] | [3, 27, 38, 43] |
| 4 | [9] | [82] | [9, 82] |
| 5 | [9, 82] | [10] | [9, 10, 82] |
| 6 | [3, 27, 38, 43] | [9, 10, 82] | [3, 9, 10, 27, 38, 43, 82] |

Result: $[3, 9, 10, 27, 38, 43, 82]$.

### Bottom-up implementation

The classic recursive merge sort divides the array top-down and merges bottom-up. An equivalent approach is to skip the divide phase entirely and work bottom-up from the start: first merge pairs of single elements into sorted pairs, then merge pairs of pairs into sorted 4-element runs, and so on, doubling the run length each time.

```typescript
export function mergeSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = elements.slice(0);
  let step = 1;

  while (step < copy.length) {
    step = step * 2;
    for (let start = 0; start < copy.length; start = start + step) {
      const middle = Math.min(start + step / 2, copy.length);
      const end = Math.min(start + step, copy.length);

      merge(copy, start, middle, end, comparator);
    }
  }
  return copy;
}
```

The bottom-up approach has the same time complexity as the recursive version but avoids the $O(\log n)$ recursion stack overhead.

### Correctness

**Claim.** The merge procedure correctly merges two sorted subarrays.

At each step of the main loop, we choose the smaller of the two current front elements. Since both subarrays are sorted, the current front element of each is the smallest remaining element in that subarray. Therefore, the smaller of the two fronts is the smallest remaining element overall. After the main loop, one subarray is exhausted and we append the remainder of the other (which is already sorted). The result is a sorted permutation of all elements from both subarrays. The `<= 0` comparison ensures that equal elements from the left subarray come first, preserving stability.

**Claim.** Merge sort correctly sorts the array.

We argue by induction on the run length. In the first iteration (`step = 2`), each merge operates on runs of length 1, which are trivially sorted. Each merge produces a sorted run of length 2. In each subsequent iteration, the runs from the previous iteration are sorted (by the inductive hypothesis), and the merge procedure correctly combines pairs of sorted runs into longer sorted runs. After $\lceil \log_2 n \rceil$ iterations, the entire array is a single sorted run. $\square$

### Complexity analysis

**Time.** At each level of the merge tree, the total work across all merges is $O(n)$ (each element is compared and copied once). The number of levels is $\lceil \log_2 n \rceil$. Therefore:

$$T(n) = O(n \log n).$$

This holds in the best case, worst case, and average case — merge sort is _not_ adaptive to the input's presortedness.

The same result follows from the recurrence for the recursive version:

$$T(n) = 2T(n/2) + O(n), \quad T(1) = O(1).$$

By the Master Theorem (case 2, with $a = 2$, $b = 2$, $f(n) = O(n)$), we get $T(n) = O(n \log n)$.

**Space.** The merge procedure uses an auxiliary array of size up to $n$ to hold merged elements. Combined with the $O(n)$ copy of the input, the total space is $O(n)$. The bottom-up version uses no recursion stack; the recursive version would add $O(\log n)$ stack frames.

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

### Tracing through an example

Let us sort $A = [7, 2, 1, 6, 8, 5, 3, 4]$ with middle-element pivot selection.

**First partition** (full array, indices 0–7):

The middle index is $\lfloor (0 + 7)/2 \rfloor = 3$, so the pivot is $A[3] = 6$. Swap it to the end:

$[7, 2, 1, 4, 8, 5, 3, \underline{6}]$

Scan with `storeIndex = 0`:

| $i$ | $A[i]$ | $A[i] < 6$? | Action | `storeIndex` |
|-----|--------|------------|--------|-------------|
| 0 | 7 | No | — | 0 |
| 1 | 2 | Yes | Swap $A[0]$ and $A[1]$ | 1 |
| 2 | 1 | Yes | Swap $A[1]$ and $A[2]$ | 2 |
| 3 | 4 | Yes | Swap $A[2]$ and $A[3]$ | 3 |
| 4 | 8 | No | — | 3 |
| 5 | 5 | Yes | Swap $A[3]$ and $A[5]$ | 4 |
| 6 | 3 | Yes | Swap $A[4]$ and $A[6]$ | 5 |

Place pivot at `storeIndex = 5`:

$[2, 1, 4, 5, 3, \underline{6}, 7, 8]$

Now 6 is in its final position. Recursively sort $[2, 1, 4, 5, 3]$ (indices 0–4) and $[7, 8]$ (indices 6–7).

The recursion continues, each time placing one element in its final position, until the base cases (subarrays of size 0 or 1) are reached.

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
  const copy = elements.slice(0);

  sort(copy, 0, copy.length - 1, comparator);
  return copy;
}
```

### Correctness

**Claim.** After `partition(arr, start, end)`, the pivot is in its correct final sorted position.

The partition loop moves all elements less than the pivot to positions before `storeIndex`, and leaves elements greater than or equal to the pivot after `storeIndex`. The pivot is then placed at `storeIndex`. Every element before it is smaller, every element after it is at least as large — this is exactly where the pivot belongs in the sorted output.

**Claim.** Quicksort correctly sorts the array.

By induction on the subarray size. Subarrays of size 0 or 1 are trivially sorted (base case). For a subarray of size $k > 1$: partition places the pivot correctly, then quicksort recursively sorts the left subarray (elements $<$ pivot) and right subarray (elements $\geq$ pivot). By the inductive hypothesis, both recursive calls produce sorted subarrays. Since every element in the left subarray is $\leq$ pivot $\leq$ every element in the right subarray, the entire array is sorted. $\square$

### Complexity analysis

The performance of quicksort depends on the quality of the partition — how evenly the pivot divides the array.

**Best case.** If the pivot always lands in the middle, each partition splits the array into two roughly equal halves. The recurrence is the same as merge sort:

$$T(n) = 2T(n/2) + O(n) = O(n \log n).$$

**Worst case.** If the pivot always lands at one extreme (the smallest or largest element), one partition has $n - 1$ elements and the other has 0. The recurrence becomes:

$$T(n) = T(n - 1) + O(n) = O(n^2).$$

This worst case occurs with our middle-element pivot when the input is specially constructed, and with the first-element or last-element pivot strategies on already-sorted or reverse-sorted input.

**Average case.** On a random permutation with any fixed pivot strategy, the expected running time is $O(n \log n)$. Intuitively, even moderately unbalanced partitions (say, 1:9 splits) only add a constant factor to the recursion depth: the shorter side shrinks by a factor of 10, and $\log_{10} n = O(\log n)$.

More precisely, if we assume each element is equally likely to be the pivot, the expected number of comparisons is:

$$\mathbb{E}[C(n)] = 2(n + 1)H_n - 4n \approx 2n \ln n \approx 1.39\, n \log_2 n$$

where $H_n = \sum_{k=1}^{n} 1/k$ is the $n$th harmonic number. This is only about 39% more comparisons than merge sort's worst case of $n \log_2 n$.

**Space.** Quicksort sorts in place (aside from our defensive copy of the input). The recursion stack has depth $O(\log n)$ in the best case but $O(n)$ in the worst case. Tail-call optimization or explicit stack management can limit the worst-case stack depth to $O(\log n)$ by always recursing on the smaller partition first.

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

4. **Adaptable.** In practice, quicksort implementations use optimizations like switching to insertion sort for small subarrays, choosing better pivots (median-of-three), and using three-way partitioning for inputs with many duplicates.

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
  const arr = elements.slice(0);
  let heapSize = arr.length;

  buildHeap(arr, heapSize, comparator);
  for (let i = arr.length - 1; i > 0; i--) {
    const temp = arr[0]!;
    arr[0] = arr[i]!;
    arr[i] = temp;
    heapSize--;
    heapify(arr, heapSize, 0, comparator);
  }
  return arr;
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

| Step | Swap | Array after swap | Heapify root | Result |
|------|------|-----------------|-------------|--------|
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

**Space.** Heapsort sorts in place. The only auxiliary space is $O(1)$ for temporary variables (plus $O(n)$ for our defensive copy).

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
  const copy = elements.slice(0);

  sort(copy, 0, copy.length - 1, comparator);
  return copy;
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
