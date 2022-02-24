/*
 * author: chia.chang@ge.com
 */

var assert = require('chai').assert;

describe('ph server tcp handshake', function() {
  describe('got tcp response', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});

//to be continued
