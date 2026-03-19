# Greedy Algorithms

_Dynamic programming (Chapter 16) achieves optimal solutions by methodically exploring all subproblems and combining their answers. Greedy algorithms take a more aggressive approach: at each step they make the locally optimal choice and never look back. When a greedy strategy works, the result is typically a simpler and faster algorithm — often just a single pass over sorted data. The catch is that the locally optimal choice does not always lead to a globally optimal solution, so correctness requires proof. In this chapter we develop two proof techniques — the "greedy stays ahead" argument and the exchange argument — and apply them to three classic problems: interval scheduling, Huffman coding, and fractional knapsack._

## The greedy strategy

A greedy algorithm builds a solution incrementally. At each step it examines the available candidates, selects the one that looks best according to some criterion, and commits to that choice irrevocably. It never reconsiders past decisions or explores alternative combinations.

Contrast this with dynamic programming:

| | Dynamic programming | Greedy |
|---|---|---|
| **Decisions** | Deferred — explores all combinations via table | Immediate — commits at each step |
| **Subproblems** | Many, overlapping | Typically none (single pass) |
| **Correctness** | Optimal substructure + overlapping subproblems | Requires a specific proof (exchange or stays-ahead) |
| **Efficiency** | Often $O(n^2)$ or $O(n^3)$ | Often $O(n \log n)$ or $O(n)$ |

The greedy strategy works when a problem has:

1. **Optimal substructure.** An optimal solution contains optimal solutions to subproblems.
2. **The greedy-choice property.** A locally optimal choice can always be extended to a globally optimal solution. In other words, we never need to reconsider a greedy choice.

Property 1 is shared with DP. Property 2 is what distinguishes greedy problems: it asserts that committing to the local optimum is safe.

## Proving greedy algorithms correct

Because the greedy-choice property is not obvious, we need rigorous proofs. Two standard techniques are widely used.

### Greedy stays ahead

**Idea.** Show that after each step, the greedy solution is at least as good as any other solution at the same step. If the greedy algorithm stays ahead (or tied) at every step, it must be at least as good as the optimum overall.

**Structure of the proof:**

1. Define a measure of progress after $k$ steps.
2. Prove by induction that the greedy solution's measure is at least as good as the optimal solution's measure after every step $k$.
3. Conclude that the final greedy solution is optimal.

We will use this technique for interval scheduling below.

### Exchange argument

**Idea.** Start with an arbitrary optimal solution. Show that it can be transformed — step by step, by "exchanging" its choices for greedy choices — into the greedy solution without worsening the objective. If an optimal solution can always be transformed into the greedy solution, the greedy solution must be optimal.

**Structure of the proof:**

1. Consider an optimal solution $O$ that differs from the greedy solution $G$.
2. Identify the first point where $O$ and $G$ differ.
3. Show that modifying $O$ to agree with $G$ at that point does not make $O$ worse.
4. Repeat until $O = G$.

We will use this technique for Huffman coding.

## Interval scheduling (activity selection)

### Problem definition

Given $n$ activities, each with a start time $s_i$ and a finish time $f_i$ (where $s_i < f_i$), select the largest subset of mutually compatible activities. Two activities are **compatible** if they do not overlap — that is, one finishes before the other starts.

This problem arises in resource allocation: scheduling the maximum number of non-overlapping jobs on a single machine, booking meeting rooms, or allocating time slots.

### Greedy approach

The key insight is to **sort activities by finish time** and greedily select each activity whose start time does not conflict with the previously selected activity.

Why finish time? Consider the alternatives:

- **Sort by start time.** A long early activity could block many shorter ones.
- **Sort by duration.** A short activity in the middle could block two non-overlapping ones.
- **Sort by fewest conflicts.** Counterexamples exist.
- **Sort by finish time.** By always choosing the activity that finishes earliest, we leave as much room as possible for future activities.

### Algorithm

1. Sort activities by finish time.
2. Select the first activity.
3. For each subsequent activity: if its start time is $\geq$ the finish time of the last selected activity, select it.

```typescript
export interface Interval {
  start: number;
  end: number;
}

export interface IntervalSchedulingResult {
  selected: Interval[];
  count: number;
}

export function intervalScheduling(
  intervals: readonly Interval[],
): IntervalSchedulingResult {
  if (intervals.length === 0) {
    return { selected: [], count: 0 };
  }

  // Sort by finish time (break ties by start time).
  const sorted = intervals.slice().sort((a, b) => {
    if (a.end !== b.end) return a.end - b.end;
    return a.start - b.start;
  });

  const selected: Interval[] = [sorted[0]!];
  let lastEnd = sorted[0]!.end;

  for (let i = 1; i < sorted.length; i++) {
    const interval = sorted[i]!;
    if (interval.start >= lastEnd) {
      selected.push(interval);
      lastEnd = interval.end;
    }
  }

  return { selected, count: selected.length };
}
```

### Correctness proof (greedy stays ahead)

Let $G = \{g_1, g_2, \ldots, g_k\}$ be the activities selected by the greedy algorithm (in order of finish time), and let $O = \{o_1, o_2, \ldots, o_m\}$ be an optimal solution (also sorted by finish time). We want to show $k \geq m$.

**Lemma (greedy stays ahead).** For all $i \leq k$, we have $f(g_i) \leq f(o_i)$ — the $i$-th greedy activity finishes no later than the $i$-th optimal activity.

_Proof by induction on $i$:_

- **Base case** ($i = 1$). The greedy algorithm picks the activity with the earliest finish time, so $f(g_1) \leq f(o_1)$.
- **Inductive step.** Assume $f(g_i) \leq f(o_i)$. Since $o_{i+1}$ starts after $o_i$ finishes, we have $s(o_{i+1}) \geq f(o_i) \geq f(g_i)$. Therefore $o_{i+1}$ is compatible with $g_i$, and the greedy algorithm considers it (or an activity that finishes even earlier). It follows that $f(g_{i+1}) \leq f(o_{i+1})$.

**Theorem.** $k \geq m$. If $k < m$, then by the lemma, $f(g_k) \leq f(o_k) \leq s(o_{k+1})$, so $o_{k+1}$ is compatible with $g_k$ and the greedy algorithm would have selected it — contradicting the fact that greedy stopped at $k$ activities. Therefore $k = m$, and the greedy solution is optimal. $\square$

### Complexity

- **Time:** $O(n \log n)$ for sorting, plus $O(n)$ for the single scan. Total: $O(n \log n)$.
- **Space:** $O(n)$ for the sorted copy and result.

### Example

Consider these activities sorted by finish time:

| Activity | Start | Finish |
|----------|-------|--------|
| A | 1 | 4 |
| B | 3 | 5 |
| C | 0 | 6 |
| D | 5 | 7 |
| E | 3 | 9 |
| F | 6 | 10 |
| G | 8 | 11 |

The greedy algorithm proceeds:

1. Select **A** [1, 4). Last finish = 4.
2. **B** starts at 3 < 4 — skip.
3. **C** starts at 0 < 4 — skip.
4. **D** starts at 5 ≥ 4 — select. Last finish = 7.
5. **E** starts at 3 < 7 — skip.
6. **F** starts at 6 < 7 — skip.
7. **G** starts at 8 ≥ 7 — select. Last finish = 11.

Result: {A, D, G} — 3 activities. This is optimal.

## Huffman coding

### Problem definition

Given an alphabet $C$ of $n$ characters, each with a known frequency $f(c)$, find a **prefix-free binary code** that minimizes the total encoding length:

$$B(T) = \sum_{c \in C} f(c) \cdot d_T(c)$$

where $d_T(c)$ is the depth of character $c$ in the coding tree $T$ (which equals the length of its binary codeword).

A code is **prefix-free** if no codeword is a prefix of another. This guarantees that encoded text can be decoded unambiguously without delimiters.

### Why variable-length codes?

Fixed-length codes (like ASCII) use $\lceil \log_2 n \rceil$ bits per character regardless of frequency. If some characters appear much more often than others, variable-length codes can do better: assign shorter codewords to frequent characters and longer ones to rare characters. This is the principle behind data compression formats like ZIP, gzip, and JPEG.

### Huffman's greedy algorithm

David Huffman (1952) discovered that the optimal prefix-free code can be built by a simple greedy procedure:

1. Create a leaf node for each character, with its frequency as the key.
2. Insert all leaves into a min-priority queue.
3. While the queue has more than one node:
   a. Extract the two nodes $x$ and $y$ with the lowest frequencies.
   b. Create a new internal node $z$ with $z.freq = x.freq + y.freq$, left child $x$, and right child $y$.
   c. Insert $z$ back into the queue.
4. The remaining node is the root of the Huffman tree.
5. Assign code `0` to left edges and `1` to right edges. Each character's codeword is the sequence of bits on the path from root to its leaf.

```typescript
import { BinaryHeap } from '../11-heaps-and-priority-queues/binary-heap.js';

export type HuffmanNode = HuffmanLeaf | HuffmanInternal;

export interface HuffmanLeaf {
  kind: 'leaf';
  char: string;
  freq: number;
}

export interface HuffmanInternal {
  kind: 'internal';
  freq: number;
  left: HuffmanNode;
  right: HuffmanNode;
}

export function buildHuffmanTree(
  frequencies: ReadonlyMap<string, number>,
): HuffmanNode {
  if (frequencies.size === 0) {
    throw new RangeError('frequency map must not be empty');
  }

  // Special case: single character.
  if (frequencies.size === 1) {
    const [char, freq] = [...frequencies][0]!;
    return { kind: 'leaf', char, freq };
  }

  const heap = new BinaryHeap<HuffmanNode>((a, b) => a.freq - b.freq);
  for (const [char, freq] of frequencies) {
    heap.insert({ kind: 'leaf', char, freq });
  }

  while (heap.size > 1) {
    const left = heap.extract()!;
    const right = heap.extract()!;
    const merged: HuffmanInternal = {
      kind: 'internal',
      freq: left.freq + right.freq,
      left,
      right,
    };
    heap.insert(merged);
  }

  return heap.extract()!;
}
```

The code table is then extracted by a simple tree traversal:

```typescript
export function buildCodeTable(root: HuffmanNode): Map<string, string> {
  const table = new Map<string, string>();

  if (root.kind === 'leaf') {
    table.set(root.char, '0');
    return table;
  }

  function walk(node: HuffmanNode, prefix: string): void {
    if (node.kind === 'leaf') {
      table.set(node.char, prefix);
      return;
    }
    walk(node.left, prefix + '0');
    walk(node.right, prefix + '1');
  }

  walk(root, '');
  return table;
}
```

### Encoding and decoding

Encoding replaces each character with its codeword:

```typescript
export function huffmanEncode(text: string): HuffmanEncodingResult {
  if (text.length === 0) {
    throw new RangeError('text must be non-empty');
  }

  const frequencies = new Map<string, number>();
  for (const ch of text) {
    frequencies.set(ch, (frequencies.get(ch) ?? 0) + 1);
  }

  const tree = buildHuffmanTree(frequencies);
  const codeTable = buildCodeTable(tree);

  let encoded = '';
  for (const ch of text) {
    encoded += codeTable.get(ch)!;
  }

  return { encoded, codeTable, tree };
}
```

Decoding walks the tree from root to leaf for each bit:

```typescript
export function huffmanDecode(
  encoded: string,
  tree: HuffmanNode,
): string {
  if (tree.kind === 'leaf') {
    return tree.char.repeat(encoded.length);
  }

  let result = '';
  let node: HuffmanNode = tree;

  for (const bit of encoded) {
    node = bit === '0'
      ? (node as HuffmanInternal).left
      : (node as HuffmanInternal).right;

    if (node.kind === 'leaf') {
      result += node.char;
      node = tree;
    }
  }

  return result;
}
```

### Correctness proof (exchange argument)

We prove that the Huffman algorithm produces an optimal prefix-free code.

**Lemma 1.** There exists an optimal tree in which the two lowest-frequency characters are siblings at the maximum depth.

_Proof._ Let $T^*$ be an optimal tree. Let $x$ and $y$ be the two characters with the lowest frequencies. If they are not at the maximum depth or not siblings in $T^*$, we can swap them with the characters at maximum depth without increasing the cost (because $x$ and $y$ have the lowest frequencies, moving them deeper cannot increase $B(T)$, and moving more frequent characters to shallower positions can only help). $\square$

**Lemma 2.** Let $T'$ be the tree obtained by replacing the subtree containing siblings $x$ and $y$ with a single leaf $z$ having frequency $f(z) = f(x) + f(y)$. Then $B(T) = B(T') + f(x) + f(y)$.

_Proof._ In $T$, $x$ and $y$ are one level deeper than $z$ is in $T'$. Each contributes $f(c) \cdot 1$ extra to $B(T)$ compared to $B(T')$. $\square$

**Theorem.** The Huffman algorithm produces an optimal prefix-free code.

_Proof by induction on the number of characters $n$:_

- **Base case** ($n = 1$ or $n = 2$). Trivially optimal.
- **Inductive step.** By Lemma 1, there is an optimal tree where the two lowest-frequency characters $x, y$ are siblings at maximum depth. By Lemma 2, replacing them with a merged node $z$ gives a subproblem with $n - 1$ characters. By the inductive hypothesis, Huffman solves the subproblem optimally. Since the merge doesn't affect the relative costs of the remaining characters, the full tree is also optimal. $\square$

### Complexity

- **Time:** $O(n \log n)$ where $n$ is the number of distinct characters. Each of the $n - 1$ merge steps involves two heap extractions and one insertion, each $O(\log n)$.
- **Space:** $O(n)$ for the tree and heap.
- **Encoding time:** $O(m)$ where $m$ is the length of the input text (after the tree is built).
- **Decoding time:** $O(b)$ where $b$ is the number of bits in the encoded string.

### Example

Consider an alphabet with these frequencies:

| Character | f | a | b | c | d | e |
|-----------|---|---|---|---|---|---|
| Frequency | 5 | 9 | 12 | 13 | 16 | 45 |

**Step-by-step tree construction:**

1. Extract `f` (5) and `a` (9) → merge into node (14).
2. Extract `b` (12) and `c` (13) → merge into node (25).
3. Extract (14) and `d` (16) → merge into node (30).
4. Extract (25) and (30) → merge into node (55).
5. Extract `e` (45) and (55) → merge into root (100).

```
           (100)
          /     \
        e:45   (55)
              /    \
           (25)   (30)
          /   \   /   \
        b:12 c:13 (14) d:16
                 /   \
               f:5   a:9
```

**Resulting codes:**

| Character | Code | Length |
|-----------|------|--------|
| e | 0 | 1 |
| b | 100 | 3 |
| c | 101 | 3 |
| f | 1100 | 4 |
| a | 1101 | 4 |
| d | 111 | 3 |

**Total encoding length:** $45 \times 1 + 12 \times 3 + 13 \times 3 + 5 \times 4 + 9 \times 4 + 16 \times 3 = 45 + 36 + 39 + 20 + 36 + 48 = 224$ bits.

A fixed-length code would require $\lceil \log_2 6 \rceil = 3$ bits per character, for a total of $100 \times 3 = 300$ bits. Huffman coding saves $300 - 224 = 76$ bits, a 25% reduction.

## Fractional knapsack

### Problem definition

Given $n$ items, each with a weight $w_i > 0$ and a value $v_i \geq 0$, and a knapsack with capacity $W$, maximize the total value of items placed in the knapsack. Unlike the 0/1 knapsack (Chapter 16), here we may take **fractions** of items: for each item $i$, we choose a fraction $x_i \in [0, 1]$, subject to:

$$\sum_{i=1}^{n} x_i \cdot w_i \leq W$$

Maximize:

$$\sum_{i=1}^{n} x_i \cdot v_i$$

### Why greedy works here (but not for 0/1 knapsack)

The fractional knapsack has the greedy-choice property: we should always take as much as possible of the item with the highest value-per-unit-weight ratio $v_i / w_i$.

For the **0/1 knapsack**, this greedy strategy fails. Consider:

- Item A: weight 10, value 60 (ratio 6)
- Item B: weight 20, value 100 (ratio 5)
- Capacity: 20

Greedy by ratio selects item A (ratio 6), getting value 60. But the optimal solution takes item B for value 100. The constraint that items cannot be split breaks the greedy-choice property, which is why the 0/1 knapsack requires dynamic programming.

In the fractional case, if item A doesn't fill the knapsack, we can take part of item B as well — the "fractional freedom" ensures the greedy choice is always safe.

### Algorithm

1. Compute the value-to-weight ratio for each item.
2. Sort items by ratio in descending order.
3. Greedily take as much of each item as possible until the knapsack is full.

```typescript
export interface FractionalKnapsackItem {
  weight: number;
  value: number;
}

export interface PackedItem {
  index: number;
  fraction: number;
  weight: number;
  value: number;
}

export interface FractionalKnapsackResult {
  maxValue: number;
  totalWeight: number;
  packedItems: PackedItem[];
}

export function fractionalKnapsack(
  items: readonly FractionalKnapsackItem[],
  capacity: number,
): FractionalKnapsackResult {
  if (capacity < 0) {
    throw new RangeError('capacity must be non-negative');
  }

  const indexed = items.map((item, i) => ({
    index: i,
    weight: item.weight,
    value: item.value,
    ratio: item.value / item.weight,
  }));
  indexed.sort((a, b) => b.ratio - a.ratio);

  const packedItems: PackedItem[] = [];
  let remaining = capacity;
  let totalValue = 0;
  let totalWeight = 0;

  for (const item of indexed) {
    if (remaining <= 0) break;

    if (item.weight <= remaining) {
      packedItems.push({
        index: item.index,
        fraction: 1,
        weight: item.weight,
        value: item.value,
      });
      remaining -= item.weight;
      totalValue += item.value;
      totalWeight += item.weight;
    } else {
      const fraction = remaining / item.weight;
      const fractionalValue = item.value * fraction;
      packedItems.push({
        index: item.index,
        fraction,
        weight: remaining,
        value: fractionalValue,
      });
      totalValue += fractionalValue;
      totalWeight += remaining;
      remaining = 0;
    }
  }

  return { maxValue: totalValue, totalWeight, packedItems };
}
```

### Correctness proof (exchange argument)

**Theorem.** Sorting by $v_i / w_i$ and greedily packing yields an optimal solution.

_Proof._ Suppose items are sorted so that $v_1/w_1 \geq v_2/w_2 \geq \cdots \geq v_n/w_n$. Let $G = (x_1, \ldots, x_n)$ be the greedy solution and $O = (y_1, \ldots, y_n)$ be an optimal solution. If $G \neq O$, let $j$ be the first index where they differ. By the greedy algorithm, $x_j$ is as large as possible (either 1 or filling the remaining capacity), so $x_j > y_j$.

We can increase $y_j$ and decrease some $y_k$ (where $k > j$, so $v_k/w_k \leq v_j/w_j$) to compensate. Specifically, shift weight $\delta$ from item $k$ to item $j$:

$$\Delta = \delta \cdot (v_j/w_j - v_k/w_k) \geq 0$$

The objective value does not decrease. Repeating this exchange process transforms $O$ into $G$ without ever decreasing the total value, so $G$ is optimal. $\square$

### Complexity

- **Time:** $O(n \log n)$ for sorting, plus $O(n)$ for the greedy scan. Total: $O(n \log n)$.
- **Space:** $O(n)$.

### Example

| Item | Weight | Value | Ratio |
|------|--------|-------|-------|
| A | 10 | 60 | 6.0 |
| B | 20 | 100 | 5.0 |
| C | 30 | 120 | 4.0 |

**Capacity:** 50

**Greedy packing (sorted by ratio):**

1. Take all of A: weight 10, value 60. Remaining capacity: 40.
2. Take all of B: weight 20, value 100. Remaining capacity: 20.
3. Take 20/30 of C: weight 20, value $120 \times \frac{20}{30} = 80$. Remaining capacity: 0.

**Total value:** $60 + 100 + 80 = 240$.

Compare with the 0/1 knapsack (no fractions allowed), where the optimal is to take A and C for value $60 + 120 = 180$, or A and B for value $60 + 100 = 160$. The ability to take fractions yields a strictly higher value.

## When greedy fails

Not every optimization problem admits a greedy solution. Here are instructive examples where the greedy approach fails:

1. **0/1 Knapsack.** As shown above, the greedy-by-ratio strategy is suboptimal. The integer constraint destroys the greedy-choice property.

2. **Longest path in a graph.** Greedily choosing the longest edge at each step does not yield the longest path. This problem is NP-hard.

3. **Optimal BST.** Greedily placing the most frequent key at the root does not minimize expected search time. This requires DP (similar to matrix chain multiplication).

The lesson: always prove that the greedy-choice property holds before trusting a greedy algorithm. The proofs in this chapter — "greedy stays ahead" and the exchange argument — are the standard tools for doing so.

## Summary

Greedy algorithms solve optimization problems by making locally optimal choices at each step. They are simpler and typically faster than dynamic programming — often requiring just a sort followed by a linear scan — but they require careful proof that the greedy-choice property holds.

We studied two proof techniques. The **greedy stays ahead** argument shows that the greedy solution maintains an advantage over any optimal solution at every step, and we applied it to interval scheduling. The **exchange argument** shows that any optimal solution can be transformed into the greedy solution without loss, and we applied it to Huffman coding and fractional knapsack.

The three problems in this chapter illustrate the range of greedy applications:

- **Interval scheduling** selects the maximum number of non-overlapping activities by always choosing the one that finishes earliest — a $O(n \log n)$ algorithm.
- **Huffman coding** produces optimal prefix-free binary codes by repeatedly merging the two lowest-frequency symbols — also $O(n \log n)$.
- **Fractional knapsack** maximizes value by greedily packing items in order of value-to-weight ratio — $O(n \log n)$.

| Problem | Strategy | Time | Space | Proof technique |
|---------|----------|------|-------|-----------------|
| Interval scheduling | Sort by finish time | $O(n \log n)$ | $O(n)$ | Greedy stays ahead |
| Huffman coding | Merge lowest-frequency pairs | $O(n \log n)$ | $O(n)$ | Exchange argument |
| Fractional knapsack | Sort by value/weight ratio | $O(n \log n)$ | $O(n)$ | Exchange argument |

We also contrasted greedy with DP on the knapsack problem: the fractional variant yields to greedy, while the 0/1 variant requires dynamic programming. Recognizing which problems have the greedy-choice property — and which do not — is a fundamental skill in algorithm design.

## Exercises

1. **Weighted interval scheduling.** In the weighted variant, each activity has a value $v_i$, and the goal is to maximize the total value (not the count) of selected non-overlapping activities. Show that the greedy algorithm (sort by finish time) does not solve this problem optimally. Design a dynamic programming algorithm in $O(n \log n)$ time.

2. **Job scheduling with deadlines.** You have $n$ jobs, each taking unit time, with a deadline $d_i$ and a penalty $p_i$ incurred if the job is not completed by its deadline. Design a greedy algorithm that minimizes the total penalty. Prove its correctness.

3. **Optimal merge pattern.** You have $n$ sorted files of sizes $s_1, s_2, \ldots, s_n$. Merging two files of sizes $a$ and $b$ costs $a + b$. Find the merge order that minimizes the total cost. How does this relate to Huffman coding?

4. **Huffman vs fixed-width.** Prove that Huffman coding never uses more bits than a fixed-width encoding. Under what conditions does it use the same number of bits?

5. **Greedy failure.** Consider the coin-change problem with denominations $\{1, 3, 4\}$ and target amount 6. Show that the greedy algorithm (always use the largest denomination that fits) gives a suboptimal solution. What is the optimal solution?
