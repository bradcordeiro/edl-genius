/* eslint-env mocha */
const assert = require('assert');
const eventParser = require('./eventParser');

describe('Event Parsers', () => {
  const event = eventParser('003  BOONE_SM V     C        01:01:43:05 01:01:57:00 01:00:07:26 01:00:21:21', 29.97);

  it('Should get an integer Event Number for an Event', () => {
    assert.strictEqual(event.number, 3);
  });

  it('Should get get the correct string for the Reel', () => {
    assert.strictEqual(event.reel, 'BOONE_SM');
  });

  it('Should get a trackType of V for a video-only event', () => {
    assert.strictEqual(event.trackType, 'V');
  });

  it('Should get a transition of C for a cut', () => {
    assert.strictEqual(event.transition, 'C');
  });

  it('Should get a Timecode object with the correct fields for the sourceStart', () => {
    assert.strictEqual(event.sourceStart.toString(), '01;01;43;05');
  });

  it('Should get a Timecode object with the correct fields for the sourceEnd', () => {
    assert.strictEqual(event.sourceEnd.toString(), '01;01;57;00');
  });

  it('Should get a Timecode object with the correct fields for the recordStart', () => {
    assert.strictEqual(event.recordStart.toString(), '01;00;07;26');
  });

  it('Should get a Timecode object with the correct fields for the recordEnd', () => {
    assert.strictEqual(event.recordEnd.toString(), '01;00;21;21');
  });
});
