import { describe, it, expect } from 'vitest';
import { BinaryHeap } from '../../src/11-heaps-and-priority-queues/binary-heap';

/**
 * Verify the min-heap property: every parent is ≤ its children according to
 * the default numeric comparator.
 */
function verifyMinHeapProperty(heap: BinaryHeap<number>): void {
  const arr = heap.toArray();
  for (let i = 0; i < arr.length; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < arr.length) {
      expect(arr[i]).toBeLessThanOrEqual(arr[left]!);
    }
    if (right < arr.length) {
      expect(arr[i]).toBeLessThanOrEqual(arr[right]!);
    }
  }
}

/**
 * Verify the max-heap property using a reversed comparator.
 */
function verifyMaxHeapProperty(heap: BinaryHeap<number>): void {
  const arr = heap.toArray();
  for (let i = 0; i < arr.length; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < arr.length) {
      expect(arr[i]).toBeGreaterThanOrEqual(arr[left]!);
    }
    if (right < arr.length) {
      expect(arr[i]).toBeGreaterThanOrEqual(arr[right]!);
    }
  }
}

describe('BinaryHeap', () => {
  // ── Empty heap ────────────────────────────────────────────────

  describe('empty heap', () => {
    it('should start empty', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });

    it('should return undefined on peek', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should return undefined on extract', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.extract()).toBeUndefined();
    });

    it('should return an empty array from toArray', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should produce no values from iterator', () => {
      const heap = new BinaryHeap<number>();
      expect([...heap]).toEqual([]);
    });
  });

  // ── Single element ────────────────────────────────────────────

  describe('single element', () => {
    it('should insert and peek', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(42);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty).toBe(false);
      expect(heap.peek()).toBe(42);
    });

    it('should insert and extract', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(42);
      expect(heap.extract()).toBe(42);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });
  });

  // ── Min-heap (default) ────────────────────────────────────────

  describe('min-heap (default comparator)', () => {
    it('should always extract the minimum element', () => {
      const heap = new BinaryHeap<number>();
      for (const v of [5, 3, 8, 1, 2, 7, 4, 6]) {
        heap.insert(v);
      }
      const sorted: number[] = [];
      while (!heap.isEmpty) {
        sorted.push(heap.extract()!);
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should maintain heap property after each insert', () => {
      const heap = new BinaryHeap<number>();
      for (const v of [10, 4, 15, 20, 0, 30, 2]) {
        heap.insert(v);
        verifyMinHeapProperty(heap);
      }
    });

    it('should maintain heap property after each extract', () => {
      const heap = new BinaryHeap<number>();
      for (const v of [10, 4, 15, 20, 0, 30, 2]) {
        heap.insert(v);
      }
      while (heap.size > 1) {
        heap.extract();
        verifyMinHeapProperty(heap);
      }
    });

    it('should handle duplicate values', () => {
      const heap = new BinaryHeap<number>();
      for (const v of [3, 1, 3, 1, 2, 2]) {
        heap.insert(v);
      }
      const sorted: number[] = [];
      while (!heap.isEmpty) {
        sorted.push(heap.extract()!);
      }
      expect(sorted).toEqual([1, 1, 2, 2, 3, 3]);
    });

    it('should handle already-sorted insertions', () => {
      const heap = new BinaryHeap<number>();
      for (const v of [1, 2, 3, 4, 5]) {
        heap.insert(v);
      }
      expect(heap.peek()).toBe(1);
      verifyMinHeapProperty(heap);
    });

    it('should handle reverse-sorted insertions', () => {
      const heap = new BinaryHeap<number>();
      for (const v of [5, 4, 3, 2, 1]) {
        heap.insert(v);
      }
      expect(heap.peek()).toBe(1);
      verifyMinHeapProperty(heap);
    });
  });

  // ── Max-heap (reversed comparator) ────────────────────────────

  describe('max-heap (reversed comparator)', () => {
    const maxComparator = (a: number, b: number) => b - a;

    it('should always extract the maximum element', () => {
      const heap = new BinaryHeap<number>(maxComparator);
      for (const v of [5, 3, 8, 1, 2, 7, 4, 6]) {
        heap.insert(v);
      }
      const sorted: number[] = [];
      while (!heap.isEmpty) {
        sorted.push(heap.extract()!);
      }
      expect(sorted).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
    });

    it('should maintain max-heap property after each insert', () => {
      const heap = new BinaryHeap<number>(maxComparator);
      for (const v of [10, 4, 15, 20, 0, 30, 2]) {
        heap.insert(v);
        verifyMaxHeapProperty(heap);
      }
    });
  });

  // ── BinaryHeap.from (buildHeap) ───────────────────────────────

  describe('from() — build heap', () => {
    it('should build a valid min-heap from an unsorted array', () => {
      const heap = BinaryHeap.from([9, 3, 7, 1, 5, 6, 2, 8, 4]);
      verifyMinHeapProperty(heap);
      expect(heap.size).toBe(9);
      expect(heap.peek()).toBe(1);
    });

    it('should build a valid max-heap from an unsorted array', () => {
      const heap = BinaryHeap.from(
        [9, 3, 7, 1, 5, 6, 2, 8, 4],
        (a, b) => b - a,
      );
      verifyMaxHeapProperty(heap);
      expect(heap.peek()).toBe(9);
    });

    it('should not mutate the input array', () => {
      const input = [5, 3, 1, 4, 2];
      const copy = [...input];
      BinaryHeap.from(input);
      expect(input).toEqual(copy);
    });

    it('should handle an empty array', () => {
      const heap = BinaryHeap.from<number>([]);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });

    it('should handle a single-element array', () => {
      const heap = BinaryHeap.from([42]);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(42);
    });

    it('should extract elements in sorted order', () => {
      const heap = BinaryHeap.from([20, 15, 10, 5, 25, 30, 1]);
      const sorted: number[] = [];
      while (!heap.isEmpty) {
        sorted.push(heap.extract()!);
      }
      expect(sorted).toEqual([1, 5, 10, 15, 20, 25, 30]);
    });
  });

  // ── decreaseKey ───────────────────────────────────────────────

  describe('decreaseKey', () => {
    it('should decrease a key and maintain heap order', () => {
      const heap = BinaryHeap.from([10, 20, 30, 40, 50]);
      // Element at some index — decrease the value of 50 (index 4 in unsorted,
      // but after build-heap the positions may differ). Let's find the index.
      const arr = heap.toArray();
      const idx = arr.indexOf(50);
      heap.decreaseKey(idx, 1);
      expect(heap.peek()).toBe(1);
      verifyMinHeapProperty(heap);
    });

    it('should throw on out-of-bounds index', () => {
      const heap = BinaryHeap.from([1, 2, 3]);
      expect(() => heap.decreaseKey(-1, 0)).toThrow(RangeError);
      expect(() => heap.decreaseKey(3, 0)).toThrow(RangeError);
    });

    it('should throw when new value has lower priority (larger in min-heap)', () => {
      const heap = BinaryHeap.from([1, 2, 3]);
      // Index 0 has value 1 (root of min-heap), trying to set it to 5
      expect(() => heap.decreaseKey(0, 5)).toThrow();
    });

    it('should allow setting equal value (no-op)', () => {
      const heap = BinaryHeap.from([1, 2, 3]);
      const root = heap.peek()!;
      heap.decreaseKey(0, root);
      expect(heap.peek()).toBe(root);
      verifyMinHeapProperty(heap);
    });
  });

  // ── Iterator ──────────────────────────────────────────────────

  describe('iterator', () => {
    it('should iterate over all elements', () => {
      const heap = BinaryHeap.from([3, 1, 4, 1, 5]);
      const values = [...heap];
      expect(values).toHaveLength(5);
      // Values are in heap order, not sorted
      expect(values.sort((a, b) => a - b)).toEqual([1, 1, 3, 4, 5]);
    });
  });

  // ── Custom comparator with objects ────────────────────────────

  describe('custom comparator with objects', () => {
    interface Task {
      name: string;
      deadline: number;
    }

    const deadlineComparator = (a: Task, b: Task) => a.deadline - b.deadline;

    it('should order by earliest deadline', () => {
      const heap = new BinaryHeap<Task>(deadlineComparator);
      heap.insert({ name: 'C', deadline: 30 });
      heap.insert({ name: 'A', deadline: 10 });
      heap.insert({ name: 'B', deadline: 20 });

      expect(heap.peek()?.name).toBe('A');
      expect(heap.extract()?.name).toBe('A');
      expect(heap.extract()?.name).toBe('B');
      expect(heap.extract()?.name).toBe('C');
    });
  });

  // ── Large dataset ─────────────────────────────────────────────

  describe('large dataset', () => {
    it('should handle 10 000 random insertions and extractions', () => {
      const heap = new BinaryHeap<number>();
      const n = 10_000;
      for (let i = 0; i < n; i++) {
        heap.insert(Math.random() * n);
      }
      expect(heap.size).toBe(n);
      verifyMinHeapProperty(heap);

      let prev = -Infinity;
      while (!heap.isEmpty) {
        const val = heap.extract()!;
        expect(val).toBeGreaterThanOrEqual(prev);
        prev = val;
      }
    });

    it('should build from 10 000 elements and extract in order', () => {
      const input = Array.from({ length: 10_000 }, () => Math.random() * 10_000);
      const heap = BinaryHeap.from(input);
      verifyMinHeapProperty(heap);

      let prev = -Infinity;
      while (!heap.isEmpty) {
        const val = heap.extract()!;
        expect(val).toBeGreaterThanOrEqual(prev);
        prev = val;
      }
    });
  });
});
