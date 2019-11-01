// Experiment with trying to make NDArrays with compile-time checks
// for compatible dimensions.
// Does not work - Typescript is not strict enough to do the kinks
// of checks I was hoping for.

interface Dim {
  size: number;
}

class Arr<ElementType> {}

class Array_1D<Size> extends Arr<number> {
  d1: Size;;
  constructor(size: Size) {
    super();
    this.d1 = size;
  }
}

class Array_2D<Height extends Dim, Width extends Dim> extends Array_1D<Height> {
  d2: Width;
  constructor(height: Height, width: Width) {
    super(height);
    this.d2 = width;
  }
}

// type W = 'W';
// type H = 'H';
// type C = 'C';
// const W: W = 'W';
// const H: H = 'H';
// const C: C = 'C';
class W {}
class H {}
class C {}

function mm<X, Y, Z>(a: Array_2D<X, Y>, b: Array_2D<Y, Z>): [Array_2D<X,Z>, Y, Y] {
  return [new Array_2D(a.d1, b.d2), a.d2, b.d1];
}

// Should be OK:
const a = mm(new Array_2D(W,H), new Array_2D(H,C));

// Should not compile - inner dimension of the matrix mult does not match. But
// Typescript lets you do it anyway :(
const b = mm(new Array_2D(W,H), new Array_2D(C,H));

function flarp<T,U,V>(a: [T,U], b: [U,V]): [T,V] {
  return [a[0], b[1]];
}
const xxx = flarp([1,'hi'], ['bye',true]);
const yyy = flarp([1,new H], [new C, 'bye']);

class Thing<T,U> {
  a: T;
  b: U;
  constructor(a: T, b: U) {
    this.a = a;
    this.b = b;
  }
}
function flarp2<T,U,V>(a: Thing<T,U>, b: Thing<U,V>): [T,V] {
  return [a.a, b.b];
}
const zzz = flarp2(new Thing(1,'hi'), new Thing('bye', true));
const xyz = flarp2(new Thing(1,'hi'), new Thing(new C, 'bye'));

// Testing how typescript enforces consistency of type parameters
function foo<T>(a: T[], b: T[]): T[] {
  return [...a, ...b];
}
foo([1,2], ['foo', 'bar'])

function bar<T>(a: T[], b: T[]): void {
  a.concat(b);
}
bar([1,2], ['foo', 'bar'])
