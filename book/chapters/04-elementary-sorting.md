# Elementary Sorting

_Sorting is one of the most fundamental problems in computer science. In this chapter we define the sorting problem precisely, introduce the concepts of stability and in-place sorting, and study three elementary sorting algorithms — bubble sort, selection sort, and insertion sort. All three run in $O(n^2)$ time in the worst case, but they differ in important ways: their behavior on nearly sorted input, their stability properties, and their practical performance. We close the chapter by proving that any comparison-based sorting algorithm must make $\Omega(n \log n)$ comparisons in the worst case — a lower bound that the elementary algorithms do not achieve, motivating the efficient algorithms of Chapter 5._

## The sorting problem

Sorting is the problem of rearranging a collection of elements into a specified order. It arises constantly in practice — in database queries, in preparing data for binary search, in eliminating duplicates, in scheduling, and in countless other contexts. Knuth devoted an entire volume of _The Art of Computer Programming_ to sorting and searching, calling sorting "perhaps the most deeply studied problem in computer science."

---

> **Definition 4.1 — The sorting problem**
>
> **Input:** A sequence of $n$ elements $\langle a_1, a_2, \ldots, a_n \rangle$ and a total ordering $\leq$ on the elements.
>
> **Output:** A permutation $\langle a'_1, a'_2, \ldots, a'_n \rangle$ of the input such that $a'_1 \leq a'_2 \leq \cdots \leq a'_n$.

---

In TypeScript, we express the ordering through a _comparator function_:

```typescript
export type Comparator<T> = (a: T, b: T) => number;
```

The comparator returns a negative number if $a < b$, zero if $a = b$, and a positive number if $a > b$. For numbers in ascending order, the comparator is simply:

```typescript
export const numberComparator: Comparator<number> = (a, b) => a - b;
```

All three sorting algorithms in this chapter accept an optional comparator, defaulting to `numberComparator`. This makes them generic: they can sort arrays of any type, provided an appropriate comparator is supplied.

## Stability

When a sequence contains elements that compare as equal, there is a choice: should the algorithm preserve the original relative order of equal elements, or is any arrangement of equal elements acceptable?

---

> **Definition 4.2 — Stable sort**
>
> A sorting algorithm is **stable** if, whenever two elements $a_i$ and $a_j$ satisfy $a_i = a_j$ and $i < j$ in the input, then $a_i$ appears before $a_j$ in the output.

---

Stability matters when elements carry additional data beyond the sort key. For example, suppose we sort a list of students by grade, and two students — Alice and Bob — both have a grade of 90. If Alice appeared before Bob in the original list, a stable sort guarantees she still appears before Bob in the sorted output. An unstable sort might swap them.

Stability also enables _multi-key sorting_ by composition: to sort by last name and then by first name, we first sort by first name (using a stable sort), then sort by last name (using a stable sort). The second sort preserves the relative order established by the first sort within each group of equal last names.

Of the three algorithms in this chapter, **bubble sort** and **insertion sort** are stable, while **selection sort** is not.

## In-place sorting

---

> **Definition 4.3 — In-place sort**
>
> A sorting algorithm is **in-place** if it uses $O(1)$ auxiliary space — that is, a constant amount of memory beyond the input array.

---

All three algorithms in this chapter are inherently in-place: they sort by swapping and shifting elements within the array, using only a constant number of temporary variables. Our TypeScript implementations copy the input array before sorting (to avoid mutating the caller's data), which adds $O(n)$ auxiliary space for the copy. The sorting logic itself, however, operates in-place on this copy.

## Bubble sort

Bubble sort is perhaps the simplest sorting algorithm. It works by repeatedly scanning the array from left to right, swapping adjacent elements that are out of order. After each complete pass, the largest unsorted element has "bubbled" to its correct position at the end. The process repeats until no swaps are needed, meaning the array is sorted.

### The algorithm

1. Repeat the following until no swap occurs during a complete pass:
   - For $i = 1, 2, \ldots, n - 1$:
     - If $a[i-1] > a[i]$, swap $a[i-1]$ and $a[i]$.

### Implementation

```typescript
export function bubbleSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = elements.slice(0);
  let wasSwapped = true;

  while (wasSwapped) {
    wasSwapped = false;
    for (let i = 1; i < copy.length; i++) {
      if (comparator(copy[i - 1]!, copy[i]!) > 0) {
        const temp = copy[i - 1]!;
        copy[i - 1] = copy[i]!;
        copy[i] = temp;
        wasSwapped = true;
      }
    }
  }
  return copy;
}
```

The `wasSwapped` flag is an optimization: if a complete pass makes no swaps, the array is already sorted and we can stop early.

### Tracing through an example

Let us sort $A = [5, 3, 8, 4, 2]$.

**Pass 1:**

| $i$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 1 | [**5**, **3**, 8, 4, 2] | $5 > 3$? Yes | Swap | [3, 5, 8, 4, 2] |
| 2 | [3, **5**, **8**, 4, 2] | $5 > 8$? No | — | [3, 5, 8, 4, 2] |
| 3 | [3, 5, **8**, **4**, 2] | $8 > 4$? Yes | Swap | [3, 5, 4, 8, 2] |
| 4 | [3, 5, 4, **8**, **2**] | $8 > 2$? Yes | Swap | [3, 5, 4, 2, 8] |

After pass 1, the largest element (8) is in its final position.

**Pass 2:**

| $i$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 1 | [**3**, **5**, 4, 2, 8] | $3 > 5$? No | — | [3, 5, 4, 2, 8] |
| 2 | [3, **5**, **4**, 2, 8] | $5 > 4$? Yes | Swap | [3, 4, 5, 2, 8] |
| 3 | [3, 4, **5**, **2**, 8] | $5 > 2$? Yes | Swap | [3, 4, 2, 5, 8] |
| 4 | [3, 4, 2, **5**, **8**] | $5 > 8$? No | — | [3, 4, 2, 5, 8] |

After pass 2, the second-largest element (5) is in place.

**Pass 3:**

| $i$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 1 | [**3**, **4**, 2, 5, 8] | $3 > 4$? No | — | [3, 4, 2, 5, 8] |
| 2 | [3, **4**, **2**, 5, 8] | $4 > 2$? Yes | Swap | [3, 2, 4, 5, 8] |
| 3 | [3, 2, **4**, **5**, 8] | $4 > 5$? No | — | [3, 2, 4, 5, 8] |
| 4 | [3, 2, 4, **5**, **8**] | $5 > 8$? No | — | [3, 2, 4, 5, 8] |

**Pass 4:**

| $i$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 1 | [**3**, **2**, 4, 5, 8] | $3 > 2$? Yes | Swap | [2, 3, 4, 5, 8] |
| 2 | [2, **3**, **4**, 5, 8] | $3 > 4$? No | — | [2, 3, 4, 5, 8] |
| 3 | [2, 3, **4**, **5**, 8] | $4 > 5$? No | — | [2, 3, 4, 5, 8] |
| 4 | [2, 3, 4, **5**, **8**] | $5 > 8$? No | — | [2, 3, 4, 5, 8] |

**Pass 5:** No swaps occur → `wasSwapped` remains `false` → algorithm terminates.

Result: $[2, 3, 4, 5, 8]$.

### Correctness

We prove correctness using the following loop invariant for the outer loop.

**Invariant:** After $k$ complete passes, the $k$ largest elements are in their correct final positions at the end of the array, and the algorithm has not changed the relative order of equal elements.

**Initialization:** Before any passes ($k = 0$), the invariant holds trivially — zero elements are known to be in their final positions.

**Maintenance:** Consider pass $k + 1$. The inner loop scans from left to right, swapping adjacent out-of-order pairs. The largest element in the unsorted prefix "bubbles" rightward through every comparison, because it is larger than (or equal to) every element it encounters. By the end of the pass, this element has reached position $n - k - 1$, which is its correct final position. The swap condition uses strict inequality ($>$), so equal elements are never swapped — preserving stability.

**Termination:** The outer loop terminates when a pass makes no swaps, which means the entire array is sorted. In the worst case, $n - 1$ passes are needed (when the smallest element starts at the end). By the invariant, after each pass one more element is correctly placed. After $n - 1$ passes, all elements are correctly placed. $\square$

### Complexity analysis

**Worst case.** The worst case occurs when the array is in reverse order. Pass $k$ performs $n - 1$ comparisons (our implementation always scans the full remaining array). In the worst case, $n - 1$ passes are needed, giving:

$$T_{\text{worst}}(n) = (n - 1) \cdot (n - 1) = (n - 1)^2 = \Theta(n^2).$$

More precisely, with the optimization of reducing the scan range after each pass (which our implementation does not include), the comparison count would be $\sum_{k=1}^{n-1}(n - k) = n(n-1)/2$, still $\Theta(n^2)$.

**Best case.** The best case occurs when the array is already sorted. The first pass makes $n - 1$ comparisons with no swaps, and the algorithm terminates:

$$T_{\text{best}}(n) = n - 1 = \Theta(n).$$

**Average case.** On average, bubble sort still performs $\Theta(n^2)$ comparisons and swaps.

**Space complexity.** $O(1)$ auxiliary space for the in-place sorting logic (plus $O(n)$ for the input copy in our implementation).

### Properties

| Property | Bubble sort |
|----------|-------------|
| Worst-case time | $\Theta(n^2)$ |
| Best-case time | $\Theta(n)$ |
| Average-case time | $\Theta(n^2)$ |
| Space | $O(1)$ in-place |
| Stable | Yes |

## Selection sort

Selection sort takes a different approach: instead of bubbling elements rightward, it repeatedly finds the minimum element from the unsorted portion and places it at the beginning.

### The algorithm

1. For $i = 0, 1, \ldots, n - 2$:
   - Find the index $j$ of the minimum element in $a[i..n-1]$.
   - Swap $a[i]$ and $a[j]$.

After iteration $i$, the first $i + 1$ positions contain the $i + 1$ smallest elements in sorted order.

### Implementation

```typescript
export function selectionSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = elements.slice(0);

  for (let i = 0; i < copy.length - 1; i++) {
    let remainingMinimum = copy[i]!;
    let indexToSwap = -1;

    for (let j = i + 1; j < copy.length; j++) {
      if (comparator(copy[j]!, remainingMinimum) < 0) {
        remainingMinimum = copy[j]!;
        indexToSwap = j;
      }
    }
    if (indexToSwap >= 0) {
      copy[indexToSwap] = copy[i]!;
      copy[i] = remainingMinimum;
    }
  }
  return copy;
}
```

### Tracing through an example

Let us sort $A = [29, 10, 14, 37, 13]$.

| $i$ | Unsorted portion | Minimum | Swap | Array after |
|-----|-----------------|---------|------|-------------|
| 0 | [**29**, 10, 14, 37, 13] | 10 (index 1) | Swap $a[0]$ and $a[1]$ | [10, 29, 14, 37, 13] |
| 1 | [10, **29**, 14, 37, 13] | 13 (index 4) | Swap $a[1]$ and $a[4]$ | [10, 13, 14, 37, 29] |
| 2 | [10, 13, **14**, 37, 29] | 14 (index 2) | No swap needed | [10, 13, 14, 37, 29] |
| 3 | [10, 13, 14, **37**, 29] | 29 (index 4) | Swap $a[3]$ and $a[4]$ | [10, 13, 14, 29, 37] |

Result: $[10, 13, 14, 29, 37]$.

### Correctness

**Invariant:** After iteration $i$ of the outer loop, the subarray $a[0..i]$ contains the $i + 1$ smallest elements of the original array, in sorted order, and the remaining elements in $a[i+1..n-1]$ are all greater than or equal to $a[i]$.

**Initialization:** Before the first iteration ($i = 0$), the sorted prefix is empty. The invariant holds vacuously.

**Maintenance:** In iteration $i$, the inner loop scans $a[i..n-1]$ and finds the minimum element. This element is the smallest among all elements not yet in the sorted prefix (since, by the invariant, all smaller elements are already in $a[0..i-1]$). Swapping it into position $i$ extends the sorted prefix by one element, maintaining the invariant.

**Termination:** After $n - 1$ iterations, positions $0$ through $n - 2$ contain the $n - 1$ smallest elements in order. The remaining element at position $n - 1$ is necessarily the largest, so the entire array is sorted. $\square$

### Why selection sort is not stable

Consider the array $[2_a, 2_b, 1]$, where $2_a$ and $2_b$ are equal values distinguished by subscripts to track their original positions. In the first iteration, selection sort finds the minimum (1, at index 2) and swaps it with $a[0]$:

$$[2_a, 2_b, 1] \xrightarrow{\text{swap } a[0] \leftrightarrow a[2]} [1, 2_b, 2_a]$$

Now $2_b$ appears before $2_a$, but in the original array $2_a$ appeared first. The relative order of equal elements has been reversed. This happens because the swap moves $2_a$ past $2_b$ in a single step, without regard for their original order.

### Complexity analysis

The inner loop in iteration $i$ performs $n - i - 1$ comparisons. The total number of comparisons is:

$$\sum_{i=0}^{n-2} (n - i - 1) = \sum_{k=1}^{n-1} k = \frac{n(n-1)}{2} = \Theta(n^2).$$

This count is the same regardless of the input — selection sort always performs exactly $n(n-1)/2$ comparisons, whether the array is sorted, reverse-sorted, or random.

**Swaps.** Selection sort performs at most $n - 1$ swaps (one per outer-loop iteration). This is a notable advantage: if swaps are expensive (for example, when array elements are large objects), selection sort minimizes data movement.

**Space complexity.** $O(1)$ auxiliary space for the in-place sorting logic.

### Properties

| Property | Selection sort |
|----------|---------------|
| Worst-case time | $\Theta(n^2)$ |
| Best-case time | $\Theta(n^2)$ |
| Average-case time | $\Theta(n^2)$ |
| Space | $O(1)$ in-place |
| Stable | No |

## Insertion sort

Insertion sort is the algorithm most people use intuitively when sorting a hand of playing cards. We hold the sorted cards in our left hand and pick up one card at a time from the table with our right hand, inserting it into the correct position among the already-sorted cards.

### The algorithm

1. For $i = 1, 2, \ldots, n - 1$:
   - Let $\text{key} = a[i]$.
   - Insert $\text{key}$ into the sorted subarray $a[0..i-1]$ by shifting larger elements one position to the right.

### Implementation

```typescript
export function insertionSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = elements.slice(0);

  for (let i = 1; i < copy.length; i++) {
    const toInsert = copy[i]!;
    let insertIndex = i - 1;

    while (insertIndex >= 0 && comparator(toInsert, copy[insertIndex]!) < 0) {
      copy[insertIndex + 1] = copy[insertIndex]!;
      insertIndex--;
    }
    insertIndex++;
    copy[insertIndex] = toInsert;
  }
  return copy;
}
```

The inner `while` loop shifts elements rightward until it finds the correct position for `toInsert`. The use of strict less-than (`< 0`) in the comparator check means that equal elements are not shifted past each other, which makes the algorithm stable.

### Tracing through an example

Let us sort $A = [5, 2, 4, 6, 1, 3]$.

| $i$ | `toInsert` | Sorted prefix before | Shifts | Sorted prefix after |
|-----|-----------|---------------------|--------|---------------------|
| 1 | 2 | [**5**] | Shift 5 right | [2, 5] |
| 2 | 4 | [2, **5**] | Shift 5 right | [2, 4, 5] |
| 3 | 6 | [2, 4, 5] | None (6 ≥ 5) | [2, 4, 5, 6] |
| 4 | 1 | [**2, 4, 5, 6**] | Shift all four right | [1, 2, 4, 5, 6] |
| 5 | 3 | [1, **2**, **4, 5, 6**] | Shift 4, 5, 6 right | [1, 2, 3, 4, 5, 6] |

Result: $[1, 2, 3, 4, 5, 6]$.

Notice how each element is inserted into its correct position within the growing sorted prefix on the left. When the element is already in the right place (like 6 in step 3), no shifting is needed and the inner loop exits immediately.

### Correctness

**Invariant:** At the start of iteration $i$ of the outer loop, the subarray $a[0..i-1]$ is a sorted permutation of the elements originally in those positions.

**Initialization:** Before the first iteration ($i = 1$), the subarray $a[0..0]$ contains a single element. A single element is trivially sorted.

**Maintenance:** During iteration $i$, the element $a[i]$ is removed from its position and inserted into the sorted subarray $a[0..i-1]$. The inner loop finds the correct insertion point by scanning rightward from position $i - 1$ and shifting elements that are larger than $a[i]$. After the insertion, $a[0..i]$ is a sorted permutation of the elements originally in $a[0..i]$.

**Termination:** When $i = n$, the entire array $a[0..n-1]$ is sorted. $\square$

### Complexity analysis

The number of comparisons depends on the input.

**Worst case.** The worst case is a reverse-sorted array. In iteration $i$, the element must be shifted past all $i$ elements in the sorted prefix, requiring $i$ comparisons. The total is:

$$T_{\text{worst}}(n) = \sum_{i=1}^{n-1} i = \frac{n(n-1)}{2} = \Theta(n^2).$$

**Best case.** The best case is an already-sorted array. In each iteration, the inner loop performs one comparison (finding that `toInsert` is already in place) and zero shifts:

$$T_{\text{best}}(n) = \sum_{i=1}^{n-1} 1 = n - 1 = \Theta(n).$$

This is remarkable: insertion sort runs in _linear_ time on sorted input, matching the theoretical minimum for any algorithm that must verify sortedness.

**Average case.** On a random permutation, each element is, on average, shifted past half the elements in the sorted prefix:

$$T_{\text{avg}}(n) = \sum_{i=1}^{n-1} \frac{i}{2} = \frac{n(n-1)}{4} = \Theta(n^2).$$

**Nearly sorted input.** If each element is at most $k$ positions from its sorted position, the inner loop performs at most $k$ comparisons per element, giving $T(n) = O(nk)$. When $k$ is a small constant, insertion sort runs in linear time. This makes it an excellent choice for "nearly sorted" data and for finishing off the work of a more sophisticated algorithm (for example, some quicksort implementations switch to insertion sort for small subarrays).

**Space complexity.** $O(1)$ auxiliary space for the in-place sorting logic.

### Inversions

The performance of insertion sort is closely tied to the concept of _inversions_.

---

> **Definition 4.4 — Inversion**
>
> An **inversion** in a sequence $\langle a_1, a_2, \ldots, a_n \rangle$ is a pair $(i, j)$ with $i < j$ and $a_i > a_j$.

---

Each swap (or shift) in insertion sort eliminates exactly one inversion. Therefore, the number of comparisons insertion sort makes is $\Theta(n + I)$, where $I$ is the number of inversions in the input. A sorted array has $I = 0$ inversions; a reverse-sorted array has $I = n(n-1)/2$, the maximum possible. On average, a random permutation has $I = n(n-1)/4$ inversions.

This connection makes insertion sort the natural choice when we know the input has few inversions — it is _adaptive_ to the presortedness of the input.

### Properties

| Property | Insertion sort |
|----------|---------------|
| Worst-case time | $\Theta(n^2)$ |
| Best-case time | $\Theta(n)$ |
| Average-case time | $\Theta(n^2)$ |
| Space | $O(1)$ in-place |
| Stable | Yes |
| Adaptive | Yes (time depends on inversions) |

## Comparison of elementary sorts

Now that we have studied all three algorithms, let us compare them side by side.

| Property | Bubble sort | Selection sort | Insertion sort |
|----------|-------------|---------------|----------------|
| Worst-case time | $\Theta(n^2)$ | $\Theta(n^2)$ | $\Theta(n^2)$ |
| Best-case time | $\Theta(n)$ | $\Theta(n^2)$ | $\Theta(n)$ |
| Average-case time | $\Theta(n^2)$ | $\Theta(n^2)$ | $\Theta(n^2)$ |
| Stable | Yes | No | Yes |
| Adaptive | Yes | No | Yes |
| Comparisons (worst) | $\Theta(n^2)$ | $\Theta(n^2)$ | $\Theta(n^2)$ |
| Swaps (worst) | $\Theta(n^2)$ | $\Theta(n)$ | $\Theta(n^2)$ shifts |

Several observations stand out:

- **Selection sort** always does the same amount of work regardless of the input — it is not adaptive. However, it minimizes the number of swaps ($O(n)$), which matters when moving elements is expensive.

- **Insertion sort** is the best general-purpose choice among the three. It is stable, adaptive, and efficient on small or nearly sorted inputs. In practice, it outperforms both bubble sort and selection sort.

- **Bubble sort** is adaptive (like insertion sort), but in practice it is slower because it performs more data movement per inversion — elements move only one position per swap, while insertion sort shifts an entire block. Bubble sort's main virtue is pedagogical simplicity.

## The comparison-based sorting lower bound

All three elementary sorting algorithms are _comparison-based_: they access the input elements only through pairwise comparisons. Can we do better than $O(n^2)$ with a comparison-based algorithm? The answer is yes — merge sort, heapsort, and quicksort achieve $O(n \log n)$ time, as we will see in Chapter 5. But can we do better than $O(n \log n)$? The answer is no.

---

> **Theorem 4.1 — Comparison-based sorting lower bound**
>
> Any comparison-based sorting algorithm must make at least $\lceil \log_2(n!) \rceil = \Omega(n \log n)$ comparisons in the worst case to sort $n$ elements.

---

### The decision tree argument

To prove this theorem, we model any comparison-based sorting algorithm as a _decision tree_. Each internal node represents a comparison between two elements (e.g., "is $a_i \leq a_j$?"), with two children corresponding to the outcomes "yes" and "no." Each leaf represents a specific output permutation.

For the algorithm to be correct, it must be able to produce every permutation of $n$ elements as output — there must be at least $n!$ leaves. The number of comparisons in the worst case equals the height of the decision tree (the longest root-to-leaf path).

A binary tree of height $h$ has at most $2^h$ leaves. For the tree to have at least $n!$ leaves:

$$2^h \geq n!$$

Taking logarithms:

$$h \geq \log_2(n!)$$

Using Stirling's approximation, $n! \approx \sqrt{2\pi n}\, (n/e)^n$, we get:

$$\log_2(n!) = \Theta(n \log n).$$

More concretely:

$$\log_2(n!) = \sum_{k=1}^{n} \log_2 k \geq \sum_{k=n/2}^{n} \log_2 k \geq \frac{n}{2} \cdot \log_2 \frac{n}{2} = \frac{n}{2}(\log_2 n - 1) = \Omega(n \log n).$$

Therefore, any comparison-based sorting algorithm requires $\Omega(n \log n)$ comparisons in the worst case. $\square$

### Implications

This lower bound tells us that $O(n \log n)$ algorithms like merge sort and heapsort are _asymptotically optimal_ among comparison-based sorts — they cannot be improved in the worst case.

It also tells us that our elementary $O(n^2)$ algorithms are a factor of $n / \log n$ away from optimal. For $n = 1{,}000{,}000$, that factor is roughly 50,000 — the same dramatic gap we noted in the growth-rate table of Chapter 2.

However, the lower bound applies only to comparison-based sorting. Algorithms that exploit additional structure in the input (such as knowing that elements are integers in a bounded range) can sort in $O(n)$ time, as we will see in Chapter 6.

## Looking ahead

In this chapter we studied the sorting problem and three elementary algorithms for solving it:

- **Bubble sort** repeatedly swaps adjacent out-of-order elements. It is simple and stable, with $O(n)$ best-case time, but $O(n^2)$ on average and in the worst case.
- **Selection sort** repeatedly selects the minimum from the unsorted portion. It always takes $\Theta(n^2)$ time but minimizes swaps to $O(n)$. It is not stable.
- **Insertion sort** inserts each element into its correct position in a growing sorted prefix. It is stable, adaptive to the number of inversions, and has $O(n)$ best-case time. It is the practical choice among elementary sorts.
- The **comparison-based lower bound** of $\Omega(n \log n)$ shows that these quadratic algorithms are not optimal.

In Chapter 5, we study three efficient sorting algorithms — merge sort, quicksort, and heapsort — that achieve the $O(n \log n)$ bound. These algorithms use the divide-and-conquer strategy from Chapter 3 to overcome the quadratic barrier.

## Exercises

**Exercise 4.1.** Trace through bubble sort on the input $[6, 4, 1, 8, 3]$. How many passes are needed? How many total swaps?

**Exercise 4.2.** Our bubble sort implementation scans the entire array on each pass. Modify the algorithm so that pass $k$ scans only positions $0$ through $n - k - 1$ (since the last $k$ elements are already in place). Does this change the worst-case asymptotic complexity? Does it improve the constant factor?

**Exercise 4.3.** Give a concrete example showing that selection sort is not stable. Then describe how selection sort could be modified to become stable (hint: use insertion into a separate output instead of swapping). What is the cost of this modification?

**Exercise 4.4.** Prove that insertion sort performs exactly $n + I - 1$ comparisons on an input with $I$ inversions (assuming the inner loop always does one comparison to confirm the insertion point even when no shifting is needed). Use this to show that insertion sort is $O(n)$ on inputs with $O(n)$ inversions.

**Exercise 4.5.** A _sentinel_ version of insertion sort places a minimum element at position $a[0]$ before sorting, eliminating the `insertIndex >= 0` bound check in the inner loop. Explain why this is correct and analyze its effect on performance. What are the drawbacks?
