import { array, broadcast, conform, strides, NDArray, zeros } from "./ndarray";

// expect.extend({
//   toEqualArray(a: NDArray, b: NDArray) {
//     expect(a.data).toEqual(b.data);
//   }
// }

describe("NDArray", () => {
  describe("addition", () => {
    let a: NDArray;
    let expected: NDArray;

    beforeEach(() => {
      a = array([1, 2, 3]);
      expected = array([2, 3, 4]);
    });

    it("should add a number", () => {
      expect(a.add(1)).toEqual(expected);
    });

    it("should add an array of the same size", () => {
      expect(a.add([1, 1, 1])).toEqual(expected);
    });

    it("should add an NDArray", () => {
      expect(a.add(array([1, 1, 1]))).toEqual(expected);
    });

    describe("broadcasting", () => {
      it.skip("should broadcast a 1-element array", () => {
        // TOOD: make this work
        expect(a.add(array([3]))).toEqual(array([4, 5, 6]));
      });
    });
  });

  describe("views", () => {
    it("should share underlying data", () => {
      const a = new NDArray([1, 2, 3, 4], [2, 2]);
      const b = a.at(1);
      expect(b.flat()).toEqual([3, 4]);
      expect(b.shape).toEqual([2]);
    });
    it("data is mutable", () => {
      const a = new NDArray([1, 2, 3, 4], [2, 2]);
      const b = a.at(1);
      a.setAt([1, 1], 99);
      expect(a.flat()).toEqual([1, 2, 3, 99]);
      expect(b.flat()).toEqual([3, 99]);
    });
  });

  describe("sum", () => {
    it("should work", () => {
      const a = new NDArray([1, 2, 3, 4], [2, 2]);
      expect(a.sum(0)).toEqual(array([4, 6]));
      expect(a.sum(1)).toEqual(array([3, 7]));
      // expect(a.sum(0), true).toEqual(array([[4, 6]]));
      // expect(a.sum(1)).toEqual(array([[3], [7]]));
    });
  });
});

describe("broadcast", () => {
  it("should work", () => {
    expect(broadcast([3], [3])).toEqual([3]);
    expect(broadcast([3], [1])).toEqual([3]);
    expect(broadcast([1], [3])).toEqual([3]);

    expect(broadcast([3, 2], [2])).toEqual([3, 2]);
    expect(broadcast([3, 2], [3, 2])).toEqual([3, 2]);
    expect(broadcast([2], [3, 2])).toEqual([3, 2]);

    expect(broadcast([3, 4, 5], [3, 4, 5])).toEqual([3, 4, 5]);
    expect(broadcast([3, 4, 5], [5])).toEqual([3, 4, 5]);
    expect(broadcast([3, 4, 5], [3, 1, 5])).toEqual([3, 4, 5]);
    expect(broadcast([1, 4, 5], [3, 1, 5])).toEqual([3, 4, 5]);
  });
});

describe("conform", () => {
  it("should work", () => {
    expect(conform([3], [1])).toEqual([[1], [0]]);
    expect(conform([3], [3])).toEqual([[1], [1]]);
    expect(conform([2, 3], [3])).toEqual([
      [3, 1],
      [0, 1],
    ]);
    expect(conform([2, 1, 4], [3, 4])).toEqual([
      [4, 0, 1],
      [0, 4, 1],
    ]);
    expect(conform([2, 3, 4], [1])).toEqual([
      [12, 4, 1],
      [0, 0, 0],
    ]);
  });

  describe("makemore", () => {
    // Inpsired by karpathy/makemore
    // Grid of counts of how many times letter in col followed letter in row.
    // Convert to probabilities.
    // Lets just use an alphabet of 3 letters for now, plus '.' as start/end token.
    it.skip("should work", () => {
      const names = ["abba", "caab", "baba", "baa"];
      const alphabet = [...new Set(names.join(""))].sort();
      alphabet.unshift(".");
      const N = alphabet.length;
      const counts = zeros([N, N]);

      // lookups
      const ctoi = new Map<string, number>();
      const itoc = new Map<number, string>();
      for (let i = 0; i < alphabet.length; i++) {
        ctoi.set(alphabet[i], i);
        itoc.set(i, alphabet[i]);
      }

      for (const name of names) {
        const word = `.${name}.`;
        for (let i = 0; i < word.length - 1; i++) {
          const c1 = word.at(i)!;
          const c2 = word.at(i + 1)!;
          const i1 = ctoi.get(c1)!;
          const i2 = ctoi.get(c2)!;
          counts.setAt([i1, i2], counts.getAt([i1, i2])! + 1);
        }
      }

      // convert counts to probabilities
      const P = counts.div(counts.sum(1));

      expect(counts).toEqual(1);
    });
  });
});
