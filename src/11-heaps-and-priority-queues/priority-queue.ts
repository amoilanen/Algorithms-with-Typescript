import { BinaryHeap } from './binary-heap.js';

/**
 * An entry stored inside the priority queue, pairing a value with its
 * numeric priority.
 */
export interface PQEntry<T> {
  value: T;
  priority: number;
}

/**
 * A generic priority queue backed by a {@link BinaryHeap}.
 *
 * Lower numeric priority values are dequeued first (min-priority queue).
 * To obtain a max-priority queue, negate the priorities when enqueuing.
 *
 * ### Complexity
 * | Operation       | Time      |
 * |-----------------|-----------|
 * | enqueue         | O(log n)  |
 * | dequeue         | O(log n)  |
 * | peek            | O(1)      |
 * | changePriority  | O(n + log n) — linear scan to find, then sift |
 * | size / isEmpty  | O(1)      |
 *
 * Note: `changePriority` performs a linear scan to locate the entry by
 * value identity. For O(log n) decrease-key with a handle-based API,
 * use {@link BinaryHeap} directly with an index map.
 */
export class PriorityQueue<T> {
  private heap: BinaryHeap<PQEntry<T>>;

  constructor() {
    this.heap = new BinaryHeap<PQEntry<T>>((a, b) => a.priority - b.priority);
  }

  // ── Public API ──────────────────────────────────────────────────

  /** Number of entries in the queue. */
  get size(): number {
    return this.heap.size;
  }

  /** Whether the queue is empty. */
  get isEmpty(): boolean {
    return this.heap.isEmpty;
  }

  /**
   * Add a value with the given priority.
   * Time: O(log n)
   */
  enqueue(value: T, priority: number): void {
    this.heap.insert({ value, priority });
  }

  /**
   * Remove and return the value with the lowest (highest-priority) numeric
   * priority. Returns `undefined` if the queue is empty.
   * Time: O(log n)
   */
  dequeue(): T | undefined {
    const entry = this.heap.extract();
    return entry?.value;
  }

  /**
   * Return the value with the lowest numeric priority without removing it.
   * Returns `undefined` if the queue is empty.
   * Time: O(1)
   */
  peek(): T | undefined {
    return this.heap.peek()?.value;
  }

  /**
   * Change the priority of the first entry whose value satisfies
   * `Object.is(entry.value, value)`.
   *
   * Time: O(n) scan + O(log n) rebuild = O(n)
   *
   * @returns `true` if the value was found and updated, `false` otherwise.
   */
  changePriority(value: T, newPriority: number): boolean {
    // We need to rebuild because the new priority may be higher or lower.
    // Extract internal array, find and update, then rebuild heap.
    const arr = this.heap.toArray();
    const idx = arr.findIndex((e) => Object.is(e.value, value));
    if (idx === -1) return false;

    arr[idx] = { value, priority: newPriority };
    this.heap = BinaryHeap.from<PQEntry<T>>(arr, (a, b) => a.priority - b.priority);
    return true;
  }

  /**
   * Return all entries as an array (heap-ordered, not sorted).
   * Useful for inspection and testing.
   */
  toArray(): PQEntry<T>[] {
    return this.heap.toArray();
  }
}
