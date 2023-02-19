/**
 * Utility functions for working with one-dimensional arrays of numbers.
 */

/**
 * Fill an array with values produced by a function. Returns the array.
 */
export function fill<T>(a: T[], f: (i: number) => T): T[] {
  for (let i = 0; i < a.length; ++i) {
    a[i] = f(i);
  }
  return a;
}

export function array<T>(length: number): T[] {
  return new Array<T>(length);
}

export function zeros(length: number): number[] {
  return new Array(length).fill(0);
}

export function ones(length: number): number[] {
  return new Array(length).fill(1);
}

export function product(shape: number[]): number {
  return shape.reduce((a, b) => a * b, 1);
}

export function map2<T, U, V>(arr1: T[], arr2: U[], f: (a: T, b: U) => V): V[] {
  if (arr1.length !== arr2.length) {
    throw new Error(
      `Arrays are not the same length: ${arr1.length} and ${arr2.length}`
    );
  }
  return arr1.map((v1, i) => f(v1, arr2[i]));
}

export function eq<T>(arr1: T[], arr2: T[]): boolean {
  return arr1.length == arr2.length && arr1.every((v, i) => v === arr2[i]);
}

export function of<T>(val: T, length: number) {
  return array<T>(length).fill(val);
}

export function lpad<T>(arr: T[], length: number, val: T): T[] {
  return arr.length < length ? [...of(val, length - arr.length), ...arr] : arr;
}
