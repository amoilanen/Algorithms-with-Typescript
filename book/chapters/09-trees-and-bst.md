# Trees and Binary Search Trees

_Hash tables give us expected $O(1)$ lookups, but they cannot answer order-based queries: what is the smallest key? What is the next key after $k$? What are all keys in the range $[a, b]$? Trees restore this capability. A binary search tree stores elements in a way that mirrors binary search — at every node, all smaller elements are to the left and all larger elements are to the right. This gives us $O(h)$ search, insert, and delete operations, where $h$ is the height of the tree. In this chapter we develop the fundamental vocabulary of trees, study the four standard traversal orders, and build a complete binary search tree implementation._

## Tree terminology

A **tree** is a connected, acyclic graph. In Computer Science we almost always work with **rooted trees**, where one node is designated as the **root** and all other nodes are arranged in a parent-child hierarchy descending from it.

Key definitions:

- **Node**: an element of the tree, containing a value and links to its children.
- **Root**: the topmost node; it has no parent.
- **Parent**: the node directly above a given node.
- **Child**: a node directly below a given node.
- **Leaf**: a node with no children (also called an **external node**).
- **Internal node**: a node with at least one child.
- **Sibling**: nodes that share the same parent.
- **Subtree**: the tree rooted at a given node, consisting of that node and all its descendants.
- **Depth** of a node: the number of edges from the root to that node. The root has depth 0.
- **Height** of a node: the number of edges on the longest path from that node down to a leaf. A leaf has height 0.
- **Height of the tree**: the height of the root. An empty tree has height $-1$ by convention.
- **Level** $k$: the set of all nodes at depth $k$.
- **Degree** of a node: the number of children it has.

## Binary trees

A **binary tree** is a tree in which every node has at most two children, called the **left child** and the **right child**. Binary trees are the most fundamental tree structure in Computer Science, underpinning search trees, heaps, expression parsers, and many other data structures.

### Representations

There are two common ways to represent a binary tree:

**Linked representation.** Each node is an object with a value and two pointers (`left` and `right`). This is the most flexible representation and the one we use throughout this book:

```typescript
class BinaryTreeNode<T> {
  constructor(
    public value: T,
    public left: BinaryTreeNode<T> | null = null,
    public right: BinaryTreeNode<T> | null = null,
  ) {}
}
```

**Array representation.** For a complete binary tree (where every level except possibly the last is fully filled), we can store nodes in an array by level order. The root is at index 0, and for a node at index $i$:

- Left child: $2i + 1$
- Right child: $2i + 2$
- Parent: $\lfloor (i - 1) / 2 \rfloor$

This representation avoids pointer overhead and is used for binary heaps (Chapter 11).

### Properties of binary trees

A binary tree of height $h$ has:

- At most $2^{h+1} - 1$ nodes (when every level is full — a **perfect** binary tree).
- At least $h + 1$ nodes (when every internal node has exactly one child — a **degenerate** or **skewed** tree).
- At most $2^h$ leaves.

A binary tree with $n$ nodes has height between $\lfloor \log_2 n \rfloor$ and $n - 1$.

## Tree traversals

A **traversal** visits every node in the tree exactly once. The order of visitation defines the traversal type. For a binary tree, there are four standard traversals.

### Inorder traversal (left, root, right)

Visit the left subtree, then the root, then the right subtree. For a binary search tree, inorder traversal produces values in sorted order.

```
     1
    / \
   2   3
  / \   \
 4   5   6

Inorder: 4, 2, 5, 1, 3, 6
```

```typescript
inorder(): T[] {
  const result: T[] = [];
  this.inorderHelper(this.root, result);
  return result;
}

private inorderHelper(node: BinaryTreeNode<T> | null, result: T[]): void {
  if (node === null) return;
  this.inorderHelper(node.left, result);
  result.push(node.value);
  this.inorderHelper(node.right, result);
}
```

The recursion mirrors the traversal definition directly: recurse left, process the current node, recurse right.

### Preorder traversal (root, left, right)

Visit the root first, then the left subtree, then the right subtree. Preorder traversal is useful for serializing a tree (e.g., to reconstruct it later) because the root always comes before its children.

```
Preorder: 1, 2, 4, 5, 3, 6
```

```typescript
private preorderHelper(node: BinaryTreeNode<T> | null, result: T[]): void {
  if (node === null) return;
  result.push(node.value);
  this.preorderHelper(node.left, result);
  this.preorderHelper(node.right, result);
}
```

### Postorder traversal (left, right, root)

Visit the left subtree, then the right subtree, then the root. Postorder traversal processes children before their parent, making it useful for deleting a tree (free children before the parent) or evaluating expression trees (evaluate operands before the operator).

```
Postorder: 4, 5, 2, 6, 3, 1
```

```typescript
private postorderHelper(node: BinaryTreeNode<T> | null, result: T[]): void {
  if (node === null) return;
  this.postorderHelper(node.left, result);
  this.postorderHelper(node.right, result);
  result.push(node.value);
}
```

### Level-order traversal (breadth-first)

Visit nodes level by level, from left to right. Unlike the three depth-first traversals above, level-order traversal uses a queue rather than recursion:

```
Level-order: 1, 2, 3, 4, 5, 6
```

```typescript
levelOrder(): T[] {
  if (this.root === null) return [];

  const result: T[] = [];
  const queue: BinaryTreeNode<T>[] = [this.root];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node.value);
    if (node.left !== null) queue.push(node.left);
    if (node.right !== null) queue.push(node.right);
  }

  return result;
}
```

We enqueue the root, then repeatedly dequeue a node, process it, and enqueue its children. Since every node is enqueued and dequeued exactly once, the traversal is $O(n)$.

### Complexity of traversals

All four traversals visit every node exactly once, so they run in $O(n)$ time. The space complexity depends on the traversal:

- **Recursive traversals** (inorder, preorder, postorder): $O(h)$ stack space, where $h$ is the tree height. For a balanced tree this is $O(\log n)$; for a skewed tree it is $O(n)$.
- **Level-order traversal**: $O(w)$ space for the queue, where $w$ is the maximum width (number of nodes at any single level). For a complete binary tree, the last level has up to $n/2$ nodes, so the space is $O(n)$.

### Computing height and size

The **height** of a tree is computed recursively: the height of an empty tree is $-1$, and the height of a non-empty tree is one plus the maximum of the heights of its subtrees:

```typescript
private heightHelper(node: BinaryTreeNode<T> | null): number {
  if (node === null) return -1;
  return 1 + Math.max(
    this.heightHelper(node.left),
    this.heightHelper(node.right),
  );
}
```

The **size** (number of nodes) is similarly recursive:

```typescript
private sizeHelper(node: BinaryTreeNode<T> | null): number {
  if (node === null) return 0;
  return 1 + this.sizeHelper(node.left) + this.sizeHelper(node.right);
}
```

Both run in $O(n)$ time by visiting every node.

## Binary search trees

A **binary search tree** (BST) is a binary tree that satisfies the **BST property**: for every node $x$,

- all values in $x$'s left subtree are less than $x$'s value, and
- all values in $x$'s right subtree are greater than or equal to $x$'s value.

This property makes the tree a natural implementation of the dictionary abstract data type (Chapter 8), with the added ability to answer order-based queries.

```
       10
      /  \
     5    15
    / \   / \
   3   7 12  20
```

Every node in the left subtree of 10 (namely 3, 5, 7) is less than 10, and every node in the right subtree (12, 15, 20) is greater.

### BST node structure

Our BST nodes carry parent pointers, which simplify the successor and predecessor algorithms:

```typescript
class BSTNode<T> {
  constructor(
    public value: T,
    public left: BSTNode<T> | null = null,
    public right: BSTNode<T> | null = null,
    public parent: BSTNode<T> | null = null,
  ) {}
}
```

The `parent` pointer costs one extra reference per node but eliminates the need to maintain an explicit stack when walking up the tree.

### Search

To search for a value $v$, start at the root and compare $v$ with the current node's value. If $v$ is smaller, go left; if larger, go right; if equal, the node is found. If we reach a null pointer, the value is not in the tree.

```typescript
search(value: T): BSTNode<T> | null {
  let current = this.root;
  while (current !== null) {
    const cmp = this.compare(value, current.value);
    if (cmp === 0) return current;
    current = cmp < 0 ? current.left : current.right;
  }
  return null;
}
```

This is exactly binary search applied to a tree structure. At each step we eliminate one subtree, following a single root-to-leaf path. The running time is $O(h)$ where $h$ is the height of the tree.

### Insert

To insert a value, we walk the tree as in search until we reach a null position, then place the new node there:

```typescript
insert(value: T): void {
  const newNode = new BSTNode(value);

  if (this.root === null) {
    this.root = newNode;
    return;
  }

  let current = this.root;
  for (;;) {
    if (this.compare(value, current.value) < 0) {
      if (current.left === null) {
        current.left = newNode;
        newNode.parent = current;
        return;
      }
      current = current.left;
    } else {
      if (current.right === null) {
        current.right = newNode;
        newNode.parent = current;
        return;
      }
      current = current.right;
    }
  }
}
```

Insertion always adds a new leaf, so the tree's shape depends on the order of insertions. Inserting values in sorted order creates a degenerate (right-skewed) tree of height $n - 1$, while inserting in random order produces a tree of expected height $O(\log n)$.

### Tracing through insertions

Let us trace the insertion of values 10, 5, 15, 3, 7, 12, 20:

| Insert | Tree state |
|--------|-----------|
| 10 | `10` — root |
| 5  | `10` ← `5` goes left (5 < 10) |
| 15 | `10` → `15` goes right (15 ≥ 10) |
| 3  | `5` ← `3` goes left (3 < 5) |
| 7  | `5` → `7` goes right (7 ≥ 5) |
| 12 | `15` ← `12` goes left (12 < 15) |
| 20 | `15` → `20` goes right (20 ≥ 15) |

The result is a balanced tree of height 2:

```
       10
      /  \
     5    15
    / \   / \
   3   7 12  20
```

If instead we inserted 3, 5, 7, 10, 12, 15, 20 (sorted order), each value would go to the right of the previous one, producing a right-skewed linked list of height 6. This is why balanced BST variants (Chapter 10) are important.

### Minimum and maximum

The minimum value in a BST is the leftmost node; the maximum is the rightmost:

```typescript
private minNode(node: BSTNode<T> | null): BSTNode<T> | null {
  if (node === null) return null;
  while (node.left !== null) {
    node = node.left;
  }
  return node;
}

private maxNode(node: BSTNode<T> | null): BSTNode<T> | null {
  if (node === null) return null;
  while (node.right !== null) {
    node = node.right;
  }
  return node;
}
```

Both follow a single path from the given node to a leaf, so they run in $O(h)$ time.

### Successor and predecessor

The **in-order successor** of a node $x$ is the node with the smallest value greater than $x$'s value — the next element in sorted order. The **predecessor** is the node with the largest value smaller than $x$'s.

Finding the successor has two cases:

1. **If $x$ has a right subtree**, the successor is the minimum of that subtree (the leftmost node in the right subtree).
2. **If $x$ has no right subtree**, the successor is the lowest ancestor of $x$ whose left child is also an ancestor of $x$. Intuitively, we walk up the tree until we turn right — the node where we turn is the successor.

```typescript
private successorNode(node: BSTNode<T>): BSTNode<T> | null {
  if (node.right !== null) {
    return this.minNode(node.right);
  }
  let current: BSTNode<T> | null = node;
  let parent = current.parent;
  while (parent !== null && current === parent.right) {
    current = parent;
    parent = parent.parent;
  }
  return parent;
}
```

The predecessor is symmetric: if $x$ has a left subtree, the predecessor is the maximum of that subtree; otherwise walk up until we turn left.

```typescript
private predecessorNode(node: BSTNode<T>): BSTNode<T> | null {
  if (node.left !== null) {
    return this.maxNode(node.left);
  }
  let current: BSTNode<T> | null = node;
  let parent = current.parent;
  while (parent !== null && current === parent.left) {
    current = parent;
    parent = parent.parent;
  }
  return parent;
}
```

Both operations follow at most one root-to-leaf path, so they are $O(h)$.

### Tracing successor

Consider the tree:

```
       10
      /  \
     5    15
    / \   / \
   3   7 12  20
```

- **Successor of 7**: 7 has no right subtree. Walk up: 7 is the right child of 5, so continue. 5 is the left child of 10 — stop. The successor is 10.
- **Successor of 10**: 10 has a right subtree rooted at 15. The minimum of that subtree is 12. The successor is 12.
- **Successor of 20**: 20 has no right subtree. Walk up: 20 is the right child of 15, 15 is the right child of 10, 10 has no parent. No successor exists (20 is the maximum).

### Delete

Deletion is the most complex BST operation because removing a node must preserve the BST property. There are three cases:

**Case 1: The node is a leaf (no children).** Simply remove it by setting the parent's pointer to null.

**Case 2: The node has one child.** Replace the node with its only child. The child takes the node's position in the tree.

**Case 3: The node has two children.** Find the node's in-order successor (the minimum of the right subtree). Copy the successor's value into the node, then delete the successor. The successor has at most one child (a right child), so its deletion reduces to Case 1 or 2.

The implementation uses a helper called `transplant` (following CLRS) that replaces one subtree with another:

```typescript
private transplant(u: BSTNode<T>, v: BSTNode<T> | null): void {
  if (u.parent === null) {
    this.root = v;
  } else if (u === u.parent.left) {
    u.parent.left = v;
  } else {
    u.parent.right = v;
  }
  if (v !== null) {
    v.parent = u.parent;
  }
}
```

`transplant(u, v)` replaces the subtree rooted at $u$ with the subtree rooted at $v$. It updates the parent of $u$ to point to $v$ and sets $v$'s parent pointer.

The full deletion procedure:

```typescript
private deleteNode(node: BSTNode<T>): void {
  if (node.left === null) {
    // Case 1 or 2a: no left child
    this.transplant(node, node.right);
  } else if (node.right === null) {
    // Case 2b: no right child
    this.transplant(node, node.left);
  } else {
    // Case 3: two children
    const successor = this.minNode(node.right)!;
    if (successor.parent !== node) {
      this.transplant(successor, successor.right);
      successor.right = node.right;
      successor.right.parent = successor;
    }
    this.transplant(node, successor);
    successor.left = node.left;
    successor.left.parent = successor;
  }
}
```

In Case 3, we find the successor (the minimum of the right subtree). If the successor is not the immediate right child of the node being deleted, we first detach the successor from its current position (transplanting its right child into its place), then connect the node's right subtree to the successor. Finally, we transplant the successor into the deleted node's position and connect the left subtree.

### Tracing deletion

Starting with:

```
       15
      /  \
     5    20
         / \
        18  25
       / \
      16  19
```

**Delete 15** (two children, successor = 16):

1. Successor of 15 is 16 (minimum of right subtree).
2. 16 is not the immediate right child of 15, so first transplant 16 out: 16 has no right child, so its parent (18) gets null as left child.
3. Connect 20's subtree to 16: `16.right = 20`, `20.parent = 16`.
4. Transplant 16 into 15's position: 16 becomes the root.
5. Connect 15's left subtree to 16: `16.left = 5`, `5.parent = 16`.

Result:

```
       16
      /  \
     5    20
         / \
        18  25
         \
          19
```

The BST property is preserved: 5 < 16, and all of 18, 19, 20, 25 are greater than 16.

## BST performance analysis

Every operation (search, insert, delete, min, max, successor, predecessor) follows at most one root-to-leaf path, so all run in $O(h)$ time where $h$ is the tree height.

The height depends on the insertion order:

| Scenario | Height $h$ | Operation time |
|----------|:----------:|:--------------:|
| Balanced tree ($n$ nodes) | $O(\log n)$ | $O(\log n)$ |
| Random insertion order (expected) | $O(\log n)$ | $O(\log n)$ |
| Sorted insertion order (worst case) | $O(n)$ | $O(n)$ |

For random insertions, the expected height of a BST with $n$ nodes is approximately $4.311 \ln n$ (a result due to Reed, 2003). This means that on average, a plain BST performs well. However, the worst case is $O(n)$, which is no better than a linked list.

To guarantee $O(\log n)$ operations regardless of insertion order, we need **balanced binary search trees** — trees that automatically restructure themselves to maintain low height. AVL trees and red-black trees (Chapter 10) achieve this guarantee with a constant-factor overhead per operation.

### BST vs hash table

| Property | BST | Hash table |
|----------|:---:|:----------:|
| Search | $O(h)$ | $O(1)$ expected |
| Insert | $O(h)$ | $O(1)$ expected |
| Delete | $O(h)$ | $O(1)$ expected |
| Min / Max | $O(h)$ | $O(n)$ |
| Successor / Predecessor | $O(h)$ | $O(n)$ |
| Sorted traversal | $O(n)$ | $O(n \log n)$ (sort first) |
| Range query $[a, b]$ | $O(h + k)$ | $O(n)$ |

Hash tables are faster for pure lookup workloads, but BSTs support order-based operations that hash tables cannot efficiently provide. When you need sorted iteration, range queries, or finding the nearest key, a BST (especially a balanced one) is the right choice.

## Complexity summary

| Operation | Time (average) | Time (worst) | Space |
|-----------|:-:|:-:|:-:|
| Search | $O(\log n)$ | $O(n)$ | $O(1)$ |
| Insert | $O(\log n)$ | $O(n)$ | $O(1)$ |
| Delete | $O(\log n)$ | $O(n)$ | $O(1)$ |
| Min / Max | $O(\log n)$ | $O(n)$ | $O(1)$ |
| Successor / Predecessor | $O(\log n)$ | $O(n)$ | $O(1)$ |
| Inorder traversal | $O(n)$ | $O(n)$ | $O(h)$ |
| Space (tree itself) | — | — | $O(n)$ |

The "average" column assumes random insertion order. The "worst" column covers sorted or adversarial insertion order, which produces a degenerate tree.

## Summary

Trees are hierarchical data structures where each node has a value and links to its children. Binary trees restrict each node to at most two children, and support four standard traversals: inorder (left-root-right), preorder (root-left-right), postorder (left-right-root), and level-order (breadth-first). All traversals run in $O(n)$ time.

A **binary search tree** augments the binary tree with the BST property: left subtree values are less than the node's value, and right subtree values are greater. This enables $O(h)$ search, insert, delete, min, max, successor, and predecessor operations by following a single root-to-leaf path.

The critical limitation of a plain BST is that its height $h$ depends on insertion order. Random insertions yield an expected height of $O(\log n)$, but sorted insertions produce a degenerate tree of height $O(n)$, reducing all operations to linear time. In the next chapter, we study **balanced search trees** — AVL trees and red-black trees — that maintain $O(\log n)$ height through automatic rotations, guaranteeing efficient operations regardless of the input order.

## Exercises

**Exercise 9.1.** Given the preorder traversal `[8, 3, 1, 6, 4, 7, 10, 14, 13]` of a BST, reconstruct the tree and write out the inorder and postorder traversals. Verify that the inorder traversal is sorted.

**Exercise 9.2.** Write an iterative (non-recursive) inorder traversal using an explicit stack. Compare its space usage with the recursive version. Under what circumstances might the iterative version be preferable?

**Exercise 9.3.** Prove that deleting a node from a BST using the successor-replacement method preserves the BST property. Specifically, argue that after replacing a two-children node with its in-order successor, every node in the left subtree is still less than the replacement, and every node in the right subtree is still greater.

**Exercise 9.4.** Write a function `isBST(root)` that checks whether a given binary tree satisfies the BST property. Your solution should run in $O(n)$ time. Be careful with the common pitfall of only checking immediate children — for example, the tree with root 10, left child 5, and left child's right child 15 violates the BST property even though each parent-child relationship individually looks correct.

**Exercise 9.5.** Implement a function `rangeQuery(bst, low, high)` that returns all values in the BST that fall within $[\texttt{low}, \texttt{high}]$, in sorted order. Your solution should run in $O(h + k)$ time where $k$ is the number of values in the range, not $O(n)$. (Hint: adapt the inorder traversal to skip subtrees that cannot contain values in the range.)
