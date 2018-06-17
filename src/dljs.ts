import * as arrays from "./arrays";

type ArrayLike = NDArray | number | number[];

export class NDArray {
  readonly data: number[];
  readonly shape: number[];

  get size() {
    return this.data.length;
  }

  get ndims() {
    return this.shape.length;
  }

  constructor(data: number[], shape?: number[]) {
    this.data = data;
    this.shape = shape || [data.length];
    this.validateShapeMatchesData();
  }

  private validateShapeMatchesData() {
    if (this.data.length !== this.shape.reduce((a, b) => a * b)) {
      throw new Error("Shape is not compatible with size of data array");
    }
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

export function sizeOf(shape: number[]) {
  return shape.reduce((a, b) => a * b);
}

export function array(data: number[]) {
  return new NDArray(data);
}

export function ones(shape: number | number[]): NDArray {
  if (typeof shape === "number") shape = [shape];
  return new NDArray(arrays.ones(sizeOf(shape)), shape);
}

export function zeros(shape: number | number[]): NDArray {
  if (typeof shape === "number") shape = [shape];
  return new NDArray(arrays.zeros(sizeOf(shape)), shape);
}

export function broadcast(shape1: number[], shape2: number[]): number[] {
  const [n1, n2] = [shape1.length, shape2.length];
  if (n1 < n2) {
    return broadcast([...arrays.ones(n2 - n1), ...shape1], shape2);
  }
  if (n2 < n1) {
    return broadcast(shape1, [...arrays.ones(n1 - n2), ...shape2]);
  }
  return arrays.map2(shape1, shape2, (a, b) => {
    if (a === b) return a;
    if (a === 1) return b;
    if (b === 1) return a;
    throw new Error(`Incompatible shapes: ${shape1}, ${shape2}`);
  });
}

export function broadcastFn(
  a: NDArray,
  b: NDArray,
  op: (a: number, b: number) => number
): NDArray {
  if (arrays.eq(a.shape, b.shape)) {
    // Fast-path (maybe... I haven't measured)
    const size = sizeOf(a.shape);
    const out = arrays.array<number>(size);
    const da = a.data;
    const db = b.data;
    for (let i = 0; i < size; ++i) {
      // Assuming/hoping the JIT inlines this:
      out[i] = op(da[i], db[i]);
    }
    return new NDArray(out, a.shape);
  } else {
    const outShape = broadcast(a.shape, b.shape);
    const size = sizeOf(outShape);
    return new NDArray(arrays.zeros(size), outShape);
  }
}
