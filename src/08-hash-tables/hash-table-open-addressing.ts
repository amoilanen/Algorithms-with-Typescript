/** Probing strategy for collision resolution. */
export type ProbingStrategy = 'linear' | 'double-hashing';

/** When load factor exceeds this threshold, the table doubles in size. */
const MAX_LOAD_FACTOR = 0.5;

/** Minimum capacity (must be > 0). */
const DEFAULT_CAPACITY = 16;

/**
 * Sentinel value marking a slot that held a deleted entry.
 * We need this so that probe sequences are not broken by deletions.
 */
const TOMBSTONE = Symbol('TOMBSTONE');

/** An occupied slot in the table. */
interface Slot<K, V> {
  key: K;
  value: V;
}

type BucketEntry<K, V> = Slot<K, V> | typeof TOMBSTONE | undefined;

/**
 * Compute a non-negative 32-bit integer hash for an arbitrary key.
 * Same algorithm as the chaining implementation for consistency.
 */
function primaryHash(key: unknown): number {
  if (typeof key === 'number') {
    const n = Object.is(key, -0) ? 0 : key;
    let h = (n | 0) ^ ((n >>> 16) | 0);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = h ^ (h >>> 16);
    return h >>> 0;
  }
  const s = typeof key === 'string' ? key : String(key);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * A secondary hash function for double hashing.
 * Must return a value in [1, capacity - 1] that is coprime to capacity.
 * We ensure capacity is a power of 2, so any odd number is coprime.
 */
function secondaryHash(key: unknown, capacity: number): number {
  let h: number;
  if (typeof key === 'number') {
    const n = Object.is(key, -0) ? 0 : key;
    h = Math.imul((n | 0) ^ 0x27d4eb2d, 0x165667b1);
    h = h ^ (h >>> 15);
  } else {
    const s = typeof key === 'string' ? key : String(key);
    h = 0x01000193;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x811c9dc5);
    }
  }
  // Force odd so it's coprime to the power-of-2 capacity, and at least 1
  return ((h >>> 0) % (capacity - 1)) | 1;
}

/**
 * Round up to the next power of 2 (required for double hashing to guarantee
 * all slots are visited when the step is odd).
 */
function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * A generic hash table using **open addressing** for collision resolution.
 *
 * Supports two probing strategies:
 *   - **linear probing**: probe slots i, i+1, i+2, … (mod capacity).
 *     Simpler, cache-friendly, but susceptible to primary clustering.
 *   - **double hashing**: probe slots i, i+h₂, i+2·h₂, … where h₂ is a
 *     secondary hash. Eliminates primary clustering at the cost of
 *     more hash computations.
 *
 * The table uses tombstones for lazy deletion so that probe sequences
 * are not broken. When the load factor (counting tombstones) exceeds 0.5,
 * the table is rebuilt to clear tombstones and restore performance.
 *
 * Time complexity (expected, assuming a good hash function):
 *   - get / set / delete:  O(1)
 *   - Worst case (all keys collide):  O(n)
 *
 * Space complexity: O(n)
 */
export class HashTableOpenAddressing<K, V> implements Iterable<[K, V]> {
  private slots: BucketEntry<K, V>[];
  private count = 0;
  private tombstoneCount = 0;
  private readonly strategy: ProbingStrategy;

  constructor(
    initialCapacity = DEFAULT_CAPACITY,
    strategy: ProbingStrategy = 'linear',
  ) {
    this.strategy = strategy;
    const cap = nextPowerOf2(Math.max(1, initialCapacity));
    this.slots = new Array<BucketEntry<K, V>>(cap);
  }

  /** The number of key-value pairs stored. */
  get size(): number {
    return this.count;
  }

  /** The current number of slots. */
  get capacity(): number {
    return this.slots.length;
  }

  /** The current load factor (size / capacity). */
  get loadFactor(): number {
    return this.count / this.slots.length;
  }

  /**
   * Insert or update a key-value pair. O(1) expected.
   * Returns the previous value if the key already existed, or undefined.
   */
  set(key: K, value: V): V | undefined {
    // Resize when live entries + tombstones exceed load factor
    if ((this.count + this.tombstoneCount) / this.slots.length >= MAX_LOAD_FACTOR) {
      this.rebuild(this.slots.length * 2);
    }

    const cap = this.slots.length;
    const h1 = primaryHash(key) % cap;
    const step = this.strategy === 'double-hashing' ? secondaryHash(key, cap) : 1;

    let firstTombstone = -1;
    let idx = h1;

    for (let i = 0; i < cap; i++) {
      const slot = this.slots[idx];

      if (slot === undefined) {
        // Empty slot: key not in table. Insert at tombstone position if found earlier.
        const insertIdx = firstTombstone !== -1 ? firstTombstone : idx;
        this.slots[insertIdx] = { key, value };
        this.count++;
        if (firstTombstone !== -1) {
          this.tombstoneCount--;
        }
        return undefined;
      }

      if (slot === TOMBSTONE) {
        if (firstTombstone === -1) {
          firstTombstone = idx;
        }
      } else if (this.keysEqual(slot.key, key)) {
        const old = slot.value;
        slot.value = value;
        return old;
      }

      idx = (idx + step) % cap;
    }

    // Table is full of tombstones and live entries — should not happen due to load factor
    // but handle gracefully: rebuild and retry
    this.rebuild(this.slots.length * 2);
    return this.set(key, value);
  }

  /**
   * Retrieve the value associated with `key`.
   * Returns undefined if the key is not present. O(1) expected.
   */
  get(key: K): V | undefined {
    const slot = this.findSlot(key);
    return slot !== undefined ? slot.value : undefined;
  }

  /** Return true if the table contains `key`. O(1) expected. */
  has(key: K): boolean {
    return this.findSlot(key) !== undefined;
  }

  /**
   * Remove `key` from the table (lazy deletion with tombstone).
   * Returns true if the key was found and removed, false otherwise. O(1) expected.
   */
  delete(key: K): boolean {
    const cap = this.slots.length;
    const h1 = primaryHash(key) % cap;
    const step = this.strategy === 'double-hashing' ? secondaryHash(key, cap) : 1;

    let idx = h1;
    for (let i = 0; i < cap; i++) {
      const slot = this.slots[idx];
      if (slot === undefined) return false;
      if (slot !== TOMBSTONE && this.keysEqual(slot.key, key)) {
        this.slots[idx] = TOMBSTONE;
        this.count--;
        this.tombstoneCount++;
        return true;
      }
      idx = (idx + step) % cap;
    }
    return false;
  }

  /** Remove all entries from the table. */
  clear(): void {
    this.slots = new Array<BucketEntry<K, V>>(this.slots.length);
    this.count = 0;
    this.tombstoneCount = 0;
  }

  /** Return an array of all keys in the table. */
  keys(): K[] {
    const result: K[] = [];
    for (const slot of this.slots) {
      if (slot !== undefined && slot !== TOMBSTONE) {
        result.push(slot.key);
      }
    }
    return result;
  }

  /** Return an array of all values in the table. */
  values(): V[] {
    const result: V[] = [];
    for (const slot of this.slots) {
      if (slot !== undefined && slot !== TOMBSTONE) {
        result.push(slot.value);
      }
    }
    return result;
  }

  /** Iterate over all [key, value] pairs. */
  *[Symbol.iterator](): Iterator<[K, V]> {
    for (const slot of this.slots) {
      if (slot !== undefined && slot !== TOMBSTONE) {
        yield [slot.key, slot.value];
      }
    }
  }

  /** Locate the slot containing `key`, or return undefined. */
  private findSlot(key: K): Slot<K, V> | undefined {
    const cap = this.slots.length;
    const h1 = primaryHash(key) % cap;
    const step = this.strategy === 'double-hashing' ? secondaryHash(key, cap) : 1;

    let idx = h1;
    for (let i = 0; i < cap; i++) {
      const slot = this.slots[idx];
      if (slot === undefined) return undefined;
      if (slot !== TOMBSTONE && this.keysEqual(slot.key, key)) {
        return slot;
      }
      idx = (idx + step) % cap;
    }
    return undefined;
  }

  /** Compare keys for equality, handling special cases like NaN. */
  private keysEqual(a: K, b: K): boolean {
    return Object.is(a, b);
  }

  /** Rebuild the table with a new capacity, discarding tombstones. */
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
}
