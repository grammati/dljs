// Experiment with trying to make NDArrays with compile-time checks
// for compatible dimensions.
// Does not work - Typescript is not strict enough to do the kinks
// of checks I was hoping for.

type Dim<Name extends string> = number & {
  __dimension_name__: Name;
};

function dim<Name extends string>(name: Name, size: number): Dim<Name> {
  return size as Dim<Name>;
}

class Arr {}

class Array_1D<D1Name extends string> extends Arr {
  shape: [Dim<D1Name>];
  data: number[];
  constructor(size: Dim<D1Name>) {
    super();
    this.shape = [size];
    this.data = new Array(size);
    this.data.fill(0);
  }
}

class Array_2D<D1Name extends string, D2Name extends string> extends Arr {
  shape: [Dim<D1Name>, Dim<D2Name>];
  data: number[][];
  constructor(d1: Dim<D1Name>, d2: Dim<D2Name>) {
    super();
    this.shape = [d1, d2];
    this.data = new Array(d1);
    for (let i = 0; i < d1; i++) {
      const row = new Array(d2);
      row.fill(0);
      this.data[i] = row;
    }
  }
}

// class NDArray<Dims extends [Dim1, ...DimRest[]]> {}

// type W = 'W';
// type H = 'H';
// type C = 'C';
// const W: W = 'W';
// const H: H = 'H';
// const C: C = 'C';
// class W {}
// class H {}
// class C {}
const W = dim("W", 10);
const H = dim("H", 8);
const C = dim("C", 3);

type Same<T1, T2> = T1 extends T2 ? (T2 extends T1 ? true : false) : false;

type MatMulResult<A, B> = A extends Array_2D<infer A1, infer A2>
  ? B extends Array_2D<infer B1, infer B2>
    ? Same<A2, B1> extends true
      ? Array_2D<A1, B2>
      : never
    : never
  : never;

// Matrix multiplication
function mm<
  X extends string,
  Y1 extends string,
  Y2 extends string,
  Z extends string
>(
  a: Array_2D<X, Y1>,
  b: Array_2D<Y2, Z>
): MatMulResult<typeof a, typeof b> {
  if ((a.shape[1] as number) !== (b.shape[0] as number)) {
    throw new Error("Incompatible dimensions");
  }
  const result = new Array_2D<X, Z>(a.shape[0], b.shape[1]);
  for (let i = 0; i < a.shape[0]; i++) {
    for (let j = 0; j < b.shape[1]; j++) {
      let sum = 0;
      for (let k = 0; k < a.shape[1]; k++) {
        sum += a.data[i][k] * b.data[k][j];
      }
      result.data[i][j] = sum;
    }
  }
  return result; // satisfies MatMulResult<typeof a, typeof b>;
}

// Should be OK:
const a = mm(new Array_2D(W, H), new Array_2D(H, C));

// Should not compile - inner dimension of the matrix mult does not match. But
// Typescript lets you do it anyway :(

// OK, with the current version it does infer type `never` for the result. Not
// ideal, as it does not give a good error message, and does not show the error
// at the call site (only when you try to use the result).
const b = mm(new Array_2D(W, H), new Array_2D(C, H));
