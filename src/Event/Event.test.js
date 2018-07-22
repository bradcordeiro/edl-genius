/* eslint-env mocha */
const assert = require('assert');
const Timecode = require('timecode-boss');
const Event = require('./Event');

describe('Event Class', () => {
  it('Should allow creation of empty Event when constructed with no arguments', () => {
    const event = new Event();

    assert.strictEqual(event.number, undefined);
  });

  it('Should parse a string into properties', () => {
    const event = new Event('003  BOONE_SM V     C        01:01:43:05 01:01:57:00 01:00:07:26 01:00:21:21');

    assert.strictEqual(event.number, 3);
    assert.strictEqual(event.reel, 'BOONE_SM');
    assert.strictEqual(event.trackType, 'V');
    assert.strictEqual(event.transition, 'C');
    assert.strictEqual(event.sourceStart.toString(), '01;01;43;05');
    assert.strictEqual(event.sourceEnd.toString(), '01;01;57;00');
    assert.strictEqual(event.recordStart.toString(), '01;00;07;26');
    assert.strictEqual(event.recordEnd.toString(), '01;00;21;21');
  });

  it('Should assign object properties to itself', () => {
    const event = new Event({
      number: 3,
      reel: 'BOONE_SM',
      trackType: 'V',
      transition: 'C',
      sourceStart: new Timecode('01:01:43:05'),
      sourceEnd: new Timecode('01:01:57:00'),
      recordStart: new Timecode('01:00:07:26'),
      recordEnd: new Timecode('01:00:21:21'),
    });

    assert.strictEqual(event.number, 3);
    assert.strictEqual(event.reel, 'BOONE_SM');
    assert.strictEqual(event.trackType, 'V');
    assert.strictEqual(event.transition, 'C');
    assert.strictEqual(event.sourceStart.toString(), '01;01;43;05');
    assert.strictEqual(event.sourceEnd.toString(), '01;01;57;00');
    assert.strictEqual(event.recordStart.toString(), '01;00;07;26');
    assert.strictEqual(event.recordEnd.toString(), '01;00;21;21');
  });

  it('Should assign object properties to itself, and convert string timecode to Timecode class', () => {
    const event = new Event({
      sourceStart: '01:01:43:05',
      sourceEnd: '01:01:57:00',
      recordStart: '01:00:07:26',
      recordEnd: '01:00:21:21',
    });

    assert.strictEqual(event.sourceStart.toString(), '01;01;43;05');
    assert.strictEqual(event.sourceEnd.toString(), '01;01;57;00');
    assert.strictEqual(event.recordStart.toString(), '01;00;07;26');
    assert.strictEqual(event.recordEnd.toString(), '01;00;21;21');
  });

  it('Should separate trackType from trackNumber', () => {
    const event = new Event('004  BFD_CHIL A10   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19 ');

    assert.strictEqual(event.number, 4);
    assert.strictEqual(event.reel, 'BFD_CHIL');
    assert.strictEqual(event.trackType, 'A');
    assert.strictEqual(event.trackNumber, 10);
    assert.strictEqual(event.transition, 'C');
    assert.strictEqual(event.sourceStart.toString(), '01;00;01;05');
    assert.strictEqual(event.sourceEnd.toString(), '01;00;02;05');
    assert.strictEqual(event.recordStart.toString(), '01;00;11;19');
    assert.strictEqual(event.recordEnd.toString(), '01;00;12;19');
  });

  it('Should concatenate two comment lines in the comment property', () => {
    const event = new Event('004  BFD_CHIL A10   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19 ');
    event.addComment('* GETTY__QEVL1ESCP001_GREAT ESCAPES_MECKLENBURG SIX_AERIAL AROUND PRISON ON ALCATR ');
    event.addComment('* AZ ISLAND _622-21 ');

    assert.strictEqual(event.comment, 'GETTY__QEVL1ESCP001_GREAT ESCAPES_MECKLENBURG SIX_AERIAL AROUND PRISON ON ALCATRAZ ISLAND _622-21');
  });

  it('Should throw a TypeError when a non-string, non-object is passed to the constructor', () => {
    assert.throws(() => new Event(5), TypeError);
  });

  it('Should throw a TypeError when an invalid event string is passed', () => {
    assert.throws(() => new Event('blagfodot'));
  });
});
