// Test the performance of large NDArray operations.
// Determine what representation to use:
//   - The obvioius nested array of arrays
//   - A flat array with a shape and strides and all that fancy stuff
//     - As a plain JS array, or
//     - As a typed array (eg: Float32Array)
//  - something else? eg: some webgl thing?
import * as arrays from "./arrays";

function timeit(f: () => void) {
  const now = () => new Date().getTime();
  const start = now();
  f();
  const end = now();
  return end - start;
}

const D = 3000;
const N = D * D;

function jsarray() {
  const a = new Array(N).fill(1);
  const b = new Array(N).fill(1);
  const c = new Array(N);
  const t = timeit(() => {
    for (let i = 0; i < N; ++i) {
      c[i] = a[i] + b[i];
    }
  });
  return t;
}

function f32array() {
  const a = new Float32Array(N).fill(1);
  const b = new Float32Array(N).fill(1);
  const c = new Float32Array(N);
  const t = timeit(() => {
    for (let i = 0; i < N; ++i) {
      c[i] = a[i] + b[i];
    }
  });
  return t;
}

function jsarray2d() {
  const a = new Array(D).fill(undefined);
  a.forEach((_, i) => (a[i] = new Array(D).fill(1)));
  const b = new Array(D).fill(undefined);
  b.forEach((_, i) => (b[i] = new Array(D).fill(1)));
  const c = new Array(D).fill(undefined);
  c.forEach((_, i) => (c[i] = new Array(D).fill(0)));
  const t = timeit(() => {
    for (let i = 0; i < D; ++i) {
      for (let j = 0; j < D; ++j) {
        c[i][j] = a[i][j] + b[i][j];
      }
    }
  });
  return t;
}

function main() {
  console.log(jsarray());
  console.log(f32array());
  console.log(jsarray2d());
}

// Run main() if this file is run directly.
if (require.main === module) {
  main();
}
