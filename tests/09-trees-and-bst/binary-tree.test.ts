import { describe, it, expect } from 'vitest';
import { BinaryTree, BinaryTreeNode } from '../../src/09-trees-and-bst/binary-tree';

describe('BinaryTreeNode', () => {
  it('should create a node with a value and null children', () => {
    const node = new BinaryTreeNode(10);
    expect(node.value).toBe(10);
    expect(node.left).toBeNull();
    expect(node.right).toBeNull();
  });

  it('should create a node with children', () => {
    const left = new BinaryTreeNode(5);
    const right = new BinaryTreeNode(15);
    const root = new BinaryTreeNode(10, left, right);
    expect(root.left).toBe(left);
    expect(root.right).toBe(right);
  });
});

describe('BinaryTree', () => {
  /*
   * Test tree:
   *        1
   *       / \
   *      2   3
   *     / \   \
   *    4   5   6
   */
  function buildTestTree(): BinaryTree<number> {
    const n4 = new BinaryTreeNode(4);
    const n5 = new BinaryTreeNode(5);
    const n6 = new BinaryTreeNode(6);
    const n2 = new BinaryTreeNode(2, n4, n5);
    const n3 = new BinaryTreeNode(3, null, n6);
    const n1 = new BinaryTreeNode(1, n2, n3);
    return new BinaryTree(n1);
  }

  describe('empty tree', () => {
    it('should have size 0', () => {
      const tree = new BinaryTree<number>();
      expect(tree.size()).toBe(0);
    });

    it('should have height -1', () => {
      const tree = new BinaryTree<number>();
      expect(tree.height()).toBe(-1);
    });

    it('should return empty arrays for all traversals', () => {
      const tree = new BinaryTree<number>();
      expect(tree.inorder()).toEqual([]);
      expect(tree.preorder()).toEqual([]);
      expect(tree.postorder()).toEqual([]);
      expect(tree.levelOrder()).toEqual([]);
    });
  });

  describe('single node tree', () => {
    it('should have size 1', () => {
      const tree = new BinaryTree(new BinaryTreeNode(42));
      expect(tree.size()).toBe(1);
    });

    it('should have height 0', () => {
      const tree = new BinaryTree(new BinaryTreeNode(42));
      expect(tree.height()).toBe(0);
    });

    it('should return the single value for all traversals', () => {
      const tree = new BinaryTree(new BinaryTreeNode(42));
      expect(tree.inorder()).toEqual([42]);
      expect(tree.preorder()).toEqual([42]);
      expect(tree.postorder()).toEqual([42]);
      expect(tree.levelOrder()).toEqual([42]);
    });
  });

  describe('inorder traversal', () => {
    it('should return left-root-right order', () => {
      const tree = buildTestTree();
      expect(tree.inorder()).toEqual([4, 2, 5, 1, 3, 6]);
    });
  });

  describe('preorder traversal', () => {
    it('should return root-left-right order', () => {
      const tree = buildTestTree();
      expect(tree.preorder()).toEqual([1, 2, 4, 5, 3, 6]);
    });
  });

  describe('postorder traversal', () => {
    it('should return left-right-root order', () => {
      const tree = buildTestTree();
      expect(tree.postorder()).toEqual([4, 5, 2, 6, 3, 1]);
    });
  });

  describe('level-order traversal', () => {
    it('should return nodes level by level left to right', () => {
      const tree = buildTestTree();
      expect(tree.levelOrder()).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('height', () => {
    it('should return the correct height', () => {
      const tree = buildTestTree();
      expect(tree.height()).toBe(2);
    });

    it('should handle a left-skewed tree', () => {
      const n3 = new BinaryTreeNode(3);
      const n2 = new BinaryTreeNode(2, n3);
      const n1 = new BinaryTreeNode(1, n2);
      const tree = new BinaryTree(n1);
      expect(tree.height()).toBe(2);
    });

    it('should handle a right-skewed tree', () => {
      const n3 = new BinaryTreeNode(3);
      const n2 = new BinaryTreeNode(2, null, n3);
      const n1 = new BinaryTreeNode(1, null, n2);
      const tree = new BinaryTree(n1);
      expect(tree.height()).toBe(2);
    });
  });

  describe('size', () => {
    it('should return the correct number of nodes', () => {
      const tree = buildTestTree();
      expect(tree.size()).toBe(6);
    });
  });

  describe('with string values', () => {
    it('should work with non-numeric types', () => {
      const left = new BinaryTreeNode('b');
      const right = new BinaryTreeNode('c');
      const root = new BinaryTreeNode('a', left, right);
      const tree = new BinaryTree(root);
      expect(tree.inorder()).toEqual(['b', 'a', 'c']);
      expect(tree.preorder()).toEqual(['a', 'b', 'c']);
      expect(tree.postorder()).toEqual(['b', 'c', 'a']);
      expect(tree.levelOrder()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('complex tree structure', () => {
    /*
     *           10
     *          /  \
     *         5    15
     *        / \   / \
     *       3   7 12  20
     *      /     \
     *     1       8
     */
    it('should handle a larger tree correctly', () => {
      const n1 = new BinaryTreeNode(1);
      const n8 = new BinaryTreeNode(8);
      const n3 = new BinaryTreeNode(3, n1);
      const n7 = new BinaryTreeNode(7, null, n8);
      const n12 = new BinaryTreeNode(12);
      const n20 = new BinaryTreeNode(20);
      const n5 = new BinaryTreeNode(5, n3, n7);
      const n15 = new BinaryTreeNode(15, n12, n20);
      const n10 = new BinaryTreeNode(10, n5, n15);
      const tree = new BinaryTree(n10);

      expect(tree.size()).toBe(9);
      expect(tree.height()).toBe(3);
      expect(tree.inorder()).toEqual([1, 3, 5, 7, 8, 10, 12, 15, 20]);
      expect(tree.preorder()).toEqual([10, 5, 3, 1, 7, 8, 15, 12, 20]);
      expect(tree.postorder()).toEqual([1, 3, 8, 7, 5, 12, 20, 15, 10]);
      expect(tree.levelOrder()).toEqual([10, 5, 15, 3, 7, 12, 20, 1, 8]);
    });
  });
});
