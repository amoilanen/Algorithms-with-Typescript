# Hash Tables

_The data structures of the previous chapter — arrays, linked lists, stacks, and queues — support searching in $O(n)$ time at best. Binary search trees (which we will study in Chapter 9) reduce this to $O(\log n)$, but can we do even better? Hash tables achieve expected $O(1)$ time for insertions, deletions, and lookups by using a hash function to compute the index where each element should be stored. This makes hash tables one of the most important and widely used data structures in software engineering. In this chapter we explore how hash functions work, how to handle collisions when two keys map to the same index, and how to build hash tables that resize dynamically to maintain their performance guarantees._

## The dictionary problem

Many problems reduce to maintaining a collection of key-value pairs that supports three operations:

- **Insert** a new key-value pair (or update the value if the key exists).
- **Lookup** the value associated with a given key.
- **Delete** a key-value pair.

This is the **dictionary** abstract data type (also called a **map** or **associative array**). JavaScript's built-in `Map` and Python's `dict` are both dictionaries backed by hash tables.

### Direct addressing

The simplest approach is **direct addressing**: use the key itself as an index into an array. If keys are integers in the range $[0, m-1]$, we allocate an array of size $m$ and store the value for key $k$ at index $k$. All three operations are $O(1)$.

```typescript
// Direct-address table for integer keys in [0, m-1]
const table = new Array<string | undefined>(1000);
table[42] = 'Alice';         // insert
const name = table[42];      // lookup — O(1)
table[42] = undefined;       // delete
```

Direct addressing has a fatal flaw: the key space must be small and dense. If keys are strings, or integers in the range $[0, 2^{32}-1]$, allocating an array large enough to hold every possible key is impractical. We need a way to map a large key space into a small array.

## Hash functions

A **hash function** $h$ maps keys from a large universe $U$ to indices in a table of size $m$:

$$h: U \to \{0, 1, \ldots, m - 1\}$$

Given a key $k$, the hash function computes $h(k)$, which is the index (or **bucket**) where the key should be stored. A good hash function has two properties:

1. **Determinism.** The same key always produces the same hash.
2. **Uniformity.** Different keys should spread as evenly as possible across the $m$ buckets, minimizing collisions.

### The division method

The simplest hash function for integer keys is the **division method**:

$$h(k) = k \bmod m$$

This maps any non-negative integer to $[0, m-1]$. The choice of $m$ matters: if $m$ is a power of 2, the hash uses only the lowest-order bits of $k$, which can lead to clustering. Prime values of $m$ tend to distribute keys more uniformly.

### The multiplication method

The **multiplication method** avoids the sensitivity to $m$:

$$h(k) = \lfloor m \cdot (k \cdot A \bmod 1) \rfloor$$

where $A$ is a constant in the range $(0, 1)$. Knuth suggests $A \approx (\sqrt{5} - 1) / 2 \approx 0.6180339887$. The expression $k \cdot A \bmod 1$ extracts the fractional part of $k \cdot A$, which is then scaled to $[0, m)$. This method works well regardless of whether $m$ is a power of 2.

### Hashing strings

For string keys, we need to convert a sequence of characters into an integer. A standard approach is a **polynomial rolling hash**:

$$h(s) = \left(\sum_{i=0}^{n-1} s[i] \cdot p^{n-1-i}\right) \bmod m$$

where $s[i]$ is the character code at position $i$, $p$ is a prime base (often 31 or 37), and $m$ is the table size. Variants of this idea include the FNV (Fowler–Noll–Vo) hash, which alternates XOR and multiplication to achieve good distribution with simple operations:

```typescript
function fnvHash(key: string): number {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  return h >>> 0; // ensure non-negative 32-bit integer
}
```

The `>>> 0` at the end is a JavaScript idiom that converts a possibly negative 32-bit integer to an unsigned 32-bit integer, ensuring we get a non-negative result suitable for use as an array index.

### Universal hashing

No single hash function can avoid collisions for every possible input. An adversary who knows the hash function can deliberately choose keys that all hash to the same bucket, degrading performance to $O(n)$.

**Universal hashing** defeats this by choosing the hash function randomly from a family of functions at construction time. A family $\mathcal{H}$ of hash functions from $U$ to $\{0, \ldots, m-1\}$ is **universal** if, for any two distinct keys $x \neq y$:

$$\Pr_{h \in \mathcal{H}}[h(x) = h(y)] \leq \frac{1}{m}$$

When the hash function is chosen randomly, no input distribution can consistently cause collisions, giving us expected $O(1)$ performance regardless of the input.

## Collision resolution

Since $|U| > m$, multiple keys will inevitably hash to the same bucket — a **collision**. The two primary strategies for handling collisions are **separate chaining** and **open addressing**.

## Separate chaining

In **separate chaining**, each bucket stores a linked list (or chain) of all key-value pairs that hash to that index. Insertions prepend to the chain; lookups and deletions walk the chain until the key is found.

### How it works

Consider a hash table with $m = 4$ buckets after inserting keys with hashes as shown:

```
Bucket 0: → (key₁, val₁) → (key₅, val₅) → null
Bucket 1: → (key₂, val₂) → null
Bucket 2: → null
Bucket 3: → (key₃, val₃) → (key₄, val₄) → null
```

Keys 1 and 5 collide at bucket 0; keys 3 and 4 collide at bucket 3. Lookups for key₅ must traverse two nodes in bucket 0.

### Load factor

The **load factor** $\alpha = n / m$ is the average number of elements per bucket, where $n$ is the number of stored entries and $m$ is the number of buckets. Under the **simple uniform hashing assumption** (each key is equally likely to hash to any bucket), the expected chain length is $\alpha$.

- If $\alpha$ is kept constant (say, $\alpha \leq 0.75$), the expected time for any operation is $O(1 + \alpha) = O(1)$.
- If we never resize, $\alpha$ grows with $n$, and operations degrade to $O(n)$.

### Implementation

Our `HashTableChaining<K, V>` maintains an array of bucket heads (each either a chain node or `null`) and doubles the array when $\alpha \geq 0.75$:

```typescript
class ChainNode<K, V> {
  constructor(
    public key: K,
    public value: V,
    public next: ChainNode<K, V> | null = null,
  ) {}
}

export class HashTableChaining<K, V> implements Iterable<[K, V]> {
  private buckets: (ChainNode<K, V> | null)[];
  private count = 0;

  constructor(initialCapacity = 16) {
    const cap = Math.max(1, initialCapacity);
    this.buckets = new Array<ChainNode<K, V> | null>(cap).fill(null);
  }

  get size(): number {
    return this.count;
  }

  get capacity(): number {
    return this.buckets.length;
  }

  get loadFactor(): number {
    return this.count / this.buckets.length;
  }
```

The `set` method searches the chain at the target bucket. If the key is found, its value is updated; otherwise a new node is prepended:

```typescript
  set(key: K, value: V): V | undefined {
    if (this.count / this.buckets.length >= 0.75) {
      this.resize(this.buckets.length * 2);
    }

    const idx = this.bucketIndex(key);
    let node: ChainNode<K, V> | null = this.buckets[idx]!;

    while (node !== null) {
      if (Object.is(node.key, key)) {
        const old = node.value;
        node.value = value;
        return old;
      }
      node = node.next;
    }

    // Prepend to the bucket chain
    this.buckets[idx] = new ChainNode(key, value, this.buckets[idx]!);
    this.count++;
    return undefined;
  }
```

The `get` and `delete` methods follow the same pattern — compute the bucket index, then walk the chain:

```typescript
  get(key: K): V | undefined {
    const idx = this.bucketIndex(key);
    let node: ChainNode<K, V> | null = this.buckets[idx]!;
    while (node !== null) {
      if (Object.is(node.key, key)) {
        return node.value;
      }
      node = node.next;
    }
    return undefined;
  }

  delete(key: K): boolean {
    const idx = this.bucketIndex(key);
    let node: ChainNode<K, V> | null = this.buckets[idx]!;
    let prev: ChainNode<K, V> | null = null;

    while (node !== null) {
      if (Object.is(node.key, key)) {
        if (prev !== null) {
          prev.next = node.next;
        } else {
          this.buckets[idx] = node.next;
        }
        this.count--;
        return true;
      }
      prev = node;
      node = node.next;
    }
    return false;
  }
```

We use `Object.is` for key comparison rather than `===` because `Object.is` correctly handles the edge case where `NaN === NaN` is `false` but we want `NaN` keys to match.

### Dynamic resizing

When the load factor reaches the threshold, we allocate a new array with double the capacity and rehash every entry:

```typescript
  private resize(newCapacity: number): void {
    const oldBuckets = this.buckets;
    this.buckets = new Array<ChainNode<K, V> | null>(newCapacity).fill(null);
    this.count = 0;

    for (let b = 0; b < oldBuckets.length; b++) {
      let node: ChainNode<K, V> | null = oldBuckets[b]!;
      while (node !== null) {
        this.set(node.key, node.value);
        node = node.next;
      }
    }
  }
```

Resizing costs $O(n)$ in the worst case, but by the same amortized argument as dynamic arrays (Chapter 7), the cost per insertion averages $O(1)$ over a sequence of operations.

### Tracing through an example

Let us trace insertions into a hash table with 4 buckets. We use a simple hash $h(k) = k \bmod 4$ for clarity:

| Operation | Hash | Bucket state | Size |
|-----------|:----:|:-------------|:----:|
| `set(5, "a")` | $5 \bmod 4 = 1$ | B1: `(5,"a")` | 1 |
| `set(9, "b")` | $9 \bmod 4 = 1$ | B1: `(9,"b")→(5,"a")` | 2 |
| `set(3, "c")` | $3 \bmod 4 = 3$ | B1: `(9,"b")→(5,"a")`, B3: `(3,"c")` | 3 |
| `set(5, "d")` | $5 \bmod 4 = 1$ | B1: `(9,"b")→(5,"d")` — value updated | 3 |
| `delete(9)` | $9 \bmod 4 = 1$ | B1: `(5,"d")` | 2 |

Keys 5 and 9 collide at bucket 1. Setting key 5 again updates its value without increasing the size. Deleting key 9 removes it from the chain.

## Open addressing

In **open addressing**, all entries are stored directly in the table array — there are no linked lists. When a collision occurs, we probe a sequence of alternative slots until an empty one is found.

The **probe sequence** for key $k$ is a permutation of the table indices:

$$h(k, 0), \; h(k, 1), \; h(k, 2), \; \ldots, \; h(k, m-1)$$

We try slot $h(k, 0)$ first; if it's occupied, we try $h(k, 1)$, and so on.

### Linear probing

The simplest probing strategy is **linear probing**:

$$h(k, i) = (h'(k) + i) \bmod m$$

where $h'(k)$ is the primary hash. This means we simply try the next slot, then the one after that, wrapping around the end of the array.

Linear probing is cache-friendly because it accesses consecutive memory locations. However, it suffers from **primary clustering**: a contiguous block of occupied slots tends to grow, because any key that hashes into the cluster must probe to its end. Long clusters slow down both insertions and lookups.

### Double hashing

**Double hashing** uses a second hash function to compute the probe step:

$$h(k, i) = (h_1(k) + i \cdot h_2(k)) \bmod m$$

where $h_1$ is the primary hash and $h_2$ determines the step size. Different keys that collide at $h_1$ will have different step sizes, breaking up clusters.

For double hashing to work correctly, $h_2(k)$ must be coprime to $m$ so that the probe sequence visits every slot. A common choice is to make $m$ a power of 2 and ensure $h_2(k)$ is always odd.

### Tombstones and lazy deletion

Deleting from an open-addressed table is tricky. Simply clearing a slot would break probe sequences: if key $A$ was placed after probing past slot $s$ (which held key $B$), clearing slot $s$ would make $A$ unreachable.

The solution is **lazy deletion** with **tombstones**. When we delete a key, we mark its slot with a special sentinel value (the tombstone). During lookups, tombstones are treated as occupied (we continue probing past them). During insertions, tombstones can be reused.

```
Slot 0: ── (key₁, val₁)
Slot 1: ── TOMBSTONE       ← deleted entry
Slot 2: ── (key₃, val₃)   ← still reachable past tombstone
Slot 3: ── empty
```

Over time, tombstones accumulate and degrade performance. When we resize the table, tombstones are discarded, restoring clean probe sequences.

### Load factor for open addressing

Open addressing is more sensitive to load factor than chaining. As the table fills up, probe sequences get longer. At load factor $\alpha$, the expected number of probes for an unsuccessful search under uniform hashing is:

$$\frac{1}{1 - \alpha}$$

At $\alpha = 0.5$, this is 2 probes. At $\alpha = 0.75$, it's 4. At $\alpha = 0.9$, it's 10. For this reason, open-addressed tables typically resize at $\alpha \leq 0.5$ — more aggressively than chaining tables.

### Implementation

Our `HashTableOpenAddressing<K, V>` supports both linear probing and double hashing:

```typescript
const TOMBSTONE = Symbol('TOMBSTONE');

interface Slot<K, V> {
  key: K;
  value: V;
}

type BucketEntry<K, V> = Slot<K, V> | typeof TOMBSTONE | undefined;

export class HashTableOpenAddressing<K, V> implements Iterable<[K, V]> {
  private slots: BucketEntry<K, V>[];
  private count = 0;
  private tombstoneCount = 0;
  private readonly strategy: 'linear' | 'double-hashing';

  constructor(
    initialCapacity = 16,
    strategy: 'linear' | 'double-hashing' = 'linear',
  ) {
    this.strategy = strategy;
    const cap = nextPowerOf2(Math.max(1, initialCapacity));
    this.slots = new Array<BucketEntry<K, V>>(cap);
  }
```

The `set` method probes for an empty slot or a matching key:

```typescript
  set(key: K, value: V): V | undefined {
    if ((this.count + this.tombstoneCount) / this.slots.length >= 0.5) {
      this.rebuild(this.slots.length * 2);
    }

    const cap = this.slots.length;
    const h1 = primaryHash(key) % cap;
    const step = this.strategy === 'double-hashing'
      ? secondaryHash(key, cap) : 1;

    let firstTombstone = -1;
    let idx = h1;

    for (let i = 0; i < cap; i++) {
      const slot = this.slots[idx];

      if (slot === undefined) {
        const insertIdx = firstTombstone !== -1 ? firstTombstone : idx;
        this.slots[insertIdx] = { key, value };
        this.count++;
        if (firstTombstone !== -1) this.tombstoneCount--;
        return undefined;
      }

      if (slot === TOMBSTONE) {
        if (firstTombstone === -1) firstTombstone = idx;
      } else if (Object.is(slot.key, key)) {
        const old = slot.value;
        slot.value = value;
        return old;
      }

      idx = (idx + step) % cap;
    }
  }
```

Notice the `firstTombstone` optimization: if we pass a tombstone during the probe sequence, we remember its position. If the key is not in the table, we insert at the first tombstone rather than probing all the way to an empty slot. This recycles tombstones and prevents them from accumulating.

The resize check counts both live entries and tombstones against the load threshold. When we rebuild, tombstones are discarded:

```typescript
  private rebuild(newCapacity: number): void {
    const cap = nextPowerOf2(Math.max(1, newCapacity));
    const oldSlots = this.slots;
    this.slots = new Array<BucketEntry<K, V>>(cap);
    this.count = 0;
    this.tombstoneCount = 0;

    for (const slot of oldSlots) {
      if (slot !== undefined && slot !== TOMBSTONE) {
        this.set(slot.key, slot.value);
      }
    }
  }
```

### Tracing through linear probing

Let us trace insertions into a table of size 8 using linear probing with $h(k) = k \bmod 8$:

| Operation | Hash | Probes | Result |
|-----------|:----:|:------:|--------|
| `set(3, "a")` | 3 | 3 | Slot 3 ← `(3,"a")` |
| `set(11, "b")` | 3 | 3→4 | Collision at 3, slot 4 ← `(11,"b")` |
| `set(19, "c")` | 3 | 3→4→5 | Collision at 3,4, slot 5 ← `(19,"c")` |
| `delete(11)` | 3 | 3→4 | Slot 4 ← TOMBSTONE |
| `get(19)` | 3 | 3→4→5 | Probes past tombstone at 4, finds at 5 |
| `set(27, "d")` | 3 | 3→4 | Reuses tombstone at 4 ← `(27,"d")` |

The tombstone at slot 4 ensures that `get(19)` does not stop prematurely after passing the deleted slot.

## Chaining vs open addressing

| Property | Chaining | Open addressing |
|----------|:--------:|:---------------:|
| Extra memory | Linked list nodes | None (entries in table) |
| Cache performance | Poor (pointer chasing) | Good (sequential probes) |
| Load factor tolerance | Works well up to $\alpha \approx 1$ | Degrades rapidly above $\alpha \approx 0.7$ |
| Deletion | Simple | Requires tombstones |
| Worst case (all collisions) | $O(n)$ | $O(n)$ |
| Implementation complexity | Simpler | More subtle |

In practice, open addressing with linear probing tends to outperform chaining for moderate load factors thanks to cache locality. Chaining is more forgiving when the load factor varies or when deletions are frequent. Modern high-performance hash maps (like Google's SwissTable or Rust's `HashMap`) use sophisticated open-addressing schemes with SIMD-accelerated probing.

## Applications

Hash tables are ubiquitous. Here are a few classic applications:

### Frequency counting

Count how many times each word appears in a text:

```typescript
function wordFrequency(words: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return freq;
}
```

This runs in $O(n)$ expected time, where $n$ is the number of words. Without a hash table, we would need $O(n \log n)$ (sorting) or $O(n^2)$ (brute force).

### Two-sum problem

Given an array of numbers and a target sum, find two elements that add up to the target:

```typescript
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // value → index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    const j = seen.get(complement);
    if (j !== undefined) return [j, i];
    seen.set(nums[i], i);
  }
  return null;
}
```

Each element is inserted and looked up once, giving $O(n)$ expected time.

### Anagram detection

Two strings are anagrams if they contain the same characters with the same frequencies. We can check this by counting character frequencies in both strings and comparing:

```typescript
function areAnagrams(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const counts = new Map<string, number>();
  for (const ch of a) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of b) {
    const c = (counts.get(ch) ?? 0) - 1;
    if (c < 0) return false;
    counts.set(ch, c);
  }
  return true;
}
```

This is $O(n)$ where $n$ is the string length, versus $O(n \log n)$ for sorting both strings and comparing.

### Deduplication

Remove duplicate elements from an array while preserving order:

```typescript
function deduplicate<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  for (const item of arr) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}
```

A `Set` is essentially a hash table that stores only keys (no values).

## Complexity summary

| Operation | Chaining (expected) | Chaining (worst) | Open addressing (expected) | Open addressing (worst) |
|-----------|:---:|:---:|:---:|:---:|
| Insert | $O(1)$ | $O(n)$ | $O(1)$ | $O(n)$ |
| Lookup | $O(1)$ | $O(n)$ | $O(1)$ | $O(n)$ |
| Delete | $O(1)$ | $O(n)$ | $O(1)$ | $O(n)$ |
| Space | $O(n + m)$ | — | $O(m)$ | — |

The expected $O(1)$ complexities hold under the assumptions that the hash function distributes keys uniformly and the load factor is bounded by a constant.

## Exercises

**Exercise 8.1.** Implement a function `groupAnagrams(words: string[]): string[][]` that groups an array of words into sub-arrays of anagrams. For example, `groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])` should return `[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]` (in any order). Use a hash table where the key is the sorted characters of each word.

**Exercise 8.2.** Our open-addressing implementation uses a load factor threshold of 0.5 and doubles the table when exceeded. Experiment with different thresholds (0.6, 0.7, 0.8) and measure the average number of probes per lookup on random data. At what point does performance degrade noticeably?

**Exercise 8.3.** Implement a `HashSet<T>` class backed by `HashTableChaining<T, boolean>`. Support `add`, `has`, `delete`, `size`, and iteration. How does this compare to using TypeScript's built-in `Set`?

**Exercise 8.4.** The **cuckoo hashing** scheme uses two hash functions and two tables. Each key has exactly two possible locations — one in each table. If both are occupied during an insertion, one of the existing keys is "kicked out" and re-inserted using its alternate location. Research cuckoo hashing and explain: (a) why lookup is $O(1)$ worst case, (b) under what conditions insertion might fail, and (c) how to handle insertion failures.

**Exercise 8.5.** Our hash function uses FNV-1a for strings and a bit-mixing scheme for numbers. Design an experiment to test how uniformly these functions distribute keys. Generate 10,000 random strings (and separately, 10,000 random integers), hash each into a table of 1,000 buckets, and compute the chi-squared statistic. Compare with a theoretically perfect uniform distribution.

## Summary

Hash tables achieve expected $O(1)$ time for insert, lookup, and delete by using a hash function to map keys to array indices. The two main collision resolution strategies are:

- **Separate chaining** stores colliding entries in linked lists at each bucket. It is simple, tolerates high load factors, and handles deletions cleanly. The cost is extra memory for list nodes and poor cache locality.
- **Open addressing** stores all entries directly in the table array, probing for alternative slots on collision. Linear probing is cache-friendly but susceptible to clustering; double hashing eliminates clustering at the cost of additional hash computations. Deletions require tombstones to preserve probe sequences.

The **load factor** $\alpha = n/m$ controls performance. Chaining tables typically resize at $\alpha \geq 0.75$; open-addressed tables at $\alpha \geq 0.5$. Dynamic resizing (doubling the table and rehashing all entries) maintains the load factor within bounds, giving amortized $O(1)$ insertions.

Hash tables are the backbone of frequency counting, deduplication, two-sum–style problems, caching, and countless other applications. Their expected $O(1)$ operations make them the go-to data structure whenever fast key-based access is needed — though their worst-case $O(n)$ behavior means they are not a substitute for balanced search trees when guaranteed performance is required.

In the next chapter, we study **trees and binary search trees**, which provide $O(\log n)$ worst-case operations and support order-based queries that hash tables cannot efficiently answer.
