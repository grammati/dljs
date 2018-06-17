import * as arrays from './arrays'

describe('arrays', () => {

  describe('zeros', () => {
    it('should work', () {
      expect(arrays.zeros(3)).toEqual([0,0,0])
      expect(arrays.zeros(1)).toEqual([0])
      expect(arrays.zeros(0)).toEqual([])
    })
  })

  describe('ones', () => {
    it('should work', () => {
      expect(arrays.ones(3)).toEqual([1,1,1])
      expect(arrays.ones(1)).toEqual([1])
      expect(arrays.ones(0)).toEqual([])
    })
  })

  describe('fill', () => {
    it('should work', () => {
      expect(arrays.fill([0,0,0], 3)).toEqual([3,3,3])
      expect(arrays.fill([], 3)).toEqual([])
    })
  })

  describe('map2', () => {
    it('should work on arrays of the same length', () => {
      expect(arrays.map2([2,3],[4,5], (a,b) => a + b)).toEqual([6,8])
    })
    it('should throw on arrays of different lengths', () => {
      expect(() => arrays.map2([1,2],[3], (a,b)=>a)).toThrow()
    })
  })
})
