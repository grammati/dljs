// Experiment with trying to make NDArrays with compile-time checks
// for compatible dimensions.
// Does not work - Typescript is not strict enough to do the kinks
// of checks I was hoping for.

interface Dim<Size> {
  size: Size;
}

class Arr<ElementType> {}

class Array_1D<Size> extends Arr<number> {
  d1: Dim<Size>;
  constructor(size: Dim<Size>) {
    super();
    this.d1 = size;
  }
}

class Array_2D<Height, Width> extends Array_1D<Height> {
  d2: Dim<Width>;
  constructor(height: Dim<Height>, width: Dim<Width>) {
    super(height);
    this.d2 = width;
  }
}

const W: Dim<5> = { size: 5 };
const H: Dim<4> = { size: 4 };
const C: Dim<3> = { size: 3 };

function mm<X, Y, Z>(a: Array_2D<X, Y>, b: Array_2D<Y, Z>): Array_2D<X, Z> {
  return new Array_2D<X, Z>(a.d1, b.d2);
}

// Should be OK:
const a = mm(new Array_2D(W,H), new Array_2D(H,C));

// Should not compile - inner dimension of the matrix mult does not match. But
// Typescript lets you do it anyway :(
const b = mm(new Array_2D(W,H), new Array_2D(C,H));
