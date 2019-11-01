import * as arrays from "./arrays";

type ArrayLike = NDArray | number | number[];

export class NDArray {
  private _data: number[];
  private _shape: number[];
  private offset: number;
  private dataLength: number;
  private strides: number[];

  get shape() {
    return this._shape;
  }

  get size() {
    return this.data.length;
  }

  get ndims() {
    return this._shape.length;
  }

  get data(): number[] {
    this.disconnect();
    return this._data;
  }

  disconnect() {
    if (this.offset > 0 || this.dataLength !== this._data.length) {
      // This is a view on a shared data array. Copy our piece of it.
      this._data = arrays.slice(this._data, this.offset, this.dataLength);
      this.offset = 0;
      this.dataLength = this._data.length;
    }
  }

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

  reshape(shape: number[]): NDArray {
    return new NDArray(this._data, shape, this.offset, this.dataLength);
  }

  private validateShapeMatchesData() {
    if (this.dataLength !== this._shape.reduce((a, b) => a * b)) {
      throw new Error("Shape is not compatible with size of data array");
    }
  }

  item(idx: number): NDArray {
    const shape = [...this._shape];
    shape.shift();
    return new NDArray(
      this.data,
      shape,
      this.strides[0] * idx,
      this.strides[0]
    );
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
    const [i, ...rest] = coords;
    if (rest.length > 0) {
      return this.item(i).getAt(rest)
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

function strides(shape: number[]): number[] {
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
    strides(arrays.lpad(shape2, ndims, 1))
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
      broadcastInto(a.item(i), b.item(i), op, out.item(i))
    }
  } else {
    // innermost dimension
    for (let i = 0; i < v; ++i) {
      out.setAt([i], op(a.getAt([i]), b.getAt([i])))
    }
  }
}
