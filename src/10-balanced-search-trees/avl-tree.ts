import type { Comparator } from '../types.js';
import { numberComparator } from '../types.js';

/**
 * A node in an AVL tree.
 *
 * Each node stores its height (the number of edges on the longest path to a
 * leaf).  The balance factor is derived as height(left) − height(right).
 */
export class AVLNode<T> {
  public left: AVLNode<T> | null = null;
  public right: AVLNode<T> | null = null;
  public parent: AVLNode<T> | null = null;
  public height = 0;

  constructor(public value: T) {}
}

/**
 * A self-balancing binary search tree using the AVL invariant.
 *
 * The AVL property guarantees that for every node the heights of its left and
 * right subtrees differ by at most 1.  This ensures O(log n) worst-case time
 * for search, insert, and delete.
 *
 * Four rotation cases are handled during rebalancing:
 *   - Left-Left   → single right rotation
 *   - Right-Right → single left rotation
 *   - Left-Right  → left rotation on left child, then right rotation
 *   - Right-Left  → right rotation on right child, then left rotation
 *
 * Time complexity: O(log n) for search, insert, delete, min, max,
 *                  successor, predecessor.
 * Space complexity: O(n).
 */
export class AVLTree<T> {
  private root: AVLNode<T> | null = null;
  private count = 0;
  private readonly compare: Comparator<T>;

  constructor(comparator?: Comparator<T>) {
    this.compare = comparator ?? (numberComparator as unknown as Comparator<T>);
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
   * Insert a value into the AVL tree.
   * Duplicates are allowed and placed in the right subtree.
   */
  insert(value: T): void {
    const newNode = new AVLNode(value);
    this.count++;

    if (this.root === null) {
      this.root = newNode;
      return;
    }

    // Standard BST insert
    let current = this.root;
    for (;;) {
      if (this.compare(value, current.value) < 0) {
        if (current.left === null) {
          current.left = newNode;
          newNode.parent = current;
          break;
        }
        current = current.left;
      } else {
        if (current.right === null) {
          current.right = newNode;
          newNode.parent = current;
          break;
        }
        current = current.right;
      }
    }

    // Walk up and rebalance
    this.rebalanceUp(newNode.parent);
  }

  /**
   * Search for a value.
   * Returns the node if found, or null if not present.
   */
  search(value: T): AVLNode<T> | null {
    let current = this.root;
    while (current !== null) {
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
   * Delete a value from the AVL tree.
   * Returns true if the value was found and removed, false otherwise.
   */
  delete(value: T): boolean {
    const node = this.search(value);
    if (node === null) return false;
    this.deleteNode(node);
    this.count--;
    return true;
  }

  /** Return the minimum value, or undefined if empty. */
  min(): T | undefined {
    const node = this.minNode(this.root);
    return node?.value;
  }

  /** Return the maximum value, or undefined if empty. */
  max(): T | undefined {
    const node = this.maxNode(this.root);
    return node?.value;
  }

  /**
   * Find the in-order successor (smallest value strictly greater than the
   * given value).  Returns undefined if no successor exists or the value is
   * not in the tree.
   */
  successor(value: T): T | undefined {
    const node = this.search(value);
    if (node === null) return undefined;
    const succ = this.successorNode(node);
    return succ?.value;
  }

  /**
   * Find the in-order predecessor (largest value strictly less than the
   * given value).
   */
  predecessor(value: T): T | undefined {
    const node = this.search(value);
    if (node === null) return undefined;
    const pred = this.predecessorNode(node);
    return pred?.value;
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
    if (this.root === null) return [];
    const result: T[] = [];
    const queue: AVLNode<T>[] = [this.root];
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node.value);
      if (node.left !== null) queue.push(node.left);
      if (node.right !== null) queue.push(node.right);
    }
    return result;
  }

  /**
   * The height of the tree (edges on the longest root-to-leaf path).
   * An empty tree has height −1; a single node has height 0.
   */
  height(): number {
    return this.root === null ? -1 : this.root.height;
  }

  // ── Rotation helpers ──────────────────────────────────────────────

  /** Height of a node (null-safe: null → −1). */
  private h(node: AVLNode<T> | null): number {
    return node === null ? -1 : node.height;
  }

  /** Balance factor of a node: height(left) − height(right). */
  private balanceFactor(node: AVLNode<T>): number {
    return this.h(node.left) - this.h(node.right);
  }

  /** Recompute and store the height from the children's heights. */
  private updateHeight(node: AVLNode<T>): void {
    node.height = 1 + Math.max(this.h(node.left), this.h(node.right));
  }

  /**
   * Right rotation around `y`:
   *
   *       y            x
   *      / \          / \
   *     x   C  →    A   y
   *    / \              / \
   *   A   B            B   C
   */
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

    // Update heights (y first, then x, since x is now y's parent)
    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  /**
   * Left rotation around `x`:
   *
   *     x              y
   *    / \            /  \
   *   A   y    →    x    C
   *      / \       / \
   *     B   C     A   B
   */
  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!;
    const B = y.left;

    // Perform rotation
    y.left = x;
    x.right = B;

    // Update parents
    y.parent = x.parent;
    x.parent = y;
    if (B !== null) B.parent = x;

    // Update parent's child pointer
    if (y.parent === null) {
      this.root = y;
    } else if (y.parent.left === x) {
      y.parent.left = y;
    } else {
      y.parent.right = y;
    }

    // Update heights (x first, then y)
    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  /**
   * Rebalance the subtree rooted at `node` if its balance factor is ±2.
   * Returns the new root of the subtree after any rotations.
   */
  private rebalance(node: AVLNode<T>): AVLNode<T> {
    this.updateHeight(node);
    const bf = this.balanceFactor(node);

    if (bf > 1) {
      // Left-heavy
      if (this.balanceFactor(node.left!) < 0) {
        // Left-Right case
        this.rotateLeft(node.left!);
      }
      // Left-Left case (or Left-Right reduced to Left-Left)
      return this.rotateRight(node);
    }

    if (bf < -1) {
      // Right-heavy
      if (this.balanceFactor(node.right!) > 0) {
        // Right-Left case
        this.rotateRight(node.right!);
      }
      // Right-Right case (or Right-Left reduced to Right-Right)
      return this.rotateLeft(node);
    }

    return node;
  }

  /** Walk from `node` up to the root, rebalancing at every ancestor. */
  private rebalanceUp(node: AVLNode<T> | null): void {
    let current = node;
    while (current !== null) {
      const parent = current.parent; // save before possible rotation
      this.rebalance(current);
      current = parent;
    }
  }

  // ── Deletion helpers ──────────────────────────────────────────────

  /**
   * Replace the subtree rooted at u with the subtree rooted at v
   * (CLRS TRANSPLANT).  Does NOT update v's children.
   */
  private transplant(u: AVLNode<T>, v: AVLNode<T> | null): void {
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

  /**
   * Delete a specific node and rebalance the tree.
   *
   * The approach mirrors CLRS deletion but adds a rebalance walk starting
   * from the lowest modified ancestor.
   */
  private deleteNode(node: AVLNode<T>): void {
    let rebalanceStart: AVLNode<T> | null;

    if (node.left === null) {
      rebalanceStart = node.parent;
      this.transplant(node, node.right);
    } else if (node.right === null) {
      rebalanceStart = node.parent;
      this.transplant(node, node.left);
    } else {
      // Two children — replace with in-order successor
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

  // ── Navigation helpers ────────────────────────────────────────────

  private minNode(node: AVLNode<T> | null): AVLNode<T> | null {
    if (node === null) return null;
    while (node.left !== null) node = node.left;
    return node;
  }

  private maxNode(node: AVLNode<T> | null): AVLNode<T> | null {
    if (node === null) return null;
    while (node.right !== null) node = node.right;
    return node;
  }

  private successorNode(node: AVLNode<T>): AVLNode<T> | null {
    if (node.right !== null) return this.minNode(node.right);
    let current: AVLNode<T> | null = node;
    let parent = current.parent;
    while (parent !== null && current === parent.right) {
      current = parent;
      parent = parent.parent;
    }
    return parent;
  }

  private predecessorNode(node: AVLNode<T>): AVLNode<T> | null {
    if (node.left !== null) return this.maxNode(node.left);
    let current: AVLNode<T> | null = node;
    let parent = current.parent;
    while (parent !== null && current === parent.left) {
      current = parent;
      parent = parent.parent;
    }
    return parent;
  }

  // ── Traversal helpers ─────────────────────────────────────────────

  private inorderHelper(node: AVLNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.inorderHelper(node.left, result);
    result.push(node.value);
    this.inorderHelper(node.right, result);
  }

  private preorderHelper(node: AVLNode<T> | null, result: T[]): void {
    if (node === null) return;
    result.push(node.value);
    this.preorderHelper(node.left, result);
    this.preorderHelper(node.right, result);
  }

  private postorderHelper(node: AVLNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.postorderHelper(node.left, result);
    this.postorderHelper(node.right, result);
    result.push(node.value);
  }
}
