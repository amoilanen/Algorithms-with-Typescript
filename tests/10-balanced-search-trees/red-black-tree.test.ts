import { describe, it, expect } from 'vitest';
import {
  RedBlackTree,
  Color,
} from '../../src/10-balanced-search-trees/red-black-tree';

/**
 * Verify all five red-black properties:
 *   1. Every node is red or black (guaranteed by the Color enum).
 *   2. Root is black.
 *   3. Every leaf (NIL) is black (guaranteed by sentinel construction).
 *   4. No two consecutive red nodes.
 *   5. All paths from a node to its descendant leaves have the same black-height.
 *
 * Also checks that in-order traversal is sorted (BST property).
 */
function verifyRBProperties(tree: RedBlackTree<number>): void {
  // BST property
  const sorted = tree.inorder();
  for (let i = 1; i < sorted.length; i++) {
    expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
  }

  // Red-black structural properties (uses the built-in verify method)
  expect(tree.verify()).toBe(true);

  // Height bound: h ≤ 2 * lg(n + 1) for red-black trees
  if (tree.size > 0) {
    const maxHeight = 2 * Math.log2(tree.size + 1);
    expect(tree.height()).toBeLessThanOrEqual(maxHeight);
  }
}

describe('RedBlackTree', () => {
  describe('empty tree', () => {
    it('should start empty', () => {
      const tree = new RedBlackTree<number>();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it('should return empty arrays for traversals', () => {
      const tree = new RedBlackTree<number>();
      expect(tree.inorder()).toEqual([]);
      expect(tree.preorder()).toEqual([]);
      expect(tree.postorder()).toEqual([]);
      expect(tree.levelOrder()).toEqual([]);
    });

    it('should return undefined for min and max', () => {
      const tree = new RedBlackTree<number>();
      expect(tree.min()).toBeUndefined();
      expect(tree.max()).toBeUndefined();
    });

    it('should return null for search', () => {
      const tree = new RedBlackTree<number>();
      expect(tree.search(5)).toBeNull();
      expect(tree.has(5)).toBe(false);
    });

    it('should have height -1', () => {
      const tree = new RedBlackTree<number>();
      expect(tree.height()).toBe(-1);
    });

    it('should return false for delete', () => {
      const tree = new RedBlackTree<number>();
      expect(tree.delete(5)).toBe(false);
    });

    it('should verify as valid', () => {
      const tree = new RedBlackTree<number>();
      expect(tree.verify()).toBe(true);
    });
  });

  describe('single node', () => {
    it('should have size 1 after one insert', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      expect(tree.size).toBe(1);
      expect(tree.isEmpty).toBe(false);
    });

    it('should have a black root (property 2)', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      const node = tree.search(10);
      expect(node).not.toBeNull();
      expect(node!.color).toBe(Color.Black);
      verifyRBProperties(tree);
    });

    it('should find the inserted value', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      expect(tree.has(10)).toBe(true);
      expect(tree.has(5)).toBe(false);
    });

    it('should return the value for min and max', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      expect(tree.min()).toBe(10);
      expect(tree.max()).toBe(10);
    });

    it('should have height 0', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      expect(tree.height()).toBe(0);
    });

    it('should have no successor or predecessor', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      expect(tree.successor(10)).toBeUndefined();
      expect(tree.predecessor(10)).toBeUndefined();
    });

    it('should delete the only node', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      expect(tree.delete(10)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.has(10)).toBe(false);
      verifyRBProperties(tree);
    });
  });

  describe('insert and red-black properties', () => {
    it('should maintain properties after inserting 3 nodes (triggers recolor)', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);

      expect(tree.inorder()).toEqual([5, 10, 15]);
      verifyRBProperties(tree);
    });

    it('should handle case 3 (uncle is black, node is same-side child)', () => {
      // Insert 30, 20, 10 → left-left case → right rotation
      const tree = new RedBlackTree<number>();
      tree.insert(30);
      tree.insert(20);
      tree.insert(10);

      expect(tree.inorder()).toEqual([10, 20, 30]);
      verifyRBProperties(tree);
    });

    it('should handle case 2+3 (uncle is black, node is opposite-side child)', () => {
      // Insert 30, 10, 20 → left-right case → double rotation
      const tree = new RedBlackTree<number>();
      tree.insert(30);
      tree.insert(10);
      tree.insert(20);

      expect(tree.inorder()).toEqual([10, 20, 30]);
      verifyRBProperties(tree);
    });

    it('should handle right-side symmetric cases', () => {
      // Right-right: 10, 20, 30
      const tree1 = new RedBlackTree<number>();
      tree1.insert(10);
      tree1.insert(20);
      tree1.insert(30);
      expect(tree1.inorder()).toEqual([10, 20, 30]);
      verifyRBProperties(tree1);

      // Right-left: 10, 30, 20
      const tree2 = new RedBlackTree<number>();
      tree2.insert(10);
      tree2.insert(30);
      tree2.insert(20);
      expect(tree2.inorder()).toEqual([10, 20, 30]);
      verifyRBProperties(tree2);
    });

    it('should handle case 1 (uncle is red — recolor propagates up)', () => {
      const tree = new RedBlackTree<number>();
      // This sequence forces a recolor that propagates up
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(3);
      tree.insert(7);
      tree.insert(12);
      tree.insert(20);
      tree.insert(1);

      expect(tree.inorder()).toEqual([1, 3, 5, 7, 10, 12, 15, 20]);
      verifyRBProperties(tree);
    });

    it('should maintain properties with sequential insertions', () => {
      const tree = new RedBlackTree<number>();
      for (let i = 1; i <= 15; i++) tree.insert(i);

      expect(tree.size).toBe(15);
      expect(tree.inorder()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      verifyRBProperties(tree);
    });

    it('should maintain properties with reverse sequential insertions', () => {
      const tree = new RedBlackTree<number>();
      for (let i = 15; i >= 1; i--) tree.insert(i);

      expect(tree.size).toBe(15);
      expect(tree.inorder()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      verifyRBProperties(tree);
    });
  });

  describe('duplicate handling', () => {
    it('should allow duplicate values', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      tree.insert(10);
      tree.insert(10);

      expect(tree.size).toBe(3);
      expect(tree.inorder()).toEqual([10, 10, 10]);
      verifyRBProperties(tree);
    });

    it('should delete only one occurrence of a duplicate', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(10);

      expect(tree.delete(10)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.has(10)).toBe(true);
      verifyRBProperties(tree);
    });
  });

  describe('min and max', () => {
    it('should return correct min and max', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(3);
      tree.insert(20);

      expect(tree.min()).toBe(3);
      expect(tree.max()).toBe(20);
    });

    it('should update after deletions', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);

      tree.delete(5);
      expect(tree.min()).toBe(10);

      tree.delete(15);
      expect(tree.max()).toBe(10);
      verifyRBProperties(tree);
    });
  });

  describe('successor and predecessor', () => {
    function buildTree(): RedBlackTree<number> {
      const tree = new RedBlackTree<number>();
      for (const v of [10, 5, 15, 3, 7, 12, 20]) tree.insert(v);
      return tree;
    }

    it('should find the successor of each node', () => {
      const tree = buildTree();
      expect(tree.successor(3)).toBe(5);
      expect(tree.successor(5)).toBe(7);
      expect(tree.successor(7)).toBe(10);
      expect(tree.successor(10)).toBe(12);
      expect(tree.successor(12)).toBe(15);
      expect(tree.successor(15)).toBe(20);
      expect(tree.successor(20)).toBeUndefined();
    });

    it('should find the predecessor of each node', () => {
      const tree = buildTree();
      expect(tree.predecessor(3)).toBeUndefined();
      expect(tree.predecessor(5)).toBe(3);
      expect(tree.predecessor(7)).toBe(5);
      expect(tree.predecessor(10)).toBe(7);
      expect(tree.predecessor(12)).toBe(10);
      expect(tree.predecessor(15)).toBe(12);
      expect(tree.predecessor(20)).toBe(15);
    });

    it('should return undefined for values not in tree', () => {
      const tree = buildTree();
      expect(tree.successor(99)).toBeUndefined();
      expect(tree.predecessor(99)).toBeUndefined();
    });
  });

  describe('delete with fixup', () => {
    it('should delete a red leaf without fixup', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);

      // 5 and 15 should be red leaves
      expect(tree.delete(5)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.inorder()).toEqual([10, 15]);
      verifyRBProperties(tree);
    });

    it('should delete a black node and run fixup', () => {
      const tree = new RedBlackTree<number>();
      for (const v of [10, 5, 15, 3, 7, 12, 20]) tree.insert(v);

      // Deleting a node that might be black triggers fixup
      expect(tree.delete(5)).toBe(true);
      expect(tree.inorder()).toEqual([3, 7, 10, 12, 15, 20]);
      verifyRBProperties(tree);
    });

    it('should delete the root', () => {
      const tree = new RedBlackTree<number>();
      for (const v of [10, 5, 15, 3, 7, 12, 20]) tree.insert(v);

      expect(tree.delete(10)).toBe(true);
      expect(tree.size).toBe(6);
      expect(tree.inorder()).toEqual([3, 5, 7, 12, 15, 20]);
      verifyRBProperties(tree);
    });

    it('should handle deleting non-existent value', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(10);
      expect(tree.delete(99)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should handle deleting all nodes one by one', () => {
      const tree = new RedBlackTree<number>();
      const values = [10, 5, 15, 3, 7, 12, 20];
      for (const v of values) tree.insert(v);

      for (const v of values) {
        expect(tree.delete(v)).toBe(true);
        verifyRBProperties(tree);
      }
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.inorder()).toEqual([]);
    });

    it('should handle delete fixup case 1 (red sibling)', () => {
      // Build a specific tree to trigger case 1
      const tree = new RedBlackTree<number>();
      for (const v of [20, 10, 30, 5, 15, 25, 40, 35, 45]) tree.insert(v);

      tree.delete(5);
      verifyRBProperties(tree);

      tree.delete(10);
      verifyRBProperties(tree);
    });

    it('should handle delete fixup case 2 (black sibling, both children black)', () => {
      const tree = new RedBlackTree<number>();
      for (const v of [10, 5, 15]) tree.insert(v);

      tree.delete(5);
      verifyRBProperties(tree);
    });

    it('should handle delete fixup cases 3 and 4', () => {
      const tree = new RedBlackTree<number>();
      // Build a larger tree to trigger the more complex fixup cases
      for (const v of [20, 10, 30, 5, 15, 25, 40, 3, 7, 12, 17, 22, 27, 35, 45]) {
        tree.insert(v);
      }

      // Delete several nodes to exercise different fixup paths
      for (const v of [3, 7, 5, 12, 17]) {
        tree.delete(v);
        verifyRBProperties(tree);
      }
    });

    it('should delete where successor is not immediate right child', () => {
      const tree = new RedBlackTree<number>();
      tree.insert(15);
      tree.insert(5);
      tree.insert(20);
      tree.insert(18);
      tree.insert(25);
      tree.insert(16);
      tree.insert(19);

      expect(tree.delete(15)).toBe(true);
      expect(tree.inorder()).toEqual([5, 16, 18, 19, 20, 25]);
      verifyRBProperties(tree);
    });
  });

  describe('traversals', () => {
    function buildTree(): RedBlackTree<number> {
      const tree = new RedBlackTree<number>();
      for (const v of [4, 2, 6, 1, 3, 5, 7]) tree.insert(v);
      return tree;
    }

    it('should produce sorted inorder traversal', () => {
      const tree = buildTree();
      expect(tree.inorder()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should produce valid preorder traversal', () => {
      const tree = buildTree();
      const pre = tree.preorder();
      expect(pre.length).toBe(7);
      // All values present
      expect(pre.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should produce valid postorder traversal', () => {
      const tree = buildTree();
      const post = tree.postorder();
      expect(post.length).toBe(7);
      expect(post.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should produce valid level-order traversal', () => {
      const tree = buildTree();
      const level = tree.levelOrder();
      expect(level.length).toBe(7);
      expect(level.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('custom comparator (strings)', () => {
    it('should work with string comparator', () => {
      const tree = new RedBlackTree<string>((a, b) => a.localeCompare(b));
      tree.insert('mango');
      tree.insert('apple');
      tree.insert('pear');
      tree.insert('banana');

      expect(tree.inorder()).toEqual(['apple', 'banana', 'mango', 'pear']);
      expect(tree.min()).toBe('apple');
      expect(tree.max()).toBe('pear');
      expect(tree.has('banana')).toBe(true);
      expect(tree.has('cherry')).toBe(false);
      expect(tree.verify()).toBe(true);
    });

    it('should support successor/predecessor with strings', () => {
      const tree = new RedBlackTree<string>((a, b) => a.localeCompare(b));
      tree.insert('mango');
      tree.insert('apple');
      tree.insert('pear');
      tree.insert('banana');

      expect(tree.successor('apple')).toBe('banana');
      expect(tree.predecessor('pear')).toBe('mango');
    });
  });

  describe('large dataset', () => {
    it('should handle 1000 sequential insertions with valid properties', () => {
      const tree = new RedBlackTree<number>();
      for (let i = 0; i < 1000; i++) tree.insert(i);

      expect(tree.size).toBe(1000);
      verifyRBProperties(tree);

      const sorted = tree.inorder();
      for (let i = 0; i < 1000; i++) {
        expect(sorted[i]).toBe(i);
      }
    });

    it('should handle 1000 random insertions with valid properties', () => {
      const tree = new RedBlackTree<number>();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        values.push(Math.floor(Math.random() * 10000));
      }
      for (const v of values) tree.insert(v);

      expect(tree.size).toBe(1000);
      verifyRBProperties(tree);

      const sorted = tree.inorder();
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
      }
    });

    it('should handle many insertions and deletions', () => {
      const tree = new RedBlackTree<number>();
      for (let i = 0; i < 100; i++) tree.insert(i);
      expect(tree.size).toBe(100);

      // Delete even numbers
      for (let i = 0; i < 100; i += 2) {
        expect(tree.delete(i)).toBe(true);
        verifyRBProperties(tree);
      }
      expect(tree.size).toBe(50);

      const remaining = tree.inorder();
      expect(remaining.length).toBe(50);
      for (let i = 0; i < remaining.length; i++) {
        expect(remaining[i]).toBe(i * 2 + 1);
      }
    });

    it('should handle interleaved insert and delete', () => {
      const tree = new RedBlackTree<number>();

      // Insert 0..49
      for (let i = 0; i < 50; i++) tree.insert(i);
      // Delete 0..24
      for (let i = 0; i < 25; i++) tree.delete(i);
      // Insert 50..99
      for (let i = 50; i < 100; i++) tree.insert(i);
      // Delete 50..74
      for (let i = 50; i < 75; i++) tree.delete(i);

      expect(tree.size).toBe(50); // 25..49 and 75..99
      verifyRBProperties(tree);

      const sorted = tree.inorder();
      const expected = [
        ...Array.from({ length: 25 }, (_, i) => i + 25),
        ...Array.from({ length: 25 }, (_, i) => i + 75),
      ];
      expect(sorted).toEqual(expected);
    });
  });
});
