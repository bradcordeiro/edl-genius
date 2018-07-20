/* eslint-env mocha */
const assert = require('assert');
const edlParser = require('./edlParser');

describe('EDL Parser', () => {
  it('should find 9 events in test file "cmx3600.edl"', async () => {
    const events = await edlParser('../test/edl_files/cmx3600.edl');
    assert.strictEqual(events.length, 9);
  });
});
