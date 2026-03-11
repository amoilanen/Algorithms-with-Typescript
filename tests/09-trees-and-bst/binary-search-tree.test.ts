import { describe, it, expect } from 'vitest';
import { BinarySearchTree } from '../../src/09-trees-and-bst/binary-search-tree.js';

describe('BinarySearchTree', () => {
  describe('empty tree', () => {
    it('should start empty', () => {
      const bst = new BinarySearchTree<number>();
      expect(bst.size).toBe(0);
      expect(bst.isEmpty).toBe(true);
    });

    it('should return empty arrays for traversals', () => {
      const bst = new BinarySearchTree<number>();
      expect(bst.inorder()).toEqual([]);
      expect(bst.preorder()).toEqual([]);
      expect(bst.postorder()).toEqual([]);
      expect(bst.levelOrder()).toEqual([]);
    });

    it('should return undefined for min and max', () => {
      const bst = new BinarySearchTree<number>();
      expect(bst.min()).toBeUndefined();
      expect(bst.max()).toBeUndefined();
    });

    it('should return null for search', () => {
      const bst = new BinarySearchTree<number>();
      expect(bst.search(5)).toBeNull();
      expect(bst.has(5)).toBe(false);
    });

    it('should have height -1', () => {
      const bst = new BinarySearchTree<number>();
      expect(bst.height()).toBe(-1);
    });

    it('should return false for delete', () => {
      const bst = new BinarySearchTree<number>();
      expect(bst.delete(5)).toBe(false);
    });
  });

  describe('single node', () => {
    it('should have size 1 after one insert', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      expect(bst.size).toBe(1);
      expect(bst.isEmpty).toBe(false);
    });

    it('should find the inserted value', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      expect(bst.has(10)).toBe(true);
      expect(bst.has(5)).toBe(false);
    });

    it('should return the value for min and max', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      expect(bst.min()).toBe(10);
      expect(bst.max()).toBe(10);
    });

    it('should have height 0', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      expect(bst.height()).toBe(0);
    });

    it('should have no successor or predecessor', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      expect(bst.successor(10)).toBeUndefined();
      expect(bst.predecessor(10)).toBeUndefined();
    });

    it('should delete the only node', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      expect(bst.delete(10)).toBe(true);
      expect(bst.size).toBe(0);
      expect(bst.isEmpty).toBe(true);
      expect(bst.has(10)).toBe(false);
    });
  });

  describe('insert and search', () => {
    it('should maintain BST property', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(15);
      bst.insert(3);
      bst.insert(7);
      bst.insert(12);
      bst.insert(20);

      // Inorder should be sorted
      expect(bst.inorder()).toEqual([3, 5, 7, 10, 12, 15, 20]);
      expect(bst.size).toBe(7);
    });

    it('should find all inserted values', () => {
      const bst = new BinarySearchTree<number>();
      const values = [10, 5, 15, 3, 7, 12, 20];
      for (const v of values) bst.insert(v);

      for (const v of values) {
        expect(bst.has(v)).toBe(true);
      }
      expect(bst.has(999)).toBe(false);
      expect(bst.has(0)).toBe(false);
    });

    it('should return the node from search', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(15);

      const node = bst.search(5);
      expect(node).not.toBeNull();
      expect(node!.value).toBe(5);
    });

    it('should handle inserting in sorted order (skewed tree)', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(1);
      bst.insert(2);
      bst.insert(3);
      bst.insert(4);
      bst.insert(5);

      expect(bst.inorder()).toEqual([1, 2, 3, 4, 5]);
      expect(bst.height()).toBe(4); // degenerate right-skewed tree
    });

    it('should handle inserting in reverse sorted order (left-skewed)', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(5);
      bst.insert(4);
      bst.insert(3);
      bst.insert(2);
      bst.insert(1);

      expect(bst.inorder()).toEqual([1, 2, 3, 4, 5]);
      expect(bst.height()).toBe(4); // degenerate left-skewed tree
    });
  });

  describe('duplicate handling', () => {
    it('should allow duplicate values', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(10);
      bst.insert(10);

      expect(bst.size).toBe(3);
      expect(bst.inorder()).toEqual([10, 10, 10]);
    });

    it('should find a duplicate value', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(5);
      bst.insert(5);
      expect(bst.has(5)).toBe(true);
    });

    it('should delete only one occurrence of a duplicate', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(10);

      expect(bst.delete(10)).toBe(true);
      expect(bst.size).toBe(2);
      expect(bst.has(10)).toBe(true); // second 10 is still there
    });
  });

  describe('min and max', () => {
    it('should return correct min and max', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(15);
      bst.insert(3);
      bst.insert(20);

      expect(bst.min()).toBe(3);
      expect(bst.max()).toBe(20);
    });

    it('should update after deletions', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(15);

      bst.delete(5);
      expect(bst.min()).toBe(10);

      bst.delete(15);
      expect(bst.max()).toBe(10);
    });
  });

  describe('successor and predecessor', () => {
    /*
     * Tree structure:
     *        10
     *       /  \
     *      5    15
     *     / \   / \
     *    3   7 12  20
     */
    function buildTree(): BinarySearchTree<number> {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(15);
      bst.insert(3);
      bst.insert(7);
      bst.insert(12);
      bst.insert(20);
      return bst;
    }

    it('should find the successor of each node', () => {
      const bst = buildTree();
      expect(bst.successor(3)).toBe(5);
      expect(bst.successor(5)).toBe(7);
      expect(bst.successor(7)).toBe(10);
      expect(bst.successor(10)).toBe(12);
      expect(bst.successor(12)).toBe(15);
      expect(bst.successor(15)).toBe(20);
      expect(bst.successor(20)).toBeUndefined(); // max has no successor
    });

    it('should find the predecessor of each node', () => {
      const bst = buildTree();
      expect(bst.predecessor(3)).toBeUndefined(); // min has no predecessor
      expect(bst.predecessor(5)).toBe(3);
      expect(bst.predecessor(7)).toBe(5);
      expect(bst.predecessor(10)).toBe(7);
      expect(bst.predecessor(12)).toBe(10);
      expect(bst.predecessor(15)).toBe(12);
      expect(bst.predecessor(20)).toBe(15);
    });

    it('should return undefined for values not in tree', () => {
      const bst = buildTree();
      expect(bst.successor(99)).toBeUndefined();
      expect(bst.predecessor(99)).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a leaf node', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(15);

      expect(bst.delete(5)).toBe(true);
      expect(bst.size).toBe(2);
      expect(bst.has(5)).toBe(false);
      expect(bst.inorder()).toEqual([10, 15]);
    });

    it('should delete a node with only a left child', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(3);

      expect(bst.delete(5)).toBe(true);
      expect(bst.size).toBe(2);
      expect(bst.inorder()).toEqual([3, 10]);
    });

    it('should delete a node with only a right child', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(7);

      expect(bst.delete(5)).toBe(true);
      expect(bst.size).toBe(2);
      expect(bst.inorder()).toEqual([7, 10]);
    });

    it('should delete a node with two children', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(15);
      bst.insert(3);
      bst.insert(7);

      expect(bst.delete(5)).toBe(true);
      expect(bst.size).toBe(4);
      expect(bst.inorder()).toEqual([3, 7, 10, 15]);
    });

    it('should delete the root with two children', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(15);
      bst.insert(3);
      bst.insert(7);
      bst.insert(12);
      bst.insert(20);

      expect(bst.delete(10)).toBe(true);
      expect(bst.size).toBe(6);
      const sorted = bst.inorder();
      expect(sorted).toEqual([3, 5, 7, 12, 15, 20]);
    });

    it('should delete the root with one child', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);

      expect(bst.delete(10)).toBe(true);
      expect(bst.size).toBe(1);
      expect(bst.inorder()).toEqual([5]);
    });

    it('should handle deleting non-existent value', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      expect(bst.delete(99)).toBe(false);
      expect(bst.size).toBe(1);
    });

    it('should handle deleting all nodes one by one', () => {
      const bst = new BinarySearchTree<number>();
      const values = [10, 5, 15, 3, 7, 12, 20];
      for (const v of values) bst.insert(v);

      for (const v of values) {
        expect(bst.delete(v)).toBe(true);
      }
      expect(bst.size).toBe(0);
      expect(bst.isEmpty).toBe(true);
      expect(bst.inorder()).toEqual([]);
    });

    it('should delete where successor is not immediate right child', () => {
      const bst = new BinarySearchTree<number>();
      // Build tree where successor of root (15) has its own right child
      bst.insert(15);
      bst.insert(5);
      bst.insert(20);
      bst.insert(18);
      bst.insert(25);
      bst.insert(16);
      bst.insert(19);

      // Delete 15: successor is 16 (min of right subtree)
      // 16 is not the immediate right child of 15
      expect(bst.delete(15)).toBe(true);
      const sorted = bst.inorder();
      expect(sorted).toEqual([5, 16, 18, 19, 20, 25]);
    });
  });

  describe('traversals', () => {
    /*
     *        10
     *       /  \
     *      5    15
     *     / \   / \
     *    3   7 12  20
     */
    function buildTree(): BinarySearchTree<number> {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(15);
      bst.insert(3);
      bst.insert(7);
      bst.insert(12);
      bst.insert(20);
      return bst;
    }

    it('should produce sorted inorder traversal', () => {
      const bst = buildTree();
      expect(bst.inorder()).toEqual([3, 5, 7, 10, 12, 15, 20]);
    });

    it('should produce correct preorder traversal', () => {
      const bst = buildTree();
      expect(bst.preorder()).toEqual([10, 5, 3, 7, 15, 12, 20]);
    });

    it('should produce correct postorder traversal', () => {
      const bst = buildTree();
      expect(bst.postorder()).toEqual([3, 7, 5, 12, 20, 15, 10]);
    });

    it('should produce correct level-order traversal', () => {
      const bst = buildTree();
      expect(bst.levelOrder()).toEqual([10, 5, 15, 3, 7, 12, 20]);
    });
  });

  describe('height', () => {
    it('should be 0 for a single node', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      expect(bst.height()).toBe(0);
    });

    it('should reflect the longest path', () => {
      const bst = new BinarySearchTree<number>();
      bst.insert(10);
      bst.insert(5);
      bst.insert(15);
      bst.insert(3);
      bst.insert(7);
      bst.insert(12);
      bst.insert(20);
      expect(bst.height()).toBe(2);
    });

    it('should be n-1 for a skewed tree of n nodes', () => {
      const bst = new BinarySearchTree<number>();
      for (let i = 1; i <= 10; i++) bst.insert(i);
      expect(bst.height()).toBe(9);
    });
  });

  describe('custom comparator (strings)', () => {
    it('should work with string comparator', () => {
      const bst = new BinarySearchTree<string>((a, b) => a.localeCompare(b));
      bst.insert('mango');
      bst.insert('apple');
      bst.insert('pear');
      bst.insert('banana');

      expect(bst.inorder()).toEqual(['apple', 'banana', 'mango', 'pear']);
      expect(bst.min()).toBe('apple');
      expect(bst.max()).toBe('pear');
      expect(bst.has('banana')).toBe(true);
      expect(bst.has('cherry')).toBe(false);
    });

    it('should support successor/predecessor with strings', () => {
      const bst = new BinarySearchTree<string>((a, b) => a.localeCompare(b));
      bst.insert('mango');
      bst.insert('apple');
      bst.insert('pear');
      bst.insert('banana');

      expect(bst.successor('apple')).toBe('banana');
      expect(bst.predecessor('pear')).toBe('mango');
    });
  });

  describe('large dataset', () => {
    it('should handle 1000 insertions and remain sorted', () => {
      const bst = new BinarySearchTree<number>();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        values.push(Math.floor(Math.random() * 10000));
      }
      for (const v of values) bst.insert(v);

      expect(bst.size).toBe(1000);

      const sorted = bst.inorder();
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
      }
    });

    it('should handle many insertions and deletions', () => {
      const bst = new BinarySearchTree<number>();
      for (let i = 0; i < 100; i++) bst.insert(i);
      expect(bst.size).toBe(100);

      // Delete even numbers
      for (let i = 0; i < 100; i += 2) {
        expect(bst.delete(i)).toBe(true);
      }
      expect(bst.size).toBe(50);

      // Remaining should be odd numbers in order
      const remaining = bst.inorder();
      expect(remaining.length).toBe(50);
      for (let i = 0; i < remaining.length; i++) {
        expect(remaining[i]).toBe(i * 2 + 1);
      }
    });
  });
});
