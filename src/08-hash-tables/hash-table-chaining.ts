/**
 * A node in a hash-table chain (singly linked list bucket entry).
 */
class ChainNode<K, V> {
  constructor(
    public key: K,
    public value: V,
    public next: ChainNode<K, V> | null = null,
  ) {}
}

/** Default initial number of buckets. */
const DEFAULT_CAPACITY = 16;

/** When load factor exceeds this threshold, the table doubles in size. */
const MAX_LOAD_FACTOR = 0.75;

/**
 * Compute a non-negative 32-bit integer hash for an arbitrary key.
 *
 * Strings are hashed using a polynomial rolling hash (FNV-1a–inspired).
 * Numbers are used directly (after flooring and absolute-value).
 * Other values are coerced to their string representation.
 */
function hash(key: unknown): number {
  if (typeof key === 'number') {
    // Handle -0, NaN, Infinity consistently
    const n = Object.is(key, -0) ? 0 : key;
    // Spread the bits for small integers
    let h = (n | 0) ^ ((n >>> 16) | 0);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = h ^ (h >>> 16);
    return h >>> 0; // ensure non-negative
  }

  const s = typeof key === 'string' ? key : String(key);
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  return h >>> 0;
}

/**
 * A generic hash table using **separate chaining** for collision resolution.
 *
 * Each bucket is a singly linked list of key-value pairs. When the load
 * factor (size / capacity) exceeds 0.75, the table doubles its number of
 * buckets and rehashes all entries.
 *
 * Time complexity (expected, assuming a good hash function):
 *   - get / set / delete:  O(1)
 *   - Worst case (all keys collide):  O(n)
 *
 * Space complexity: O(n)
 */
export class HashTableChaining<K, V> implements Iterable<[K, V]> {
  private buckets: (ChainNode<K, V> | null)[];
  private count = 0;

  constructor(initialCapacity = DEFAULT_CAPACITY) {
    const cap = Math.max(1, initialCapacity);
    this.buckets = new Array<ChainNode<K, V> | null>(cap).fill(null);
  }

  /** The number of key-value pairs stored. */
  get size(): number {
    return this.count;
  }

  /** The current number of buckets. */
  get capacity(): number {
    return this.buckets.length;
  }

  /** The current load factor (size / capacity). */
  get loadFactor(): number {
    return this.count / this.buckets.length;
  }

  /**
   * Insert or update a key-value pair. O(1) expected.
   * Returns the previous value if the key already existed, or undefined.
   */
  set(key: K, value: V): V | undefined {
    if (this.count / this.buckets.length >= MAX_LOAD_FACTOR) {
      this.resize(this.buckets.length * 2);
    }

    const idx = this.bucketIndex(key);
    let node: ChainNode<K, V> | null = this.buckets[idx]!;

    while (node !== null) {
      if (this.keysEqual(node.key, key)) {
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

  /**
   * Retrieve the value associated with `key`.
   * Returns undefined if the key is not present. O(1) expected.
   */
  get(key: K): V | undefined {
    const idx = this.bucketIndex(key);
    let node: ChainNode<K, V> | null = this.buckets[idx]!;
    while (node !== null) {
      if (this.keysEqual(node.key, key)) {
        return node.value;
      }
      node = node.next;
    }
    return undefined;
  }

  /** Return true if the table contains `key`. O(1) expected. */
  has(key: K): boolean {
    const idx = this.bucketIndex(key);
    let node: ChainNode<K, V> | null = this.buckets[idx]!;
    while (node !== null) {
      if (this.keysEqual(node.key, key)) return true;
      node = node.next;
    }
    return false;
  }

  /**
   * Remove `key` from the table.
   * Returns true if the key was found and removed, false otherwise. O(1) expected.
   */
  delete(key: K): boolean {
    const idx = this.bucketIndex(key);
    let node: ChainNode<K, V> | null = this.buckets[idx]!;
    let prev: ChainNode<K, V> | null = null;

    while (node !== null) {
      if (this.keysEqual(node.key, key)) {
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

  /** Remove all entries from the table. */
  clear(): void {
    this.buckets.fill(null);
    this.count = 0;
  }

  /** Return an array of all keys in the table. */
  keys(): K[] {
    const result: K[] = [];
    for (const bucket of this.buckets) {
      let node: ChainNode<K, V> | null = bucket ?? null;
      while (node !== null) {
        result.push(node.key);
        node = node.next;
      }
    }
    return result;
  }

  /** Return an array of all values in the table. */
  values(): V[] {
    const result: V[] = [];
    for (const bucket of this.buckets) {
      let node: ChainNode<K, V> | null = bucket ?? null;
      while (node !== null) {
        result.push(node.value);
        node = node.next;
      }
    }
    return result;
  }

  /** Iterate over all [key, value] pairs. */
  *[Symbol.iterator](): Iterator<[K, V]> {
    for (const bucket of this.buckets) {
      let node: ChainNode<K, V> | null = bucket ?? null;
      while (node !== null) {
        yield [node.key, node.value];
        node = node.next;
      }
    }
  }

  /** Compute the bucket index for a given key. */
  private bucketIndex(key: K): number {
    return hash(key) % this.buckets.length;
  }

  /** Compare keys for equality, handling special cases like NaN. */
  private keysEqual(a: K, b: K): boolean {
    // Object.is handles NaN === NaN and distinguishes +0/-0
    return Object.is(a, b);
  }

  /** Resize the bucket array and rehash all entries. */
  private resize(newCapacity: number): void {
    const oldBuckets = this.buckets;
    this.buckets = new Array<ChainNode<K, V> | null>(newCapacity).fill(null);
    this.count = 0;

    for (const bucket of oldBuckets) {
      let node: ChainNode<K, V> | null = bucket ?? null;
      while (node !== null) {
        this.set(node.key, node.value);
        node = node.next;
      }
    }
  }
}
