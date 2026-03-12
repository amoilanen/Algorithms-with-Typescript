# Recursion and Divide-and-Conquer

_Recursion is one of the most powerful techniques in algorithm design: a function solving a problem by solving smaller instances of itself. In this chapter we study recursion from the ground up, connect it to mathematical induction, and then develop the divide-and-conquer strategy — splitting a problem into independent subproblems, solving each recursively, and combining the results. We illustrate these ideas with four algorithms: binary search, fast exponentiation, the Euclidean algorithm for greatest common divisors, and the closest pair of points._

## Recursion

A function is _recursive_ if it calls itself. This is not mere circularity — each call works on a smaller instance of the problem, and eventually the instances become small enough to solve directly. Every recursive function has two essential ingredients:

1. **Base case.** One or more input sizes for which the answer is immediate, without further recursion.
2. **Recursive case.** For larger inputs, the function reduces the problem to one or more smaller instances and combines the results.

Consider a simple example: computing the factorial $n! = 1 \cdot 2 \cdots n$.

```typescript
function factorial(n: number): number {
  if (n <= 1) return 1;   // base case
  return n * factorial(n - 1); // recursive case
}
```

The base case is $n \leq 1$, where we return 1. The recursive case multiplies $n$ by the factorial of $n - 1$. Each recursive call reduces the argument by 1, so the chain of calls eventually reaches the base case:

$$\text{factorial}(4) = 4 \cdot \text{factorial}(3) = 4 \cdot 3 \cdot \text{factorial}(2) = 4 \cdot 3 \cdot 2 \cdot \text{factorial}(1) = 4 \cdot 3 \cdot 2 \cdot 1 = 24.$$

### The call stack

When a function calls itself, the runtime maintains a _call stack_ — a stack of _frames_, each recording the local variables and return address for one invocation. For `factorial(4)`, the stack grows to depth 4 before the base case is reached:

```
factorial(4)  — waiting for factorial(3)
  factorial(3)  — waiting for factorial(2)
    factorial(2)  — waiting for factorial(1)
      factorial(1)  — returns 1
    factorial(2)  — returns 2 × 1 = 2
  factorial(3)  — returns 3 × 2 = 6
factorial(4)  — returns 4 × 6 = 24
```

Each frame occupies memory, so a recursion of depth $d$ uses $O(d)$ stack space. For `factorial(n)`, the depth is $n$, so the space complexity is $O(n)$. This overhead can be a concern for very deep recursions, but for many problems the clarity and elegance of the recursive solution outweigh the cost.

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

There is a deep connection between recursion and mathematical induction. Induction proves that a property holds for all natural numbers; recursion computes a value for all valid inputs. The structures are parallel:

| Induction | Recursion |
|-----------|-----------|
| Base case: prove $P(0)$ (or $P(1)$) | Base case: return a value directly |
| Inductive step: assuming $P(k)$, prove $P(k+1)$ | Recursive case: assuming the recursive call returns the correct result, compute the current result |

This parallel is not a coincidence — it is the foundation for proving recursive algorithms correct. To prove that a recursive function computes the right answer, we use _strong induction_ (also called _complete induction_): assume the function works correctly for all inputs smaller than $n$, and show it works correctly for input $n$.

---

> **Definition 3.1 --- Correctness of a recursive algorithm**
>
> A recursive algorithm is **correct** if:
>
> 1. It produces the correct answer on all base cases.
> 2. If every recursive call on a strictly smaller input returns the correct answer, then the current call also returns the correct answer.

---

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

where $a$ is the number of subproblems, $n/b$ is their size, and $f(n)$ is the cost of dividing and combining. As we saw in Chapter 2, the Master Theorem often gives us the solution directly.

## Binary search

Our first divide-and-conquer algorithm is one of the most important: binary search. It finds the position of a target value in a _sorted_ array by repeatedly halving the search space.

### The problem

**Input:** A sorted array $A[0..n-1]$ of numbers and a target value $x$.

**Output:** An index $i$ such that $A[i] = x$, or $-1$ if $x$ is not in $A$.

### The algorithm

The idea is simple: compare $x$ with the middle element of the array.

- If they match, return the index.
- If $x$ is smaller, recurse on the left half.
- If $x$ is larger, recurse on the right half.

Each step eliminates half the remaining elements.

Here is our iterative implementation (an iterative approach avoids the overhead of recursive calls and is standard for binary search):

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

Although this implementation is iterative, it mirrors the recursive divide-and-conquer structure exactly: the variables `low` and `high` define the current subproblem, and each iteration halves the range.

### Tracing through an example

Let $A = [1, 3, 5, 7, 9, 11, 13]$ and $x = 9$.

| Step | `low` | `high` | `mid` | `arr[mid]` | Action |
|------|-------|--------|-------|------------|--------|
| 1 | 0 | 6 | 3 | 7 | $9 > 7$: search right half |
| 2 | 4 | 6 | 5 | 11 | $9 < 11$: search left half |
| 3 | 4 | 4 | 4 | 9 | $9 = 9$: found, return 4 |

After only 3 comparisons, we have found the element in a 7-element array. A linear scan might have taken up to 7 comparisons.

### Correctness

We prove correctness using a loop invariant.

**Invariant:** If $x$ is in $A$, then $x$ is in $A[\text{low}..\text{high}]$.

- **Initialization:** Before the loop, $\text{low} = 0$ and $\text{high} = n - 1$, so the invariant holds trivially.
- **Maintenance:** If $A[\text{mid}] < x$, then $x$ cannot be in $A[\text{low}..\text{mid}]$ (since $A$ is sorted), so setting $\text{low} = \text{mid} + 1$ preserves the invariant. The case $A[\text{mid}] > x$ is symmetric.
- **Termination:** The loop terminates either when $x$ is found or when $\text{low} > \text{high}$, meaning the search range is empty. In the latter case, $x$ is not in $A$, and returning $-1$ is correct.

### Complexity analysis

Each iteration halves the search range. Starting from $n$ elements, after $k$ iterations we have at most $n / 2^k$ elements. The loop terminates when $n / 2^k < 1$, i.e., after $k = \lceil \log_2 n \rceil$ iterations.

- **Time complexity:** $O(\log n)$.
- **Space complexity:** $O(1)$ (the iterative version uses only a few variables).

Using the Master Theorem on the recursive form: $T(n) = T(n/2) + O(1)$. Here $a = 1$, $b = 2$, $n^{\log_b a} = n^0 = 1$. Since $f(n) = O(1) = \Theta(n^{\log_b a})$, Case 2 gives $T(n) = \Theta(\log n)$.

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

This dramatic improvement — from linear to logarithmic — is the hallmark of the divide-and-conquer approach. The key insight is that each comparison does not eliminate a single element but _half the remaining elements_.

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

Here is the iterative implementation:

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

The recurrence for the recursive view is $T(n) = T(n/2) + O(1)$, the same as binary search, giving $\Theta(\log n)$ by the Master Theorem.

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

This holds because any common divisor of $x$ and $y$ also divides $x \bmod y$ (since $x \bmod y = x - \lfloor x/y \rfloor \cdot y$), and conversely. Since $x \bmod y < y$, the arguments strictly decrease, and the process terminates when the remainder is 0:

$$\gcd(x, 0) = x.$$

Here is the implementation:

```typescript
export function gcd(x: number, y: number): number {
  let r = x % y;

  while (r > 0) {
    x = y;
    y = r;
    r = x % y;
  }
  return y;
}
```

### Tracing through an example

Let us compute $\gcd(210, 2618)$:

| Step | $x$ | $y$ | $r = x \bmod y$ |
|------|-----|-----|-----------------|
| 1 | 210 | 2618 | 210 |
| 2 | 2618 | 210 | 98 |
| 3 | 210 | 98 | 14 |
| 4 | 98 | 14 | 0 |

Result: $\gcd(210, 2618) = 14$.

The naive approach would have tested candidates from 2618 down to 14 — over 2600 iterations. The Euclidean algorithm needed only 4.

### Correctness

We prove correctness by induction on the number of iterations.

**Base case.** If $x \bmod y = 0$, then $y$ divides $x$, so $\gcd(x, y) = y$. The algorithm returns $y$. Correct.

**Inductive step.** Assume the algorithm correctly computes $\gcd(y, r)$ where $r = x \bmod y$. Since $\gcd(x, y) = \gcd(y, x \bmod y)$, the result is correct. $\square$

### Complexity analysis

The key insight is that after two consecutive iterations, the value of $y$ is reduced by at least half. Formally: if $r = x \bmod y$, then $r < y$, and one can show that $x \bmod y < x / 2$ whenever $y \leq x$. By the Fibonacci-like worst case analysis (due to Gabriel Lamé, 1844):

- **Time complexity:** $O(\log(\min(x, y)))$.
- **Space complexity:** $O(1)$.

This is an exponential improvement over the naive $O(\max(x, y))$ approach.

## The closest pair of points

Our most substantial example brings together all the divide-and-conquer ideas. Given a set of points in the plane, we want to find two points that are closest to each other.

### The problem

**Input:** A set $P$ of $n \geq 2$ points in the plane, where each point is a pair $(x, y)$ of coordinates.

**Output:** A pair of points $p_1, p_2 \in P$ that minimize the Euclidean distance $d(p_1, p_2) = \sqrt{(p_1.x - p_2.x)^2 + (p_1.y - p_2.y)^2}$.

### Brute-force approach

The obvious approach checks all $\binom{n}{2}$ pairs:

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

Now comes the key geometric insight. Sort the points in the strip by $y$-coordinate. For any point $p$ in the strip, how many other strip points can be within distance $\delta$ of $p$? Since all such points lie in a $2\delta \times \delta$ rectangle, and any two points in the same half (left or right) are at least $\delta$ apart, a packing argument shows that at most **7** other points in the strip need to be checked.

This means the combine step checks each strip point against at most 7 neighbors — a constant number — so it takes $O(n)$ time (after sorting the strip by $y$).

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

The algorithm correctly finds the closest pair because it considers all three possible cases — closest pair entirely in the left, entirely in the right, or split across the dividing line. The correctness of the strip check follows from the geometric packing argument: any split pair closer than $\delta$ must lie in the strip and must appear within 7 positions of each other when sorted by $y$.

**Base case.** For 2 or 3 points, brute force checks all pairs. Correct.

**Inductive step.** Assume the recursive calls return the correct closest pairs in $L$ and $R$. Then $\delta$ is the correct minimum distance within each half. The strip check examines all candidates for a closer split pair. Since the inner loop breaks when the $y$-distance exceeds $\delta$, and any valid split pair must appear within 7 $y$-neighbors, no valid candidate is missed. $\square$

### Complexity analysis

Let $T(n)$ be the running time. The algorithm:

- Divides the points in half: $O(1)$ (the array is already sorted by $x$).
- Recursively solves two subproblems: $2T(n/2)$.
- Builds and sorts the strip: $O(n \log n)$ in the worst case (the strip could contain all $n$ points).
- Checks strip pairs: $O(n)$ (each point is compared with at most 7 neighbors).

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

## Looking ahead

In this chapter we developed recursion and the divide-and-conquer paradigm:

- **Recursion** solves a problem by reducing it to smaller instances, terminating at base cases. Its correctness is proven by induction.
- **Divide-and-conquer** is a specific recursion pattern: divide into subproblems, conquer recursively, combine the results.
- **Binary search** halves the search space at each step, achieving $O(\log n)$ time.
- **Exponentiation by squaring** computes $b^n$ in $O(\log n)$ multiplications instead of $O(n)$.
- **The Euclidean algorithm** computes GCD in $O(\log(\min(x,y)))$ time, an ancient and elegant application of the divide-and-conquer idea.
- **The closest pair of points** demonstrates a nontrivial combine step, achieving $O(n \log n)$ (or $O(n \log^2 n)$ in the simpler variant) versus $O(n^2)$ brute force.

In the next chapter, we turn to the sorting problem. We begin with three elementary sorting algorithms — bubble sort, selection sort, and insertion sort — all of which run in $O(n^2)$ time. In Chapter 5, we study efficient sorting algorithms — merge sort, quicksort, and heapsort — that use divide-and-conquer to achieve $O(n \log n)$ time.

## Exercises

**Exercise 3.1.** Write a recursive version of binary search. What is its space complexity? Compare it with the iterative version presented in this chapter.

**Exercise 3.2.** The _Tower of Hanoi_ puzzle has $n$ disks of decreasing size stacked on one of three pegs. The goal is to move all disks to another peg, moving one disk at a time, never placing a larger disk on a smaller one. Write a recursive function `hanoi(n: number, from: string, to: string, via: string): void` that prints the moves. What is the time complexity? Prove that $2^n - 1$ moves are both necessary and sufficient.

**Exercise 3.3.** Implement a recursive version of the `pow` function (exponentiation by squaring). Analyze its space complexity and compare it with the iterative version.

**Exercise 3.4.** The _maximum subarray problem_ asks for a contiguous subarray of an array of numbers with the largest sum. Design an $O(n \log n)$ divide-and-conquer algorithm for this problem. (Hint: split the array in half; the maximum subarray is entirely in the left half, entirely in the right half, or crossing the midpoint.)

**Exercise 3.5.** Karatsuba's algorithm multiplies two $n$-digit numbers using the recurrence $T(n) = 3T(n/2) + O(n)$. Use the Master Theorem to determine its time complexity. How does this compare with the naive $O(n^2)$ multiplication algorithm?
