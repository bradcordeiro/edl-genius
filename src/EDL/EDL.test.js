/* eslint-env mocha */
const assert = require('assert');
const EDL = require('./EDL');

describe('EDL Parser', () => {
  it('Should find 9 events in test file "cmx3600.edl"', async () => {
    const edl = new EDL('./test/edl_files/cmx3600.edl');
    assert.strictEqual(edl.events.length, 9);
  });

  it('Should find 588 events in test file "12_16 TL01 MUSIC.edl"', async () => {
    const edl = new EDL('./test/edl_files/12_16 TL01 MUSIC.edl');
    assert.strictEqual(edl.events.length, 588);
  });

  it('Should store events where each Event number is its index+1', () => {
    const edl = new EDL('./test/edl_files/cmx3600.edl');

    for (let i = 0; i < edl.events.length; i += 1) {
      assert.strictEqual(i + 1, edl.events[i].number);
    }
  });
});
