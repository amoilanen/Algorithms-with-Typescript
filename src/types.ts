/**
 * A comparator function that defines a total ordering on elements of type T.
 * Returns a negative number if a < b, zero if a === b, positive if a > b.
 */
export type Comparator<T> = (a: T, b: T) => number;

/** Default comparator for numbers, ascending order. */
export const numberComparator: Comparator<number> = (a, b) => a - b;

/** An edge in a weighted graph. */
export interface Edge<T> {
  from: T;
  to: T;
  weight: number;
}
