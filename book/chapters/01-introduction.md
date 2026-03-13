# Introduction to Algorithms

_In this chapter we discuss what an algorithm is, how algorithms can be expressed, and why studying them matters. We introduce TypeScript as the language used throughout the book, walk through setting up a development environment, and examine our first two algorithms in detail: finding the maximum of an array and the Sieve of Eratosthenes._

## What is an algorithm?

Let us start with a discussion of what an algorithm is. Intuitively the notion is more or less clear: we are talking about some formal way to describe a computational procedure. According to the Merriam-Webster dictionary, an algorithm is "a set of steps that are followed in order to solve a mathematical problem or to complete a computer process".

Still, this is probably not formal enough. How do we choose the next step from the set of steps? Should the procedure stop eventually? What is the result of executing an algorithm? Many formal definitions of what constitutes an algorithm can be given; however, we will use the following working definition.

---

> **Definition 1.1 - Algorithm**
>
> A set of computational steps that specifies a formal computational procedure and has the following properties:
>
> 1. After each step is completed, the next step is unambiguously defined, or the algorithm stops its execution if there are no more steps left.
>
> 2. It is defined on a set of inputs and for each valid input it stops after a finite number of steps.
>
> 3. When it stops it produces a result, which we call its **output**.
>
> 4. Its steps and their order of execution can be formally and unambiguously specified using some language or notation.

---

These four properties capture the essence of what makes a procedure an algorithm. Let us look at each one briefly:

- **Determinism** (property 1): at every point during execution, there is exactly one thing to do next, or the algorithm is done. The next step is always uniquely determined by the current state.
- **Termination** (property 2): for every valid input, the algorithm eventually finishes. It does not run forever.
- **Output** (property 3): when the algorithm finishes, it produces a well-defined result.
- **Formal specification** (property 4): the algorithm can be written down precisely enough that it could, in principle, be carried out mechanically.

## Expressing algorithms

Algorithms can be expressed in a variety of ways. We can even specify the execution steps using ordinary human language. Let us provide a few simple examples. A trivial first example is multiplying two numbers.

---

**Example 1.1: Integer multiplication.**

*Steps:*

1. *Given two integer numbers, multiply them and return the result.*

---

All the properties from Definition 1.1 are satisfied. There is only one step; after this step the algorithm stops; the step is formally specified; all pairs of integer numbers are valid inputs; and a valid result will be produced for each of them. If we denote the algorithm for multiplication as $\text{mult}$, then, for example,

$$\text{mult}(2, 5) = 10$$

and we can specify the algorithm more concisely as

$$\text{mult}(x, y) = x \times y$$

So far, while talking about algorithms, we have encountered no TypeScript or any other programming language notation. This is quite intentional: the notion of an algorithm is mathematical and abstract. Of course we can express any algorithm using TypeScript, but that will be just one of the possible formal representations - in this case, one that is also executable by a computer.

A careful reader might be puzzled by our confidence. How can we assert that _any_ algorithm can be expressed using TypeScript? Can this claim be proven, given our definition? Is TypeScript powerful enough to express every possible algorithm? It turns out that it is. This can be proven rigorously: TypeScript (like most general-purpose programming languages) is _Turing complete_, meaning it can simulate any computation that a Turing machine can perform. Since Turing machines capture the full power of algorithmic computation, any algorithm can be expressed in TypeScript.

Let us look again at Definition 1.1. It states that we should be able to specify the computational procedure formally. It is now clear why we require this property: given a formal language such as TypeScript, we can specify the algorithm of interest and execute the specification on a computer. For the multiplication algorithm we can write:

```typescript
function mult(x: number, y: number): number {
  return x * y;
}
```

The TypeScript specification is more concise and unambiguous than the natural-language version. Throughout the book we will primarily use TypeScript, but keep in mind that the algorithms we discuss can be expressed in other formal notations as well. Many Computer Science textbooks go as far as inventing their own pseudocode to avoid being tied to a particular programming language. We will not go that far and will happily use TypeScript - hence the name of the book, _Algorithms with TypeScript_.

## Computational procedures that are not algorithms

Can we write a computational procedure that is _not_ an algorithm? Yes. Consider the following TypeScript function:

```typescript
function getMaximumNumber(): number {
  let x = 0;
  while (true) {
    x++;
  }
  return x;
}
```

This function never terminates: the `while (true)` loop runs forever, so the `return` statement is never reached. Property 2 of Definition 1.1 is violated - the procedure does not stop after a finite number of steps. This is therefore not an algorithm.

Another example of a non-algorithm is a division function defined on all pairs of numbers:

```typescript
function divide(x: number, y: number): number {
  if (y === 0) {
    throw new Error('Cannot divide by zero');
  }
  return x / y;
}
```

This is not an algorithm according to our definition because the result is not defined for all inputs - when $y = 0$ the procedure throws an error instead of producing an output (property 3 is violated). However, it is easy to fix this:

```typescript
function divide(x: number, y: number): number {
  return y === 0 ? Infinity : x / y;
}
```

In fact, in JavaScript (and TypeScript), dividing by zero returns `Infinity` by default, so we could simply write:

```typescript
function divide(x: number, y: number): number {
  return x / y;
}
```

This _is_ an algorithm - but only because of JavaScript's particular treatment of division by zero.

From these examples we see that not every computational procedure that can be formally expressed is an algorithm. The properties in Definition 1.1 are genuine constraints.

## Why study algorithms?

Before we proceed to our first nontrivial examples, let's briefly discuss why studying algorithms is worthwhile.

**Correctness.** Real-world software often needs to solve well-defined computational problems: sort a list, find the shortest route, compress data, search a database. An algorithm gives us a _proven_ solution to such a problem. Understanding the classic algorithms means you can recognize when a problem you face has already been solved - and solved well.

**Efficiency.** Two algorithms that solve the same problem can differ enormously in how long they take or how much memory they use. Later in this book we will see sorting algorithms that take time proportional to $n^2$ (where $n$ is the number of elements) and others that take time proportional to $n \log n$. For a million elements, that is the difference between a trillion operations and roughly twenty million - a factor of 50,000. Choosing the right algorithm can be the difference between a program that finishes in seconds and one that takes hours.

**Foundation for deeper topics.** Algorithms and data structures form the backbone of Computer Science. Topics like databases, compilers, operating systems, machine learning, and cryptography all build on the ideas we will develop in this book.

**Problem-solving skills.** Even when you are not directly implementing a classic algorithm, the techniques you learn - divide and conquer, dynamic programming, greedy strategies, graph modeling - give you a powerful toolkit for approaching new problems.

## Introduction to TypeScript

Throughout this book we use TypeScript as our implementation language. TypeScript is a statically typed superset of JavaScript: every valid JavaScript program is also a valid TypeScript program, but TypeScript adds optional type annotations that are checked at compile time.

We chose TypeScript for several reasons:

- **Readability.** TypeScript syntax is familiar to anyone who has worked with JavaScript, Java, C#, or similar C-family languages. Type annotations make function signatures self-documenting.
- **Type safety.** Generic types let us write algorithms that work with any element type while the compiler catches type errors before we run the code.
- **Ubiquity.** TypeScript runs anywhere JavaScript runs: in the browser, on the server (Node.js), and in countless tools. There is no special runtime to install beyond Node.js.
- **Modern features.** Destructuring, iterators, generator functions, and first-class functions make algorithm implementations concise and expressive.

Here is a small example that illustrates some features we will use frequently:

```typescript
// A generic function that returns the first element of a non-empty array
function first<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Array must not be empty');
  }
  return arr[0];
}

const name: string = first(['Alice', 'Bob', 'Charlie']); // 'Alice'
const value: number = first([42, 17, 8]);                 // 42
```

The `<T>` syntax introduces a _type parameter_: the function works with arrays of any element type, and the compiler ensures that the return type matches the array's element type. We will use generics extensively when implementing data structures and sorting algorithms.

## Setting up the development environment

To follow along with the code in this book, you will need:

1. **Node.js** (version 18 or later): download from [https://nodejs.org](https://nodejs.org) or use a version manager such as `nvm`.
2. **A text editor** with TypeScript support. Visual Studio Code works particularly well, but any modern editor will do.

Once Node.js is installed, clone the book's repository and install the dependencies:

```bash
git clone https://github.com/amoilanen/Algorithms-with-TypeScript.git
cd Algorithms-with-TypeScript
npm install
```

The project uses the following tools, all installed automatically by `npm install`:

| Tool | Purpose |
|------|---------|
| **TypeScript** | Static type checking and compilation |
| **Vitest** | Fast test runner with native TypeScript support |
| **ESLint** | Code quality and consistency checking |
| **Prettier** | Automatic code formatting |

Useful commands:

```bash
npm test            # Run all tests
npm run test:watch  # Re-run tests on file changes
npm run typecheck   # Check types without emitting files
npm run lint        # Run the linter
```

Every algorithm in this book has a corresponding test suite. We encourage you to run the tests, read them, and experiment by modifying the implementations.

## Finding the maximum element

Now that we are finished with definitions and setup, let's look at a few more interesting algorithms. The first problem is simple: given an array of numbers, find the largest one.

### The problem

**Input:** An array $A$ of $n$ numbers $A[0], A[1], \ldots, A[n-1]$.

**Output:** The maximum value in $A$, or `undefined` if $A$ is empty.

### A linear scan

The most natural approach is to scan through the array from left to right, keeping track of the largest value seen so far:

1. Set $\text{result}$ to `undefined`.
2. For each element $e$ in $A$:
   - If $\text{result}$ is `undefined` or $e > \text{result}$, set $\text{result} = e$.
3. Return $\text{result}$.

Here is the TypeScript implementation:

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

Let us trace through an example. Suppose $A = [2, 1, 4, 2, 3]$:

| Step | `element` | `result` before | Comparison | `result` after |
|------|-----------|-----------------|------------|----------------|
| 1 | 2 | `undefined` | `undefined` → update | 2 |
| 2 | 1 | 2 | $1 > 2$? No | 2 |
| 3 | 4 | 2 | $4 > 2$? Yes | 4 |
| 4 | 2 | 4 | $2 > 4$? No | 4 |
| 5 | 3 | 4 | $3 > 4$? No | 4 |

The function returns 4, which is indeed the maximum.

### Correctness

We can argue correctness using a _loop invariant_: at the start of each iteration, `result` holds the maximum of all elements examined so far (or `undefined` if none have been examined).

- **Initialization:** Before the first iteration, no elements have been examined and `result` is `undefined`. The invariant holds trivially.
- **Maintenance:** Suppose the invariant holds at the start of an iteration. If the current `element` is greater than `result` (or `result` is `undefined`), we update `result` to `element`. Otherwise `result` already holds the maximum. In either case, after the iteration `result` is the maximum of all elements seen so far.
- **Termination:** The loop ends when all elements have been examined. By the invariant, `result` holds the maximum of the entire array.

### Complexity analysis

The function performs one comparison per element and visits each element exactly once.

- **Time complexity:** $O(n)$, where $n$ is the length of the array.
- **Space complexity:** $O(1)$ - we use only a single variable `result` beyond the input.

Can we do better than $O(n)$? No. Any algorithm that finds the maximum must examine every element at least once: if it skipped an element, that element could have been the maximum. Therefore $O(n)$ is optimal for this problem.

## Finding prime numbers: the Sieve of Eratosthenes

Our second algorithm is more substantial and has a rich history dating back over two thousand years. The goal is to find all prime numbers up to a given number $n$.

### The problem

**Input:** A positive integer $n$.

**Output:** A list of all prime numbers $p$ such that $2 \leq p \leq n$.

Recall that a prime number is an integer greater than 1 whose only positive divisors are 1 and itself. The first few primes are 2, 3, 5, 7, 11, 13, 17, 19, 23, ...

### A naive approach: trial division

The most straightforward method is to test each number from 2 to $n$ for primality by checking whether it has any divisors other than 1 and itself:

```typescript
export function primesUpToSlow(number: number): number[] {
  const primes: number[] = [];

  for (let current = 2; current <= number; current++) {
    if (isPrime(current)) {
      primes.push(current);
    }
  }
  return primes;
}

function isPrime(number: number): boolean {
  for (let i = 2; i < number; i++) {
    if (number % i === 0) {
      return false;
    }
  }
  return true;
}
```

For each candidate number $k$, the `isPrime` function tests all potential divisors from 2 up to $k - 1$. If any of them divides $k$ evenly, $k$ is not prime.

This works, but it is slow. For each of the $n - 1$ candidates, we may test up to $k - 2$ divisors. In the worst case (when $k$ is prime), the `isPrime` check does $O(k)$ work. Summing over all candidates gives roughly $O(n^2)$ time. (We could improve `isPrime` by only testing up to $\sqrt{k}$, which brings the total to approximately $O(n\sqrt{n})$, but there is a fundamentally better approach.)

### The Sieve of Eratosthenes

The Sieve of Eratosthenes, attributed to the ancient Greek mathematician Eratosthenes of Cyrene (c. 276--194 BC), takes a different approach. Instead of testing each number individually, it starts by assuming all numbers are prime and then systematically eliminates the ones that are not:

1. Create a boolean array `isPrime[2..n]`, initially all `true`.
2. For each number $p$ starting from 2:
   - If `isPrime[p]` is `true`, then $p$ is prime. Mark all multiples of $p$ (starting from $2p$) as `false`.
3. Collect all indices that remain `true`.

Here is the TypeScript implementation:

```typescript
export function primesUpTo(number: number): number[] {
  const isPrimeNumber: boolean[] = [];
  const primes: number[] = [];
  let current = 2;

  for (let i = 2; i <= number; i++) {
    isPrimeNumber[i] = true;
  }

  while (current <= number) {
    if (isPrimeNumber[current]) {
      primes.push(current);
      for (let j = 2 * current; j <= number; j += current) {
        isPrimeNumber[j] = false;
      }
    }
    current++;
  }
  return primes;
}
```

### Tracing through an example

Let us trace the sieve for $n = 20$. We start with all numbers from 2 to 20 marked as potentially prime:

```
 2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
 T  T  T  T  T  T  T  T  T  T  T  T  T  T  T  T  T  T  T
```

**$p = 2$:** 2 is prime. Cross out multiples of 2: 4, 6, 8, 10, 12, 14, 16, 18, 20.

```
 2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
 T  T  F  T  F  T  F  T  F  T  F  T  F  T  F  T  F  T  F
```

**$p = 3$:** 3 is still marked `true`, so it is prime. Cross out multiples of 3: 6, 9, 12, 15, 18 (some are already crossed out).

```
 2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
 T  T  F  T  F  T  F  F  F  T  F  T  F  F  F  T  F  T  F
```

**$p = 4$:** 4 is marked `false` (not prime). Skip it.

**$p = 5$:** 5 is marked `true`, so it is prime. Cross out multiples of 5: 10, 15, 20 (all already crossed out). The array is unchanged.

**$p = 6$:** 6 is marked `false` (not prime). Skip it.

**$p = 7$:** 7 is marked `true`, so it is prime. Its first multiple is 14, which is already crossed out. The array is unchanged.

**$p = 8, 9, 10$:** All marked `false`. Skip.

**$p = 11$:** 11 is marked `true`, so it is prime. Its first multiple within range would be 22, which exceeds $n = 20$. No crossings.

**$p = 12$:** Marked `false`. Skip.

**$p = 13$:** 13 is marked `true`, so it is prime. Its first multiple within range would be 26, which exceeds $n = 20$. No crossings.

**$p = 14, 15, 16$:** All marked `false`. Skip.

**$p = 17$:** 17 is marked `true`, so it is prime. Its first multiple within range would be 34, which exceeds $n = 20$. No crossings.

**$p = 18$:** Marked `false`. Skip.

**$p = 19$:** 19 is marked `true`, so it is prime. Its first multiple within range would be 38, which exceeds $n = 20$. No crossings.

**$p = 20$:** Marked `false`. Skip.

The final state of the array is:

```
 2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
 T  T  F  T  F  T  F  F  F  T  F  T  F  F  F  T  F  T  F
```

The numbers that remain `true` are:

$$2, 3, 5, 7, 11, 13, 17, 19$$

These are exactly the primes up to 20.

### Why does the sieve work?

The key insight is: if a number $k$ is composite (not prime), then $k = a \times b$ for some integers $a, b$ with $2 \leq a \leq b < k$. The smallest such factor $a$ is itself prime (otherwise it could be factored further). When the sieve processes $p = a$, it marks $k = a \times b$ as composite. Therefore, every composite number gets marked `false` by the time the sieve finishes.

Conversely, if a number $k$ is prime, no smaller prime $p$ divides it, so $k$ is never marked `false`. The sieve correctly identifies exactly the prime numbers.

### Complexity analysis

How much work does the sieve do? For each prime $p \leq n$, it crosses out at most $n/p$ multiples. The total work is proportional to:

$$\sum_{p \text{ prime}, p \leq n} \frac{n}{p} = n \sum_{p \text{ prime}, p \leq n} \frac{1}{p}$$

A classical result in number theory states that the sum of the reciprocals of the primes up to $n$ grows as $\ln(\ln(n))$. Therefore:

- **Time complexity:** $O(n \ln(\ln n))$.
- **Space complexity:** $O(n)$ for the boolean array.

Note: since $\ln n$ and $\log_2 n$ differ only by a constant factor ($\log_2 n = \ln n / \ln 2$), it does not matter which logarithm base we use inside big-$O$ notation. You may see this complexity written equivalently as $O(n \log \log n)$ in other sources.

Compare this with the naive trial-division approach at $O(n\sqrt{n})$. For $n = 1{,}000{,}000$:

| Algorithm | Approximate operations |
|-----------|----------------------|
| Trial division | $10^6 \times 10^3 = 10^9$ |
| Sieve of Eratosthenes | $10^6 \times \ln\ln(10^6) \approx 10^6 \times 2.9 \approx 3 \times 10^6$ |

The sieve is roughly 300 times faster - an enormous difference for large inputs.

### Comparing the two approaches

This is our first encounter with a recurring theme in this book: different algorithms for the same problem can have vastly different performance characteristics. The naive approach is simple and easy to understand, but the sieve achieves dramatically better performance by exploiting the structure of the problem.

Throughout the book, we will develop the tools to analyze these differences precisely. In Chapter 2 we formalize the notion of time complexity using asymptotic notation ($O$, $\Omega$, $\Theta$), which gives us a language for comparing algorithms independently of the specific hardware they run on.

## Looking ahead

In this chapter we defined what an algorithm is, introduced TypeScript as our implementation language, and studied two concrete algorithms. We saw that:

- An algorithm is a well-defined computational procedure that terminates on all valid inputs and produces a result.
- Algorithms can be expressed in many notations; we use TypeScript because it combines readability, type safety, and executability.
- Even for simple problems, the choice of algorithm can dramatically affect performance: the Sieve of Eratosthenes outperforms trial division by orders of magnitude.

In the next chapter, we develop the mathematical framework - asymptotic notation and complexity analysis - that lets us reason precisely about algorithm efficiency. These tools will be essential throughout the rest of the book.

## Exercises

**Exercise 1.1.** Write a function `min(elements: number[]): number | undefined` that returns the minimum element of an array, analogous to the `max` function. What is its time complexity?

**Exercise 1.2.** The `isPrime` function in the trial-division approach tests divisors from 2 all the way up to $k - 1$. Explain why it suffices to test only up to $\lfloor\sqrt{k}\rfloor$. Modify the function accordingly and analyze the improved time complexity for finding all primes up to $n$.

**Exercise 1.3.** The Sieve of Eratosthenes as presented starts crossing out multiples of $p$ from $2p$. Show that it is sufficient to start from $p^2$ instead. Why does this not change the asymptotic time complexity?

**Exercise 1.4.** The _proper divisors_ of a positive integer $n$ are all positive divisors of $n$ other than $n$ itself. For example, the proper divisors of 12 are 1, 2, 3, 4, and 6. A _perfect number_ is a positive integer that equals the sum of its proper divisors (e.g., $6 = 1 + 2 + 3$). Write a function `isPerfect(n: number): boolean` and use it to find all perfect numbers up to 10,000. What is the time complexity of your approach?

**Exercise 1.5.** Consider the following function:

```typescript
function mystery(n: number): number {
  if (n <= 1) return n;
  return mystery(n - 1) + mystery(n - 2);
}
```

Does this function define an algorithm according to Definition 1.1? What does it compute? Try calling it with $n = 5$, $n = 10$, and $n = 40$. What do you observe about the running time? (We will revisit this function in Chapter 16 on dynamic programming.)
