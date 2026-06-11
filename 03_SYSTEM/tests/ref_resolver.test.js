const assert = require('assert');
const { normalizeRef, pageFor, sameEntity } = require('../shared/ref_resolver');

(function testNormalizeRef() {
  assert.strictEqual(normalizeRef('[[Foo/Bar]]'), 'Foo/Bar');
  assert.strictEqual(normalizeRef('Foo.md'), 'Foo');
})();

(function testSameEntityNoDv() {
  assert.strictEqual(sameEntity('a', 'b'), false);
})();

console.log('ref_resolver tests passed');
