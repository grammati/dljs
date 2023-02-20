/**
 * Provides the NDArray class, which represents an n-dimensional array.
 *
 * NDArrays are closely modeled after numpy ndarrays.
 */
import * as arrays from "./arrays";

type ArrayLike = NDArray | number | number[];

export class NDArray {
  private _data: number[];
  private _shape: number[];
  private offset: number;
  private dataLength: number;
  private strides: number[];

  constructor(
    data: number[],
    shape?: number[],
    offset?: number,
    dataLength?: number
  ) {
    this._data = data;
    this._shape = shape || [data.length];
    this.dataLength = dataLength || data.length;
    this.offset = offset || 0;
    this.strides = strides(this._shape);
    this.validateShapeMatchesData();
  }

  *[Symbol.iterator]() {
    // Iterate over the first dimension, yielding an NDArray for each row.
    if (this.ndims == 1) {
      for (let i = this.offset; i < this.offset + this.dataLength; i++) {
        yield this._data[i];
      }
    }
    for (let i = 0; i < this._shape[0]; i++) {
      yield this.at(i);
    }
  }

  get shape() {
    return this._shape;
  }

  get ndims() {
    return this._shape.length;
  }

  /**
   * Returns a 1-dimensional array of the data in this array.
   */
  flat(): number[] {
    return this._data.slice(this.offset, this.offset + this.dataLength);
  }

  disconnect() {
    if (this.offset > 0 || this.dataLength !== this._data.length) {
      // This is a view on a shared data array. Copy our piece of it.
      this._data = this.flat();
      this.offset = 0;
      this.dataLength = this._data.length;
    }
  }

  reshape(shape: number[]): NDArray {
    return new NDArray(this._data, shape, this.offset, this.dataLength);
  }

  private validateShapeMatchesData() {
    if (this.dataLength !== this._shape.reduce((a, b) => a * b)) {
      throw new Error("Shape is not compatible with size of data array");
    }
  }

  at(idx: number): NDArray {
    const shape = [...this._shape];
    shape.shift();
    return new NDArray(
      this._data,
      shape,
      this.strides[0] * idx,
      this.strides[0]
    );
  }

  add(other: ArrayLike): NDArray {
    return this.binop(other, (a, b) => a + b);
  }

  sub(other: ArrayLike): NDArray {
    return this.binop(other, (a, b) => a - b);
  }

  mul(other: ArrayLike): NDArray {
    return this.binop(other, (a, b) => a * b);
  }

  div(other: ArrayLike): NDArray {
    return this.binop(other, (a, b) => a / b);
  }

  binop(other: ArrayLike, fn: (a: number, b: number) => number): NDArray {
    if (other instanceof Array) {
      return this.binop(new NDArray(other), fn);
    }
    if (other instanceof NDArray) {
      return broadcastFn(this, other, fn);
    }
    return new NDArray(this._data.map((v) => fn(v, other)));
  }

  iadd(other: ArrayLike): NDArray {
    return this.binopInplace(other, (a, b) => a + b);
  }

  binopInplace(
    other: ArrayLike,
    fn: (a: number, b: number) => number
  ): NDArray {
    if (other instanceof Array) {
      return this.binopInplace(new NDArray(other), fn);
    }
    if (typeof other === "number") {
      return this.binopInplace(new NDArray([other]), fn);
    }
    broadcastInto(this, other, fn, this);
    return this;
  }

  reduce(
    axis: number,
    fn: (a: number, b: number) => number,
    initial: number
  ): NDArray {
    if (axis >= this.ndims) {
      throw new Error(
        `Axis ${axis} out of range for array of dimension ${this.ndims}`
      );
    }
    if (this.ndims === 1) {
      // Return a scalar.
      return new NDArray([this._data.reduce(fn, initial)], []);
    }
    if (axis === 0) {
      const newShape = [...this._shape];
      newShape.splice(axis, 1);
      const result = zeros(newShape);
      for (const subarray of this) {
        result.iadd(subarray);
      }
      return result;
    } else {
      throw new Error("Not implemented");
    }
  }

  reduceInto(
    axis: number,
    fn: (a: number, b: number) => number,
    initial: number,
    destination: NDArray
  ) {
    if (axis >= this.ndims) {
      throw new Error(
        `Axis ${axis} out of range for array of dimension ${this.ndims}`
      );
    }
    if (this.ndims === 1) {
      destination.setAt([0], this._data.reduce(fn, initial));
    }
    for (const [i, subarray] of enumerate(this)) {
      subarray.reduceInto(axis - 1, fn, initial, destination.item(i));
    }
  }

  sum(axis = 0): NDArray | number {
    return this.reduce(axis, (a, b) => a + b, 0);
  }

  setAt(coords: number[], value: number): void {
    const [i, ...rest] = coords;
    if (rest.length > 0) {
      this.at(i).setAt(rest, value);
    } else {
      this._data[i + this.offset] = value;
    }
  }

  getAt(coords: number[]): number {
    const [i, ...rest] = coords;
    if (rest.length > 0) {
      return this.at(i).getAt(rest);
    }
    return this._data[i + this.offset];
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

export function strides(shape: number[]): number[] {
  const strides: number[] = [];
  let stride = 1;
  for (let i = shape.length - 1; i >= 0; --i) {
    const a = shape[i];
    strides.unshift(a === 1 ? 0 : stride);
    stride *= a;
  }
  return strides;
}

export function conform(
  shape1: number[],
  shape2: number[]
): [number[], number[]] {
  // return an array of numbers that tell you how far to move ahead in the
  // underlying data array when moving ahead by one in the corresponding
  // dimension.
  // eg: conform([2,3], [2,3]) => [3,1]
  const ndims = Math.max(shape1.length, shape2.length);
  return [
    strides(arrays.lpad(shape1, ndims, 1)),
    strides(arrays.lpad(shape2, ndims, 1)),
  ];
}

export function broadcastFn(
  a: NDArray,
  b: NDArray,
  op: (a: number, b: number) => number
): NDArray {
  const outShape = broadcast(a.shape, b.shape);
  const size = sizeOf(outShape);
  const out = new NDArray(arrays.array<number>(size), outShape);

  broadcastInto(a, b, op, out);
  return out;
}

function broadcastInto(
  a: NDArray,
  b: NDArray,
  op: (a: number, b: number) => number,
  out: NDArray
): void {
  const [aStrides, bStrides] = conform(a.shape, b.shape);

  const [v, ...rest] = out.shape;
  if (rest.length > 0) {
    for (let i = 0; i < v; ++i) {
      broadcastInto(a.at(i), b.at(i), op, out.at(i));
    }
  } else {
    // innermost dimension
    for (let i = 0; i < v; ++i) {
      out.setAt([i], op(a.getAt([i]), b.getAt([i])));
    }
  }
}

function* enumerate<T>(iterable: Iterable<T>): Iterable<[number, T]> {
  let i = 0;
  for (const item of iterable) {
    yield [i, item];
    ++i;
  }
}
