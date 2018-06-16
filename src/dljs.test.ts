import { array, broadcast } from "./dljs";

describe("NDArray", () => {

  describe("addition", () => {

    const a = array([1, 2, 3]);

    it("should add numbers", () => {
      expect(a.add(1).data).toEqual([2, 3, 4]);
    });
    // it('should add array', () => {
    //   expect(a.add([1]).data).toEqual([2,3,4])
    // })
    // it('should add an NDArray', () => {
    //   expect(a.add(array([1,1,1]))).toEqual([2,3,4])
    // })
  });

});

describe('broadcast', () => {
  it('should work', () => {
    expect(broadcast([3], [3])).toEqual([3])
    expect(broadcast([3], [1])).toEqual([3])
    expect(broadcast([1], [3])).toEqual([3])

    expect(broadcast([3,2], [2])).toEqual([3,2])
    expect(broadcast([3,2], [3,2])).toEqual([3,2])
    expect(broadcast([2], [3,2])).toEqual([3,2])

    expect(broadcast([3,4,5], [3,4,5])).toEqual([3,4,5])
    expect(broadcast([3,4,5], [5])).toEqual([3,4,5])
    expect(broadcast([3,4,5], [3,1,5])).toEqual([3,4,5])
    expect(broadcast([1,4,5], [3,1,5])).toEqual([3,4,5])
  })
})
