/* eslint-env mocha */
const assert = require('assert');
const EDL = require('./EDL');

describe('EDL Parser', async () => {
  const smallEdl = await new EDL().read('./test/edl_files/cmx3600.edl');
  const largeEdl = await new EDL().read('./test/edl_files/12_16 TL01 MUSIC.edl');

  it('Should find 9 events in test file "cmx3600.edl"', () => {
    assert.strictEqual(smallEdl.events.length, 9);
  });

  it('Should find 588 events in test file "12_16 TL01 MUSIC.edl"', () => {
    assert.strictEqual(largeEdl.events.length, 588);
  });

  it('Should store events where each Event number is its index+1', () => {
    for (let i = 0; i < smallEdl.events.length; i += 1) {
      assert.strictEqual(i + 1, smallEdl.events[i].number);
    }
  });
});
