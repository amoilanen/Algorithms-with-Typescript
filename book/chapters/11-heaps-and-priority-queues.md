# Heaps and Priority Queues

_In the previous two chapters we studied binary search trees and their balanced variants — structures that maintain a total ordering of their elements for efficient search, insertion, and deletion. In this chapter we turn to a different kind of tree-based structure: the **binary heap**. A heap does not maintain a full sorted order; instead, it maintains a weaker **heap property** that ensures the minimum (or maximum) element is always at the root. This partial ordering is cheaper to maintain and gives us an efficient implementation of the **priority queue** abstract data type — a collection where we can always extract the highest-priority element in $O(\log n)$ time, insert new elements in $O(\log n)$ time, and peek at the top element in $O(1)$ time._

## The priority queue abstraction

Many algorithms need a data structure that answers the question: _"What is the most urgent item?"_ Consider these examples:

- **Dijkstra's algorithm** (Chapter 13) repeatedly extracts the vertex with the smallest tentative distance.
- **Prim's algorithm** (Chapter 14) repeatedly extracts the lightest edge crossing a cut.
- **Huffman coding** (Chapter 17) repeatedly extracts the two lowest-frequency symbols.
- **Operating system schedulers** select the highest-priority process to run next.
- **Event-driven simulations** process events in chronological order.

In all these cases, the key operation is _extract the element with the highest priority_. A sorted array could answer this in $O(1)$ time, but insertion would cost $O(n)$. An unsorted array allows $O(1)$ insertion but $O(n)$ extraction. We want $O(\log n)$ for both — and that is exactly what a binary heap provides.

A **priority queue** supports the following operations:

| Operation | Description |
|-----------|-------------|
| `enqueue(value, priority)` | Insert a value with a given priority |
| `dequeue()` | Remove and return the highest-priority value |
| `peek()` | Return the highest-priority value without removing it |
| `changePriority(value, newPriority)` | Update the priority of an existing value |

The binary heap is the most common implementation of a priority queue, and the one we study in this chapter.

## Binary heaps

A **binary heap** is a complete binary tree stored in an array. It satisfies two properties:

1. **Shape property:** The tree is a _complete binary tree_ — every level is fully filled except possibly the last, which is filled from left to right. This guarantees the tree has height $\lfloor \log_2 n \rfloor$.

2. **Heap property:** For every node $i$ (other than the root), the value at $i$'s parent is less than or equal to the value at $i$ (for a min-heap) or greater than or equal (for a max-heap).

The shape property means we can represent the tree as a flat array with no pointers. The heap property means the root always holds the minimum (or maximum) element.

### Array representation

Because the tree is complete, we can map between tree positions and array indices using simple arithmetic. For a node at index $i$ (using 0-based indexing):

$$\text{parent}(i) = \left\lfloor \frac{i - 1}{2} \right\rfloor$$

$$\text{left}(i) = 2i + 1$$

$$\text{right}(i) = 2i + 2$$

For example, the min-heap containing the values 1, 3, 5, 7, 4, 8, 6 is stored as:

```
Array:   [1, 3, 5, 7, 4, 8, 6]
Index:    0  1  2  3  4  5  6

Tree view:
            1          (index 0)
          /   \
        3       5      (indices 1, 2)
       / \     / \
      7   4   8   6    (indices 3, 4, 5, 6)
```

Node 1 (at index 0) is the root. Its children are at indices 1 and 2. Node 3 (index 1) has children at indices 3 and 4. No pointers are needed — the parent-child relationships are computed from the index.

In TypeScript:

```typescript
function parentIndex(i: number): number {
  return Math.floor((i - 1) / 2);
}

function leftIndex(i: number): number {
  return 2 * i + 1;
}

function rightIndex(i: number): number {
  return 2 * i + 2;
}
```

### The heap class

Our `BinaryHeap<T>` class stores elements in a flat array and accepts a comparator function to define the ordering. By default it uses ascending numeric comparison, producing a min-heap. Passing `(a, b) => b - a` produces a max-heap.

```typescript
export class BinaryHeap<T> {
  private data: T[] = [];
  private readonly compare: Comparator<T>;

  constructor(comparator?: Comparator<T>) {
    this.compare = (comparator ?? numberComparator) as Comparator<T>;
  }

  get size(): number {
    return this.data.length;
  }

  get isEmpty(): boolean {
    return this.data.length === 0;
  }

  peek(): T | undefined {
    return this.data[0];
  }
  // ...
}
```

The `peek` operation simply returns the root element at index 0 in $O(1)$ time.

## Heap operations

### Sift-up (swim)

When we insert a new element at the end of the array, it may violate the heap property by being smaller than its parent (in a min-heap). **Sift-up** fixes this by repeatedly swapping the element with its parent until the heap property is restored or the element reaches the root.

```
Insert 2 into [1, 3, 5, 7, 4, 8, 6]:

Step 0: [1, 3, 5, 7, 4, 8, 6, 2]    ← 2 appended at index 7
                                        parent(7) = 3, at index 3
                                        2 < 7, so swap

Step 1: [1, 3, 5, 2, 4, 8, 6, 7]    ← 2 now at index 3
                                        parent(3) = 1, at index 1
                                        2 < 3, so swap

Step 2: [1, 2, 5, 3, 4, 8, 6, 7]    ← 2 now at index 1
                                        parent(1) = 0, at index 0
                                        2 > 1, stop
```

The implementation:

```typescript
private siftUp(index: number): void {
  while (index > 0) {
    const parent = parentIndex(index);
    if (this.compare(this.data[index]!, this.data[parent]!) < 0) {
      this.swap(index, parent);
      index = parent;
    } else {
      break;
    }
  }
}
```

Since the tree has height $\lfloor \log_2 n \rfloor$, sift-up performs at most $O(\log n)$ swaps.

### Sift-down (sink)

When we remove the root, we replace it with the last element in the array. This element is likely too large for the root position. **Sift-down** fixes this by repeatedly swapping the element with its smaller child (in a min-heap) until the heap property is restored or the element reaches a leaf.

```
Extract min from [1, 2, 5, 3, 4, 8, 6, 7]:

Step 0: Remove root (1), move last element (7) to root:
        [7, 2, 5, 3, 4, 8, 6]

Step 1: Compare 7 with children 2 (left) and 5 (right).
        Smallest child is 2 at index 1. 7 > 2, so swap.
        [2, 7, 5, 3, 4, 8, 6]

Step 2: Compare 7 with children 3 (left) and 4 (right).
        Smallest child is 3 at index 3. 7 > 3, so swap.
        [2, 3, 5, 7, 4, 8, 6]

Step 3: Index 3 has no children within bounds. Stop.
```

The implementation:

```typescript
private siftDown(index: number): void {
  const n = this.data.length;
  while (true) {
    let best = index;
    const left = leftIndex(index);
    const right = rightIndex(index);

    if (left < n && this.compare(this.data[left]!, this.data[best]!) < 0) {
      best = left;
    }
    if (right < n && this.compare(this.data[right]!, this.data[best]!) < 0) {
      best = right;
    }
    if (best === index) break;
    this.swap(index, best);
    index = best;
  }
}
```

Like sift-up, sift-down performs at most $O(\log n)$ swaps.

### Insert

Insertion appends the new element to the end of the array (maintaining the shape property) and then sift-ups to restore the heap property:

```typescript
insert(value: T): void {
  this.data.push(value);
  this.siftUp(this.data.length - 1);
}
```

Time: $O(\log n)$. The `push` is $O(1)$ amortized, and sift-up traverses at most $\lfloor \log_2 n \rfloor$ levels.

### Extract

Extraction removes the root (the minimum element in a min-heap), replaces it with the last element, and sift-downs:

```typescript
extract(): T | undefined {
  if (this.data.length === 0) return undefined;
  if (this.data.length === 1) return this.data.pop()!;

  const root = this.data[0]!;
  this.data[0] = this.data.pop()!;
  this.siftDown(0);
  return root;
}
```

Time: $O(\log n)$. Moving the last element to the root is $O(1)$, and sift-down traverses at most $\lfloor \log_2 n \rfloor$ levels.

### Decrease-key

The **decrease-key** operation replaces an element's value with a smaller one (higher priority in a min-heap) and sift-ups to restore order. This operation is essential for algorithms like Dijkstra's, where we discover shorter paths and need to update a vertex's tentative distance.

```typescript
decreaseKey(index: number, newValue: T): void {
  if (index < 0 || index >= this.data.length) {
    throw new RangeError(
      `Index ${index} out of bounds [0, ${this.data.length})`
    );
  }
  if (this.compare(newValue, this.data[index]!) > 0) {
    throw new Error('New value has lower priority than the current value');
  }
  this.data[index] = newValue;
  this.siftUp(index);
}
```

Time: $O(\log n)$, since sift-up traverses at most the height of the tree.

Note that decrease-key requires knowing the index of the element to update. In practice, algorithms that use decrease-key maintain a separate map from elements to their heap indices, updating it during every swap.

## Building a heap in $O(n)$

The naive approach to building a heap from $n$ elements is to insert them one at a time: $n$ insertions at $O(\log n)$ each, for $O(n \log n)$ total. But we can do better.

**Floyd's build-heap algorithm** (1964) starts with the elements in arbitrary order and applies sift-down to every non-leaf node, working from the bottom of the tree to the root:

```typescript
static from<T>(
  elements: T[],
  comparator?: Comparator<T>,
): BinaryHeap<T> {
  const heap = new BinaryHeap<T>(comparator);
  heap.data = elements.slice();
  heap.buildHeap();
  return heap;
}

private buildHeap(): void {
  for (let i = parentIndex(this.data.length - 1); i >= 0; i--) {
    this.siftDown(i);
  }
}
```

### Why is this $O(n)$?

The key insight is that most nodes are near the bottom of the tree, where sift-down is cheap. In a complete binary tree with $n$ nodes:

- $\lceil n/2 \rceil$ nodes are leaves (height 0) — sift-down does 0 swaps
- $\lceil n/4 \rceil$ nodes are at height 1 — sift-down does at most 1 swap
- $\lceil n/8 \rceil$ nodes are at height 2 — sift-down does at most 2 swaps
- In general, $\lceil n / 2^{h+1} \rceil$ nodes are at height $h$, each doing at most $h$ swaps

The total work is:

$$\sum_{h=0}^{\lfloor \log_2 n \rfloor} \left\lceil \frac{n}{2^{h+1}} \right\rceil \cdot h \leq \frac{n}{2} \sum_{h=0}^{\infty} \frac{h}{2^h}$$

The series $\sum_{h=0}^{\infty} h / 2^h = 2$ (this can be derived by differentiating the geometric series $\sum x^h = 1/(1-x)$ and setting $x = 1/2$). Therefore:

$$\text{Total work} \leq \frac{n}{2} \cdot 2 = n = O(n)$$

This is a remarkable result: building a heap is **linear**, not $O(n \log n)$. The intuition is that the expensive sift-downs (for nodes near the root) apply to very few nodes, while the cheap sift-downs (for nodes near the bottom) apply to many.

### Why not sift-up?

If we tried to build a heap by sifting *up* from the first node to the last (simulating $n$ insertions), the analysis would be:

$$\sum_{h=0}^{\lfloor \log_2 n \rfloor} \left\lceil \frac{n}{2^{h+1}} \right\rceil \cdot (\lfloor \log_2 n \rfloor - h) = \Theta(n \log n)$$

The problem is that the many leaf nodes would each sift up $O(\log n)$ levels. Floyd's algorithm avoids this by processing nodes top-down (from the perspective of sift-down), so leaves do no work at all.

## The priority queue interface

Our `PriorityQueue<T>` class wraps a `BinaryHeap` to provide a cleaner interface for the common case where each value has an associated numeric priority:

```typescript
export interface PQEntry<T> {
  value: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: BinaryHeap<PQEntry<T>>;

  constructor() {
    this.heap = new BinaryHeap<PQEntry<T>>(
      (a, b) => a.priority - b.priority
    );
  }

  enqueue(value: T, priority: number): void {
    this.heap.insert({ value, priority });
  }

  dequeue(): T | undefined {
    const entry = this.heap.extract();
    return entry?.value;
  }

  peek(): T | undefined {
    return this.heap.peek()?.value;
  }

  changePriority(value: T, newPriority: number): boolean {
    const arr = this.heap.toArray();
    const idx = arr.findIndex((e) => Object.is(e.value, value));
    if (idx === -1) return false;

    arr[idx] = { value, priority: newPriority };
    this.heap = BinaryHeap.from<PQEntry<T>>(
      arr,
      (a, b) => a.priority - b.priority,
    );
    return true;
  }
}
```

Lower numeric priority values are dequeued first. To create a max-priority queue, negate the priorities when enqueuing.

The `changePriority` method finds the entry by value identity (`Object.is`) and rebuilds the heap. This is $O(n)$ due to the linear scan. For Dijkstra's algorithm and similar performance-critical use cases, it is better to use `BinaryHeap` directly with an auxiliary index map for $O(\log n)$ decrease-key — we will see this in Chapter 13.

## Min-heap vs. max-heap

Our implementation uses the comparator pattern to support both min-heaps and max-heaps without separate classes:

```typescript
// Min-heap (default): smallest element at root
const minHeap = new BinaryHeap<number>();

// Max-heap: largest element at root
const maxHeap = new BinaryHeap<number>((a, b) => b - a);
```

The only difference is the comparator. When `compare(a, b) < 0`, element `a` has higher priority and should be closer to the root. For a min-heap, we want the smallest element at the root, so `compare(a, b) = a - b` makes smaller values "win." For a max-heap, `compare(a, b) = b - a` reverses the ordering.

This is the same pattern used by `Array.prototype.sort` in JavaScript and by the `Comparator<T>` type used throughout this book.

## Applications

### Heap sort

We saw heap sort in Chapter 5: build a max-heap from the input, then repeatedly extract the maximum and place it at the end of the array. The `BinaryHeap` class in this chapter is the data structure that heap sort uses internally. Heap sort achieves $O(n \log n)$ worst-case time and $O(1)$ extra space (when done in-place on the array).

### Running median

Given a stream of numbers, maintain the median at all times. Use two heaps:

- A **max-heap** for the lower half of the numbers.
- A **min-heap** for the upper half.

When a new number arrives, insert it into the appropriate heap and rebalance so the heaps differ in size by at most 1. The median is the root of the larger heap (or the average of both roots if they are equal in size). Each insertion takes $O(\log n)$.

### Event-driven simulation

Model a system as a series of events, each with a timestamp. Store events in a min-heap ordered by time. At each step, extract the earliest event, process it (which may generate new events), and insert any new events. The heap ensures events are always processed in chronological order.

### $k$ smallest / largest elements

To find the $k$ smallest elements in an unsorted array of $n$ elements:

1. Build a min-heap in $O(n)$.
2. Extract $k$ times for a total of $O(k \log n)$.

If $k \ll n$, this is much faster than sorting the entire array.

Alternatively, maintain a max-heap of size $k$. Scan the array; if an element is smaller than the heap's maximum, extract the max and insert the new element. This uses $O(k)$ space and $O(n \log k)$ time.

## Complexity summary

| Operation | Time | Space |
|-----------|------|-------|
| `peek` | $O(1)$ | $O(1)$ |
| `insert` | $O(\log n)$ | $O(1)$ amortized |
| `extract` | $O(\log n)$ | $O(1)$ |
| `decreaseKey` | $O(\log n)$ | $O(1)$ |
| `buildHeap` (from array) | $O(n)$ | $O(n)$ for copy |
| `size` / `isEmpty` | $O(1)$ | $O(1)$ |

The space for the entire heap is $O(n)$, since it is stored as a contiguous array.

Compared to balanced BSTs, heaps trade away sorted-order iteration and efficient search ($O(n)$ to find an arbitrary element) in exchange for simpler implementation, better constant factors, and cache-friendly array storage. If you only need insert and extract-min, a heap is the right choice.

## Exercises

**Exercise 11.1.** Starting from an empty min-heap, insert the values 15, 10, 20, 8, 25, 12, 5, 18 one at a time. After each insertion, draw the heap as both a tree and an array. Verify the heap property holds at every step.

**Exercise 11.2.** Use Floyd's build-heap algorithm to construct a min-heap from the array $[16, 14, 10, 8, 7, 9, 3, 2, 4, 1]$. Show the array after processing each non-leaf node (from right to left). How many total swaps are performed? Compare this with the number of swaps that would result from inserting the elements one by one.

**Exercise 11.3.** Prove that the number of leaves in a complete binary tree stored in an array of length $n$ is $\lceil n/2 \rceil$. (Hint: the last non-leaf node is at index $\lfloor(n-1)/2\rfloor$.)

**Exercise 11.4.** Design a data structure that supports `insert`, `findMin`, and `findMax` in $O(\log n)$ time, and `extractMin` and `extractMax` in $O(\log n)$ time. (Hint: maintain both a min-heap and a max-heap simultaneously, with cross-references between corresponding entries.)

**Exercise 11.5.** Implement a _running median_ data structure that supports `insert(x)` in $O(\log n)$ and `median()` in $O(1)$. Use two heaps: a max-heap for the lower half and a min-heap for the upper half. Write tests that insert a stream of 1000 random numbers and verify the median is correct after each insertion by comparing with a sorted-array baseline.

## Summary

A **binary heap** is a complete binary tree stored in an array that maintains the heap property: every parent has higher priority than its children. This partial ordering — weaker than a sorted order — is cheaper to maintain and provides $O(\log n)$ insertion and extraction of the highest-priority element, with $O(1)$ peek.

The two fundamental operations are **sift-up** (restore order after insertion at the bottom) and **sift-down** (restore order after removal from the root). Floyd's **build-heap** algorithm constructs a heap from an arbitrary array in $O(n)$ time — a result that follows from the observation that most nodes in a complete tree are near the bottom where sift-down is cheap.

The **priority queue** abstraction — enqueue with a priority, dequeue the highest-priority element — is directly implemented by a binary heap and is central to many graph algorithms (Dijkstra, Prim, Huffman). In the next chapters, we will put priority queues to work: Chapter 12 introduces graphs and graph traversal, and Chapter 13 uses priority queues as the backbone of Dijkstra's shortest-path algorithm.
