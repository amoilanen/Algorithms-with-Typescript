import type { Comparator } from '../types';
import { numberComparator } from '../types';

/**
 * A node in a binary search tree.
 */
export class BSTNode<T> {
  constructor(
    public value: T,
    public left: BSTNode<T> | null = null,
    public right: BSTNode<T> | null = null,
    public parent: BSTNode<T> | null = null,
  ) {}
}

/**
 * A generic binary search tree (BST).
 *
 * The BST property is maintained via a comparator function: for every node,
 * all values in its left subtree compare less than its value, and all values
 * in its right subtree compare greater. Duplicate values are placed in the
 * right subtree (i.e., duplicates are allowed and stored to the right).
 *
 * Operations:
 *   - insert(value): Insert a value into the tree.
 *   - search(value): Find the node containing a value.
 *   - delete(value): Remove a value from the tree.
 *   - min() / max(): Find the minimum / maximum value.
 *   - successor(value) / predecessor(value): Find the in-order successor / predecessor.
 *   - inorder(): Return all values in sorted order.
 *
 * Time complexity (where h is the tree height):
 *   - search, insert, delete, min, max, successor, predecessor: O(h)
 *   - inorder traversal: O(n)
 *   - For a balanced tree h = O(log n); for a skewed tree h = O(n).
 *
 * Space complexity: O(n) for storing n nodes.
 */
export class BinarySearchTree<T> {
  private root: BSTNode<T> | null = null;
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

  /**
   * Insert a value into the BST.
   * Duplicates are allowed and placed in the right subtree.
   */
  insert(value: T): void {
    const newNode = new BSTNode(value);
    this.count++;

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

  /**
   * Search for a value in the BST.
   * Returns the node if found, or null if not present.
   */
  search(value: T): BSTNode<T> | null {
    let current = this.root;
    while (current !== null) {
      const cmp = this.compare(value, current.value);
      if (cmp === 0) return current;
      current = cmp < 0 ? current.left : current.right;
    }
    return null;
  }

  /**
   * Check whether a value exists in the tree.
   */
  has(value: T): boolean {
    return this.search(value) !== null;
  }

  /**
   * Delete a value from the BST.
   * Returns true if the value was found and removed, false otherwise.
   *
   * Deletion handles three cases:
   *   1. Node has no children: remove it directly.
   *   2. Node has one child: replace it with its child.
   *   3. Node has two children: replace it with its in-order successor
   *      (the minimum of the right subtree), then delete the successor.
   */
  delete(value: T): boolean {
    const node = this.search(value);
    if (node === null) return false;
    this.deleteNode(node);
    this.count--;
    return true;
  }

  /**
   * Return the minimum value in the tree, or undefined if empty.
   */
  min(): T | undefined {
    const node = this.minNode(this.root);
    return node?.value;
  }

  /**
   * Return the maximum value in the tree, or undefined if empty.
   */
  max(): T | undefined {
    const node = this.maxNode(this.root);
    return node?.value;
  }

  /**
   * Find the in-order successor of a given value (the smallest value
   * strictly greater than the given value).
   * Returns undefined if no successor exists or the value is not in the tree.
   */
  successor(value: T): T | undefined {
    const node = this.search(value);
    if (node === null) return undefined;
    const succ = this.successorNode(node);
    return succ?.value;
  }

  /**
   * Find the in-order predecessor of a given value (the largest value
   * strictly less than the given value).
   * Returns undefined if no predecessor exists or the value is not in the tree.
   */
  predecessor(value: T): T | undefined {
    const node = this.search(value);
    if (node === null) return undefined;
    const pred = this.predecessorNode(node);
    return pred?.value;
  }

  /**
   * Return all values in the tree in sorted (in-order) order.
   */
  inorder(): T[] {
    const result: T[] = [];
    this.inorderHelper(this.root, result);
    return result;
  }

  /**
   * Return values in preorder (root, left, right).
   */
  preorder(): T[] {
    const result: T[] = [];
    this.preorderHelper(this.root, result);
    return result;
  }

  /**
   * Return values in postorder (left, right, root).
   */
  postorder(): T[] {
    const result: T[] = [];
    this.postorderHelper(this.root, result);
    return result;
  }

  /**
   * Return values in level-order (breadth-first).
   */
  levelOrder(): T[] {
    if (this.root === null) return [];

    const result: T[] = [];
    const queue: BSTNode<T>[] = [this.root];

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node.value);
      if (node.left !== null) queue.push(node.left);
      if (node.right !== null) queue.push(node.right);
    }

    return result;
  }

  /**
   * The height of the tree (number of edges on the longest root-to-leaf path).
   * An empty tree has height -1; a single node has height 0.
   */
  height(): number {
    return this.heightHelper(this.root);
  }

  // ── Private helpers ────────────────────────────────────────────────

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

  /**
   * Find the in-order successor of a node.
   * If the node has a right subtree, the successor is the minimum of that subtree.
   * Otherwise, walk up the tree until we find an ancestor whose left child
   * is also an ancestor of the node (or the node itself).
   */
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

  /**
   * Find the in-order predecessor of a node.
   * If the node has a left subtree, the predecessor is the maximum of that subtree.
   * Otherwise, walk up the tree until we find an ancestor whose right child
   * is also an ancestor of the node (or the node itself).
   */
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

  /**
   * Replace the subtree rooted at node u with the subtree rooted at node v.
   * This is the CLRS TRANSPLANT procedure.
   */
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

  /**
   * Delete a specific node from the tree (CLRS-style three-case deletion).
   */
  private deleteNode(node: BSTNode<T>): void {
    if (node.left === null) {
      // Case 1 & 2a: no left child — replace with right child (possibly null)
      this.transplant(node, node.right);
    } else if (node.right === null) {
      // Case 2b: no right child — replace with left child
      this.transplant(node, node.left);
    } else {
      // Case 3: two children — replace with in-order successor
      const successor = this.minNode(node.right)!;
      if (successor.parent !== node) {
        // Successor is not the immediate right child
        this.transplant(successor, successor.right);
        successor.right = node.right;
        successor.right.parent = successor;
      }
      this.transplant(node, successor);
      successor.left = node.left;
      successor.left.parent = successor;
    }
  }

  private inorderHelper(node: BSTNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.inorderHelper(node.left, result);
    result.push(node.value);
    this.inorderHelper(node.right, result);
  }

  private preorderHelper(node: BSTNode<T> | null, result: T[]): void {
    if (node === null) return;
    result.push(node.value);
    this.preorderHelper(node.left, result);
    this.preorderHelper(node.right, result);
  }

  private postorderHelper(node: BSTNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.postorderHelper(node.left, result);
    this.postorderHelper(node.right, result);
    result.push(node.value);
  }

  private heightHelper(node: BSTNode<T> | null): number {
    if (node === null) return -1;
    return 1 + Math.max(this.heightHelper(node.left), this.heightHelper(node.right));
  }
}
