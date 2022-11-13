import { array, broadcast, conform, NDArray } from "./dljs";

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
      it("should broadcast a 1-element array", () => {
        // expect(a.add(array([3]))).toEqual(array([4, 5, 6]));
      });
    });
  });

  describe("views", () => {
    it("should share underlying data", () => {
      const a = new NDArray([1, 2, 3, 4], [2, 2]);
      const b = a.item(1);
      expect(b.data).toEqual([3, 4]);
      expect(b.shape).toEqual([2]);
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
});
