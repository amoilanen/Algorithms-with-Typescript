# Elementary Sorting

_Sorting is one of the most fundamental problems in Computer Science. In this chapter we define the sorting problem precisely, introduce the concepts of stability and in-place sorting, and study three elementary sorting algorithms — bubble sort, selection sort, and insertion sort. All three run in $O(n^2)$ time in the worst case, but they differ in important ways: their behavior on nearly sorted input, their stability properties, and their practical performance. We close the chapter by proving that any comparison-based sorting algorithm must make $\Omega(n \log n)$ comparisons in the worst case — a lower bound that the elementary algorithms do not achieve, motivating the efficient algorithms of Chapter 5._

## The sorting problem

Sorting is the problem of rearranging a collection of elements into a specified order. It arises constantly in practice — in database queries, in preparing data for binary search, in eliminating duplicates, in scheduling, and in countless other contexts. Knuth devoted an entire volume of _The Art of Computer Programming_ to sorting and searching, calling sorting "perhaps the most deeply studied problem in Computer Science."

---

> **Definition 4.1 - The sorting problem**
>
> **Input:** A sequence of $n$ elements $\langle a_1, a_2, \ldots, a_n \rangle$ and a total ordering $\leq$ on the elements.
>
> **Output:** A permutation $\langle a'_1, a'_2, \ldots, a'_n \rangle$ of the input such that $a'_1 \leq a'_2 \leq \cdots \leq a'_n$.

---

The definition requires a **total ordering** on the elements. A total ordering is a relation $\leq$ that satisfies four properties for all elements $a$, $b$, and $c$:

1. **Reflexivity:** $a \leq a$.
2. **Transitivity:** if $a \leq b$ and $b \leq c$, then $a \leq c$.
3. **Antisymmetry:** if $a \leq b$ and $b \leq a$, then $a = b$.
4. **Totality:** for any two elements, either $a \leq b$ or $b \leq a$ (or both).

The crucial property is _totality_: every pair of elements is comparable. Numbers compared with $\leq$ are the most familiar example — given any two numbers, one is less than or equal to the other — but numbers are not the only things we can sort: for example, strings can be sorted lexicographically (dictionary order), dates can be sorted chronologically, and objects can be sorted by any key that admits a total ordering. No matter what the nature of the elements is, any sequence of such elements can be sorted, if we can define a total ordering on them.

So far we have seen only total orderings. A natural question arises if there exist any other kinds of orderings. It turns out that not all orderings are total: a **partial ordering** satisfies the first three properties but not totality: some pairs of elements may be _incomparable_. For example, consider sets ordered by the subset relation $\subseteq$. We have $\{1\} \subseteq \{1, 2\}$, but $\{1, 2\}$ and $\{2, 3\}$ are incomparable — neither is a subset of the other. Another example is a task dependency relation: task A must precede task B, and task C must precede task D, but A and C have no ordering relation between them.

Because with partial ordering we cannot compare any arbitrary pair of elements, we cannot sort elements into a single linear sequence (though we can _topologically sort_ them, which is a different problem discussed in Chapter 12). This is why the condition that there is a total ordering defined on the elements of the sequence being sorted is important and cannot be omitted: sorting requires a total ordering because the output must be a _linear_ sequence where every adjacent pair of elements satisfies $a'_i \leq a'_{i+1}$. If some elements were incomparable, there would be no way to decide which should come first.

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

When a sequence contains elements that compare as equal, there is a choice: should the algorithm preserve the original relative order of equal elements, or is potentially re-arranging these equal elements acceptable?

---

> **Definition 4.2 - Stable sort**
>
> A sorting algorithm is **stable** if, whenever two elements $a_i$ and $a_j$ satisfy $a_i = a_j$ and $i < j$ in the input, then $a_i$ appears before $a_j$ in the output.

---

Stability matters when elements carry additional data beyond the sort key. For example, suppose we sort a list of students by grade, and two students — Alice and Bob — both have a grade of 90. If Alice appeared before Bob in the original list, a stable sort guarantees she still appears before Bob in the sorted output. An unstable sort might swap them.

Stability also enables _multi-key sorting_ by composition: to sort by last name and then by first name, we first sort by first name (using a stable sort). When we then sort by last name (using a stable sort), stability ensures that records sharing the same last name retain the first-name ordering from the first sort — giving us the desired two-level sort.

Of the three algorithms in this chapter, **bubble sort** and **insertion sort** are stable, while **selection sort** is not.

## In-place sorting

---

> **Definition 4.3 - In-place sort**
>
> A sorting algorithm is **in-place** if it uses $O(1)$ auxiliary space — that is, a constant amount of memory beyond the input array.

---

All three algorithms in this chapter are in-place: they sort by swapping and shifting elements within the array, using only a constant number of temporary variables. Our TypeScript implementations sort the input array directly — the caller's array is modified.

## Bubble sort

Bubble sort's main virtue is pedagogical simplicity: it is the easiest sorting algorithm to understand and implement, which makes it an ideal first example when studying sorting. In practice, however, it is outperformed by insertion sort on nearly every input and is rarely used outside the classroom. The algorithm works by repeatedly scanning the array from left to right, swapping adjacent elements that are out of order. After each complete pass, the largest unsorted element has "bubbled" to its correct position at the end. After $n - 1$ passes, every element is in place.

### The algorithm

1. For $k = 1, 2, \ldots, n - 1$:
   - For $i = 1, 2, \ldots, n - k$:
     - If $a[i-1] > a[i]$, swap $a[i-1]$ and $a[i]$.

After pass $k$, the last $k$ elements are already in their final positions, so the inner loop only needs to scan positions $1$ through $n - k$.

### Implementation

```typescript
export function bubbleSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  for (let k = 0; k < elements.length - 1; k++) {
    for (let i = 1; i < elements.length - k; i++) {
      if (comparator(elements[i - 1]!, elements[i]!) > 0) {
        const temp = elements[i - 1]!;
        elements[i - 1] = elements[i]!;
        elements[i] = temp;
      }
    }
  }
  return elements;
}
```

### Tracing through an example

Let us sort $A = [5, 3, 8, 4, 2]$.

**Pass 1** ($k = 1$, inner loop scans $i = 1 \ldots 4$)**:**

| $i$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 1 | [**5**, **3**, 8, 4, 2] | $5 > 3$? Yes | Swap | [3, 5, 8, 4, 2] |
| 2 | [3, **5**, **8**, 4, 2] | $5 > 8$? No | — | [3, 5, 8, 4, 2] |
| 3 | [3, 5, **8**, **4**, 2] | $8 > 4$? Yes | Swap | [3, 5, 4, 8, 2] |
| 4 | [3, 5, 4, **8**, **2**] | $8 > 2$? Yes | Swap | [3, 5, 4, 2, 8] |

After pass 1, the largest element (8) is in its final position.

**Pass 2** ($k = 2$, inner loop scans $i = 1 \ldots 3$)**:**

| $i$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 1 | [**3**, **5**, 4, 2, 8] | $3 > 5$? No | — | [3, 5, 4, 2, 8] |
| 2 | [3, **5**, **4**, 2, 8] | $5 > 4$? Yes | Swap | [3, 4, 5, 2, 8] |
| 3 | [3, 4, **5**, **2**, 8] | $5 > 2$? Yes | Swap | [3, 4, 2, 5, 8] |

After pass 2, the two largest elements (5, 8) are in place.

**Pass 3** ($k = 3$, inner loop scans $i = 1 \ldots 2$)**:**

| $i$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 1 | [**3**, **4**, 2, 5, 8] | $3 > 4$? No | — | [3, 4, 2, 5, 8] |
| 2 | [3, **4**, **2**, 5, 8] | $4 > 2$? Yes | Swap | [3, 2, 4, 5, 8] |

**Pass 4** ($k = 4$, inner loop scans $i = 1$)**:**

| $i$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 1 | [**3**, **2**, 4, 5, 8] | $3 > 2$? Yes | Swap | [2, 3, 4, 5, 8] |

Result: $[2, 3, 4, 5, 8]$.

### Correctness

We prove correctness using the following loop invariant for the outer loop.

**Invariant:** After $k$ complete passes, the $k$ largest elements are in their correct final positions at the end of the array, and the algorithm has not changed the relative order of equal elements.

**Initialization:** Before any passes ($k = 0$), the invariant holds trivially — zero elements are known to be in their final positions.

**Maintenance:** Consider pass $k + 1$. The inner loop scans positions $1$ through $n - k - 1$ from left to right, swapping adjacent out-of-order pairs. The largest element in the unsorted prefix $a[0..n-k-1]$ "bubbles" rightward through every comparison, because it is larger than (or equal to) every element it encounters. By the end of the pass, this element has reached position $n - k - 1$, which is its correct final position. The swap condition uses strict inequality ($>$), so equal elements are never swapped — preserving stability.

**Termination:** The outer loop runs exactly $n - 1$ times and then terminates. By the invariant, after $n - 1$ passes all $n - 1$ largest elements are in their correct positions. The remaining element — the smallest — is necessarily in position $0$, so the entire array is sorted. $\square$

### Complexity analysis

**Worst case.** The outer loop performs $n - 1$ passes. Pass $k$ performs $n - k$ comparisons. The total is:

$$T_{\text{worst}}(n) = \sum_{k=1}^{n-1}(n - k) = \sum_{j=1}^{n-1} j = \frac{n(n-1)}{2} = \Theta(n^2).$$

**Best case.** Even when the array is already sorted, the algorithm performs all $n - 1$ passes:

$$T_{\text{best}}(n) = \frac{n(n-1)}{2} = \Theta(n^2).$$

**Average case.** $\Theta(n^2)$ comparisons in all cases.

**Space complexity.** $O(1)$ auxiliary space.

### Early termination optimization

The basic algorithm always performs $n - 1$ passes, even if the array becomes sorted early. We can improve the best case by tracking whether any swap occurred during a pass. If a complete pass makes no swaps, the array is already sorted and we can stop:

```typescript
export function bubbleSortOptimized<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  let n = elements.length;
  let wasSwapped = true;

  while (wasSwapped) {
    wasSwapped = false;
    for (let i = 1; i < n; i++) {
      if (comparator(elements[i - 1]!, elements[i]!) > 0) {
        const temp = elements[i - 1]!;
        elements[i - 1] = elements[i]!;
        elements[i] = temp;
        wasSwapped = true;
      }
    }
    n--;
  }
  return elements;
}
```

This optimization does not change the worst-case or average-case complexity, but on already-sorted input only one pass is needed ($n - 1$ comparisons, zero swaps), giving a $\Theta(n)$ best case. The correctness proof from above still applies: by the loop invariant, each pass places at least one more element in its final position, so after at most $n - 1$ passes the array is sorted and `wasSwapped` remains `false`, guaranteeing termination.

### Properties

| Property | Bubble sort | Bubble sort (optimized) |
|----------|-------------|------------------------|
| Worst-case time | $\Theta(n^2)$ | $\Theta(n^2)$ |
| Best-case time | $\Theta(n^2)$ | $\Theta(n)$ |
| Average-case time | $\Theta(n^2)$ | $\Theta(n^2)$ |
| Space | $O(1)$ in-place | $O(1)$ in-place |
| Stable | Yes | Yes |

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
  for (let i = 0; i < elements.length - 1; i++) {
    let remainingMinimum = elements[i]!;
    let indexToSwap = -1;

    for (let j = i + 1; j < elements.length; j++) {
      if (comparator(elements[j]!, remainingMinimum) < 0) {
        remainingMinimum = elements[j]!;
        indexToSwap = j;
      }
    }
    if (indexToSwap >= 0) {
      elements[indexToSwap] = elements[i]!;
      elements[i] = remainingMinimum;
    }
  }
  return elements;
}
```

### Tracing through an example

Let us sort $A = [29, 10, 14, 37, 13]$.

**Iteration 1** ($i = 0$): find the minimum in $a[0..4]$ and place it at position 0.

| $j$ | Array | Comparison | Update minimum? | Current minimum |
|-----|-------|------------|-----------------|-----------------|
| — | [**29**, 10, 14, 37, 13] | — | Initialize | 29 (index 0) |
| 1 | [**29**, **10**, 14, 37, 13] | $10 < 29$? Yes | Yes | 10 (index 1) |
| 2 | [**29**, 10, **14**, 37, 13] | $14 < 10$? No | No | 10 (index 1) |
| 3 | [**29**, 10, 14, **37**, 13] | $37 < 10$? No | No | 10 (index 1) |
| 4 | [**29**, 10, 14, 37, **13**] | $13 < 10$? No | No | 10 (index 1) |

Minimum is 10 at index 1. Swap $a[0]$ and $a[1]$: $[29, 10, \ldots] \to [10, 29, \ldots]$.

Array after iteration 1: $[\underbrace{10}_{\text{sorted}},\ 29, 14, 37, 13]$.

**Iteration 2** ($i = 1$): find the minimum in $a[1..4]$ and place it at position 1.

| $j$ | Array | Comparison | Update minimum? | Current minimum |
|-----|-------|------------|-----------------|-----------------|
| — | [10, **29**, 14, 37, 13] | — | Initialize | 29 (index 1) |
| 2 | [10, **29**, **14**, 37, 13] | $14 < 29$? Yes | Yes | 14 (index 2) |
| 3 | [10, **29**, 14, **37**, 13] | $37 < 14$? No | No | 14 (index 2) |
| 4 | [10, **29**, 14, 37, **13**] | $13 < 14$? Yes | Yes | 13 (index 4) |

Minimum is 13 at index 4. Swap $a[1]$ and $a[4]$: $[\ldots, 29, \ldots, 13] \to [\ldots, 13, \ldots, 29]$.

Array after iteration 2: $[\underbrace{10, 13}_{\text{sorted}},\ 14, 37, 29]$.

**Iteration 3** ($i = 2$): find the minimum in $a[2..4]$ and place it at position 2.

| $j$ | Array | Comparison | Update minimum? | Current minimum |
|-----|-------|------------|-----------------|-----------------|
| — | [10, 13, **14**, 37, 29] | — | Initialize | 14 (index 2) |
| 3 | [10, 13, **14**, **37**, 29] | $37 < 14$? No | No | 14 (index 2) |
| 4 | [10, 13, **14**, 37, **29**] | $29 < 14$? No | No | 14 (index 2) |

Minimum is 14 at index 2. No swap needed — the minimum is already at position $i$.

Array after iteration 3: $[\underbrace{10, 13, 14}_{\text{sorted}},\ 37, 29]$.

**Iteration 4** ($i = 3$): find the minimum in $a[3..4]$ and place it at position 3.

| $j$ | Array | Comparison | Update minimum? | Current minimum |
|-----|-------|------------|-----------------|-----------------|
| — | [10, 13, 14, **37**, 29] | — | Initialize | 37 (index 3) |
| 4 | [10, 13, 14, **37**, **29**] | $29 < 37$? Yes | Yes | 29 (index 4) |

Minimum is 29 at index 4. Swap $a[3]$ and $a[4]$: $[\ldots, 37, 29] \to [\ldots, 29, 37]$.

Array after iteration 4: $[\underbrace{10, 13, 14, 29, 37}_{\text{sorted}}]$.

Result: $[10, 13, 14, 29, 37]$.

### Correctness

**Invariant:** After iteration $i$ of the outer loop, the subarray $a[0..i]$ contains the $i + 1$ smallest elements of the original array, in sorted order, and the remaining elements in $a[i+1..n-1]$ are all greater than or equal to $a[i]$.

**Initialization:** Before the first iteration ($i = 0$), the sorted prefix is empty. The invariant holds trivially.

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

**Swaps.** Selection sort performs at most $n - 1$ swaps (one per outer-loop iteration). This is a notable advantage in languages where swaps are expensive — for example, in C or C++, an array of structs stores the structs _inline_, so swapping two elements copies the entire struct byte by byte, and larger structs mean slower swaps. In TypeScript, however, arrays of objects store _references_ (pointers) rather than the objects themselves, so swapping two elements only exchanges two small references — a constant-time operation regardless of how large the underlying objects are. The low swap count of selection sort therefore matters most in languages with value-type semantics; in TypeScript the benefit is negligible.

**Space complexity.** $O(1)$ auxiliary space.

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
  for (let i = 1; i < elements.length; i++) {
    const toInsert = elements[i]!;
    let insertIndex = i - 1;

    while (insertIndex >= 0 && comparator(toInsert, elements[insertIndex]!) < 0) {
      elements[insertIndex + 1] = elements[insertIndex]!;
      insertIndex--;
    }
    insertIndex++;
    elements[insertIndex] = toInsert;
  }
  return elements;
}
```

The inner `while` loop shifts elements rightward until it finds the correct position for `toInsert`. The use of strict less-than (`< 0`) in the comparator check means that equal elements are not shifted past each other, which makes the algorithm stable.

### Tracing through an example

Let us sort $A = [5, 2, 4, 6, 1, 3]$. In the tables below, $j$ denotes `insertIndex` from the code.

**Iteration 1** ($i = 1$, `toInsert` $= 2$): insert 2 into the sorted prefix $[5]$.

| $j$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 0 | [**5**, **2**, 4, 6, 1, 3] | $2 < 5$? Yes | Shift 5 right | [5, **5**, 4, 6, 1, 3] |
| $-1$ | [5, 5, 4, 6, 1, 3] | $j < 0$ | Place 2 at position 0 | [**2**, 5, 4, 6, 1, 3] |

After iteration 1: $[\underbrace{2, 5}_{\text{sorted}},\ 4, 6, 1, 3]$.

**Iteration 2** ($i = 2$, `toInsert` $= 4$): insert 4 into the sorted prefix $[2, 5]$.

| $j$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 1 | [2, **5**, **4**, 6, 1, 3] | $4 < 5$? Yes | Shift 5 right | [2, 5, **5**, 6, 1, 3] |
| 0 | [**2**, 5, 5, 6, 1, 3] | $4 < 2$? No | Place 4 at position 1 | [2, **4**, 5, 6, 1, 3] |

After iteration 2: $[\underbrace{2, 4, 5}_{\text{sorted}},\ 6, 1, 3]$.

**Iteration 3** ($i = 3$, `toInsert` $= 6$): insert 6 into the sorted prefix $[2, 4, 5]$.

| $j$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 2 | [2, 4, **5**, **6**, 1, 3] | $6 < 5$? No | Place 6 at position 3 | [2, 4, 5, **6**, 1, 3] |

After iteration 3: $[\underbrace{2, 4, 5, 6}_{\text{sorted}},\ 1, 3]$. No shifting was needed — 6 is already in the right place.

**Iteration 4** ($i = 4$, `toInsert` $= 1$): insert 1 into the sorted prefix $[2, 4, 5, 6]$.

| $j$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 3 | [2, 4, 5, **6**, **1**, 3] | $1 < 6$? Yes | Shift 6 right | [2, 4, 5, 6, **6**, 3] |
| 2 | [2, 4, **5**, 6, 6, 3] | $1 < 5$? Yes | Shift 5 right | [2, 4, 5, **5**, 6, 3] |
| 1 | [2, **4**, 5, 5, 6, 3] | $1 < 4$? Yes | Shift 4 right | [2, 4, **4**, 5, 6, 3] |
| 0 | [**2**, 4, 4, 5, 6, 3] | $1 < 2$? Yes | Shift 2 right | [2, **2**, 4, 5, 6, 3] |
| $-1$ | [2, 2, 4, 5, 6, 3] | $j < 0$ | Place 1 at position 0 | [**1**, 2, 4, 5, 6, 3] |

After iteration 4: $[\underbrace{1, 2, 4, 5, 6}_{\text{sorted}},\ 3]$.

**Iteration 5** ($i = 5$, `toInsert` $= 3$): insert 3 into the sorted prefix $[1, 2, 4, 5, 6]$.

| $j$ | Array before | Comparison | Action | Array after |
|-----|-------------|------------|--------|-------------|
| 4 | [1, 2, 4, 5, **6**, **3**] | $3 < 6$? Yes | Shift 6 right | [1, 2, 4, 5, 6, **6**] |
| 3 | [1, 2, 4, **5**, 6, 6] | $3 < 5$? Yes | Shift 5 right | [1, 2, 4, 5, **5**, 6] |
| 2 | [1, 2, **4**, 5, 5, 6] | $3 < 4$? Yes | Shift 4 right | [1, 2, 4, **4**, 5, 6] |
| 1 | [1, **2**, 4, 4, 5, 6] | $3 < 2$? No | Place 3 at position 2 | [1, 2, **3**, 4, 5, 6] |

After iteration 5: $[\underbrace{1, 2, 3, 4, 5, 6}_{\text{sorted}}]$.

Result: $[1, 2, 3, 4, 5, 6]$.

Notice how each element is inserted into its correct position within the growing sorted prefix on the left. When the element is already in the right place (like 6 in iteration 3), no shifting is needed and the inner loop exits immediately.

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

**Space complexity.** $O(1)$ auxiliary space.

### Inversions

The performance of insertion sort is closely tied to the concept of _inversions_.

---

> **Definition 4.4 - Inversion**
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
| Best-case time | $\Theta(n^2)$ | $\Theta(n^2)$ | $\Theta(n)$ |
| Average-case time | $\Theta(n^2)$ | $\Theta(n^2)$ | $\Theta(n^2)$ |
| Stable | Yes | No | Yes |
| Adaptive | No | No | Yes |
| Comparisons (worst) | $\Theta(n^2)$ | $\Theta(n^2)$ | $\Theta(n^2)$ |
| Swaps (worst) | $\Theta(n^2)$ | $\Theta(n)$ | $\Theta(n^2)$ shifts |

The optimized bubble sort variant (with early termination) achieves $\Theta(n)$ best-case time and becomes adaptive, but the comparison above reflects the basic algorithm.

Several observations stand out:

- **Selection sort** always does the same amount of work regardless of the input — it is not adaptive. However, it minimizes the number of swaps ($O(n)$), which matters when moving elements is expensive.

- **Insertion sort** is the best general-purpose choice among the three. It is stable, adaptive, and efficient on small or nearly sorted inputs. In practice, it outperforms both bubble sort and selection sort.

- **Bubble sort** in its basic form always performs $(n-1)^2$ comparisons regardless of input. Even with the early termination optimization, it is slower in practice than insertion sort because elements move only one position per swap, while insertion sort shifts an entire block. Bubble sort's main virtue is pedagogical simplicity.

## The comparison-based sorting lower bound

All three elementary sorting algorithms are _comparison-based_: they access the input elements only through pairwise comparisons. This shared trait raises a natural question — is $O(n^2)$ the best we can do under this model, or can a comparison-based algorithm sort faster? It turns out the answer is yes: merge sort, heapsort, and quicksort all achieve $O(n \log n)$ time, as we will see in Chapter 5. This immediately raises a deeper question: can we do better still — is there a comparison-based algorithm that beats $O(n \log n)$? It turns out that the answer is "no" and we are going to prove it below.

---

> **Theorem 4.1 - Comparison-based sorting lower bound**
>
> Any comparison-based sorting algorithm must make at least $\lceil \log_2(n!) \rceil = \Omega(n \log n)$ comparisons in the worst case to sort $n$ elements.

---

### The decision tree argument

To prove this theorem, we model any comparison-based sorting algorithm as a _decision tree_. Each internal node represents a comparison between two elements (e.g., "is $a_i \leq a_j$?"), with two children corresponding to the outcomes "yes" and "no." Each leaf represents a specific output permutation.

For the algorithm to be correct, it must be able to produce every permutation of $n$ elements as output — there must be at least $n!$ leaves. The number of comparisons in the worst case equals the height of the decision tree (the longest root-to-leaf path).

A binary tree of height $h$ has at most $2^h$ leaves. We have just established that a correct decision tree must have at least $n!$ leaves. Since the actual number of leaves is simultaneously _at most_ $2^h$ (the binary-tree bound) and _at least_ $n!$ (the correctness requirement), the upper bound must be large enough to accommodate the lower bound:

$$n! \leq \text{number of leaves} \leq 2^h \quad\Longrightarrow\quad 2^h \geq n!$$

Taking logarithms:

$$h \geq \log_2(n!)$$

It remains to show that $\log_2(n!) = \Omega(n \log n)$. One can appeal to Stirling's approximation ($n! \approx \sqrt{2\pi n}\,(n/e)^n$), but a direct argument is just as short and more illuminating.

---

> **Claim — $\lceil \log_2(n!) \rceil = \Omega(n \log n)$**
>
> _Proof._ Write $\log_2(n!)$ as a sum and keep only the upper half of its terms:
>
> $$\log_2(n!) = \sum_{k=1}^{n} \log_2 k \;\geq\; \sum_{k=\lceil n/2 \rceil}^{n} \log_2 k.$$
>
> Every term in the remaining sum satisfies $k \geq n/2$, so $\log_2 k \geq \log_2(n/2)$. There are at least $\lfloor n/2 \rfloor$ such terms, giving:
>
> $$\sum_{k=\lceil n/2 \rceil}^{n} \log_2 k \;\geq\; \frac{n}{2} \cdot \log_2 \frac{n}{2} = \frac{n}{2}(\log_2 n - 1).$$
>
> For $n \geq 4$ we have $\log_2 n \geq 2$, so $\log_2 n - 1 \geq \tfrac{1}{2}\log_2 n$, and therefore:
>
> $$\log_2(n!) \;\geq\; \frac{n}{2} \cdot \frac{\log_2 n}{2} = \frac{n \log_2 n}{4} = \Omega(n \log n). \quad\square$$

---

Combining $h \geq \log_2(n!)$ with the claim, any comparison-based sorting algorithm requires $\Omega(n \log n)$ comparisons in the worst case. $\square$

### Implications

This lower bound tells us that $O(n \log n)$ algorithms like merge sort and heapsort are _asymptotically optimal_ among comparison-based sorts — they cannot be improved in the worst case.

Moreover, once we prove that a sorting algorithm's worst-case running time is $O(n \log n)$ (an upper bound), the lower bound $\Omega(n \log n)$ that we just established applies to it automatically — because it is a comparison-based sort. The two bounds together give us $\Theta(n \log n)$: such an algorithm is not merely "at most $O(n \log n)$" but _exactly_ $\Theta(n \log n)$ in the worst case. There is no comparison-based sorting algorithm whose worst case grows slower, and merge sort and heapsort already match this floor.

It also tells us that our elementary $O(n^2)$ algorithms are a factor of $n / \log n$ away from optimal. For $n = 1{,}000{,}000$, that factor is roughly 50,000 — the same dramatic gap we noted in the growth-rate table of Chapter 2.

However, as it is evident from the proof of the lower bound, the lower bound applies only to comparison-based sorting. Algorithms that exploit additional structure in the input (such as knowing that elements are integers in a bounded range) can sort in $O(n)$ time, as we will see in Chapter 6.

## Summary

In this chapter we studied the sorting problem and three elementary algorithms for solving it:

- **Bubble sort** repeatedly swaps adjacent out-of-order elements. It is simple and stable, with $O(n^2)$ time in all cases. An early termination optimization can improve the best case to $O(n)$.
- **Selection sort** repeatedly selects the minimum from the unsorted portion. It always takes $\Theta(n^2)$ time but minimizes swaps to $O(n)$. It is not stable.
- **Insertion sort** inserts each element into its correct position in a growing sorted prefix. It is stable, adaptive to the number of inversions, and has $O(n)$ best-case time. It is the practical choice among elementary sorts.
- The **comparison-based lower bound** of $\Omega(n \log n)$ shows that these quadratic algorithms are not optimal.

In Chapter 5, we study three efficient sorting algorithms — merge sort, quicksort, and heapsort — that achieve the $O(n \log n)$ bound. These algorithms use the divide-and-conquer strategy from Chapter 3 to overcome the quadratic barrier.

## Exercises

**Exercise 4.1.** The chapter shows that selection sort is not stable. Describe how selection sort could be modified to become stable (hint: use insertion into a separate output instead of swapping). What is the cost of this modification?

**Exercise 4.2.** A _sentinel_ version of insertion sort places a minimum element at position $a[0]$ before sorting, eliminating the `insertIndex >= 0` bound check in the inner loop. Explain why this is correct and analyze its effect on performance. What are the drawbacks?

**Exercise 4.3.** Write a `Comparator<string>` for lexicographic ordering and use it to sort `["banana", "apple", "cherry", "date", "apricot"]` with insertion sort. Why can't a string comparator use the subtraction pattern `(a, b) => a - b` that `numberComparator` uses?

**Exercise 4.4.** Given an array of student records `[{name: "Charlie", grade: 90}, {name: "Alice", grade: 85}, {name: "Bob", grade: 90}, {name: "Alice", grade: 90}]`, use the multi-key sorting technique described in the stability section to sort by grade (ascending) as the primary key and by name (alphabetically) as the secondary key. Then write a single composite comparator that achieves the same result in one pass — when would you prefer each approach?

**Exercise 4.5.** Consider sorting an array of `{x: number, y: number}` points by their Euclidean distance from the origin. Write the comparator. Can you avoid computing square roots? Does the choice between insertion sort and selection sort matter if multiple points may share the same distance?
