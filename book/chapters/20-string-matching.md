# String Matching

_Given a text $T$ of length $n$ and a pattern $P$ of length $m$, find all positions in $T$ where $P$ occurs. This deceptively simple problem — searching for a word in a document, a DNA motif in a genome, a keyword in a log file — is one of the most fundamental in computer science. In this chapter we develop three algorithms of increasing sophistication: the naive brute-force approach, the Rabin-Karp algorithm based on rolling hashes, and the Knuth-Morris-Pratt (KMP) algorithm based on the failure function. Each illustrates a different strategy for avoiding redundant comparisons._

## The pattern matching problem

**Input.** A text string $T[0 \ldots n-1]$ and a pattern string $P[0 \ldots m-1]$, where $m \le n$.

**Output.** All indices $i$ such that $T[i \ldots i+m-1] = P$, i.e., all positions where the pattern occurs in the text.

We call each such $i$ a **valid shift**. A shift $i$ is **invalid** if $T[i \ldots i+m-1] \ne P$.

There are $n - m + 1$ possible shifts to check ($i = 0, 1, \ldots, n - m$). The challenge is to avoid checking each one character by character from scratch. The three algorithms in this chapter differ in how they eliminate invalid shifts:

| Algorithm | Strategy | Time (worst) | Time (expected) | Space |
|-----------|----------|:------------:|:---------------:|:-----:|
| Naive | Check every shift from scratch | $O(nm)$ | $O(nm)$ | $O(1)$ |
| Rabin-Karp | Use hashing to filter shifts | $O(nm)$ | $O(n + m)$ | $O(1)$ |
| KMP | Use a failure function to skip shifts | $O(n + m)$ | $O(n + m)$ | $O(m)$ |

## Naive string matching

The simplest approach: for each possible starting position $i$ in the text, compare the pattern against $T[i \ldots i+m-1]$ character by character. If all $m$ characters match, record $i$ as a valid shift. If any character fails to match, move to position $i+1$ and start over.

### Algorithm

```
NAIVE-MATCH(T, P):
    n ← length(T)
    m ← length(P)
    for i ← 0 to n − m:
        j ← 0
        while j < m and T[i + j] = P[j]:
            j ← j + 1
        if j = m:
            report match at position i
```

### Trace through an example

Consider $T =$ `aabaabaac` and $P =$ `aabac`. We have $n = 9$ and $m = 5$.

| Shift $i$ | Comparison | Result |
|:---------:|-----------|--------|
| 0 | `aabaa` vs `aabac` | Mismatch at $j=4$ (`a` $\ne$ `c`) |
| 1 | `abaab` vs `aabac` | Mismatch at $j=1$ (`b` $\ne$ `a`) |
| 2 | `baaba` vs `aabac` | Mismatch at $j=0$ (`b` $\ne$ `a`) |
| 3 | `aabaa` vs `aabac` | Mismatch at $j=4$ (`a` $\ne$ `c`) |
| 4 | `abaac` vs `aabac` | Mismatch at $j=1$ (`b` $\ne$ `a`) |

No match is found. Notice that at shift 0 we successfully matched four characters before failing, yet at shift 1 we start the comparison entirely from scratch — discarding all information gained from the previous attempt. The algorithms that follow exploit this wasted information.

### Implementation

```typescript
export function naiveMatch(text: string, pattern: string): number[] {
  const n = text.length;
  const m = pattern.length;
  const result: number[] = [];

  if (m === 0) return result;
  if (m > n) return result;

  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    while (j < m && text[i + j] === pattern[j]) {
      j++;
    }
    if (j === m) {
      result.push(i);
    }
  }

  return result;
}
```

### Complexity analysis

The outer loop runs $n - m + 1$ times. In the worst case, the inner loop performs $m$ comparisons before discovering a mismatch (e.g., $T =$ `aaa...a` and $P =$ `aaa...ab`). The total number of character comparisons is therefore $O((n - m + 1) \cdot m) = O(nm)$.

**Best case.** If the first character of the pattern rarely appears in the text, most shifts are eliminated after a single comparison, giving $O(n)$ in practice.

**Average case.** For random text over an alphabet of size $|\Sigma|$, the expected number of comparisons per shift is $\frac{1}{1 - 1/|\Sigma|} \approx 1 + \frac{1}{|\Sigma|}$ (a geometric series), so the expected total is $O(n)$. But for small alphabets (e.g., binary) or structured text (e.g., DNA), the worst case is more likely.

**Space.** $O(1)$ beyond the output array. No preprocessing is needed.

## Rabin-Karp string matching

The Rabin-Karp algorithm avoids re-examining every character at every shift by using **hashing**. The idea: compute a hash of the pattern and a hash of each text window of length $m$. If the hashes differ, the window cannot match and we skip it without comparing characters. If the hashes match, we verify character by character to eliminate false positives (hash collisions).

The key insight is that the hash of the next window $T[i+1 \ldots i+m]$ can be computed from the hash of the current window $T[i \ldots i+m-1]$ in $O(1)$ time using a **rolling hash**. This makes the overall hash computation $O(n)$ rather than $O(nm)$.

### Rolling hash

We treat each string of length $m$ as a number in base $d$ (where $d$ is the alphabet size) and take the result modulo a prime $q$:

$$
h(T[i \ldots i+m-1]) = \left( \sum_{j=0}^{m-1} T[i+j] \cdot d^{m-1-j} \right) \bmod q
$$

When we slide the window one position to the right, the new hash is:

$$
h(T[i+1 \ldots i+m]) = \left( d \cdot \big( h(T[i \ldots i+m-1]) - T[i] \cdot d^{m-1} \big) + T[i+m] \right) \bmod q
$$

This recurrence removes the contribution of the leftmost character $T[i]$ and adds the new rightmost character $T[i+m]$. The value $d^{m-1} \bmod q$ is a constant that we precompute once.

### Algorithm

```
RABIN-KARP(T, P):
    n ← length(T)
    m ← length(P)
    d ← 256                          // alphabet size
    q ← 1000000007                   // large prime
    h ← d^(m−1) mod q                // precomputed weight

    // Initial hashes
    patternHash ← 0
    windowHash ← 0
    for j ← 0 to m − 1:
        patternHash ← (patternHash · d + P[j]) mod q
        windowHash ← (windowHash · d + T[j]) mod q

    // Slide the window
    for i ← 0 to n − m:
        if windowHash = patternHash:
            if T[i..i+m−1] = P:      // verify to eliminate collisions
                report match at position i
        if i < n − m:
            windowHash ← (d · (windowHash − T[i] · h) + T[i+m]) mod q
            if windowHash < 0:
                windowHash ← windowHash + q
```

### Trace through an example

Consider $T =$ `31415926` and $P =$ `1592`. Using $d = 10$ and $q = 13$ for illustration:

- $h = 10^3 \bmod 13 = 1000 \bmod 13 = 12$
- $\text{patternHash} = 1592 \bmod 13 = 6$

| Shift $i$ | Window | Hash | Match? |
|:---------:|--------|:----:|--------|
| 0 | `3141` | $3141 \bmod 13 = 7$ | No |
| 1 | `1415` | $(10 \cdot (7 - 3 \cdot 12) + 5) \bmod 13 = 10$ | No |
| 2 | `4159` | roll... $= 8$ | No |
| 3 | `1592` | roll... $= 6$ | Hash match! Verify: `1592` = `1592`. Match at $i=3$. |
| 4 | `5926` | roll... $= 3$ | No |

### Implementation

```typescript
export function rabinKarp(text: string, pattern: string): number[] {
  const n = text.length;
  const m = pattern.length;
  const result: number[] = [];

  if (m === 0) return result;
  if (m > n) return result;

  const d = 256;           // alphabet size (extended ASCII)
  const q = 1_000_000_007; // prime modulus

  // Precompute d^(m-1) mod q
  let h = 1;
  for (let i = 0; i < m - 1; i++) {
    h = (h * d) % q;
  }

  // Initial hash values
  let patternHash = 0;
  let windowHash = 0;
  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * d + pattern.charCodeAt(i)) % q;
    windowHash = (windowHash * d + text.charCodeAt(i)) % q;
  }

  // Slide the pattern across the text
  for (let i = 0; i <= n - m; i++) {
    if (windowHash === patternHash) {
      let match = true;
      for (let j = 0; j < m; j++) {
        if (text[i + j] !== pattern[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        result.push(i);
      }
    }

    if (i < n - m) {
      windowHash =
        ((windowHash - text.charCodeAt(i) * h) * d +
          text.charCodeAt(i + m)) % q;
      if (windowHash < 0) {
        windowHash += q;
      }
    }
  }

  return result;
}
```

### Complexity analysis

**Preprocessing.** Computing $d^{m-1} \bmod q$ and the initial hashes takes $O(m)$.

**Searching.** The rolling hash update at each shift costs $O(1)$. Hash comparisons cost $O(1)$. When hashes match, verification costs $O(m)$.

- **Expected case.** If the hash function distributes uniformly, the probability of a spurious hit (collision) at any shift is $\frac{1}{q}$. The expected total verification cost is $(n - m + 1) \cdot \frac{m}{q}$, which is negligible for large $q$. Combined with $O(n)$ for rolling hashes, the expected time is $O(n + m)$.
- **Worst case.** If every window produces a collision (e.g., $T$ and $P$ consist entirely of the same character), every hash match requires $O(m)$ verification, giving $O(nm)$ — no better than naive. Choosing a large random prime $q$ makes this scenario astronomically unlikely in practice.

**Space.** $O(1)$ beyond the output array.

### Why Rabin-Karp matters

Rabin-Karp's main advantage over the other algorithms in this chapter is its easy generalization to **multi-pattern search**: given $k$ patterns, compute all their hashes and store them in a set, then check each window's hash against the set. This yields expected $O(n + km)$ time for searching $k$ patterns simultaneously — far better than running KMP $k$ times.

Rabin-Karp is also the foundation of **plagiarism detection** systems: by computing rolling hashes of fixed-length substrings in two documents, matching hashes identify shared passages.

## Knuth-Morris-Pratt (KMP)

The KMP algorithm achieves $O(n + m)$ time in the **worst case**, not just in expectation. The key idea: when a mismatch occurs after matching $j$ characters of the pattern, we have already seen the text characters $T[i \ldots i+j-1]$ and know they equal $P[0 \ldots j-1]$. Instead of restarting from scratch at shift $i+1$, we can use this information to determine the longest possible overlap — how far the pattern can be shifted while still maintaining a partial match.

This information is encoded in the **failure function** (also called the **prefix function**).

### The failure function

For a pattern $P[0 \ldots m-1]$, define:

$$
\pi[j] = \text{length of the longest proper prefix of } P[0 \ldots j] \text{ that is also a suffix of } P[0 \ldots j]
$$

In other words, $\pi[j]$ is the length of the longest string that appears both at the start and the end of $P[0 \ldots j]$, excluding the trivial case of the entire string.

**Example.** For $P =$ `ababaca`:

| $j$ | $P[0 \ldots j]$ | Longest proper prefix = suffix | $\pi[j]$ |
|:---:|----------|-------------------------------|:---------:|
| 0 | `a` | (none) | 0 |
| 1 | `ab` | (none) | 0 |
| 2 | `aba` | `a` | 1 |
| 3 | `abab` | `ab` | 2 |
| 4 | `ababa` | `aba` | 3 |
| 5 | `ababac` | (none) | 0 |
| 6 | `ababaca` | `a` | 1 |

### Computing the failure function

The failure function can be computed in $O(m)$ time by recognizing that computing $\pi$ is itself a pattern-matching problem: we are matching the pattern against itself.

```
COMPUTE-FAILURE(P):
    m ← length(P)
    π[0] ← 0
    k ← 0
    for i ← 1 to m − 1:
        while k > 0 and P[k] ≠ P[i]:
            k ← π[k − 1]            // fall back
        if P[k] = P[i]:
            k ← k + 1
        π[i] ← k
    return π
```

The variable $k$ tracks the length of the current match between a prefix and a suffix. When a mismatch occurs, we "fall back" to $\pi[k-1]$, which gives the next longest prefix that could still match. This cascade of fallbacks is the heart of KMP.

**Why is this $O(m)$?** Although the inner `while` loop can execute multiple times for a single $i$, each fallback decreases $k$ by at least 1. Since $k$ increases by at most 1 per iteration of the outer loop and can never go below 0, the total number of fallback operations across all iterations is at most $m$. The total work is therefore $O(m)$.

### The KMP search algorithm

With the failure function in hand, the search proceeds as follows. We maintain a variable $q$ that tracks how many characters of the pattern are currently matched against the text. On a mismatch, we fall back to $\pi[q-1]$ instead of restarting from 0:

```
KMP-SEARCH(T, P):
    n ← length(T)
    m ← length(P)
    π ← COMPUTE-FAILURE(P)
    q ← 0                                 // characters matched so far
    for i ← 0 to n − 1:
        while q > 0 and P[q] ≠ T[i]:
            q ← π[q − 1]                  // fall back
        if P[q] = T[i]:
            q ← q + 1
        if q = m:
            report match at position i − m + 1
            q ← π[q − 1]                  // continue for overlapping matches
```

### Step-by-step trace

Let $T =$ `abababaababaca` and $P =$ `ababaca$. The failure function is $\pi = [0, 0, 1, 2, 3, 0, 1]$.

| $i$ | $T[i]$ | $q$ before | Action | $q$ after |
|:---:|:------:|:----------:|--------|:---------:|
| 0 | `a` | 0 | Match, $q \to 1$ | 1 |
| 1 | `b` | 1 | Match, $q \to 2$ | 2 |
| 2 | `a` | 2 | Match, $q \to 3$ | 3 |
| 3 | `b` | 3 | Match, $q \to 4$ | 4 |
| 4 | `a` | 4 | Match, $q \to 5$ | 5 |
| 5 | `b` | 5 | $P[5]=$`c` $\ne$ `b`. Fall back: $q \to \pi[4]=3$. $P[3]=$`b` $=$ `b`. Match, $q \to 4$ | 4 |
| 6 | `a` | 4 | Match, $q \to 5$ | 5 |
| 7 | `a` | 5 | $P[5]=$`c` $\ne$ `a`. Fall back: $q \to \pi[4]=3$. $P[3]=$`b` $\ne$ `a`. Fall back: $q \to \pi[2]=1$. $P[1]=$`b` $\ne$ `a`. Fall back: $q \to \pi[0]=0$. $P[0]=$`a` $=$ `a`. Match, $q \to 1$ | 1 |
| 8 | `b` | 1 | Match, $q \to 2$ | 2 |
| 9 | `a` | 2 | Match, $q \to 3$ | 3 |
| 10 | `b` | 3 | Match, $q \to 4$ | 4 |
| 11 | `a` | 4 | Match, $q \to 5$ | 5 |
| 12 | `c` | 5 | Match, $q \to 6$ | 6 |
| 13 | `a` | 6 | Match, $q \to 7 = m$. **Match at position $13 - 7 + 1 = 7$.** Fall back: $q \to \pi[6]=1$ | 1 |

The pattern `ababaca` is found at position 7 in the text.

Notice at $i=5$: after matching 5 characters, we discovered a mismatch. Instead of going back to shift 1 and starting over, the failure function told us that the last 3 matched characters (`aba`) form a prefix of the pattern, so we could continue from $q=3$. This is the savings that gives KMP its efficiency.

### Implementation

```typescript
export function computeFailure(pattern: string): number[] {
  const m = pattern.length;
  const failure = new Array<number>(m).fill(0);

  let k = 0;

  for (let i = 1; i < m; i++) {
    while (k > 0 && pattern[k] !== pattern[i]) {
      k = failure[k - 1]!;
    }

    if (pattern[k] === pattern[i]) {
      k++;
    }

    failure[i] = k;
  }

  return failure;
}

export function kmpSearch(text: string, pattern: string): number[] {
  const n = text.length;
  const m = pattern.length;
  const result: number[] = [];

  if (m === 0) return result;
  if (m > n) return result;

  const failure = computeFailure(pattern);

  let q = 0;

  for (let i = 0; i < n; i++) {
    while (q > 0 && pattern[q] !== text[i]) {
      q = failure[q - 1]!;
    }

    if (pattern[q] === text[i]) {
      q++;
    }

    if (q === m) {
      result.push(i - m + 1);
      q = failure[q - 1]!;
    }
  }

  return result;
}
```

### Complexity analysis

**Failure function computation.** $O(m)$ as argued above.

**Search phase.** By the same amortized argument: $q$ increases by at most 1 per iteration of the outer loop, and each fallback in the `while` loop decreases $q$ by at least 1. Since $q \ge 0$ always, the total number of fallback operations is at most $n$. Combined with the $n$ iterations of the outer loop, the search phase takes $O(n)$.

**Total.** $O(n + m)$ in the worst case. This is optimal — we must read every character of both the text and the pattern at least once.

**Space.** $O(m)$ for the failure function array.

### Why KMP is important

KMP is significant not just for its efficiency, but for the ideas it introduces:

1. **The failure function** captures the self-similarity structure of the pattern. This concept appears in many other string algorithms.
2. **Amortized analysis with a potential function.** The argument that the total number of fallbacks is bounded is a clean example of amortized analysis — the variable $q$ serves as the potential.
3. **Online processing.** KMP processes the text left to right, one character at a time, never looking back. This makes it suitable for streaming data.

## Comparison and practical considerations

| Criterion | Naive | Rabin-Karp | KMP |
|-----------|:-----:|:----------:|:---:|
| Worst-case time | $O(nm)$ | $O(nm)$ | $O(n+m)$ |
| Expected time | $O(n)$* | $O(n+m)$ | $O(n+m)$ |
| Extra space | $O(1)$ | $O(1)$ | $O(m)$ |
| Preprocessing | None | $O(m)$ | $O(m)$ |
| Multi-pattern | Run $k$ times | Natural extension | Run $k$ times** |
| Implementation complexity | Trivial | Moderate | Moderate |

\* Over random text with a large alphabet.

\** The Aho-Corasick algorithm extends KMP to multi-pattern matching in $O(n + m_1 + \ldots + m_k)$ time.

**In practice:**

- For short patterns or one-off searches, the naive algorithm is often the fastest due to its simplicity and cache-friendliness. Most standard library `indexOf` implementations use optimized variants of the naive approach (with heuristics like Boyer-Moore's bad-character rule).
- Rabin-Karp shines when searching for **multiple patterns simultaneously** or when the alphabet is small and patterns are long (making hashing effective).
- KMP is the right choice when **worst-case guarantees** matter (e.g., processing untrusted input where an adversary might craft pathological text/pattern combinations).

### Beyond this chapter

The string matching algorithms presented here search for exact occurrences of a fixed pattern. Important extensions include:

- **Boyer-Moore** and its variants (bad-character and good-suffix heuristics): often the fastest in practice for single-pattern search on natural language text, achieving sublinear average time.
- **Aho-Corasick**: extends KMP to match multiple patterns simultaneously by building a trie of patterns augmented with failure links.
- **Suffix arrays and suffix trees** (introduced in Chapter 19): preprocess the text rather than the pattern, enabling $O(m)$ or $O(m + \log n)$ queries after $O(n)$ or $O(n \log n)$ construction.
- **Approximate matching**: finding occurrences that are within a given edit distance of the pattern, which connects to the dynamic programming techniques of Chapter 16.

## Exercises

**Exercise 20.1.** Trace the naive string matching algorithm on $T =$ `aabaabaaab` and $P =$ `aab`. Count the total number of character comparisons. Then trace KMP on the same input and count comparisons. By what factor does KMP reduce the work?

**Exercise 20.2.** Compute the failure function for the pattern `aabaabaaa`. Show the $\pi$ table and trace through the computation step by step. Verify your answer by checking that each $\pi[j]$ correctly identifies the longest proper prefix of $P[0 \ldots j]$ that is also a suffix.

**Exercise 20.3.** The Rabin-Karp algorithm uses a prime modulus $q$ to reduce hash collisions. What happens if $q$ is too small? Construct a concrete example where $T$ and $P$ consist of different characters but produce the same hash for every window when $q = 3$ and $d = 2$. How does the algorithm handle this situation?

**Exercise 20.4.** Modify the KMP algorithm to find only the **first** occurrence of the pattern and return immediately. Then modify it to find the **last** occurrence. What are the time complexities of your modified versions?

**Exercise 20.5.** A **circular string** is one where the end wraps around to the beginning: the circular string `abcd` contains the substring `dab`. Describe how to use any of the string matching algorithms in this chapter to search for a pattern in a circular string of length $n$. What is the time complexity?

(_Hint: consider searching in $T \| T$ — the text concatenated with itself — but be careful about reporting duplicate matches._)

## Summary

The string matching problem — finding all occurrences of a pattern $P$ of length $m$ in a text $T$ of length $n$ — admits several algorithmic approaches.

The **naive algorithm** checks each of the $n - m + 1$ possible shifts by comparing characters one by one, taking $O(nm)$ time in the worst case. It requires no preprocessing and no extra space, making it suitable for short patterns or large alphabets where mismatches occur quickly.

The **Rabin-Karp algorithm** improves on the naive approach by using a rolling hash to filter out non-matching shifts in $O(1)$ time each. Only when hashes match does it verify character by character. With a good hash function, the expected running time is $O(n + m)$, though the worst case remains $O(nm)$. Its main strength is easy extension to multi-pattern search.

The **Knuth-Morris-Pratt algorithm** achieves $O(n + m)$ time in the worst case by preprocessing the pattern into a failure function that encodes its self-similarity structure. When a mismatch occurs, the failure function determines exactly how far to shift the pattern without missing any potential matches and without re-examining any text characters. The failure function computation and the search each use an elegant amortized argument: a counter that increases by at most 1 per step and decreases on fallbacks, bounding the total work.

These three algorithms illustrate a progression of ideas — from brute force to hashing to finite automaton-like preprocessing — that recur throughout algorithm design. The choice among them in practice depends on the use case: naive for simplicity, Rabin-Karp for multi-pattern search, and KMP when worst-case guarantees matter.
