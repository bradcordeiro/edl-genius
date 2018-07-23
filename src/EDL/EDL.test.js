/* eslint-env mocha */
const assert = require('assert');
const EDL = require('./EDL');

describe('EDL Class', () => {
  it('Should use a default frame rate of 29.97 if constructed with no arguments', () => {
    const edl = new EDL();

    assert.strictEqual(edl.frameRate, 29.97);
  });

  it('Should find 9 events in test file "cmx3600.edl"', async () => {
    const edl = await new EDL(29.97).read('./test/edl_files/cmx3600.edl');
    assert.strictEqual(edl.events.length, 9);
  });

  it('Should find 588 events in test file "12_16 TL01 MUSIC.edl"', async () => {
    const edl = await new EDL(29.97).read('./test/edl_files/12_16 TL01 MUSIC.edl');
    assert.strictEqual(edl.events.length, 588);
  });

  it('Should store events where each Event number is its index+1', async () => {
    const edl = await new EDL(29.97).read('./test/edl_files/cmx3600.edl');
    for (let i = 0; i < edl.events.length; i += 1) {
      assert.strictEqual(i + 1, edl.events[i].number);
    }
  });

  it('Should correctly construct Events with comments and motion effects', async () => {
    /* 004  QEVL1GRN V     C        01:31:44:03 01:31:44:12 01:00:02:24 01:00:03:01
       M2   QEVL1GRN       037.5                01:31:44:03
      * GETTY IMAGES__QEVL1GRND130_UNDERGROUND_EL CHAPO TUNNELS_INTERIOR OF ALCATRAZ PRI
      * SON. ROW OF CELLS, CLOSE-UP OF CELL DOOR BARS, INSIDE OF JAIL CELL_180563302
      * FROM CLIP NAME:  QEVL1GRND130.NEW.01
      */
    const edl = await new EDL(29.97).read('./test/edl_files/070816_EG101_HEISTS_ROUGH_CUT_SOURCES_PART 1.edl');
    const event = edl.events[3];

    assert.strictEqual(event.number, 4);
    assert.strictEqual(event.reel, 'QEVL1GRN');
    assert.strictEqual(event.trackType, 'V');
    assert.strictEqual(event.trackNumber, undefined);
    assert.strictEqual(event.sourceStart.toString(), '01;31;44;03');
    assert.strictEqual(event.sourceEnd.toString(), '01;31;44;12');
    assert.strictEqual(event.recordStart.toString(), '01;00;02;24');
    assert.strictEqual(event.recordEnd.toString(), '01;00;03;01');
    assert.strictEqual(event.motionEffect.reel, 'QEVL1GRN');
    assert.strictEqual(event.motionEffect.speed, 37.5);
    assert.strictEqual(event.motionEffect.entryPoint.toString(), '01;31;44;03');
    assert.strictEqual(event.sourceClip, 'QEVL1GRND130.NEW.01');
    assert.strictEqual(event.comment, 'GETTY IMAGES__QEVL1GRND130_UNDERGROUND_EL CHAPO TUNNELS_INTERIOR OF ALCATRAZ PRISON. ROW OF CELLS, CLOSE-UP OF CELL DOOR BARS, INSIDE OF JAIL CELL_180563302');
  });

  it('Should accurately set source frameRates when encountering "FCM: XXX"', async () => {
    const edl = await new EDL(29.97).read('./test/edl_files/070816_EG101_HEISTS_ROUGH_CUT_SOURCES_PART 1.edl');
    // 002  EVL1_ESC V     C        06:00:02:01 06:00:07:12 01:00:00:25 01:00:01:16
    const nonDropEvent = edl.events[1];
    // 003  QEVL1GRN V     C        01:31:42:26 01:31:44:04 01:00:01:16 01:00:02:24
    const dropFramEvent = edl.events[2];

    assert.strictEqual(nonDropEvent.sourceStart.toString(), '06:00:02:01');
    assert.strictEqual(dropFramEvent.sourceStart.toString(), '01;31;42;26');
  });

  it('toJSON(true) should return a JSON string', async () => {
    const edl = await new EDL(29.97).read('./test/edl_files/cmx3600.edl');
    const stringified = edl.toJSON(true);
    const json = JSON.parse(stringified);

    assert.strictEqual(typeof json, 'object');
  });

  it('toJSON() should return a JSON string', async () => {
    const edl = await new EDL(29.97).read('./test/edl_files/cmx3600.edl');
    const json = edl.toJSON();
    const stringified = JSON.stringify(json);

    assert.strictEqual(typeof json, 'object');
    assert.strictEqual(typeof stringified, 'string');
  });
});
