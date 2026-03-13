import type { Comparator } from '../types';
import { numberComparator } from '../types';

/** Node color in a red-black tree. */
export enum Color {
  Red = 'RED',
  Black = 'BLACK',
}

/**
 * A node in a red-black tree.
 *
 * We use an explicit sentinel (`NIL`) for null leaves so that every node
 * (including leaves) has a well-defined color.  External code should compare
 * against `RedBlackTree.NIL` rather than `null`.
 */
export class RBNode<T> {
  public left: RBNode<T>;
  public right: RBNode<T>;
  public parent: RBNode<T>;
  public color: Color;

  constructor(
    public value: T,
    nil: RBNode<T> | 'self',
    color: Color = Color.Red,
  ) {
    // When constructing the sentinel itself, nil === 'self'
    const sentinel = nil === 'self' ? this : nil;
    this.left = sentinel;
    this.right = sentinel;
    this.parent = sentinel;
    this.color = color;
  }
}

/**
 * A self-balancing binary search tree using red-black properties.
 *
 * Red-black properties (CLRS):
 *   1. Every node is either red or black.
 *   2. The root is black.
 *   3. Every leaf (NIL sentinel) is black.
 *   4. If a node is red, both its children are black (no two consecutive reds).
 *   5. For each node, all simple paths from that node to descendant leaves
 *      contain the same number of black nodes (black-height).
 *
 * These properties ensure the tree height is at most 2 lg(n + 1), giving
 * O(log n) worst-case search, insert, and delete.
 *
 * Time complexity: O(log n) for search, insert, delete, min, max,
 *                  successor, predecessor.
 * Space complexity: O(n).
 */
export class RedBlackTree<T> {
  /** The sentinel node representing all NIL leaves. */
  readonly NIL: RBNode<T>;
  private root: RBNode<T>;
  private count = 0;
  private readonly compare: Comparator<T>;

  constructor(comparator?: Comparator<T>) {
    this.compare = comparator ?? (numberComparator as unknown as Comparator<T>);
    // Create sentinel with a dummy value; its color is black.
    this.NIL = new RBNode<T>(undefined as unknown as T, 'self', Color.Black);
    this.root = this.NIL;
  }

  /** The number of nodes in the tree. */
  get size(): number {
    return this.count;
  }

  /** True if the tree contains no nodes. */
  get isEmpty(): boolean {
    return this.count === 0;
  }

  // ── Public API ────────────────────────────────────────────────────

  /**
   * Insert a value into the red-black tree.
   * Duplicates are allowed and placed in the right subtree.
   */
  insert(value: T): void {
    const z = new RBNode<T>(value, this.NIL, Color.Red);
    this.count++;

    let y = this.NIL;
    let x = this.root;

    while (x !== this.NIL) {
      y = x;
      x = this.compare(value, x.value) < 0 ? x.left : x.right;
    }
    z.parent = y;

    if (y === this.NIL) {
      this.root = z;
    } else if (this.compare(value, y.value) < 0) {
      y.left = z;
    } else {
      y.right = z;
    }

    this.insertFixup(z);
  }

  /**
   * Search for a value.
   * Returns the node if found, or null if not present.
   */
  search(value: T): RBNode<T> | null {
    let current = this.root;
    while (current !== this.NIL) {
      const cmp = this.compare(value, current.value);
      if (cmp === 0) return current;
      current = cmp < 0 ? current.left : current.right;
    }
    return null;
  }

  /** Check whether a value exists in the tree. */
  has(value: T): boolean {
    return this.search(value) !== null;
  }

  /**
   * Delete a value from the red-black tree.
   * Returns true if the value was found and removed, false otherwise.
   */
  delete(value: T): boolean {
    const z = this.search(value);
    if (z === null) return false;
    this.deleteNode(z);
    this.count--;
    return true;
  }

  /** Return the minimum value, or undefined if empty. */
  min(): T | undefined {
    const node = this.minNode(this.root);
    return node === this.NIL ? undefined : node.value;
  }

  /** Return the maximum value, or undefined if empty. */
  max(): T | undefined {
    const node = this.maxNode(this.root);
    return node === this.NIL ? undefined : node.value;
  }

  /**
   * Find the in-order successor (smallest value strictly greater).
   */
  successor(value: T): T | undefined {
    const node = this.search(value);
    if (node === null) return undefined;
    const succ = this.successorNode(node);
    return succ === this.NIL ? undefined : succ.value;
  }

  /**
   * Find the in-order predecessor (largest value strictly less).
   */
  predecessor(value: T): T | undefined {
    const node = this.search(value);
    if (node === null) return undefined;
    const pred = this.predecessorNode(node);
    return pred === this.NIL ? undefined : pred.value;
  }

  /** Return all values in sorted (in-order) order. */
  inorder(): T[] {
    const result: T[] = [];
    this.inorderHelper(this.root, result);
    return result;
  }

  /** Return values in preorder (root, left, right). */
  preorder(): T[] {
    const result: T[] = [];
    this.preorderHelper(this.root, result);
    return result;
  }

  /** Return values in postorder (left, right, root). */
  postorder(): T[] {
    const result: T[] = [];
    this.postorderHelper(this.root, result);
    return result;
  }

  /** Return values in level-order (breadth-first). */
  levelOrder(): T[] {
    if (this.root === this.NIL) return [];
    const result: T[] = [];
    const queue: RBNode<T>[] = [this.root];
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node.value);
      if (node.left !== this.NIL) queue.push(node.left);
      if (node.right !== this.NIL) queue.push(node.right);
    }
    return result;
  }

  /**
   * The height of the tree.
   * An empty tree has height −1; a single node has height 0.
   */
  height(): number {
    return this.heightHelper(this.root);
  }

  /**
   * Verify all five red-black properties.  Returns true if the tree is a
   * valid red-black tree.  Useful in tests.
   */
  verify(): boolean {
    // Property 2: root is black
    if (this.root !== this.NIL && this.root.color !== Color.Black) return false;

    return this.verifyNode(this.root) >= 0;
  }

  // ── Rotations ─────────────────────────────────────────────────────

  /**
   * Left rotation around x (CLRS LEFT-ROTATE).
   *
   *     x              y
   *    / \            /  \
   *   a   y    →    x    c
   *      / \       / \
   *     b   c     a   b
   */
  private rotateLeft(x: RBNode<T>): void {
    const y = x.right;
    x.right = y.left;
    if (y.left !== this.NIL) {
      y.left.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === this.NIL) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
  }

  /**
   * Right rotation around y (CLRS RIGHT-ROTATE).
   *
   *       y            x
   *      / \          / \
   *     x   c  →    a   y
   *    / \              / \
   *   a   b            b   c
   */
  private rotateRight(y: RBNode<T>): void {
    const x = y.left;
    y.left = x.right;
    if (x.right !== this.NIL) {
      x.right.parent = y;
    }
    x.parent = y.parent;
    if (y.parent === this.NIL) {
      this.root = x;
    } else if (y === y.parent.left) {
      y.parent.left = x;
    } else {
      y.parent.right = x;
    }
    x.right = y;
    y.parent = x;
  }

  // ── Insert fixup (CLRS RB-INSERT-FIXUP) ──────────────────────────

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
            // Case 2: node is right child — left rotate to reduce to case 3
            node = node.parent;
            this.rotateLeft(node);
          }
          // Case 3: node is left child — right rotate grandparent
          node.parent.color = Color.Black;
          node.parent.parent.color = Color.Red;
          this.rotateRight(node.parent.parent);
        }
      } else {
        // Symmetric: parent is a right child
        const uncle = node.parent.parent.left;
        if (uncle.color === Color.Red) {
          // Case 1
          node.parent.color = Color.Black;
          uncle.color = Color.Black;
          node.parent.parent.color = Color.Red;
          node = node.parent.parent;
        } else {
          if (node === node.parent.left) {
            // Case 2
            node = node.parent;
            this.rotateRight(node);
          }
          // Case 3
          node.parent.color = Color.Black;
          node.parent.parent.color = Color.Red;
          this.rotateLeft(node.parent.parent);
        }
      }
    }
    this.root.color = Color.Black;
  }

  // ── Deletion (CLRS RB-DELETE + RB-TRANSPLANT + RB-DELETE-FIXUP) ──

  private transplant(u: RBNode<T>, v: RBNode<T>): void {
    if (u.parent === this.NIL) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }
    v.parent = u.parent;
  }

  private deleteNode(z: RBNode<T>): void {
    let y = z;
    let yOriginalColor = y.color;
    let x: RBNode<T>;

    if (z.left === this.NIL) {
      x = z.right;
      this.transplant(z, z.right);
    } else if (z.right === this.NIL) {
      x = z.left;
      this.transplant(z, z.left);
    } else {
      // Two children — use in-order successor
      y = this.minNode(z.right);
      yOriginalColor = y.color;
      x = y.right;
      if (y.parent === z) {
        // x might be NIL; set its parent for fixup
        x.parent = y;
      } else {
        this.transplant(y, y.right);
        y.right = z.right;
        y.right.parent = y;
      }
      this.transplant(z, y);
      y.left = z.left;
      y.left.parent = y;
      y.color = z.color;
    }

    if (yOriginalColor === Color.Black) {
      this.deleteFixup(x);
    }
  }

  private deleteFixup(x: RBNode<T>): void {
    let node = x;
    while (node !== this.root && node.color === Color.Black) {
      if (node === node.parent.left) {
        let w = node.parent.right;
        if (w.color === Color.Red) {
          // Case 1: sibling is red
          w.color = Color.Black;
          node.parent.color = Color.Red;
          this.rotateLeft(node.parent);
          w = node.parent.right;
        }
        if (w.left.color === Color.Black && w.right.color === Color.Black) {
          // Case 2: sibling's children are both black
          w.color = Color.Red;
          node = node.parent;
        } else {
          if (w.right.color === Color.Black) {
            // Case 3: sibling's right child is black
            w.left.color = Color.Black;
            w.color = Color.Red;
            this.rotateRight(w);
            w = node.parent.right;
          }
          // Case 4: sibling's right child is red
          w.color = node.parent.color;
          node.parent.color = Color.Black;
          w.right.color = Color.Black;
          this.rotateLeft(node.parent);
          node = this.root;
        }
      } else {
        // Symmetric: node is a right child
        let w = node.parent.left;
        if (w.color === Color.Red) {
          w.color = Color.Black;
          node.parent.color = Color.Red;
          this.rotateRight(node.parent);
          w = node.parent.left;
        }
        if (w.right.color === Color.Black && w.left.color === Color.Black) {
          w.color = Color.Red;
          node = node.parent;
        } else {
          if (w.left.color === Color.Black) {
            w.right.color = Color.Black;
            w.color = Color.Red;
            this.rotateLeft(w);
            w = node.parent.left;
          }
          w.color = node.parent.color;
          node.parent.color = Color.Black;
          w.left.color = Color.Black;
          this.rotateRight(node.parent);
          node = this.root;
        }
      }
    }
    node.color = Color.Black;
  }

  // ── Navigation helpers ────────────────────────────────────────────

  private minNode(node: RBNode<T>): RBNode<T> {
    while (node.left !== this.NIL) node = node.left;
    return node;
  }

  private maxNode(node: RBNode<T>): RBNode<T> {
    while (node.right !== this.NIL) node = node.right;
    return node;
  }

  private successorNode(node: RBNode<T>): RBNode<T> {
    if (node.right !== this.NIL) return this.minNode(node.right);
    let current = node;
    let parent = current.parent;
    while (parent !== this.NIL && current === parent.right) {
      current = parent;
      parent = parent.parent;
    }
    return parent;
  }

  private predecessorNode(node: RBNode<T>): RBNode<T> {
    if (node.left !== this.NIL) return this.maxNode(node.left);
    let current = node;
    let parent = current.parent;
    while (parent !== this.NIL && current === parent.left) {
      current = parent;
      parent = parent.parent;
    }
    return parent;
  }

  // ── Traversal helpers ─────────────────────────────────────────────

  private inorderHelper(node: RBNode<T>, result: T[]): void {
    if (node === this.NIL) return;
    this.inorderHelper(node.left, result);
    result.push(node.value);
    this.inorderHelper(node.right, result);
  }

  private preorderHelper(node: RBNode<T>, result: T[]): void {
    if (node === this.NIL) return;
    result.push(node.value);
    this.preorderHelper(node.left, result);
    this.preorderHelper(node.right, result);
  }

  private postorderHelper(node: RBNode<T>, result: T[]): void {
    if (node === this.NIL) return;
    this.postorderHelper(node.left, result);
    this.postorderHelper(node.right, result);
    result.push(node.value);
  }

  private heightHelper(node: RBNode<T>): number {
    if (node === this.NIL) return -1;
    return (
      1 + Math.max(this.heightHelper(node.left), this.heightHelper(node.right))
    );
  }

  /**
   * Verify red-black properties rooted at `node`.
   * Returns the black-height if valid, or −1 if any property is violated.
   */
  private verifyNode(node: RBNode<T>): number {
    if (node === this.NIL) return 0;

    // Property 4: red node must have black children
    if (node.color === Color.Red) {
      if (node.left.color === Color.Red || node.right.color === Color.Red) {
        return -1;
      }
    }

    const leftBH = this.verifyNode(node.left);
    const rightBH = this.verifyNode(node.right);

    // Subtree violation
    if (leftBH < 0 || rightBH < 0) return -1;

    // Property 5: equal black-height on both sides
    if (leftBH !== rightBH) return -1;

    return leftBH + (node.color === Color.Black ? 1 : 0);
  }
}
