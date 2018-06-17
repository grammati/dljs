// Experiment with trying to make NDArrays with compile-time checks
// for compatible dimensions.
// Does not work - Typescript is not strict enough to do the kinks
// of checks I was hoping for.

class Array_1D<D1> {
}
class Array_2D<D2,D1> extends Array_1D<D1> {
}
class Array_3D<D3,D2,D1> extends Array_2D<D2,D1> {
}

type W = 'width';
type H = 'height';
type C = 'color';
type S = 'sample'

function mm<X,Y,Z>(a: Array_2D<X,Y>, b: Array_2D<Y,Z>): Array_3D<X,Y,Z> {
  return new Array_3D<X,Y,Z>();
}

// Should be OK:
const a = mm(new Array_2D<W,H>(), new Array_2D<H,C>())

// Should not compile - inner dimension of the matrix mult does not match. But Typescript lets you do it anyway :(
const b = mm(new Array_2D<W,H>(), new Array_2D<W,C>())
