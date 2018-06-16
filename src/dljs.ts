type ArrayLike = NDArray | number[] | number;

export class NDArray {
  data: number[];
  shape: number[];

  get size() {
    return this.data.length;
  }

  get ndims() {
    return this.shape.length;
  }

  constructor(data: number[]) {
    this.data = data;
    this.shape = [data.length];
  }

  add(other: ArrayLike): NDArray {
    if (other instanceof Array) {
      return this.add(new NDArray(other));
    }
    if (other instanceof NDArray) {
      return broadcastFn(this, other, (a, b) => a + b);
    }
    return new NDArray(this.data.map(v => v + other));
  }

  setAt(coords: number[], value: number) {
    return this;
  }

  getAt(coords: number[]): number {
    return 0;
  }
}

export function array(data: number[]) {
  return new NDArray(data);
}

export function doTimes(n: number, f: () => void) {
  for (let i = 0; i < n; ++i) {
    f();
  }
}

export function ones(n: number) {
  const a: number[] = [];
  doTimes(n, () => a.push(1));
  return a;
}

export function map2<T,U,V>(arr1: T[], arr2: U[], f: (a:T, b:U) => V): V[] {
  if (arr1.length !== arr2.length) {
    throw new Error(`Arrays are not the same length: ${arr1.length} and ${arr2.length}`)
  }
  return arr1.map((v1, i) => f(v1, arr2[i]));
}

// export function map2()
export function broadcast(shape1: number[], shape2: number[]): number[] {
  const [n1, n2] = [shape1.length, shape2.length];
  if (n1 < n2) {
    return broadcast([...ones(n2-n1), ...shape1], shape2);
  }
  if (n2 < n1) {
    return broadcast(shape1, [...ones(n1-n2), ...shape2]);
  }
  return map2(shape1, shape2, (a,b) => {
    if (a === b) return a;
    if (a === 1) return b;
    if (b === 1) return a;
    throw new Error(`Incompatible shapes: `)
  })
}

export function broadcastFn(
  a: NDArray,
  b: NDArray,
  op: (a: number, b: number) => number
): NDArray {
  for (const x in broadcast(a.shape, b.shape)) {
  }
  return a;
}

// class Array_1D<D1> {
// }
// class Array_2D<D2,D1> extends Array_1D<D1> {
// }
// class Array_3D<D3,D2,D1> extends Array_2D<D2,D1> {
// }

// type W = 'width';
// type H = 'height';
// type C = 'color';
// type S = 'sample'

// function mm<X,Y,Z>(a: Array_2D<X,Y>, b: Array_2D<Y,Z>): Array_3D<X,Y,Z> {
//   return new Array_3D<X,Y,Z>();
// }

// const a = mm(new Array_2D<W,H>(), new Array_2D<H,C>())
// const b = mm(new Array_2D<W,H>(), new Array_2D<W,C>())
