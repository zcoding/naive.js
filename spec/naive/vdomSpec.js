import { extend } from '../../src/utils'

describe('utils', function() {

  it('extend object', function() {
    expect(extend({}, {a: 1})).toEqual({a: 1})
  })

})
