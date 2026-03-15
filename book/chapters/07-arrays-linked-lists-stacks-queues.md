# Arrays, Linked Lists, Stacks, and Queues

_The algorithms of the preceding chapters operate on arrays — contiguous blocks of memory indexed by integers. Arrays are powerful but they are only one of many ways to organize data. In this chapter we study the fundamental data structures that underpin nearly all of Computer Science: dynamic arrays, linked lists, stacks, queues, and deques. Each offers a different set of trade-offs between time complexity, memory usage, and flexibility. Understanding these structures deeply is essential, because every higher-level data structure — from hash tables to balanced trees to graphs — is built on top of them._

## Arrays

An **array** is the simplest data structure: a contiguous block of memory divided into equal-sized slots, each identified by an integer index. Accessing any element by its index takes $O(1)$ time, because the memory address can be computed directly: if the array starts at address $b$ and each element occupies $s$ bytes, then element $i$ lives at address $b + i \cdot s$.

This direct addressing makes arrays extremely efficient for random access. However, arrays have a fundamental limitation: their size is fixed at creation time. If we need to store more elements than the array can hold, we must allocate a new, larger array and copy all existing elements — an $O(n)$ operation.

### Static arrays in TypeScript

TypeScript (and JavaScript) arrays are actually dynamic — they resize automatically behind the scenes. But to understand the foundations, imagine a fixed-size array:

```typescript
const fixed = new Array<number>(10); // 10 slots, all undefined
fixed[0] = 42;
fixed[9] = 99;
// fixed[10] would be out of bounds in a true static array
```

In languages like C or Java, going beyond the allocated size is either a compile-time error or a runtime crash. JavaScript's built-in arrays hide this complexity, but the cost of resizing is still there — it is just managed for us. Let us see how.

## Dynamic arrays

A **dynamic array** maintains an internal buffer that is larger than the number of elements currently stored. When the buffer fills up, the array allocates a new buffer of double the size and copies all elements over. This doubling strategy gives us amortized $O(1)$ appends while keeping worst-case access at $O(1)$.

### The doubling strategy

Suppose our dynamic array has capacity $c$ and currently holds $n$ elements. When we append element $n + 1$:

- If $n < c$: store the element in slot $n$. Cost: $O(1)$.
- If $n = c$: allocate a new buffer of size $2c$, copy all $n$ elements, then store the new element. Cost: $O(n)$.

The key insight is that expensive copies happen rarely. After a copy doubles the capacity to $2c$, we can perform another $c$ cheap appends before the next copy. This is the essence of **amortized analysis**.

### Amortized analysis of append

We use the **aggregate method**. Starting from an empty array with initial capacity 1, suppose we perform $n$ appends. Copies happen when the size reaches 1, 2, 4, 8, ..., up to some power of 2. The total number of element copies across all resizes is:

$$1 + 2 + 4 + 8 + \cdots + 2^{\lfloor \log_2 n \rfloor} \leq 2n$$

So the total cost of $n$ appends is at most $n$ (for the stores) plus $2n$ (for all the copies), giving $3n$ total. The amortized cost per append is therefore $3n / n = O(1)$.

### Implementation

Our `DynamicArray<T>` uses a plain JavaScript array as the backing buffer, with explicit capacity management. The initial capacity defaults to 4.

```typescript
export class DynamicArray<T> implements Iterable<T> {
  private data: (T | undefined)[];
  private length: number;

  constructor(initialCapacity = 4) {
    this.data = new Array<T | undefined>(initialCapacity);
    this.length = 0;
  }

  get size(): number {
    return this.length;
  }

  get capacity(): number {
    return this.data.length;
  }

  get(index: number): T {
    this.checkBounds(index);
    return this.data[index] as T;
  }

  set(index: number, value: T): void {
    this.checkBounds(index);
    this.data[index] = value;
  }

  append(value: T): void {
    if (this.length === this.data.length) {
      this.resize(this.data.length * 2);
    }
    this.data[this.length] = value;
    this.length++;
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this.length) {
      throw new RangeError(
        `Index ${index} out of bounds for size ${this.length}`
      );
    }
    if (this.length === this.data.length) {
      this.resize(this.data.length * 2);
    }
    for (let i = this.length; i > index; i--) {
      this.data[i] = this.data[i - 1];
    }
    this.data[index] = value;
    this.length++;
  }

  remove(index: number): T {
    this.checkBounds(index);
    const value = this.data[index] as T;
    for (let i = index; i < this.length - 1; i++) {
      this.data[i] = this.data[i + 1];
    }
    this.data[this.length - 1] = undefined;
    this.length--;
    if (
      this.length > 0 &&
      this.length <= this.data.length / 4 &&
      this.data.length > 4
    ) {
      this.resize(Math.max(4, Math.floor(this.data.length / 2)));
    }
    return value;
  }

  private resize(newCapacity: number): void {
    const newData = new Array<T | undefined>(newCapacity);
    for (let i = 0; i < this.length; i++) {
      newData[i] = this.data[i];
    }
    this.data = newData;
  }

  private checkBounds(index: number): void {
    if (index < 0 || index >= this.length) {
      throw new RangeError(
        `Index ${index} out of bounds for size ${this.length}`
      );
    }
  }
  // ... iterator, toArray, etc.
}
```

Notice that `remove` also implements **shrinking**: when occupancy falls below 25%, the buffer is halved (but never below 4). This prevents a long sequence of removals from wasting memory, and the halving threshold (1/4 rather than 1/2) avoids **thrashing** — a pathological pattern where alternating appends and removes near the boundary trigger repeated resizes.

### Complexity summary

| Operation | Time | Notes |
|-----------|------|-------|
| `get(i)` / `set(i, v)` | $O(1)$ | Direct index access |
| `append(v)` | $O(1)$ amortized | $O(n)$ worst case during resize |
| `insert(i, v)` | $O(n)$ | Must shift elements right |
| `remove(i)` | $O(n)$ | Must shift elements left |
| `indexOf(v)` | $O(n)$ | Linear scan |

## Linked lists

A **linked list** stores elements in nodes that are scattered throughout memory, with each node containing a value and a pointer (reference) to the next node. Unlike arrays, linked lists do not require contiguous memory, and inserting or removing an element at a known position takes $O(1)$ time — no shifting required.

The trade-off is that random access is lost: to reach the $i$th element, we must follow $i$ pointers from the head, taking $O(i)$ time.

### Singly linked lists

In a **singly linked list**, each node points to the next node. The list maintains a pointer to the **head** (first node) and, for efficiency, a pointer to the **tail** (last node).

```
head → [10 | •] → [20 | •] → [30 | null]
                                ↑
                              tail
```

#### Implementation

```typescript
class SinglyNode<T> {
  constructor(
    public value: T,
    public next: SinglyNode<T> | null = null,
  ) {}
}

export class SinglyLinkedList<T> implements Iterable<T> {
  private head: SinglyNode<T> | null = null;
  private tail: SinglyNode<T> | null = null;
  private length: number = 0;

  get size(): number {
    return this.length;
  }

  prepend(value: T): void {
    const node = new SinglyNode(value, this.head);
    this.head = node;
    if (this.tail === null) {
      this.tail = node;
    }
    this.length++;
  }

  append(value: T): void {
    const node = new SinglyNode(value);
    if (this.tail !== null) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.length++;
  }

  removeFirst(): T | undefined {
    if (this.head === null) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head === null) {
      this.tail = null;
    }
    this.length--;
    return value;
  }

  delete(value: T): boolean {
    if (this.head === null) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      if (this.head === null) this.tail = null;
      this.length--;
      return true;
    }
    let current = this.head;
    while (current.next !== null) {
      if (current.next.value === value) {
        if (current.next === this.tail) this.tail = current;
        current.next = current.next.next;
        this.length--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  find(value: T): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.value === value) return true;
      current = current.next;
    }
    return false;
  }
  // ... iterator, toArray, etc.
}
```

#### Tracing through an example

Starting with an empty singly linked list, let us perform a sequence of operations:

| Operation | List state | `size` |
|-----------|-----------|--------|
| `append(10)` | `[10]` | 1 |
| `append(20)` | `[10] → [20]` | 2 |
| `prepend(5)` | `[5] → [10] → [20]` | 3 |
| `removeFirst()` → 5 | `[10] → [20]` | 2 |
| `delete(20)` → true | `[10]` | 1 |
| `append(30)` | `[10] → [30]` | 2 |

Notice that `prepend` and `removeFirst` are both $O(1)$ because they only touch the head pointer. Appending is $O(1)$ because we maintain a tail pointer. However, `delete(value)` requires a linear scan.

#### A limitation of singly linked lists

Removing the _last_ element is $O(n)$ in a singly linked list, because we must traverse the entire list to find the node that precedes the tail. The doubly linked list solves this problem.

### Doubly linked lists

In a **doubly linked list**, each node has pointers to both the next _and_ previous nodes. This enables $O(1)$ removal from both ends.

```
null ← [10 | •] ⇄ [20 | •] ⇄ [30 | •] → null
        ↑                        ↑
       head                    tail
```

#### Implementation

```typescript
class DoublyNode<T> {
  constructor(
    public value: T,
    public prev: DoublyNode<T> | null = null,
    public next: DoublyNode<T> | null = null,
  ) {}
}

export class DoublyLinkedList<T> implements Iterable<T> {
  private head: DoublyNode<T> | null = null;
  private tail: DoublyNode<T> | null = null;
  private length: number = 0;

  get size(): number {
    return this.length;
  }

  prepend(value: T): void {
    const node = new DoublyNode(value, null, this.head);
    if (this.head !== null) {
      this.head.prev = node;
    } else {
      this.tail = node;
    }
    this.head = node;
    this.length++;
  }

  append(value: T): void {
    const node = new DoublyNode(value, this.tail, null);
    if (this.tail !== null) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.length++;
  }

  removeFirst(): T | undefined {
    if (this.head === null) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head !== null) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }
    this.length--;
    return value;
  }

  removeLast(): T | undefined {
    if (this.tail === null) return undefined;
    const value = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail !== null) {
      this.tail.next = null;
    } else {
      this.head = null;
    }
    this.length--;
    return value;
  }

  private removeNode(node: DoublyNode<T>): void {
    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    this.length--;
  }
  // ... delete, find, iterators, etc.
}
```

The critical advantage is `removeLast`: by following the tail's `prev` pointer, we can unlink the last node in $O(1)$ time without traversing the list. The `removeNode` helper detaches any node from the list in $O(1)$ once we have a reference to it.

The cost of this flexibility is extra memory: each node stores two pointers instead of one. For large collections of small values, this overhead can be significant.

### Comparing arrays and linked lists

| Operation | Dynamic array | Singly linked list | Doubly linked list |
|-----------|:---:|:---:|:---:|
| Access by index | $O(1)$ | $O(n)$ | $O(n)$ |
| Prepend | $O(n)$ | $O(1)$ | $O(1)$ |
| Append | $O(1)$\* | $O(1)$ | $O(1)$ |
| Remove first | $O(n)$ | $O(1)$ | $O(1)$ |
| Remove last | $O(1)$\* | $O(n)$ | $O(1)$ |
| Insert at known position | $O(n)$ | $O(1)$ | $O(1)$ |
| Search | $O(n)$ | $O(n)$ | $O(n)$ |
| Memory per element | Low (contiguous) | +1 pointer | +2 pointers |
| Cache performance | Excellent | Poor | Poor |

\* Amortized

**When to use which:**

- **Dynamic array** when you need fast random access or are iterating sequentially (cache-friendly).
- **Singly linked list** when insertions and deletions at the front dominate.
- **Doubly linked list** when you need efficient removal from both ends or deletion of arbitrary nodes (given a reference).

In practice, arrays and dynamic arrays dominate due to cache locality — modern CPUs are optimized for accessing contiguous memory. Linked lists shine in scenarios where elements are frequently inserted or removed at the endpoints, or when the data is too large to copy during a resize.

## Abstract data types: stacks, queues, and deques

The data structures above — arrays and linked lists — are concrete implementations. Now we turn to **abstract data types** (ADTs): specifications of behavior that can be implemented in multiple ways. A stack, for instance, defines _what_ operations are available (push, pop, peek) and _what_ they do, without prescribing _how_ to store the elements.

### Stacks

A **stack** is a Last-In, First-Out (LIFO) collection. The most recently added element is the first one to be removed, like a stack of plates.

#### Interface

```typescript
interface IStack<T> {
  push(value: T): void;     // Add to top
  pop(): T | undefined;      // Remove and return top
  peek(): T | undefined;     // Return top without removing
  readonly size: number;
  readonly isEmpty: boolean;
}
```

#### Implementation

A stack is naturally implemented as a linked list where both `push` and `pop` operate on the head:

```typescript
export class Stack<T> implements IStack<T>, Iterable<T> {
  private head: { value: T; next: unknown } | null = null;
  private length: number = 0;

  get size(): number { return this.length; }
  get isEmpty(): boolean { return this.length === 0; }

  push(value: T): void {
    this.head = { value, next: this.head };
    this.length++;
  }

  pop(): T | undefined {
    if (this.head === null) return undefined;
    const value = this.head.value;
    this.head = this.head.next as typeof this.head;
    this.length--;
    return value;
  }

  peek(): T | undefined {
    return this.head?.value;
  }
}
```

All three operations — `push`, `pop`, `peek` — are $O(1)$.

We could equally implement a stack with a dynamic array (push = append, pop = remove last). The array-based version has better cache locality, while the linked-list version avoids occasional resize costs. For most purposes in TypeScript, the built-in array with `push`/`pop` is the pragmatic choice; our implementation here serves pedagogical purposes.

#### Applications

Stacks appear throughout Computer Science:

- **Function call stack.** When a function is called, its local variables and return address are pushed onto the call stack. When it returns, they are popped. This is why recursive algorithms can overflow the stack with too many nested calls.
- **Parenthesis matching.** To check whether brackets are balanced in an expression like `((a + b) * c)`, push each opening bracket and pop when a matching closing bracket is found.
- **Undo/redo.** Text editors push each action onto an undo stack. Undoing pops the most recent action.
- **Depth-first search.** DFS uses a stack (often the call stack via recursion) to track which vertices to visit next.

#### Tracing through an example

| Operation | Stack (top → bottom) | Returned |
|-----------|---------------------|----------|
| `push(10)` | `10` | — |
| `push(20)` | `20, 10` | — |
| `push(30)` | `30, 20, 10` | — |
| `peek()` | `30, 20, 10` | 30 |
| `pop()` | `20, 10` | 30 |
| `pop()` | `10` | 20 |
| `push(40)` | `40, 10` | — |
| `pop()` | `10` | 40 |
| `pop()` | _(empty)_ | 10 |

### Queues

A **queue** is a First-In, First-Out (FIFO) collection. Elements are added at the back and removed from the front, like a line of people waiting.

#### Interface

```typescript
interface IQueue<T> {
  enqueue(value: T): void;    // Add to back
  dequeue(): T | undefined;   // Remove and return front
  peek(): T | undefined;      // Return front without removing
  readonly size: number;
  readonly isEmpty: boolean;
}
```

#### Implementation

A queue maps naturally onto a singly linked list with head and tail pointers: `enqueue` appends at the tail, `dequeue` removes from the head.

```typescript
interface QueueNode<T> {
  value: T;
  next: QueueNode<T> | null;
}

export class Queue<T> implements IQueue<T>, Iterable<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private length: number = 0;

  get size(): number { return this.length; }
  get isEmpty(): boolean { return this.length === 0; }

  enqueue(value: T): void {
    const node: QueueNode<T> = { value, next: null };
    if (this.tail !== null) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.length++;
  }

  dequeue(): T | undefined {
    if (this.head === null) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head === null) this.tail = null;
    this.length--;
    return value;
  }

  peek(): T | undefined {
    return this.head?.value;
  }
}
```

All operations are $O(1)$.

An array-based queue is trickier: naively dequeuing from the front of an array is $O(n)$ because every element must shift. A **circular buffer** solves this by wrapping indices around modulo the capacity, giving $O(1)$ amortized enqueue and dequeue. Our linked-list implementation avoids this complexity altogether.

#### Applications

- **Breadth-first search.** BFS uses a queue to explore vertices level by level.
- **Task scheduling.** Operating systems use queues to schedule processes for CPU time.
- **Buffering.** Data streams (network packets, keyboard input) are buffered in queues.
- **Level-order tree traversal.** Visiting tree nodes level by level requires a queue.

#### Tracing through an example

| Operation | Queue (front → back) | Returned |
|-----------|---------------------|----------|
| `enqueue(10)` | `10` | — |
| `enqueue(20)` | `10, 20` | — |
| `enqueue(30)` | `10, 20, 30` | — |
| `peek()` | `10, 20, 30` | 10 |
| `dequeue()` | `20, 30` | 10 |
| `dequeue()` | `30` | 20 |
| `enqueue(40)` | `30, 40` | — |
| `dequeue()` | `40` | 30 |

### Deques

A **deque** (double-ended queue, pronounced "deck") supports insertion and removal at _both_ ends in $O(1)$ time. It generalizes both stacks and queues.

#### Implementation

A deque maps directly onto a doubly linked list:

```typescript
interface DequeNode<T> {
  value: T;
  prev: DequeNode<T> | null;
  next: DequeNode<T> | null;
}

export class Deque<T> implements Iterable<T> {
  private head: DequeNode<T> | null = null;
  private tail: DequeNode<T> | null = null;
  private length: number = 0;

  get size(): number { return this.length; }
  get isEmpty(): boolean { return this.length === 0; }

  pushFront(value: T): void {
    const node: DequeNode<T> = { value, prev: null, next: this.head };
    if (this.head !== null) {
      this.head.prev = node;
    } else {
      this.tail = node;
    }
    this.head = node;
    this.length++;
  }

  pushBack(value: T): void {
    const node: DequeNode<T> = { value, prev: this.tail, next: null };
    if (this.tail !== null) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.length++;
  }

  popFront(): T | undefined {
    if (this.head === null) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head !== null) this.head.prev = null;
    else this.tail = null;
    this.length--;
    return value;
  }

  popBack(): T | undefined {
    if (this.tail === null) return undefined;
    const value = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail !== null) this.tail.next = null;
    else this.head = null;
    this.length--;
    return value;
  }

  peekFront(): T | undefined { return this.head?.value; }
  peekBack(): T | undefined { return this.tail?.value; }
}
```

All six operations — `pushFront`, `pushBack`, `popFront`, `popBack`, `peekFront`, `peekBack` — are $O(1)$.

#### Using a deque as a stack or queue

A deque subsumes both stacks and queues:

- **As a stack:** use `pushFront` / `popFront` (or `pushBack` / `popBack`).
- **As a queue:** use `pushBack` / `popFront`.

This flexibility makes the deque a useful building block when the access pattern is uncertain, or when both ends are needed.

#### Applications

- **Sliding window maximum.** In the classic interview problem "maximum in every window of size $k$," a deque holds indices of potential maximums. Elements are added at the back and removed from the front (when they fall out of the window) or from the back (when a larger element supersedes them).
- **Work-stealing schedulers.** Each thread has a deque of tasks. It pops from its own front, while idle threads steal from other deques' backs.
- **Palindrome checking.** Push characters from both ends; pop from both ends and compare.

## Complexity comparison

| | `DynamicArray` | `SinglyLinkedList` | `DoublyLinkedList` | `Stack` | `Queue` | `Deque` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Add front | $O(n)$ | $O(1)$ | $O(1)$ | $O(1)$ | — | $O(1)$ |
| Add back | $O(1)$\* | $O(1)$ | $O(1)$ | — | $O(1)$ | $O(1)$ |
| Remove front | $O(n)$ | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| Remove back | $O(1)$\* | $O(n)$ | $O(1)$ | — | — | $O(1)$ |
| Access by index | $O(1)$ | $O(n)$ | $O(n)$ | — | — | — |
| Search | $O(n)$ | $O(n)$ | $O(n)$ | — | — | — |

\* Amortized

## Exercises

**Exercise 7.1.** Implement a function `isBalanced(expression: string): boolean` that uses a `Stack` to determine whether the parentheses `()`, brackets `[]`, and braces `{}` in an expression are properly balanced. For example, `isBalanced("((a+b)*[c-d])")` should return `false` (mismatched outer parentheses), while `isBalanced("{a*(b+c)}")` should return `true`.

**Exercise 7.2.** Implement a circular buffer–based queue. Use a fixed-size array and two indices (`front` and `back`) that wrap around using modular arithmetic. Compare its performance characteristics with our linked-list–based `Queue`.

**Exercise 7.3.** Implement a `MinStack<T>` that supports `push`, `pop`, `peek`, and an additional `min()` operation that returns the minimum element in the stack — all in $O(1)$ time. _Hint:_ maintain a second stack that tracks minimums.

**Exercise 7.4.** Using only two `Stack`s, implement a `Queue`. Analyze the amortized time complexity of `enqueue` and `dequeue`. _Hint:_ use one stack for enqueuing and another for dequeuing; transfer elements between them lazily.

**Exercise 7.5.** Implement a function `slidingWindowMax(arr: number[], k: number): number[]` that returns the maximum value in each window of size $k$ as the window slides from left to right across the array. Use a `Deque` to achieve $O(n)$ time complexity.

## Summary

This chapter introduced the foundational data structures upon which nearly everything else is built:

- **Dynamic arrays** provide $O(1)$ random access and $O(1)$ amortized append via the doubling strategy. Insert and remove at arbitrary positions cost $O(n)$ due to shifting.
- **Singly linked lists** offer $O(1)$ insertion and removal at the head, and $O(1)$ append with a tail pointer, but sacrifice random access and efficient removal from the tail.
- **Doubly linked lists** add back-pointers for $O(1)$ removal at both ends, at the cost of extra memory per node.
- **Stacks** (LIFO) are the workhorse of recursion, expression evaluation, and depth-first search.
- **Queues** (FIFO) power breadth-first search, task scheduling, and buffering.
- **Deques** generalize stacks and queues, supporting $O(1)$ operations at both ends.

The choice between arrays and linked lists comes down to access patterns. If you need random access or sequential iteration (where cache locality matters), use an array. If insertions and deletions at the endpoints dominate, use a linked list. When in doubt, the dynamic array is usually the right default — it is what most languages provide as their standard collection.

In the next chapter, we will use these building blocks to construct **hash tables**, which achieve expected $O(1)$ lookup by combining arrays with a hash function.
