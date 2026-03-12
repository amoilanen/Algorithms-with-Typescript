# Analyzing Algorithms

_In Chapter 1 we saw that two algorithms for the same problem — trial division versus the Sieve of Eratosthenes — can differ enormously in performance. In this chapter we develop the mathematical framework for making such comparisons precise. We introduce asymptotic notation, which lets us describe how an algorithm's resource usage grows with input size, and we study several techniques for analyzing running time: best-, worst-, and average-case analysis, amortized analysis, and recurrence relations._

## Why analyze algorithms?

Suppose you have two sorting algorithms, $A$ and $B$, and you want to know which one is faster. The most direct approach is to run both on the same input and measure the wall-clock time. This is called _benchmarking_, and it has an important place in software engineering. However, benchmarking has limitations:

- **Hardware dependence.** Algorithm $A$ might be faster on your laptop but slower on a different machine with a different CPU, cache hierarchy, or memory bandwidth.
- **Input dependence.** Algorithm $A$ might be faster on the particular test data you chose, but slower on inputs that arise in practice.
- **Implementation effects.** A clever implementation of a theoretically slower algorithm can outperform a naive implementation of a theoretically faster one.

What we want is a way to compare algorithms _independently_ of these factors — a way to reason about the inherent efficiency of an algorithm rather than the efficiency of a particular implementation on a particular machine with a particular input. This is what asymptotic analysis provides.

The idea is to count the number of "basic operations" an algorithm performs as a function of the input size $n$, and then focus on how that function grows as $n$ becomes large. We ignore constant factors (which depend on the hardware and implementation) and lower-order terms (which become negligible for large $n$). The result is a concise characterization of an algorithm's scalability.

## Measuring input size and running time

Before we can analyze an algorithm, we need to agree on two things: what counts as the _input size_, and what counts as a _basic operation_.

**Input size** is usually the most natural measure of how much data the algorithm must process:

- For an array of numbers, the input size is the number of elements $n$.
- For a graph, the input size is often specified as a pair $(V, E)$ — the number of vertices and edges.
- For a number-theoretic algorithm like the Sieve of Eratosthenes, the input size is the number $n$ itself.

**Basic operations** are the elementary steps we count. Common choices include comparisons, arithmetic operations, assignments, or array accesses. The specific choice rarely matters for asymptotic analysis, because changing which operation we count changes the total by at most a constant factor.

---

> **Definition 2.1 --- Running time**
>
> The **running time** of an algorithm on a given input is the number of basic operations it performs when executed on that input.

---

We are usually interested in expressing the running time as a function $T(n)$ of the input size $n$.

**Example 2.1: Running time of `max`.**

Recall the `max` function from Chapter 1:

```typescript
export function max(elements: number[]): number | undefined {
  let result: number | undefined;

  for (const element of elements) {
    if (result === undefined || element > result) {
      result = element;
    }
  }
  return result;
}
```

If we count comparisons as our basic operation, the loop performs exactly one comparison per element (the `element > result` check; the `undefined` check is bookkeeping). For an array of $n$ elements, the running time is $T(n) = n$.

## Asymptotic notation

Rather than stating that an algorithm takes exactly $3n^2 + 7n + 4$ operations, we want to capture the _growth rate_ — the fact that the dominant behavior is quadratic. Asymptotic notation gives us a precise way to do this.

### Big-O: upper bounds

---

> **Definition 2.2 --- Big-O notation**
>
> Let $f(n)$ and $g(n)$ be functions from the non-negative integers to the non-negative reals. We write
>
> $$f(n) = O(g(n))$$
>
> if there exist constants $c > 0$ and $n_0 \geq 0$ such that
>
> $$f(n) \leq c \cdot g(n) \quad \text{for all } n \geq n_0.$$
>
> In words: $f$ grows no faster than $g$, up to a constant factor, for sufficiently large $n$.

---

**Example 2.2.** Let $f(n) = 3n^2 + 7n + 4$. We claim $f(n) = O(n^2)$.

*Proof.* For $n \geq 1$, we have $7n \leq 7n^2$ and $4 \leq 4n^2$, so

$$f(n) = 3n^2 + 7n + 4 \leq 3n^2 + 7n^2 + 4n^2 = 14n^2.$$

Choosing $c = 14$ and $n_0 = 1$ satisfies Definition 2.2. $\square$

Note that $f(n) = O(n^3)$ is also technically true — $n^2$ is bounded above by $n^3$ — but it is less informative. By convention, we always state the tightest bound we can prove.

### Big-Omega: lower bounds

---

> **Definition 2.3 --- Big-Omega notation**
>
> We write $f(n) = \Omega(g(n))$ if there exist constants $c > 0$ and $n_0 \geq 0$ such that
>
> $$f(n) \geq c \cdot g(n) \quad \text{for all } n \geq n_0.$$
>
> In words: $f$ grows at least as fast as $g$, up to a constant factor.

---

**Example 2.3.** $3n^2 + 7n + 4 = \Omega(n^2)$.

*Proof.* For all $n \geq 0$, $3n^2 + 7n + 4 \geq 3n^2 \geq 3 \cdot n^2$. Choose $c = 3$ and $n_0 = 0$. $\square$

Big-Omega is especially useful for expressing _lower bounds_ on problems: "any algorithm that solves this problem must take at least $\Omega(g(n))$ time."

### Big-Theta: tight bounds

---

> **Definition 2.4 --- Big-Theta notation**
>
> We write $f(n) = \Theta(g(n))$ if $f(n) = O(g(n))$ and $f(n) = \Omega(g(n))$.
>
> Equivalently, there exist constants $c_1, c_2 > 0$ and $n_0 \geq 0$ such that
>
> $$c_1 \cdot g(n) \leq f(n) \leq c_2 \cdot g(n) \quad \text{for all } n \geq n_0.$$
>
> In words: $f$ and $g$ grow at the same rate, up to constant factors.

---

**Example 2.4.** From Examples 2.2 and 2.3, we have $3n^2 + 7n + 4 = \Theta(n^2)$.

Big-Theta is the most precise statement: it says the function grows _exactly_ like $g(n)$, within constant factors. When we can determine a Big-Theta bound for an algorithm, we have characterized its running time completely (in the asymptotic sense).

### Summary of notation

| Notation | Meaning | Analogy |
|----------|---------|---------|
| $f(n) = O(g(n))$ | $f$ grows no faster than $g$ | $f \leq g$ |
| $f(n) = \Omega(g(n))$ | $f$ grows at least as fast as $g$ | $f \geq g$ |
| $f(n) = \Theta(g(n))$ | $f$ and $g$ grow at the same rate | $f = g$ |

The analogy to $\leq$, $\geq$, $=$ is informal but helpful for intuition. Formally, all three notations suppress constant factors and describe behavior only for sufficiently large $n$.

### Common growth rates

The following table lists growth rates that appear throughout this book, ordered from slowest to fastest:

| Growth rate | Name | Example |
|-------------|------|---------|
| $O(1)$ | Constant | Array index access |
| $O(\log n)$ | Logarithmic | Binary search |
| $O(n)$ | Linear | Finding the maximum |
| $O(n \log n)$ | Linearithmic | Merge sort, heap sort |
| $O(n^2)$ | Quadratic | Insertion sort (worst case) |
| $O(n^3)$ | Cubic | Floyd-Warshall all-pairs shortest paths |
| $O(2^n)$ | Exponential | Brute-force subset enumeration |
| $O(n!)$ | Factorial | Brute-force permutation enumeration |

To appreciate the practical impact, consider an algorithm that performs $T(n)$ operations on a computer executing $10^9$ operations per second:

| $n$ | $n$ | $n \log_2 n$ | $n^2$ | $n^3$ | $2^n$ |
|-----|-----|-------------|-------|-------|-------|
| 10 | 10 ns | 33 ns | 100 ns | 1 μs | 1 μs |
| 100 | 100 ns | 664 ns | 10 μs | 1 ms | $4 \times 10^{13}$ years |
| 1,000 | 1 μs | 10 μs | 1 ms | 1 s | — |
| $10^6$ | 1 ms | 20 ms | 17 min | 31.7 years | — |
| $10^9$ | 1 s | 30 s | 31.7 years | — | — |

The table makes a powerful point: the gap between $O(n \log n)$ and $O(n^2)$ is large for a million elements, and the jump to $O(2^n)$ is catastrophic even for modest inputs.

## Best case, worst case, and average case

The running time of an algorithm usually depends on the _specific input_, not just its size. Consider insertion sort.

### Insertion sort as a running example

Recall the insertion sort implementation from Chapter 4 (we discuss it fully there, but introduce it here as an analysis example):

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

The outer loop runs $n - 1$ iterations (for $i = 1, 2, \ldots, n - 1$). For each iteration, the inner `while` loop shifts elements to the right until it finds the correct insertion point. The number of shifts depends on the input.

### Worst-case analysis

---

> **Definition 2.5 --- Worst-case running time**
>
> The **worst-case running time** $T_{\text{worst}}(n)$ is the maximum running time over all inputs of size $n$:
>
> $$T_{\text{worst}}(n) = \max_{\text{inputs } I \text{ of size } n} T(I).$$

---

For insertion sort, the worst case occurs when the array is sorted in reverse order: $[n, n-1, \ldots, 2, 1]$. In this case, every new element must be shifted past all previously sorted elements. The inner loop performs $i$ comparisons in iteration $i$, so the total number of comparisons is:

$$\sum_{i=1}^{n-1} i = \frac{n(n-1)}{2} = \Theta(n^2).$$

### Best-case analysis

---

> **Definition 2.6 --- Best-case running time**
>
> The **best-case running time** $T_{\text{best}}(n)$ is the minimum running time over all inputs of size $n$:
>
> $$T_{\text{best}}(n) = \min_{\text{inputs } I \text{ of size } n} T(I).$$

---

For insertion sort, the best case occurs when the array is already sorted. Each new element is already in its correct position, so the inner loop performs zero shifts — just one comparison to discover that no shifting is needed. The total is:

$$\sum_{i=1}^{n-1} 1 = n - 1 = \Theta(n).$$

This is remarkable: insertion sort runs in _linear_ time on already-sorted input, matching the theoretical minimum for any comparison-based algorithm that must verify sortedness.

### Average-case analysis

---

> **Definition 2.7 --- Average-case running time**
>
> The **average-case running time** is the expected running time over some distribution of inputs. For a uniform distribution over all permutations of $n$ elements:
>
> $$T_{\text{avg}}(n) = \frac{1}{n!} \sum_{\text{permutations } \pi} T(\pi).$$

---

For insertion sort, consider iteration $i$: the element being inserted has an equal probability of belonging at any of the $i + 1$ positions in the sorted prefix. On average, it must be shifted past half of the sorted elements, so the expected number of comparisons in iteration $i$ is roughly $i/2$. The total expected comparisons are:

$$\sum_{i=1}^{n-1} \frac{i}{2} = \frac{n(n-1)}{4} = \Theta(n^2).$$

The average case is still $\Theta(n^2)$ — the same order of growth as the worst case. The constant factor is half as large, but asymptotically the behavior is the same.

### Which case matters?

In practice, **worst-case analysis** is the most commonly used, for several reasons:

1. **Guarantees.** The worst case gives an upper bound that holds for _every_ input. This is crucial in real-time systems, web servers, and other contexts where performance must be predictable.
2. **Average case can be misleading.** The "average" depends on the input distribution, which we may not know. If the actual inputs differ from our assumption, the average-case analysis may not apply.
3. **Worst case is often typical.** For many algorithms, the worst case and average case have the same asymptotic growth rate (as we just saw with insertion sort).

We will occasionally discuss best-case and average-case bounds when they provide useful insight, but unless otherwise stated, all complexity bounds in this book refer to the worst case.

## Amortized analysis

Sometimes an operation is expensive _occasionally_ but cheap _most of the time_. Amortized analysis gives us a way to average the cost over a sequence of operations, providing a tighter bound than the worst-case cost per operation.

### The dynamic array example

Consider a dynamic array (like JavaScript's `Array` or `std::vector` in C++) that supports an `append` operation. The array maintains an internal buffer of some capacity. When the buffer is full and a new element is appended, the array allocates a new buffer of double the capacity and copies all existing elements over. This _resize_ operation costs $O(n)$, where $n$ is the current number of elements.

At first glance, this seems concerning: a single `append` can cost $O(n)$. But resizes happen infrequently — only when the size reaches a power of 2. Let us analyze the cost of $n$ consecutive appends starting from an empty array.

The resize operations happen at sizes 1, 2, 4, 8, $\ldots$, $2^k$, where $2^k \leq n$. The total copying cost across all resizes is:

$$1 + 2 + 4 + 8 + \cdots + 2^k = 2^{k+1} - 1 < 2n.$$

Adding the $n$ non-resize operations (cost 1 each), the total cost of $n$ appends is less than $3n$. Therefore the **amortized cost** per append is:

$$\frac{3n}{n} = O(1).$$

Each individual append may cost $O(n)$ in the worst case, but _averaged over a sequence of operations_, the cost is $O(1)$ per operation.

### Amortized vs. average case

It is important to distinguish amortized analysis from average-case analysis:

- **Average case** averages over _random inputs_: we assume a probability distribution on the inputs and compute the expected running time.
- **Amortized analysis** averages over a _sequence of operations_ on a _worst-case_ input: no probability is involved. The guarantee holds deterministically.

Amortized analysis says: "no matter what sequence of $n$ operations you perform, the total cost is at most $f(n)$, so the amortized cost per operation is $f(n)/n$." This is a worst-case guarantee about the total, not a probabilistic statement.

We will see amortized analysis again in Chapter 7 (dynamic arrays), Chapter 11 (binary heaps), and Chapter 18 (union-find).

## Recurrence relations

When an algorithm calls itself recursively, its running time is naturally expressed as a _recurrence relation_: a formula that expresses $T(n)$ in terms of $T$ applied to smaller values.

### Setting up a recurrence

**Example 2.5: Binary search.** Binary search (discussed in Chapter 3) repeatedly halves the search space:

1. Compare the target with the middle element.
2. If they match, return the index.
3. Otherwise, recurse on the left or right half.

The running time satisfies the recurrence:

$$T(n) = T(n/2) + O(1), \quad T(1) = O(1).$$

The $T(n/2)$ term accounts for the recursive call on half the array, and the $O(1)$ term accounts for the comparison and index computation.

**Example 2.6: Merge sort.** Merge sort (discussed in Chapter 5) divides the array in half, recursively sorts both halves, and merges the results:

$$T(n) = 2T(n/2) + O(n), \quad T(1) = O(1).$$

The two recursive calls each process half the array ($2T(n/2)$), and the merge step takes $O(n)$ time.

### Solving recurrences by expansion

One way to solve a recurrence is to expand it repeatedly until a pattern emerges.

**Example 2.7: Solving the binary search recurrence.**

$$T(n) = T(n/2) + c$$

Expanding:

$$T(n) = T(n/4) + c + c = T(n/4) + 2c$$
$$= T(n/8) + 3c$$
$$= T(n/2^k) + kc$$

The recursion bottoms out when $n/2^k = 1$, i.e., $k = \log_2 n$. Therefore:

$$T(n) = T(1) + c \log_2 n = O(\log n).$$

**Example 2.8: Solving the merge sort recurrence.**

$$T(n) = 2T(n/2) + cn$$

Expanding:

$$T(n) = 2[2T(n/4) + cn/2] + cn = 4T(n/4) + 2cn$$
$$= 4[2T(n/8) + cn/4] + 2cn = 8T(n/8) + 3cn$$

At level $k$: $T(n) = 2^k T(n/2^k) + kcn$. Setting $k = \log_2 n$:

$$T(n) = nT(1) + cn\log_2 n = O(n \log n).$$

### The recursion tree method

A recursion tree is a visual tool for solving recurrences. Each node represents the cost at one level of recursion, and the total cost is the sum over all nodes.

For merge sort with $T(n) = 2T(n/2) + cn$:

```
Level 0:              cn                    → cost cn
                    /    \
Level 1:        cn/2      cn/2              → cost cn
                / \       / \
Level 2:    cn/4  cn/4  cn/4  cn/4          → cost cn
              ...         ...
Level k:   c  c  c  ...  c  c  c           → cost cn
           (n leaves)
```

There are $\log_2 n$ levels, each contributing $cn$ work, so the total is $cn \log_2 n = O(n \log n)$.

## The Master Theorem

The Master Theorem provides a general solution for recurrences of a common form.

---

> **Definition 2.8 --- The Master Theorem**
>
> Let $a \geq 1$ and $b > 1$ be constants, let $f(n)$ be a function, and let $T(n)$ be defined by the recurrence
>
> $$T(n) = aT(n/b) + f(n).$$
>
> Then $T(n)$ can be bounded asymptotically as follows:
>
> 1. If $f(n) = O(n^{\log_b a - \epsilon})$ for some constant $\epsilon > 0$, then $T(n) = \Theta(n^{\log_b a})$.
>
> 2. If $f(n) = \Theta(n^{\log_b a})$, then $T(n) = \Theta(n^{\log_b a} \log n)$.
>
> 3. If $f(n) = \Omega(n^{\log_b a + \epsilon})$ for some constant $\epsilon > 0$, and if $af(n/b) \leq cf(n)$ for some constant $c < 1$ and sufficiently large $n$, then $T(n) = \Theta(f(n))$.

---

The three cases correspond to three scenarios:

- **Case 1:** The cost is dominated by the leaves of the recursion tree. The recursive calls do most of the work.
- **Case 2:** The cost is evenly distributed across all levels of the tree. Each level contributes roughly equally.
- **Case 3:** The cost is dominated by the root. The non-recursive work $f(n)$ dominates.

Let us apply the Master Theorem to our earlier examples.

**Example 2.9: Binary search.** $T(n) = T(n/2) + O(1)$.

Here $a = 1$, $b = 2$, $f(n) = O(1)$. We have $n^{\log_b a} = n^{\log_2 1} = n^0 = 1$. Since $f(n) = \Theta(1) = \Theta(n^{\log_b a})$, Case 2 applies:

$$T(n) = \Theta(\log n).$$

**Example 2.10: Merge sort.** $T(n) = 2T(n/2) + O(n)$.

Here $a = 2$, $b = 2$, $f(n) = O(n)$. We have $n^{\log_b a} = n^{\log_2 2} = n^1 = n$. Since $f(n) = \Theta(n) = \Theta(n^{\log_b a})$, Case 2 applies:

$$T(n) = \Theta(n \log n).$$

**Example 2.11: Strassen's matrix multiplication.** $T(n) = 7T(n/2) + O(n^2)$.

Here $a = 7$, $b = 2$, $f(n) = O(n^2)$. We have $n^{\log_b a} = n^{\log_2 7} \approx n^{2.807}$. Since $f(n) = O(n^2) = O(n^{2.807 - \epsilon})$ with $\epsilon \approx 0.807$, Case 1 applies:

$$T(n) = \Theta(n^{\log_2 7}) \approx \Theta(n^{2.807}).$$

This is better than the naive $O(n^3)$ matrix multiplication.

### Limitations of the Master Theorem

The Master Theorem does not cover all recurrences. It requires that the subproblems be of equal size $n/b$ and that $f(n)$ fall into one of the three cases. Recurrences like $T(n) = T(n/3) + T(2n/3) + O(n)$ (which arises in randomized quicksort analysis) do not fit the template directly. For such cases, the recursion-tree method or the Akra–Bazzi theorem can be used.

## Space complexity

So far we have focused on time complexity, but algorithms also consume _memory_. Space complexity measures the amount of additional memory an algorithm uses beyond the input.

---

> **Definition 2.9 --- Space complexity**
>
> The **space complexity** of an algorithm is the maximum amount of memory it uses at any point during execution, measured as a function of the input size.

---

We distinguish between:

- **Auxiliary space:** the extra memory used beyond the input itself.
- **Total space:** auxiliary space plus the space for the input.

Unless stated otherwise, when we refer to "space complexity" in this book, we mean auxiliary space.

**Example 2.12: Space complexity of `max`.**

The `max` function from Chapter 1 uses a single variable `result`. Its auxiliary space is $O(1)$.

**Example 2.13: Space complexity of merge sort.**

Merge sort requires a temporary array of size $n$ for the merge step, plus $O(\log n)$ space for the recursion stack. Its auxiliary space is $O(n)$.

**Example 2.14: Space complexity of insertion sort.**

Our insertion sort implementation copies the input array (space $O(n)$). An in-place variant that sorts the array directly would use only $O(1)$ auxiliary space.

### Time–space trade-offs

Often there is a trade-off between time and space. An algorithm can sometimes be made faster by using more memory, or made more memory-efficient at the cost of additional computation. A classic example:

- **Hash table** lookup: $O(1)$ average time, $O(n)$ space.
- **Linear search** through an unsorted array: $O(n)$ time, $O(1)$ space.

Both solve the problem of finding an element in a collection, but they make different trade-offs. Recognizing and navigating these trade-offs is a recurring theme in algorithm design.

## Practical considerations

Asymptotic analysis is a powerful framework, but it has limitations that a practicing programmer should keep in mind.

### Constant factors matter for moderate $n$

Asymptotic notation hides constant factors. An algorithm with running time $100n$ is $O(n)$, and an algorithm with running time $2n \log n$ is $O(n \log n)$. For $n < 2^{50}$, the "slower" $O(n \log n)$ algorithm is actually faster. In practice, constant factors depend on:

- The number of operations per step.
- Cache behavior — algorithms with good spatial locality are faster in practice.
- Branch prediction — algorithms with predictable control flow benefit from CPU branch predictors.

This is why, for example, insertion sort (which is $O(n^2)$) is often used for small arrays (say, $n < 20$) even inside asymptotically faster algorithms like merge sort. The constant factor is smaller, and for tiny inputs the quadratic term has not yet become dominant.

### Lower-order terms

An algorithm that performs $n^2 + 10^6 n$ operations is $\Theta(n^2)$, but for $n < 10^6$, the linear term dominates. Asymptotic analysis describes long-term growth; for small inputs, the actual constants and lower-order terms may be more important.

### Choosing the right model

Our analysis assumes a simple model where every basic operation takes the same amount of time. Real computers have caches, pipelines, and memory hierarchies that make some access patterns much faster than others. An algorithm that accesses memory sequentially (like insertion sort) can be significantly faster in practice than one that accesses memory randomly (like binary search on a large array), even if the latter has a better asymptotic bound.

Despite these caveats, asymptotic analysis remains the single most useful tool for comparing algorithms. It correctly predicts which algorithm will win for large enough inputs, and "large enough" usually means "the sizes that actually matter in practice."

## Looking ahead

In this chapter we have developed the fundamental tools for analyzing algorithms:

- **Asymptotic notation** ($O$, $\Omega$, $\Theta$) captures growth rates while abstracting away constant factors and hardware details.
- **Worst-case analysis** gives reliable upper bounds on running time. Best-case and average-case analyses provide additional insight.
- **Amortized analysis** reveals that operations with occasional expensive steps can still be efficient on average.
- **Recurrence relations** express the running time of recursive algorithms, and the **Master Theorem** provides a quick way to solve common recurrences.
- **Space complexity** measures memory usage and highlights time–space trade-offs.

Armed with these tools, we are ready to analyze every algorithm in this book rigorously. In the next chapter, we explore recursion and the divide-and-conquer strategy — one of the most powerful algorithm design techniques — and apply our analytical framework to algorithms like binary search and the closest pair of points.

## Exercises

**Exercise 2.1.** Rank the following functions by asymptotic growth rate, from slowest to fastest. For each consecutive pair, state whether $f = O(g)$, $f = \Omega(g)$, or $f = \Theta(g)$.

$$\log_2 n, \quad n^2, \quad \sqrt{n}, \quad 2^n, \quad n \log n, \quad n!, \quad n, \quad 1$$

**Exercise 2.2.** Prove or disprove: if $f(n) = O(g(n))$ and $g(n) = O(h(n))$, then $f(n) = O(h(n))$. (In other words, is Big-O transitive?)

**Exercise 2.3.** For each of the following recurrences, use the Master Theorem to determine the asymptotic bound, or explain why the Master Theorem does not apply.

(a) $T(n) = 4T(n/2) + n$

(b) $T(n) = 2T(n/2) + n \log n$

(c) $T(n) = 3T(n/3) + n$

(d) $T(n) = T(n/2) + n$

**Exercise 2.4.** Consider a dynamic array that triples (instead of doubles) its capacity when full. Prove that the amortized cost of an `append` operation is still $O(1)$. How does the constant factor compare to the doubling strategy?

**Exercise 2.5.** An algorithm processes an array of $n$ elements as follows: for each element, it performs a binary search over the preceding elements. What is the overall time complexity? Express your answer in Big-Theta notation.
