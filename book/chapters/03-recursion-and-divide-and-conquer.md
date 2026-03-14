# Recursion and Divide-and-Conquer

_Recursion is one of the most powerful techniques in algorithm design: solving a problem by breaking it into smaller instances of the same problem. In this chapter we study recursion from the ground up, connect it to mathematical induction, and then develop the divide-and-conquer strategy — splitting a problem into independent subproblems, solving each recursively, and combining the results. We illustrate these ideas with four algorithms: binary search, fast exponentiation, the Euclidean algorithm for greatest common divisors, and the closest pair of points._

## Recursion

Some problems have a natural recursive structure: the solution depends on solving one or more smaller instances of the same problem. When we translate this structure into code, we get a _recursive function_ — a function that calls itself. This is not mere circularity: each call works on a smaller instance of the problem, and eventually the instances become small enough to solve directly. Every recursive function has two essential ingredients:

1. **Base case.** One or more input sizes for which the answer is immediate, without further recursion.
2. **Recursive case.** For larger inputs, the function reduces the problem to one or more smaller instances and combines the results.

Consider a simple example: computing the factorial $n! = 1 \cdot 2 \cdot \ldots \cdot n$.

```typescript
function factorial(n: number): number {
  if (n <= 1) return 1;   // base case
  return n * factorial(n - 1); // recursive case
}
```

The base case is $n \leq 1$, where we return 1. The recursive case multiplies $n$ by the factorial of $n - 1$. Each recursive call reduces the argument by 1, so the chain of calls eventually reaches the base case:

$$\text{factorial}(4) = 4 \cdot \text{factorial}(3) = 4 \cdot 3 \cdot \text{factorial}(2) = 4 \cdot 3 \cdot 2 \cdot \text{factorial}(1) = 4 \cdot 3 \cdot 2 \cdot 1 = 24.$$

### The call stack

To understand how recursion works at runtime, we need to understand how computers handle function calls in general. Whenever any function is called — recursive or not — the runtime needs to remember where to return after the call finishes, and what values the local variables had. It stores this information in a _frame_: a block of memory holding the function's arguments, local variables, and the return address (the point in the calling code to resume after the call completes).

These frames are organized in a _call stack_ — a stack data structure where each new call pushes a frame on top, and each return pops one off. For ordinary (non-recursive) code, the stack is typically shallow — for example, if `main` calls `f`, which calls `g`, the stack is only three frames deep. But with recursion, the same function can appear many times on the stack simultaneously, each frame representing a different invocation with different argument values.

For `factorial(4)`, the stack grows to depth 4 before the base case is reached:

```
factorial(4)  — waiting for factorial(3)
  factorial(3)  — waiting for factorial(2)
    factorial(2)  — waiting for factorial(1)
      factorial(1)  — returns 1
    factorial(2)  — returns 2 × 1 = 2
  factorial(3)  — returns 3 × 2 = 6
factorial(4)  — returns 4 × 6 = 24
```

Each frame occupies memory, so a recursion of depth $d$ uses $O(d)$ stack space. For `factorial(n)`, the depth is $n$, so the space complexity is $O(n)$.

### Stack overflow

The call stack has a fixed maximum size, set by the operating system or the language runtime. When a recursion goes too deep, the stack runs out of space, and the program crashes with a _stack overflow_ error. This is not an abstract concern — it happens easily in practice. For example, our `factorial` function works fine for small inputs, but calling `factorial(100000)` will likely crash:

```typescript
factorial(100000); // RangeError: Maximum call stack size exceeded
```

In JavaScript and TypeScript, the default stack size typically allows around 10,000–15,000 frames (the exact limit depends on the runtime and the size of each frame). Other languages have similar limits.

This is an important practical consideration when choosing between a recursive and an iterative solution. Any recursion can be rewritten as a loop with an explicit stack, trading the elegance of recursion for safety against overflow. But for some problems the clarity and elegance of the recursive solution outweigh the cost. For algorithms where the recursion depth is logarithmic (like binary search, with depth $O(\log n)$), stack overflow is never a concern — even for $n = 10^{18}$, the depth is only about 60. But for algorithms where the depth is linear in the input (like our factorial), an iterative version may be preferable for large inputs.

### Common pitfalls

Two mistakes arise frequently when writing recursive functions:

1. **Missing base case.** Without a base case, the recursion never terminates:

   ```typescript
   function infiniteRecursion(n: number): number {
     return n * infiniteRecursion(n - 1); // no base case!
   }
   ```

   This is not an algorithm in the sense of Definition 1.1 — it does not terminate.

2. **Subproblems that do not shrink.** Even with a base case, the recursion must make progress:

   ```typescript
   function noProgress(n: number): number {
     if (n <= 1) return 1;
     return n * noProgress(n); // n does not decrease!
   }
   ```

   This function never reaches the base case for $n > 1$.

## Recursion and mathematical induction

_Mathematical induction_ is a proof technique for showing that a statement is true for every element of a well-ordered sequence — most commonly the natural numbers, but the idea applies whenever instances can be ranked by size (array lengths, tree depths, and so on). It works in two steps. First, you show the statement is true for the smallest case (usually $n = 0$ or $n = 1$) — this is the **base case**. Second, you show that _if_ the statement is true for some number $k$, _then_ it must also be true for $k + 1$ — this is the **inductive step**. Together, these two steps create a chain of reasoning: the base case establishes the first domino, and the inductive step guarantees that each domino knocks over the next, so the statement holds for all natural numbers.

There is a deep connection between this technique and recursion. Induction proves that a property holds for all natural numbers; recursion computes a value for all valid inputs. The structures are parallel:

| Induction | Recursion |
|-----------|-----------|
| Base case: prove $P(0)$ (or $P(1)$) | Base case: return a value directly |
| Inductive step: assuming $P(k)$, prove $P(k+1)$ | Recursive case: assuming the recursive call returns the correct result, compute the current result |

This parallel is not a coincidence — it is the foundation for proving recursive algorithms correctness. To prove that a recursive function computes the right answer, we use _strong induction_ (also called _complete induction_): assume the function works correctly for all inputs smaller than $n$, and show it works correctly for input $n$.

---

> **Definition 3.1 --- Correctness of a recursive algorithm**
>
> A recursive algorithm is **correct** if:
>
> 1. It produces the correct answer on all base cases.
> 2. If the algorithm produces the correct answer on every strictly smaller subproblem, then it also produces the correct answer on the current problem.

---

When we implement a recursive algorithm as a function in code, these two conditions translate directly: the base case corresponds to the `if` branch that returns a value without recursing, and the recursive case corresponds to the branch that calls the function on a smaller input and combines the result. Condition 2 becomes: if every recursive call on a strictly smaller input returns the correct answer, then the current call also returns the correct answer.

Not every function is an algorithm — a function might not terminate, or might not solve a well-defined problem — but when a recursive function _does_ implement an algorithm, proving it correct means verifying exactly these two conditions.

**Example 3.1: Correctness of `factorial`.**

*Base case.* When $n \leq 1$, the function returns 1, and indeed $0! = 1! = 1$.

*Inductive step.* Assume `factorial(k)` returns $k!$ for all $k < n$. Then `factorial(n)` returns $n \cdot \text{factorial}(n-1) = n \cdot (n-1)! = n!$. $\square$

## Divide and conquer

Divide and conquer is a specific recursion pattern that solves a problem by:

1. **Divide:** split the input into two or more smaller subproblems of the same type.
2. **Conquer:** solve each subproblem recursively (or directly if it is small enough).
3. **Combine:** merge the subproblem solutions into a solution for the original problem.

Not every recursive algorithm is divide-and-conquer. The factorial function above reduces the problem by a constant amount (from $n$ to $n-1$), which is sometimes called _decrease and conquer_. True divide-and-conquer algorithms typically split the input by a constant _fraction_ (usually in half), leading to logarithmic recursion depth and often dramatically better performance.

The running time of a divide-and-conquer algorithm is typically expressed as a recurrence of the form

$$T(n) = aT(n/b) + f(n),$$

where $a$ is the number of subproblems, $n/b$ is their size, and $f(n)$ is the cost of dividing and combining.

Note that $a$ and $b$ need not be equal: $b$ describes how the input is _partitioned_ (a structural choice), while $a$ describes how many of those parts the algorithm _actually recurses on_ (an algorithmic choice). For example, binary search splits the array in two ($b = 2$) but recurses on only one half ($a = 1$); merge sort also splits in two ($b = 2$) but must recurse on both halves ($a = 2$). An algorithm can even have $a > b$: Karatsuba multiplication splits each number into two halves ($b = 2$) but produces three recursive subproblems ($a = 3$) from clever algebraic rearrangement. The relationship between $a$ and $b$ is what ultimately determines the algorithm's growth rate. As we saw in Chapter 2, the Master Theorem often gives us the asymptotic estimate for $T(n)$ directly.

## Binary search

Our first divide-and-conquer algorithm is one of the most important ones: binary search. It finds the position of a target value in a _sorted_ array by repeatedly halving the search space.

### The problem

**Input:** A sorted array $A[0..n-1]$ of numbers and a target value $x$.

**Output:** An index $i$ such that $A[i] = x$, or $-1$ if $x$ is not in $A$.

### The algorithm

The idea is simple: compare $x$ with the middle element of the array.

- If they match, return the index.
- If $x$ is smaller, recurse on the left half.
- If $x$ is larger, recurse on the right half.

Each step eliminates half of the remaining elements.

### Recursive implementation

Since binary search is a divide-and-conquer algorithm, it is most natural to express it recursively. The function takes an array, a target, and the current search range (`low` and `high`). The two base cases are: (1) the range is empty — the element is not present; (2) the middle element matches — we return its index. The recursive cases narrow the range to one half:

```typescript
export function binarySearchRecursive(
  arr: number[],
  element: number,
  low: number = 0,
  high: number = arr.length - 1,
): number {
  if (low > high) return -1; // base case: empty range

  const mid = Math.floor((low + high) / 2);
  const midVal = arr[mid]!;

  if (midVal === element) {
    return mid; // base case: found
  } else if (midVal < element) {
    return binarySearchRecursive(arr, element, mid + 1, high); // search right half
  } else {
    return binarySearchRecursive(arr, element, low, mid - 1); // search left half
  }
}
```

This implementation directly mirrors the divide-and-conquer description: each call either solves the problem immediately (base case) or delegates to a single subproblem of half the size.

### Tracing through an example

Let $A = [1, 3, 5, 7, 9, 11, 13]$ and $x = 9$.

| Call | `low` | `high` | `mid` | `arr[mid]` | Action |
|------|-------|--------|-------|------------|--------|
| 1 | 0 | 6 | 3 | 7 | $9 > 7$: recurse on right half |
| 2 | 4 | 6 | 5 | 11 | $9 < 11$: recurse on left half |
| 3 | 4 | 4 | 4 | 9 | $9 = 9$: found, return 4 |

After only 3 comparisons (and 3 recursive calls), we have found the element in a 7-element array. A linear scan might have taken up to 7 comparisons.

### Correctness

We prove correctness by induction on the size of the search range $h = \text{high} - \text{low} + 1$.

**Base case.** When $\text{low} > \text{high}$ (empty range, $h \leq 0$), the element cannot be present, and the function correctly returns $-1$.

**Inductive step.** Assume the function returns the correct result for all ranges smaller than $h$. For a range of size $h$, the function computes $\text{mid}$ and compares $A[\text{mid}]$ with $x$:

- If $A[\text{mid}] = x$, we return $\text{mid}$. Correct.
- If $A[\text{mid}] < x$, then since $A$ is sorted, $x$ cannot be in $A[\text{low}..\text{mid}]$. The recursive call searches $A[\text{mid}+1..\text{high}]$, a strictly smaller range, so by the inductive hypothesis it returns the correct answer.
- The case $A[\text{mid}] > x$ is symmetric. $\square$

### From recursion to iteration

Notice that the recursive binary search is _tail-recursive_: the recursive call is the very last operation in each branch — the function returns whatever the recursive call returns, without doing any further computation. Tail-recursive functions can always be transformed into a simple loop: we replace the recursive calls with assignments to the parameters and repeat.

Of course, even without this manual transformation, the computer already executes the recursion iteratively at the hardware level — using the call stack we discussed earlier in this chapter. Each recursive call pushes a new frame, and each return pops one off. But that mechanical translation is wasteful: it allocates a stack frame for every call, even though the caller does nothing with the result except pass it through. Transforming a tail-recursive function into a loop eliminates the stack entirely — the parameters are simply updated in place and control jumps back to the top of the function. The reason we can eliminate the stack is precisely that the function is tail-recursive: since nothing remains to be done after the recursive call returns, the caller's frame holds no state that is still needed, so there is nothing to save and no need for a stack frame at all. This is a general property — any tail-recursive function can be mechanically rewritten as a loop without a stack.

Let us apply this transformation to our recursive binary search:

```typescript
export function binarySearch(arr: number[], element: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = arr[mid]!;

    if (midVal === element) {
      return mid;
    } else if (midVal < element) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}
```

The variables `low` and `high` play exactly the same role as the parameters of the recursive version — they define the current subproblem. Each iteration halves the range, just as each recursive call did. The iterative version has the advantage of using $O(1)$ space instead of $O(\log n)$, because it avoids the overhead of the call stack. In practice, both versions are fine for binary search (the recursion depth is at most about 60 even for $n = 10^{18}$), but the iterative form is conventional and marginally faster.

### Complexity analysis

Each step halves the search range. Starting from $n$ elements, after $k$ steps we have at most $n / 2^k$ elements. When $n / 2^k = 1$ there is still one element left to compare, so the search has not yet terminated. The range becomes empty — and the process terminates — when $n / 2^k < 1$, i.e., after at most $k = \lfloor \log_2 n \rfloor + 1$ steps.

- **Time complexity:** $O(\log n)$ (both versions).
- **Space complexity:** $O(\log n)$ for the recursive version (call stack depth); $O(1)$ for the iterative version.

Using the Master Theorem on the recurrence: $T(n) = T(n/2) + O(1)$. Here $a = 1$, $b = 2$, $n^{\log_b a} = n^0 = 1$. Since $f(n) = O(1) = \Theta(n^{\log_b a})$, Case 2 gives $T(n) = \Theta(\log n)$.

### Comparison with linear search

For comparison, here is the linear search algorithm:

```typescript
export function linearSearch<T>(arr: T[], element: T): number {
  let position = -1;
  let currentIndex = 0;

  while (position < 0 && currentIndex < arr.length) {
    if (arr[currentIndex] === element) {
      position = currentIndex;
    } else {
      currentIndex++;
    }
  }
  return position;
}
```

Linear search works on _any_ array (not just sorted ones) but takes $O(n)$ time. Binary search requires a sorted array but is exponentially faster:

| Elements | Linear search | Binary search |
|----------|--------------|---------------|
| 1,000 | 1,000 comparisons | 10 comparisons |
| 1,000,000 | 1,000,000 comparisons | 20 comparisons |
| $10^9$ | $10^9$ comparisons | 30 comparisons |

This dramatic improvement — from linear to logarithmic — is the hallmark of the divide-and-conquer approach. The key insight is that each comparison does not eliminate just a single element but _half of the remaining elements_.

## Fast exponentiation (exponentiation by squaring)

Our second example addresses the problem of computing $b^n$ efficiently.

### The problem

**Input:** A number $b$ (the base) and a non-negative integer $n$ (the exponent).

**Output:** The value $b^n$.

### Naive approach

The straightforward approach multiplies $b$ by itself $n$ times:

```typescript
export function powSlow(base: number, power: number): number {
  let result = 1;
  for (let i = 0; i < power; i++) {
    result = result * base;
  }
  return result;
}
```

This performs $n$ multiplications, so it runs in $O(n)$ time.

### Exponentiation by squaring

We can do much better by observing a simple mathematical identity:

$$
b^n =
\begin{cases}
1 & \text{if } n = 0, \\
(b^{n/2})^2 & \text{if } n \text{ is even}, \\
b \cdot b^{n-1} & \text{if } n \text{ is odd}.
\end{cases}
$$

When $n$ is even, we compute $b^{n/2}$ once and square the result — a single multiplication instead of $n/2$ multiplications. When $n$ is odd, we reduce to an even exponent by extracting one factor of $b$.

The recurrence above translates directly into a recursive function — just as with binary search. Writing that recursive version is straightforward (see Exercise 3.3). Here, we skip the intermediate steps we took for binary search and jump straight to the optimized iterative version. As before, the recursive version is tail-recursive, so the same transformation applies: we replace recursive calls with assignments to the parameters and loop:

```typescript
export function pow(base: number, power: number): number {
  let result = 1;

  while (power > 0) {
    if (power % 2 === 0) {
      base = base * base;
      power = power / 2;
    } else {
      result = result * base;
      power = power - 1;
    }
  }
  return result;
}
```

### Tracing through an example

Let us compute $2^{10}$:

| Step | `base` | `power` | `result` | Action |
|------|--------|---------|----------|--------|
| 1 | 2 | 10 | 1 | Even: base ← $2^2 = 4$, power ← 5 |
| 2 | 4 | 5 | 1 | Odd: result ← $1 \times 4 = 4$, power ← 4 |
| 3 | 4 | 4 | 4 | Even: base ← $4^2 = 16$, power ← 2 |
| 4 | 16 | 2 | 4 | Even: base ← $16^2 = 256$, power ← 1 |
| 5 | 256 | 1 | 4 | Odd: result ← $4 \times 256 = 1024$, power ← 0 |

Result: $2^{10} = 1024$. The naive approach would have used 10 multiplications; fast exponentiation used 5.

### Correctness

**Invariant:** At the start of each iteration, $\text{result} \times \text{base}^{\text{power}}$ equals the original $b^n$.

- **Initialization.** $\text{result} = 1$, $\text{base} = b$, $\text{power} = n$. The invariant $1 \times b^n = b^n$ holds.
- **Maintenance.**
  - If power is even: we replace base with $\text{base}^2$ and power with $\text{power}/2$. Then $\text{result} \times (\text{base}^2)^{\text{power}/2} = \text{result} \times \text{base}^{\text{power}}$. Invariant preserved.
  - If power is odd: we replace result with $\text{result} \times \text{base}$ and power with $\text{power} - 1$. Then $(\text{result} \times \text{base}) \times \text{base}^{\text{power}-1} = \text{result} \times \text{base}^{\text{power}}$. Invariant preserved.
- **Termination.** When power $= 0$, the invariant gives $\text{result} \times \text{base}^0 = \text{result} = b^n$. $\square$

### Complexity analysis

At each "odd" step, the exponent decreases by 1 (making it even). At each "even" step, the exponent halves. After at most two consecutive steps (one odd, one even), the exponent has been at least halved. Therefore the total number of steps is $O(\log n)$.

- **Time complexity:** $O(\log n)$.
- **Space complexity:** $O(1)$.

Alternatively, we can obtain a more precise asymptotic estimate directly from the Master Theorem. The recurrence for the recursive view is $T(n) = T(n/2) + O(1)$, the same as binary search, giving $\Theta(\log n)$.

## The Euclidean algorithm for GCD

The greatest common divisor (GCD) of two positive integers $x$ and $y$ is the largest integer that divides both. It is one of the oldest algorithms known, recorded by Euclid around 300 BC.

### The problem

**Input:** Two positive integers $x$ and $y$.

**Output:** $\gcd(x, y)$, the largest positive integer dividing both $x$ and $y$.

### Naive approach

The brute-force approach tries every candidate from the larger number downward:

```typescript
export function gcdSlow(x: number, y: number): number {
  const max = Math.max(x, y);

  for (let i = max; i >= 2; i--) {
    if (x % i === 0 && y % i === 0) {
      return i;
    }
  }
  return 1;
}
```

This checks up to $\max(x, y)$ candidates, so its time complexity is $O(\max(x, y))$.

### The Euclidean algorithm

The Euclidean algorithm is based on a key observation:

$$\gcd(x, y) = \gcd(y, x \bmod y)$$

---

> **The modulo operation.** The expression $x \bmod y$ (pronounced "x mod y") denotes the **remainder** when $x$ is divided by $y$: for instance, $10 \bmod 3 = 1$ because $10 = 3 \times 3 + 1$, and $15 \bmod 5 = 0$ because $5$ divides $15$ evenly. In TypeScript this is written `x % y` — we already used it in the naive GCD function above (`x % i === 0`). Formally, $x \bmod y = x - \lfloor x/y \rfloor \cdot y$, and the result always satisfies $0 \leq (x \bmod y) < y$.

---

This identity holds because the pairs $(x, y)$ and $(y, x \bmod y)$ have exactly the same set of common divisors — any integer that divides both $x$ and $y$ also divides $x \bmod y = x - \lfloor x/y \rfloor \cdot y$ (a linear combination of $x$ and $y$), and conversely. Since the two pairs share the same divisors, they share the same _greatest_ common divisor. Since $x \bmod y < y$, the arguments strictly decrease, and the process terminates when the remainder is 0:

$$\gcd(x, 0) = x.$$

Here is the implementation:

```typescript
export function gcd(x: number, y: number): number {
  while (y > 0) {
    const r = x % y;
    x = y;
    y = r;
  }
  return x;
}
```

### Tracing through an example

Let us compute $\gcd(210, 2618)$. Each row shows $x$ and $y$ at the start of the iteration. After computing $r = x \bmod y$, the algorithm sets $x \leftarrow y$ and $y \leftarrow r$, producing the values shown in the next row:

| Step | $x$ | $y$ | $r = x \bmod y$ |
|------|-----|-----|-----------------|
| 1 | 210 | 2618 | 210 |
| 2 | 2618 | 210 | 98 |
| 3 | 210 | 98 | 14 |
| 4 | 98 | 14 | 0 |
| 5 | 14 | 0 | loop exits, return $x = 14$ |

Result: $\gcd(210, 2618) = 14$.

The naive approach would have tested candidates from 2618 down to 14 — over 2600 iterations. The Euclidean algorithm needed only 5.

### Correctness

We prove correctness by induction on the number of iterations.

**Base case.** When $y = 0$, the loop does not execute, and the algorithm returns $x$. This is correct because $\gcd(x, 0) = x$.

**Inductive step.** Assume the algorithm correctly computes $\gcd(y, r)$ where $r = x \bmod y$. Since $\gcd(x, y) = \gcd(y, x \bmod y)$, the result is correct. $\square$

### Complexity analysis

The key insight is that each iteration at least halves $x$: whenever $y \leq x$, we have $x \bmod y < x / 2$. Since the algorithm swaps $x$ and $y$ at each step, after every two consecutive iterations the values have shrunk by at least a factor of 2. Starting from $\min(x, y)$, we can halve at most $\log_2(\min(x, y))$ times before reaching 0, so the total number of iterations is $O(\log(\min(x, y)))$.

- **Time complexity:** $O(\log(\min(x, y)))$.
- **Space complexity:** $O(1)$.

This is an exponential improvement over the naive $O(\max(x, y))$ approach.

**Why $x \bmod y < x/2$.** There are two cases. **Case 1: $y \leq x/2$.** The remainder is always strictly less than the divisor, so $x \bmod y < y \leq x/2$. **Case 2: $y > x/2$.** Since $y > x/2$ but $y \leq x$, dividing $x$ by $y$ gives a quotient of exactly 1, so $x \bmod y = x - y < x - x/2 = x/2$. In both cases, $x \bmod y < x/2$. $\square$

## The closest pair of points

Our final example is the most challenging one, because it requires all three stages of the divide-and-conquer recipe — a nontrivial divide step, two recursive subproblems, and a combine step whose efficiency depends on a subtle geometric argument. The problem itself is easy to state: given a set of points in the plane, find the two that are closest to each other.

### The problem

**Input:** A set $P$ of $n \geq 2$ points in the plane, where each point is a pair $(x, y)$ of coordinates.

**Output:** A pair of points $p_1, p_2 \in P$ that minimize the Euclidean distance $d(p_1, p_2) = \sqrt{(p_1.x - p_2.x)^2 + (p_1.y - p_2.y)^2}$.

### Brute-force approach

The obvious approach checks all $\binom{n}{2} = \frac{n(n-1)}{2}$ pairs — the number of ways to choose 2 points from $n$, written in the _binomial coefficient_ notation $\binom{n}{k} = \frac{n!}{k!(n-k)!}$:

```typescript
function bruteForce(pts: readonly Point[]): ClosestPairResult {
  let best: ClosestPairResult = {
    p1: pts[0]!,
    p2: pts[1]!,
    distance: distance(pts[0]!, pts[1]!),
  };

  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = distance(pts[i]!, pts[j]!);
      if (d < best.distance) {
        best = { p1: pts[i]!, p2: pts[j]!, distance: d };
      }
    }
  }
  return best;
}
```

This runs in $\Theta(n^2)$ time. Can we do better?

### The divide-and-conquer idea

The strategy is:

1. **Divide.** Sort the points by $x$-coordinate and split them into a left half $L$ and a right half $R$ at the median $x$-value.

2. **Conquer.** Recursively find the closest pair in $L$ and in $R$. Let $\delta_L$ and $\delta_R$ be these distances, and let $\delta = \min(\delta_L, \delta_R)$.

3. **Combine.** The overall closest pair is either entirely in $L$, entirely in $R$, or _split_ — with one point in $L$ and one in $R$. We have already found the first two cases. For the split case, we need to check if any split pair has distance less than $\delta$.

The crux of the algorithm is the combine step: can we check split pairs efficiently?

### The strip optimization

Consider the vertical strip of width $2\delta$ centered on the dividing line (at the median $x$-coordinate). Any split pair with distance less than $\delta$ must have both points in this strip, because otherwise the horizontal distance alone exceeds $\delta$.

Now comes the key geometric insight. Sort the points in the strip by $y$-coordinate. For any point $p$ in the strip, how many other strip points can be within distance $\delta$ of $p$? Since all such points lie in a $2\delta \times \delta$ rectangle, and any two points in the same half (left or right) are at least $\delta$ apart, a packing argument shows that at most **7** other points in the strip need to be checked (see the figure for the proof).

This means the combine step checks each strip point against at most 7 neighbors — a constant number — so it takes $O(n)$ time (after sorting the strip by $y$).

![The strip optimization: the left panel shows the vertical strip of width 2δ centered on the dividing line — only points inside the strip are candidates for a closer split pair. The right panel shows the packing argument: for any point p, all points within distance δ lie in a 2δ × δ rectangle. Each half-square can contain at most 4 points (since points in the same half are at least δ apart), so at most 7 other points need to be checked.](figures/strip-optimization.svg)

### Implementation

We define the `Point` and `ClosestPairResult` types:

```typescript
export interface Point {
  x: number;
  y: number;
}

export interface ClosestPairResult {
  p1: Point;
  p2: Point;
  distance: number;
}
```

The distance function:

```typescript
export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
```

The main function sorts by $x$-coordinate and delegates to the recursive helper:

```typescript
export function closestPair(points: readonly Point[]): ClosestPairResult {
  if (points.length < 2) {
    throw new Error('At least 2 points are required');
  }
  // Tie-break on y for a deterministic order among points with equal x
  const sortedByX = [...points].sort(
    (a, b) => a.x - b.x || a.y - b.y,
  );
  return closestPairRec(sortedByX);
}
```

The recursive function implements the three steps:

```typescript
function closestPairRec(pts: readonly Point[]): ClosestPairResult {
  if (pts.length <= 3) {
    return bruteForce(pts);
  }

  const mid = Math.floor(pts.length / 2);
  const midPoint = pts[mid]!;

  const left = pts.slice(0, mid);
  const right = pts.slice(mid);

  const leftResult = closestPairRec(left);
  const rightResult = closestPairRec(right);

  let best =
    leftResult.distance <= rightResult.distance
      ? leftResult
      : rightResult;
  const delta = best.distance;

  // Build the strip
  const strip: Point[] = [];
  for (const p of pts) {
    if (Math.abs(p.x - midPoint.x) < delta) {
      strip.push(p);
    }
  }

  // Sort strip by y-coordinate
  strip.sort((a, b) => a.y - b.y);

  // Check each point against at most 7 subsequent points
  for (let i = 0; i < strip.length; i++) {
    for (let j = i + 1; j < strip.length; j++) {
      const dy = strip[j]!.y - strip[i]!.y;
      if (dy >= best.distance) {
        break;
      }
      const d = distance(strip[i]!, strip[j]!);
      if (d < best.distance) {
        best = { p1: strip[i]!, p2: strip[j]!, distance: d };
      }
    }
  }

  return best;
}
```

### Tracing through an example

Consider 6 points:

$$P = \{(2,3),\; (12,30),\; (40,50),\; (5,1),\; (12,10),\; (3,4)\}$$

**Step 1: Sort by x.** $(2,3),\; (3,4),\; (5,1),\; (12,10),\; (12,30),\; (40,50)$.

**Step 2: Divide.** Left: $(2,3),\; (3,4),\; (5,1)$. Right: $(12,10),\; (12,30),\; (40,50)$. Dividing line at $x = 12$.

**Step 3: Conquer (left).** With 3 points, brute force checks all 3 pairs:

- $d((2,3),(3,4)) = \sqrt{2} \approx 1.414$
- $d((2,3),(5,1)) = \sqrt{13} \approx 3.606$
- $d((3,4),(5,1)) = \sqrt{13} \approx 3.606$

Closest in left: $\{(2,3),(3,4)\}$ with $\delta_L = \sqrt{2}$.

**Step 3: Conquer (right).** Brute force on $(12,10),\; (12,30),\; (40,50)$:

- $d((12,10),(12,30)) = 20$
- $d((12,10),(40,50)) = \sqrt{2384} \approx 48.83$
- $d((12,30),(40,50)) = \sqrt{1184} \approx 34.41$

Closest in right: $\{(12,10),(12,30)\}$ with $\delta_R = 20$.

**Step 4: Combine.** $\delta = \min(\sqrt{2}, 20) = \sqrt{2} \approx 1.414$. The strip contains all points within $\sqrt{2}$ of $x = 12$ — which includes none of the left points (they are at $x = 2, 3, 5$, all more than $\sqrt{2}$ away from 12) and only $(12,10)$ and $(12,30)$ on the right. The strip pair distance is 20, which does not improve on $\delta$.

**Result:** The closest pair is $\{(2,3), (3,4)\}$ with distance $\sqrt{2}$.

### Correctness

The algorithm correctly finds the closest pair because it considers all three possible cases — closest pair entirely in the left, entirely in the right, or split across the dividing line. The correctness of the strip check follows from the observation that any split pair closer than $\delta$ must lie in the strip (both points are within $\delta$ of the dividing line), and the inner loop's break condition (`dy >= delta`) guarantees that every such pair is examined.

**Base case.** For 2 or 3 points, brute force checks all pairs. Correct.

**Inductive step.** Assume the recursive calls return the correct closest pairs in $L$ and $R$. Then $\delta$ is the correct minimum distance within each half. The strip check examines all candidates for a closer split pair: it iterates over all strip points sorted by $y$, and for each point checks subsequent points until the $y$-distance reaches $\delta$. Any split pair with distance less than $\delta$ must have $y$-distance less than $\delta$ as well, so the break condition cannot skip a valid candidate. $\square$

### Complexity analysis

Let $T(n)$ be the running time. The algorithm:

- Divides the points in half: $O(1)$ (the array is already sorted by $x$).
- Recursively solves two subproblems: $2T(n/2)$.
- Builds and sorts the strip: $O(n \log n)$ in the worst case (the strip could contain all $n$ points).
- Checks strip pairs: $O(n)$. The packing argument shows that for each point, the Euclidean distance is computed at most 7 times (against at most 7 $y$-neighbors). The `dy` guard check that precedes each distance computation executes at most once more per point (the final check that triggers the break), so it adds at most $n$ comparisons total and does not affect the asymptotic bound.

The combine step is dominated by the strip sort at $O(n \log n)$. The recurrence is:

$$T(n) = 2T(n/2) + O(n \log n).$$

This does not fall neatly into Case 2 of the Master Theorem (where $f(n) = \Theta(n^{\log_b a}) = \Theta(n)$). Solving by the recursion tree method or the Akra-Bazzi theorem gives $T(n) = O(n \log^2 n)$.

However, the initial sort by $x$-coordinate costs $O(n \log n)$ and is done once. With a more careful implementation (maintaining a pre-sorted-by-$y$ list using a merge step instead of re-sorting the strip), the combine step can be reduced to $O(n)$, giving the optimal recurrence:

$$T(n) = 2T(n/2) + O(n) \implies T(n) = O(n \log n).$$

Our implementation uses the simpler $O(n \log^2 n)$ approach, which is already a substantial improvement over the $O(n^2)$ brute force. In practice, the strip is typically much smaller than $n$, so the extra logarithmic factor is rarely felt.

- **Time complexity:** $O(n \log^2 n)$ as implemented; $O(n \log n)$ with the merge-based optimization.
- **Space complexity:** $O(n)$ for the sorted arrays and strip.

### Summary of closest pair

| Approach | Time | Space |
|----------|------|-------|
| Brute force | $\Theta(n^2)$ | $O(1)$ |
| Divide-and-conquer (simple) | $O(n \log^2 n)$ | $O(n)$ |
| Divide-and-conquer (optimal) | $O(n \log n)$ | $O(n)$ |

The closest pair problem beautifully illustrates the power of divide and conquer. The brute-force approach must check all $\binom{n}{2} = \Theta(n^2)$ pairs. By splitting the problem, solving each half, and cleverly bounding the combine step, we achieve near-linear time.

## The divide-and-conquer recipe

Looking back at our four algorithms, we can identify a common recipe:

1. **Identify a way to shrink the problem.** Binary search halves the array, exponentiation by squaring halves the exponent, the Euclidean algorithm replaces a number with a remainder, and closest pair splits the point set.

2. **Solve the smaller instance(s).** Sometimes there is one subproblem (binary search, exponentiation, GCD); sometimes there are two (closest pair).

3. **Combine.** Binary search and GCD need no combining — the subproblem answer is the final answer. Exponentiation squares the subresult. Closest pair must check the strip.

4. **Analyze with recurrences.** The running time follows from the recurrence $T(n) = aT(n/b) + f(n)$ and the Master Theorem (or recursion tree method when the Master Theorem does not apply directly).

This recipe is a powerful tool for designing new algorithms. When you face a problem, ask: can I split it into smaller instances of the same problem? If so, the divide-and-conquer approach may yield an efficient solution.

## A note on memoization

There is one more important idea connected to recursion that we should mention here: _memoization_.

Many recursive algorithms solve the same subproblems repeatedly. Consider computing the Fibonacci numbers recursively: $F(n) = F(n-1) + F(n-2)$. A direct recursive implementation calls itself twice at each level, and the subproblems overlap heavily — $F(3)$ is computed many times when computing $F(5)$, $F(4)$ is computed many times when computing $F(6)$, and so on. The resulting recursion tree grows exponentially, even though there are only $O(n)$ _distinct_ subproblems.

Memoization is a technique that eliminates this redundancy: when a recursive function is about to compute a subproblem, it first checks whether the result has already been computed and stored (in a cache, hash map, or array). If so, it returns the cached value immediately; if not, it computes the result, stores it, and then returns it. The name comes from "memo" — a note to oneself — and the effect can be dramatic: for Fibonacci, memoization reduces the time from exponential $O(2^n)$ to linear $O(n)$, because each of the $n$ subproblems is solved at most once.

Memoization is valuable whenever a recursive decomposition produces **overlapping subproblems** — the same smaller instance appears in multiple branches of the recursion. The divide-and-conquer algorithms in this chapter (binary search, fast exponentiation, GCD, closest pair) do _not_ have this property: each recursive call works on a distinct portion of the input, so no subproblem is ever solved twice. But many important recursive algorithms _do_ have overlapping subproblems, and for those, memoization is the difference between a practical algorithm and an unusably slow one.

This idea is at the heart of _dynamic programming_, a powerful algorithm design paradigm that we study in detail in Chapter 16. There we will see memoization in action on problems such as Fibonacci numbers, coin change, longest common subsequence, and the knapsack problem, and we will also explore _tabulation_ — a bottom-up alternative that avoids recursion entirely.

## Looking ahead

in this chapter we developed understanding for

- **Recursion** solves a problem by reducing it to smaller instances, terminating at base cases. Its correctness is proven by induction.
- **Divide-and-conquer** is a specific recursion pattern: divide into subproblems, conquer recursively, combine the results.
- **Binary search** halves the search space at each step, achieving $O(\log n)$ time.
- **Exponentiation by squaring** computes $b^n$ in $O(\log n)$ multiplications instead of $O(n)$.
- **The Euclidean algorithm** computes GCD in $O(\log(\min(x,y)))$ time, an ancient and elegant application of the divide-and-conquer idea.
- **The closest pair of points** demonstrates a nontrivial combine step, achieving $O(n \log n)$ (or $O(n \log^2 n)$ in the simpler variant) versus $O(n^2)$ brute force.
- **Memoization** caches the results of recursive calls to avoid redundant computation when subproblems overlap — an idea we will develop fully in Chapter 16 on dynamic programming.

In the next chapter, we turn to the sorting problem. We begin with three elementary sorting algorithms — bubble sort, selection sort, and insertion sort — all of which run in $O(n^2)$ time. In Chapter 5, we study efficient sorting algorithms — merge sort, quicksort, and heapsort — that use divide-and-conquer to achieve $O(n \log n)$ time.

## Exercises

**Exercise 3.1.** In this chapter we presented both a recursive and an iterative version of binary search. Explain why the recursive version is tail-recursive and how that property enables the transformation to the iterative version. Can every recursive function be transformed this way? Give an example of a recursive function that is _not_ tail-recursive and explain what makes the transformation harder.

**Exercise 3.2.** The _Tower of Hanoi_ puzzle has $n$ disks of decreasing size stacked on one of three pegs. The goal is to move all disks to another peg, moving one disk at a time, never placing a larger disk on a smaller one. Write a recursive function `hanoi(n: number, from: string, to: string, via: string): void` that prints the moves. What is the time complexity? Prove that $2^n - 1$ moves are both necessary and sufficient.

**Exercise 3.3.** Implement a recursive version of the `pow` function (exponentiation by squaring). Analyze its space complexity and compare it with the iterative version.

**Exercise 3.4.** The _maximum subarray problem_ asks for a contiguous subarray of an array of numbers with the largest sum. Design an $O(n \log n)$ divide-and-conquer algorithm for this problem. (Hint: split the array in half; the maximum subarray is entirely in the left half, entirely in the right half, or crossing the midpoint.)

**Exercise 3.5.** Karatsuba's algorithm multiplies two $n$-digit numbers using the recurrence $T(n) = 3T(n/2) + O(n)$. Use the Master Theorem to determine its time complexity. How does this compare with the naive $O(n^2)$ multiplication algorithm?
