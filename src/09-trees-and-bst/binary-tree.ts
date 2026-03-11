/**
 * A node in a binary tree.
 */
export class BinaryTreeNode<T> {
  constructor(
    public value: T,
    public left: BinaryTreeNode<T> | null = null,
    public right: BinaryTreeNode<T> | null = null,
  ) {}
}

/**
 * A generic binary tree supporting the four standard traversal orders:
 * inorder (left-root-right), preorder (root-left-right),
 * postorder (left-right-root), and level-order (breadth-first).
 *
 * This class provides a general-purpose binary tree where nodes are
 * constructed externally and linked together. It serves as a foundation
 * for understanding tree structure and traversals before moving on to
 * binary search trees.
 *
 * Time complexity:
 *   - All traversals: O(n) where n is the number of nodes
 *   - height: O(n)
 *   - size: O(n)
 *
 * Space complexity:
 *   - Recursive traversals: O(h) stack space where h is the tree height
 *   - Level-order traversal: O(w) where w is the maximum width
 */
export class BinaryTree<T> {
  constructor(public root: BinaryTreeNode<T> | null = null) {}

  /**
   * Inorder traversal (left, root, right).
   * For a BST, this produces elements in sorted order.
   */
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

  /**
   * Preorder traversal (root, left, right).
   * Useful for serializing/copying a tree.
   */
  preorder(): T[] {
    const result: T[] = [];
    this.preorderHelper(this.root, result);
    return result;
  }

  private preorderHelper(node: BinaryTreeNode<T> | null, result: T[]): void {
    if (node === null) return;
    result.push(node.value);
    this.preorderHelper(node.left, result);
    this.preorderHelper(node.right, result);
  }

  /**
   * Postorder traversal (left, right, root).
   * Useful for deleting a tree or evaluating expression trees.
   */
  postorder(): T[] {
    const result: T[] = [];
    this.postorderHelper(this.root, result);
    return result;
  }

  private postorderHelper(node: BinaryTreeNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.postorderHelper(node.left, result);
    this.postorderHelper(node.right, result);
    result.push(node.value);
  }

  /**
   * Level-order (breadth-first) traversal.
   * Visits nodes level by level from left to right.
   */
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

  /**
   * The height of the tree (number of edges on the longest root-to-leaf path).
   * An empty tree has height -1; a single node has height 0.
   */
  height(): number {
    return this.heightHelper(this.root);
  }

  private heightHelper(node: BinaryTreeNode<T> | null): number {
    if (node === null) return -1;
    return 1 + Math.max(this.heightHelper(node.left), this.heightHelper(node.right));
  }

  /**
   * The number of nodes in the tree.
   */
  size(): number {
    return this.sizeHelper(this.root);
  }

  private sizeHelper(node: BinaryTreeNode<T> | null): number {
    if (node === null) return 0;
    return 1 + this.sizeHelper(node.left) + this.sizeHelper(node.right);
  }
}
