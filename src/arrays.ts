export function fill<T>(a: T[], val: T): T[] {
  for (let i = 0; i < a.length; ++i) {
    a[i] = val;
  }
  return a;
}

export function array<T>(length: number): T[] {
  return new Array<T>(length);
}

export function ones(length: number): number[] {
  return fill(new Array(length), 1);
}

export function zeros(length: number): number[] {
  return fill(new Array(length), 0);
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
  return fill(array<T>(length), val);
}

export function lpad<T>(arr: T[], length: number, val: T): T[] {
  return arr.length < length ? [...of(val, length - arr.length), ...arr] : arr;
}

export function slice<T>(arr: T[], start: number, length: number): T[] {
  if (start + length > arr.length) {
    throw new Error(
      `Index out of bounds: array length == ${
        arr.length
      }, start == ${start}, length == ${length}`
    );
  }
  const out = array<T>(length);
  for (let i = 0; i < length; ++i) {
    out[i] = arr[i + start];
  }
  return out;
}
