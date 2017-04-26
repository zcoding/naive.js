import { extend } from '../../lib/utils'

describe('utils', function() {

  it('extend object', function() {
    expect(extend({}, {a: 1})).toEqual({a: 1})
  })

})
