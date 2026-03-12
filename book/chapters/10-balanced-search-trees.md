# Balanced Search Trees

_In Chapter 9 we built a binary search tree that provides $O(h)$ operations — fast when balanced, but potentially $O(n)$ when degenerate. Inserting $n$ keys in sorted order produces a tree that is indistinguishable from a linked list. Balanced search trees solve this problem by restructuring the tree after every insert and delete, guaranteeing that the height remains $O(\log n)$ regardless of the input order. In this chapter we study two classic self-balancing trees: **AVL trees**, which enforce a strict balance factor constraint, and **red-black trees**, which use node coloring to maintain a looser but equally effective bound._

## The problem with unbalanced BSTs

Recall from Chapter 9 that every BST operation follows a single root-to-leaf path, giving $O(h)$ time. For a balanced tree of $n$ nodes, $h = O(\log n)$, so all operations are logarithmic. But the height depends entirely on the insertion order.

Consider inserting the values 1, 2, 3, 4, 5 in order:

```
1
 \
  2
   \
    3
     \
      4
       \
        5
```

The tree has height 4 (one less than $n$), and every operation degrades to $O(n)$. Even if the average-case height for random insertions is $O(\log n)$, we cannot rely on the input being random — an adversary, a sorted file, or even a partially ordered stream can produce the worst case.

We need a tree that **automatically rebalances** after modifications. The key tool is the **rotation** — a local restructuring operation that changes the shape of a subtree without altering the in-order sequence of elements.

## Rotations

A rotation rearranges a parent-child pair while preserving the BST property. There are two kinds:

**Right rotation** around node $y$:

```
      y            x
     / \          / \
    x   C  →    A   y
   / \              / \
  A   B            B   C
```

Node $x$ (the left child of $y$) becomes the new root of the subtree. The subtree $B$, which was $x$'s right child, becomes $y$'s left child. All BST ordering is preserved: $A < x < B < y < C$.

**Left rotation** around node $x$:

```
    x              y
   / \            / \
  A   y    →    x   C
     / \       / \
    B   C     A   B
```

This is the mirror image: $y$ (the right child of $x$) becomes the new root of the subtree.

Both rotations run in $O(1)$ time — they only reassign a constant number of pointers. The critical insight is that rotations change the height of a subtree while keeping the sorted order intact. This is how balanced trees reduce height after an insertion or deletion disturbs the balance.

```typescript
private rotateRight(y: AVLNode<T>): AVLNode<T> {
  const x = y.left!;
  const B = x.right;

  // Perform rotation
  x.right = y;
  y.left = B;

  // Update parents
  x.parent = y.parent;
  y.parent = x;
  if (B !== null) B.parent = y;

  // Update parent's child pointer
  if (x.parent === null) {
    this.root = x;
  } else if (x.parent.left === y) {
    x.parent.left = x;
  } else {
    x.parent.right = x;
  }

  // Update heights (y first since x is now y's parent)
  this.updateHeight(y);
  this.updateHeight(x);

  return x;
}
```

## AVL trees

The **AVL tree** (named after its inventors Adelson-Velsky and Landis, 1962) is the oldest self-balancing BST. It maintains the following invariant:

> **AVL property:** For every node, the heights of its left and right subtrees differ by at most 1.

The **balance factor** of a node is $\text{height}(\text{left}) - \text{height}(\text{right})$. The AVL property requires that the balance factor of every node is $-1$, $0$, or $+1$.

### Height bound

An AVL tree with $n$ nodes has height at most $1.44 \log_2(n + 2) - 0.328$. This bound comes from analyzing the **minimum** number of nodes in an AVL tree of height $h$. Let $N(h)$ be this minimum. Then:

$$N(0) = 1, \quad N(1) = 2, \quad N(h) = 1 + N(h-1) + N(h-2)$$

The minimum AVL tree of height $h$ has a root, a minimum AVL subtree of height $h-1$, and a minimum AVL subtree of height $h-2$ (the heights must differ by at most 1). This recurrence is closely related to the Fibonacci sequence, and its solution gives $N(h) \approx \phi^h / \sqrt{5}$ where $\phi = (1 + \sqrt{5})/2 \approx 1.618$ is the golden ratio. Inverting, we get $h < 1.44 \log_2(n + 2)$.

This means an AVL tree is at most about 44% taller than a perfectly balanced tree, guaranteeing $O(\log n)$ operations.

### Node structure

Each AVL node stores its height explicitly, which makes computing balance factors a constant-time operation:

```typescript
class AVLNode<T> {
  public left: AVLNode<T> | null = null;
  public right: AVLNode<T> | null = null;
  public parent: AVLNode<T> | null = null;
  public height = 0;

  constructor(public value: T) {}
}
```

Helper functions for height and balance factor:

```typescript
private h(node: AVLNode<T> | null): number {
  return node === null ? -1 : node.height;
}

private balanceFactor(node: AVLNode<T>): number {
  return this.h(node.left) - this.h(node.right);
}

private updateHeight(node: AVLNode<T>): void {
  node.height = 1 + Math.max(this.h(node.left), this.h(node.right));
}
```

### Insertion

Insertion in an AVL tree starts with a standard BST insert, then walks back up the tree from the new node to the root, checking and fixing the balance factor at each ancestor.

After inserting a new leaf, the balance factor of some ancestors may become $+2$ or $-2$. There are four cases, each resolved by one or two rotations:

**Case 1: Left-Left (balance factor = +2, left child's balance factor $\geq 0$).**
The left subtree is too tall, and the imbalance is on the left side of the left child. A single right rotation fixes it:

```
        z (+2)            y
       / \               / \
    y (+1)  D    →      x   z
     / \               / \ / \
    x   C             A  B C  D
   / \
  A   B
```

**Case 2: Right-Right (balance factor = -2, right child's balance factor $\leq 0$).**
The mirror of Case 1. A single left rotation fixes it.

**Case 3: Left-Right (balance factor = +2, left child's balance factor = -1).**
The left subtree is too tall, but the imbalance is on the *right* side of the left child. A single rotation would not fix it — we need a **double rotation**: first left-rotate the left child, then right-rotate the node:

```
      z (+2)          z (+2)          x
     / \             / \             / \
  y (-1)  D   →    x   D    →     y   z
   / \             / \            / \ / \
  A   x           y   C         A  B C  D
     / \         / \
    B   C       A   B
```

**Case 4: Right-Left (balance factor = -2, right child's balance factor = +1).**
The mirror of Case 3: right-rotate the right child, then left-rotate the node.

The rebalance procedure:

```typescript
private rebalance(node: AVLNode<T>): AVLNode<T> {
  this.updateHeight(node);
  const bf = this.balanceFactor(node);

  if (bf > 1) {
    // Left-heavy
    if (this.balanceFactor(node.left!) < 0) {
      // Left-Right case: rotate left child left first
      this.rotateLeft(node.left!);
    }
    // Left-Left case (or Left-Right reduced to Left-Left)
    return this.rotateRight(node);
  }

  if (bf < -1) {
    // Right-heavy
    if (this.balanceFactor(node.right!) > 0) {
      // Right-Left case: rotate right child right first
      this.rotateRight(node.right!);
    }
    // Right-Right case (or Right-Left reduced to Right-Right)
    return this.rotateLeft(node);
  }

  return node;
}
```

After insertion, we walk up from the new node's parent to the root, calling `rebalance` at each ancestor:

```typescript
private rebalanceUp(node: AVLNode<T> | null): void {
  let current = node;
  while (current !== null) {
    const parent = current.parent;
    this.rebalance(current);
    current = parent;
  }
}
```

### Tracing AVL insertions

Let us insert 1, 2, 3, 4, 5 — the sequence that degenerates a plain BST into a linked list.

**Insert 1:** Single node, height 0.

```
  1
```

**Insert 2:** Standard BST insert to the right. Balance factors are all valid.

```
  1
   \
    2
```

**Insert 3:** Insert to the right of 2. Now node 1 has balance factor $-2$ (Right-Right case). Left-rotate around 1:

```
  1 (-2)          2
   \             / \
    2    →      1   3
     \
      3
```

**Insert 4:** Insert to the right of 3. Balance factors are valid (root 2 has balance factor $-1$).

```
    2
   / \
  1   3
       \
        4
```

**Insert 5:** Insert to the right of 4. Now node 3 has balance factor $-2$ (Right-Right case). Left-rotate around 3:

```
    2                2
   / \              / \
  1   3 (-2)  →   1   4
       \              / \
        4            3   5
```

After 5 insertions, the tree has height 2 — the minimum possible. A plain BST would have height 4.

### Deletion

Deletion in an AVL tree uses the same three-case BST deletion algorithm from Chapter 9, followed by a rebalance walk from the lowest modified ancestor up to the root. The key difference from insertion is that deletion may require rotations at multiple ancestors (insertion requires at most one rotation point, but deletion can cascade):

```typescript
private deleteNode(node: AVLNode<T>): void {
  let rebalanceStart: AVLNode<T> | null;

  if (node.left === null) {
    rebalanceStart = node.parent;
    this.transplant(node, node.right);
  } else if (node.right === null) {
    rebalanceStart = node.parent;
    this.transplant(node, node.left);
  } else {
    const successor = this.minNode(node.right)!;
    if (successor.parent !== node) {
      rebalanceStart = successor.parent;
      this.transplant(successor, successor.right);
      successor.right = node.right;
      successor.right.parent = successor;
    } else {
      rebalanceStart = successor;
    }
    this.transplant(node, successor);
    successor.left = node.left;
    successor.left.parent = successor;
  }

  this.rebalanceUp(rebalanceStart);
}
```

### AVL complexity

| Operation | Time | Space |
|-----------|:----:|:-----:|
| Search | $O(\log n)$ | $O(1)$ |
| Insert | $O(\log n)$ | $O(1)$ |
| Delete | $O(\log n)$ | $O(1)$ |
| Min / Max | $O(\log n)$ | $O(1)$ |
| Successor / Predecessor | $O(\log n)$ | $O(1)$ |
| Inorder traversal | $O(n)$ | $O(\log n)$ |
| Space (tree) | — | $O(n)$ |

Each node stores one extra field (height), so the per-node overhead is small. Search does zero rotations. Insert does at most 2 rotations (one rotation point), but deletion may rotate at $O(\log n)$ ancestors in the worst case. All rotations are $O(1)$ each.

## Red-black trees

A **red-black tree** is a BST where each node carries a one-bit color attribute — red or black — and five properties constrain how colors can be arranged. Red-black trees allow a slightly less strict balance than AVL trees: the height can be up to $2 \log_2(n + 1)$ versus AVL's $1.44 \log_2(n + 2)$. In exchange, they require fewer rotations during insertion and deletion, making them a popular choice in practice (used in `std::map` in C++, `TreeMap` in Java, and the Linux kernel's scheduling data structure).

### Red-black properties

A valid red-black tree satisfies all five of these properties:

1. **Every node is either red or black.**
2. **The root is black.**
3. **Every leaf (NIL) is black.** We use a sentinel NIL node rather than null pointers, which simplifies the algorithms.
4. **If a node is red, both its children are black.** Equivalently, no path from root to leaf has two consecutive red nodes.
5. **For each node, all simple paths from that node to descendant leaves contain the same number of black nodes.** This count is called the **black-height** of the node.

These properties together guarantee that no root-to-leaf path is more than twice as long as any other, which gives the height bound.

### Height bound

The black-height of the root is the number of black nodes on any path from root to a leaf (not counting the root itself if we follow the convention, though CLRS counts the root). Because of Property 4 (no two reds in a row), a path of length $h$ has at least $h/2$ black nodes. Because of Property 5 (all paths have the same black-height), the shortest path is all black nodes and the longest alternates red and black. Therefore:

$$h \leq 2 \log_2(n + 1)$$

This guarantees $O(\log n)$ operations.

### Node structure and sentinel

Red-black tree implementations use a sentinel NIL node to represent all external leaves. This avoids null-checks throughout the rotation and fixup code:

```typescript
enum Color {
  Red = 'RED',
  Black = 'BLACK',
}

class RBNode<T> {
  public left: RBNode<T>;
  public right: RBNode<T>;
  public parent: RBNode<T>;
  public color: Color;

  constructor(public value: T, nil: RBNode<T>, color: Color = Color.Red) {
    this.left = nil;
    this.right = nil;
    this.parent = nil;
    this.color = color;
  }
}
```

The sentinel is a single black node that serves as every leaf and as the parent of the root. When we write `node.left === this.NIL`, we are checking whether the node has no left child.

### Insertion

Insertion follows the CLRS `RB-INSERT` algorithm:

1. Insert the new node $z$ as a red leaf using standard BST insertion.
2. Call `insertFixup(z)` to restore the red-black properties.

The new node is colored red because inserting a black node would violate Property 5 (black-height would increase on exactly one path). A red node might violate Property 4 (if its parent is also red) or Property 2 (if it becomes the root), but these are easier to fix.

The fixup procedure handles three cases (and their symmetric mirrors when the parent is a right child):

**Case 1: Uncle is red.** Both the parent and uncle are red. Recolor the parent and uncle black and the grandparent red, then move up to the grandparent and repeat:

```
        G (black)            G (red)
       / \                  / \
   P (red) U (red)  →  P (black) U (black)
    |                    |
  z (red)              z (red)
```

This fixes the local violation but may create a new red-red violation at $G$ and its parent. The fix propagates upward.

**Case 2: Uncle is black, $z$ is an opposite-side child.** If $z$ is a right child but its parent is a left child (or vice versa), rotate $z$'s parent to convert to Case 3:

```
      G                G
     / \              / \
    P   U    →      z   U
     \             /
      z           P
```

**Case 3: Uncle is black, $z$ is a same-side child.** Rotate the grandparent and recolor:

```
        G (black)           P (black)
       / \                 / \
   P (red) U (black) → z (red) G (red)
    |                            \
  z (red)                      U (black)
```

After Case 3, the subtree root is black with two red children — no further fixing is needed.

The fixup terminates when:
- The parent is black (no violation), or
- We reach the root (color it black to satisfy Property 2).

```typescript
private insertFixup(z: RBNode<T>): void {
  let node = z;
  while (node.parent.color === Color.Red) {
    if (node.parent === node.parent.parent.left) {
      const uncle = node.parent.parent.right;
      if (uncle.color === Color.Red) {
        // Case 1: uncle is red — recolor
        node.parent.color = Color.Black;
        uncle.color = Color.Black;
        node.parent.parent.color = Color.Red;
        node = node.parent.parent;
      } else {
        if (node === node.parent.right) {
          // Case 2 → rotate to reduce to Case 3
          node = node.parent;
          this.rotateLeft(node);
        }
        // Case 3 — rotate grandparent
        node.parent.color = Color.Black;
        node.parent.parent.color = Color.Red;
        this.rotateRight(node.parent.parent);
      }
    } else {
      // Symmetric cases (parent is right child)
      // ...
    }
  }
  this.root.color = Color.Black;
}
```

### Tracing red-black insertion

Let us insert the same sequence 1, 2, 3, 4, 5 into a red-black tree.

**Insert 1:** New node is red, but it's the root, so color it black.

```
  1(B)
```

**Insert 2:** Insert as right child of 1. Node 2 is red, parent 1 is black — no violation.

```
  1(B)
   \
    2(R)
```

**Insert 3:** Insert as right child of 2. Now 2 (red) has a red child 3 — violation of Property 4. Uncle of 3 is NIL (black), and 3 is a right child of a right child — Case 3 (Right-Right). Left-rotate grandparent 1 and recolor:

```
  1(B)             2(B)
   \              / \
    2(R)   →    1(R) 3(R)
     \
      3(R)
```

**Insert 4:** Insert as right child of 3. Now 3 (red) has red child 4 — violation. Uncle of 4 is 1 (red) — Case 1. Recolor: 1 and 3 become black, 2 becomes red. But 2 is the root, so immediately color it back to black:

```
    2(B)
   / \
  1(B) 3(B)
         \
          4(R)
```

**Insert 5:** Insert as right child of 4. Now 4 (red) has red child 5 — violation. Uncle of 5 is NIL (black), and 5 is a right child of a right child — Case 3. Left-rotate grandparent 3 and recolor:

```
      2(B)                2(B)
     / \                 / \
   1(B) 3(B)    →     1(B) 4(B)
          \                / \
           4(R)          3(R) 5(R)
            \
             5(R)
```

After 5 insertions, the tree has height 2 — well-balanced, with valid red-black properties.

### Deletion

Red-black deletion is the most complex operation. The algorithm follows CLRS `RB-DELETE`:

1. Perform standard BST deletion to remove the node. Track the color of the node that was actually removed or moved ($y$'s original color) and the node that replaced it ($x$).
2. If the removed/moved node was black, call `deleteFixup(x)` to restore the properties.

Removing a black node violates Property 5 (black-height consistency). The fixup pushes an "extra black" up the tree until it can be absorbed. There are four cases (and their mirrors):

**Case 1: Sibling $w$ is red.** Recolor $w$ black and the parent red, then rotate the parent. This converts to one of Cases 2–4 with a black sibling.

**Case 2: Sibling $w$ is black, both of $w$'s children are black.** Move the extra black up by coloring $w$ red and moving to the parent.

**Case 3: Sibling $w$ is black, $w$'s far child is black, near child is red.** Rotate $w$ and recolor to convert to Case 4.

**Case 4: Sibling $w$ is black, $w$'s far child is red.** Rotate the parent, transfer colors, and make the far child black. This absorbs the extra black and terminates the fixup.

The details are intricate, but the key guarantee is that at most 3 rotations are performed per deletion — fewer than AVL deletion's potential $O(\log n)$ rotations.

### Verifying red-black properties

For testing and debugging, it is valuable to have a verification method that checks all five properties:

```typescript
verify(): boolean {
  // Property 2: root is black
  if (this.root !== this.NIL && this.root.color !== Color.Black)
    return false;

  return this.verifyNode(this.root) >= 0;
}

private verifyNode(node: RBNode<T>): number {
  if (node === this.NIL) return 0;

  // Property 4: red node must have black children
  if (node.color === Color.Red) {
    if (node.left.color === Color.Red || node.right.color === Color.Red)
      return -1;
  }

  const leftBH = this.verifyNode(node.left);
  const rightBH = this.verifyNode(node.right);

  if (leftBH < 0 || rightBH < 0) return -1;

  // Property 5: equal black-height
  if (leftBH !== rightBH) return -1;

  return leftBH + (node.color === Color.Black ? 1 : 0);
}
```

This recursive procedure returns the black-height of each subtree, verifying Properties 4 and 5 simultaneously in $O(n)$ time.

### Red-black complexity

| Operation | Time | Rotations (worst case) |
|-----------|:----:|:----------------------:|
| Search | $O(\log n)$ | 0 |
| Insert | $O(\log n)$ | 2 |
| Delete | $O(\log n)$ | 3 |
| Min / Max | $O(\log n)$ | 0 |
| Inorder traversal | $O(n)$ | 0 |

The per-node overhead is 1 bit (color), which is often stored in an otherwise unused alignment bit of a pointer.

## B-trees

B-trees are balanced search trees designed for **external storage** — disks, SSDs, and databases — where the cost of each node access is high. Instead of binary branching, a B-tree of order $m$ allows each node to have up to $m$ children and store up to $m - 1$ keys. This high branching factor means fewer levels and fewer disk accesses.

A B-tree of order $m$ satisfies:
- Every node has at most $m$ children.
- Every non-root internal node has at least $\lceil m/2 \rceil$ children.
- The root has at least 2 children (unless it is a leaf).
- All leaves are at the same depth.
- A node with $k$ children stores $k - 1$ keys.

For a B-tree of order 1000 storing one billion keys, the height is at most $\log_{500} 10^9 \approx 3.3$, meaning any key can be found in at most 4 disk reads. This is why B-trees and their variant B+ trees are the backbone of every major database system and filesystem.

We do not implement B-trees in this book because their primary benefit is I/O efficiency, which is difficult to demonstrate in an in-memory setting. The interested reader is referred to CLRS Chapter 18 or Wirth's *Algorithms + Data Structures = Programs* for detailed treatments.

## Comparison of balanced tree variants

| Property | AVL tree | Red-black tree | B-tree |
|----------|:--------:|:--------------:|:------:|
| Height bound | $\leq 1.44 \log_2(n+2)$ | $\leq 2 \log_2(n+1)$ | $\leq \log_{\lceil m/2\rceil} n$ |
| Strictness | Tight (BF $\in \{-1,0,1\}$) | Loose (path ratio $\leq 2$) | All leaves same depth |
| Search time | $O(\log n)$ | $O(\log n)$ | $O(\log_m n)$ |
| Insert rotations | $\leq 2$ | $\leq 2$ | 0 (splits instead) |
| Delete rotations | $O(\log n)$ | $\leq 3$ | 0 (merges/redistributes) |
| Per-node overhead | Height (integer) | Color (1 bit) | Variable-size key arrays |
| Best use case | Lookup-heavy workloads | Insert/delete-heavy | Disk-based storage |

**When to use which:**

- **AVL trees** produce shorter, more tightly balanced trees. If your workload is search-heavy with few modifications, AVL trees will have slightly fewer comparisons per search.
- **Red-black trees** perform fewer rotations per modification. If your workload involves frequent insertions and deletions, red-black trees offer better amortized restructuring cost. Most language standard libraries choose red-black trees.
- **B-trees** are the right choice when data lives on disk and minimizing I/O operations is the priority.

## Exercises

**Exercise 10.1.** Insert the values 14, 17, 11, 7, 53, 4, 13, 12, 8 into an initially empty AVL tree. After each insertion, draw the tree and show any rotations that occur. Identify which of the four rotation cases (LL, RR, LR, RL) applies in each case.

**Exercise 10.2.** Prove that an AVL tree with $n$ nodes has height at most $1.44 \log_2(n + 2)$. (Hint: define $N(h)$ as the minimum number of nodes in an AVL tree of height $h$, establish the recurrence $N(h) = 1 + N(h-1) + N(h-2)$, and relate it to the Fibonacci sequence.)

**Exercise 10.3.** A red-black tree with $n$ internal nodes has height at most $2 \log_2(n + 1)$. Prove this. (Hint: show by induction that a subtree rooted at any node $x$ contains at least $2^{bh(x)} - 1$ internal nodes, where $bh(x)$ is the black-height of $x$. Then use Property 4 to relate height to black-height.)

**Exercise 10.4.** Consider a red-black tree where you insert the keys 1 through 15 in order. Draw the tree after all insertions. What is the resulting height? How does this compare to the height bound $2 \log_2(n + 1)$?

**Exercise 10.5.** AVL trees and red-black trees both guarantee $O(\log n)$ operations, but they make different trade-offs. Design an experiment to compare their performance: insert $n$ random integers, then perform $n$ searches, measuring the total number of comparisons for each tree type. Run the experiment for $n = 10^3, 10^4, 10^5$ and report the average number of comparisons per search. Which tree type performs fewer comparisons per search? Which performs fewer rotations per insertion? Discuss when each tree would be preferred.

## Summary

Balanced search trees solve the fundamental problem of unbalanced BSTs by maintaining height invariants through automatic restructuring. **AVL trees** enforce a strict balance factor constraint (at most 1 difference between subtree heights), achieving a height bound of $1.44 \log_2(n + 2)$ through four rotation cases applied during insertion and deletion. **Red-black trees** use a coloring scheme with five properties to maintain a height bound of $2 \log_2(n + 1)$, trading slightly taller trees for fewer rotations during modifications — at most 2 per insertion and 3 per deletion.

Both trees guarantee $O(\log n)$ worst-case time for search, insert, delete, min, max, successor, and predecessor. AVL trees are preferred for lookup-heavy workloads due to shorter tree heights, while red-black trees are preferred for modification-heavy workloads due to fewer structural changes. **B-trees**, though not implemented here, extend the balancing concept to high-branching-factor trees optimized for disk access.

The rotations and rebalancing strategies studied in this chapter are fundamental techniques that appear throughout advanced data structures. In the next chapter, we turn to **heaps and priority queues** — another tree-based structure that maintains a different invariant (the heap property) for efficient extraction of minimum or maximum elements.
