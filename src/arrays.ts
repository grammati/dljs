
export function fill<T>(a: T[], val: T): T[] {
  for (let i = 0; i < a.length; ++i) {
    a[i] = val;
  }
  return a;
}

export function ones(length: number): number[] {
  return fill(new Array(length), 1)
}

export function zeros(length: number): number[] {
  return fill(new Array(length), 0)
}

export function map2<T, U, V>(arr1: T[], arr2: U[], f: (a: T, b: U) => V): V[] {
  if (arr1.length !== arr2.length) {
    throw new Error(
      `Arrays are not the same length: ${arr1.length} and ${arr2.length}`
    );
  }
  return arr1.map((v1, i) => f(v1, arr2[i]));
}
