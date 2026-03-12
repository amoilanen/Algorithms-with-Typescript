import { describe, it, expect } from 'vitest';
import { PriorityQueue } from '../../src/11-heaps-and-priority-queues/priority-queue.js';

describe('PriorityQueue', () => {
  // ── Empty queue ───────────────────────────────────────────────

  describe('empty queue', () => {
    it('should start empty', () => {
      const pq = new PriorityQueue<string>();
      expect(pq.size).toBe(0);
      expect(pq.isEmpty).toBe(true);
    });

    it('should return undefined on peek', () => {
      const pq = new PriorityQueue<string>();
      expect(pq.peek()).toBeUndefined();
    });

    it('should return undefined on dequeue', () => {
      const pq = new PriorityQueue<string>();
      expect(pq.dequeue()).toBeUndefined();
    });
  });

  // ── Enqueue / dequeue ordering ────────────────────────────────

  describe('enqueue and dequeue ordering', () => {
    it('should dequeue in priority order (lowest first)', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('low', 10);
      pq.enqueue('high', 1);
      pq.enqueue('medium', 5);

      expect(pq.dequeue()).toBe('high');
      expect(pq.dequeue()).toBe('medium');
      expect(pq.dequeue()).toBe('low');
    });

    it('should handle multiple items with the same priority', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('a', 1);
      pq.enqueue('b', 1);
      pq.enqueue('c', 1);

      expect(pq.size).toBe(3);
      const results = [pq.dequeue(), pq.dequeue(), pq.dequeue()];
      expect(results.sort()).toEqual(['a', 'b', 'c']);
    });

    it('should peek without removing', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('a', 5);
      pq.enqueue('b', 1);

      expect(pq.peek()).toBe('b');
      expect(pq.size).toBe(2);
      expect(pq.peek()).toBe('b');
    });

    it('should track size correctly through operations', () => {
      const pq = new PriorityQueue<number>();
      expect(pq.size).toBe(0);
      pq.enqueue(10, 1);
      expect(pq.size).toBe(1);
      pq.enqueue(20, 2);
      expect(pq.size).toBe(2);
      pq.dequeue();
      expect(pq.size).toBe(1);
      pq.dequeue();
      expect(pq.size).toBe(0);
      expect(pq.isEmpty).toBe(true);
    });
  });

  // ── changePriority ────────────────────────────────────────────

  describe('changePriority', () => {
    it('should increase priority (lower number) of an existing value', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('task-a', 10);
      pq.enqueue('task-b', 5);
      pq.enqueue('task-c', 8);

      // Promote task-a to highest priority
      const found = pq.changePriority('task-a', 1);
      expect(found).toBe(true);
      expect(pq.peek()).toBe('task-a');
    });

    it('should decrease priority (higher number) of an existing value', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('urgent', 1);
      pq.enqueue('normal', 5);

      // Demote "urgent"
      const found = pq.changePriority('urgent', 100);
      expect(found).toBe(true);
      expect(pq.peek()).toBe('normal');
    });

    it('should return false for a non-existent value', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('a', 1);
      expect(pq.changePriority('missing', 0)).toBe(false);
    });

    it('should return false on an empty queue', () => {
      const pq = new PriorityQueue<string>();
      expect(pq.changePriority('x', 0)).toBe(false);
    });

    it('should preserve correct ordering after multiple priority changes', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('a', 1);
      pq.enqueue('b', 2);
      pq.enqueue('c', 3);
      pq.enqueue('d', 4);
      pq.enqueue('e', 5);

      pq.changePriority('e', 0); // promote e to top
      pq.changePriority('a', 10); // demote a to bottom

      expect(pq.dequeue()).toBe('e');
      expect(pq.dequeue()).toBe('b');
      expect(pq.dequeue()).toBe('c');
      expect(pq.dequeue()).toBe('d');
      expect(pq.dequeue()).toBe('a');
    });
  });

  // ── Object values ─────────────────────────────────────────────

  describe('with object values', () => {
    interface Job {
      id: number;
      name: string;
    }

    it('should work with object references', () => {
      const pq = new PriorityQueue<Job>();
      const jobA: Job = { id: 1, name: 'build' };
      const jobB: Job = { id: 2, name: 'test' };
      const jobC: Job = { id: 3, name: 'deploy' };

      pq.enqueue(jobC, 30);
      pq.enqueue(jobA, 10);
      pq.enqueue(jobB, 20);

      expect(pq.dequeue()).toBe(jobA);
      expect(pq.dequeue()).toBe(jobB);
      expect(pq.dequeue()).toBe(jobC);
    });

    it('should find objects by reference for changePriority', () => {
      const pq = new PriorityQueue<Job>();
      const jobA: Job = { id: 1, name: 'build' };
      const jobB: Job = { id: 2, name: 'test' };

      pq.enqueue(jobA, 10);
      pq.enqueue(jobB, 5);

      expect(pq.changePriority(jobA, 1)).toBe(true);
      expect(pq.peek()).toBe(jobA);
    });
  });

  // ── Numeric values (used as max-priority queue via negation) ──

  describe('max-priority via negated priorities', () => {
    it('should dequeue highest-value items first when using negative priorities', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('low', -1);
      pq.enqueue('high', -10);
      pq.enqueue('medium', -5);

      expect(pq.dequeue()).toBe('high');
      expect(pq.dequeue()).toBe('medium');
      expect(pq.dequeue()).toBe('low');
    });
  });

  // ── toArray ───────────────────────────────────────────────────

  describe('toArray', () => {
    it('should return all entries', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('a', 3);
      pq.enqueue('b', 1);
      pq.enqueue('c', 2);

      const entries = pq.toArray();
      expect(entries).toHaveLength(3);
      const values = entries.map((e) => e.value).sort();
      expect(values).toEqual(['a', 'b', 'c']);
    });
  });

  // ── Large dataset ─────────────────────────────────────────────

  describe('large dataset', () => {
    it('should handle 5000 items in correct priority order', () => {
      const pq = new PriorityQueue<number>();
      const n = 5000;
      const priorities = Array.from({ length: n }, () => Math.random() * n);

      for (let i = 0; i < n; i++) {
        pq.enqueue(i, priorities[i]!);
      }
      expect(pq.size).toBe(n);

      let prevPriority = -Infinity;
      while (!pq.isEmpty) {
        const val = pq.dequeue()!;
        const priority = priorities[val]!;
        expect(priority).toBeGreaterThanOrEqual(prevPriority);
        prevPriority = priority;
      }
    });
  });
});
