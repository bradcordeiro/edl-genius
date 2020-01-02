/* eslint-env mocha */
const assert = require('assert');
const Timecode = require('timecode-boss');
const Event = require('./Event');

describe('Event Class', () => {
  it('new Event() should create an empty event', () => {
    const event = new Event();

    assert.strictEqual(event.number, undefined);
  });

  it('new Event(CMXstring) should parse to Event properties', () => {
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

  it('new Event({Object}) should copy argument\'s properties to Event', () => {
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

  it('new Event({Object}) with Timecode string properties should convert Timecode strings to Timecode class) ', () => {
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

  it('new Event(CMXstring) should split track to type and number', () => {
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

  it('addComment("* SOURCE FILE: ...") should add a sourceFile property to Event', () => {
    const event = new Event();
    event.addComment('* SOURCE FILE: BOONE SMITH ON CAMERA HOST_-720P');

    assert.strictEqual(event.sourceFile, 'BOONE SMITH ON CAMERA HOST_-720P');
  });

  it('addComment("* FROM CLIP NAME: ...") should add a sourceClip property to Event', () => {
    const event = new Event();
    event.addComment('* FROM CLIP NAME:  BOONE SMITH ON CAMERA HOST_-720P.NEW.01 ');
    assert.strictEqual(event.sourceClip, 'BOONE SMITH ON CAMERA HOST_-720P.NEW.01');
  });

  it('addComment("* Misc") should add a comment property to Event', () => {
    const event = new Event();
    event.addComment('* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ');

    assert.strictEqual(event.comment, 'TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10.');
  });

  it('addComment() should add exact text of passed string if is not an EDL comment', () => {
    const event = new Event();
    event.addComment('004  BFD_CHIL A10   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19 ');

    assert.strictEqual(event.comment, '004  BFD_CHIL A10   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19');
  });

  it('addComment() should concatenate multi-line comments', () => {
    const event = new Event('004  BFD_CHIL A10   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19 ');
    event.addComment('* GETTY__QEVL1ESCP001_GREAT ESCAPES_MECKLENBURG SIX_AERIAL AROUND PRISON ON ALCATR ');
    event.addComment('* AZ ISLAND _622-21 ');

    assert.strictEqual(event.comment, 'GETTY__QEVL1ESCP001_GREAT ESCAPES_MECKLENBURG SIX_AERIAL AROUND PRISON ON ALCATRAZ ISLAND _622-21');
  });

  it('setMotionEffect() should add a motionEffect property', () => {
    const event = new Event();
    event.setMotionEffect('M2   KIRA_PAS       024.5                01:01:25:14 ');

    assert.strictEqual(event.motionEffect.reel, 'KIRA_PAS');
    assert.strictEqual(event.motionEffect.speed, 24.5);
    assert.strictEqual(event.motionEffect.entryPoint.toString(), '01;01;25;14');
  });

  it('setMotionEffect() should ignore an invalid Motion Effect line', () => {
    const event = new Event();
    event.setMotionEffect('blarg');

    assert.strictEqual(event.motionEffect, undefined);
  });

  it('toJSON() should return a stringifiable object', () => {
    const event = new Event('003  BOONE_SM V     C        01:01:43:05 01:01:57:00 01:00:07:26 01:00:21:21');
    const json = event.toJSON();
    const stringified = JSON.stringify(json);

    assert.strictEqual(stringified, '{"number":3,"reel":"BOONE_SM","trackType":"V","transition":"C","sourceStart":"01;01;43;05","sourceEnd":"01;01;57;00","recordStart":"01;00;07;26","recordEnd":"01;00;21;21"}');
    assert.strictEqual(json.number, 3);
    assert.strictEqual(json.reel, 'BOONE_SM');
    assert.strictEqual(json.trackType, 'V');
    assert.strictEqual(json.transition, 'C');
    assert.strictEqual(json.sourceStart, '01;01;43;05');
    assert.strictEqual(json.sourceEnd, '01;01;57;00');
    assert.strictEqual(json.recordStart, '01;00;07;26');
    assert.strictEqual(json.recordEnd, '01;00;21;21');
  });

  it('toJSON(true) should return a JSON string', () => {
    const event = new Event('003  BOONE_SM V     C        01:01:43:05 01:01:57:00 01:00:07:26 01:00:21:21');
    const stringified = event.toJSON(true);
    const json = JSON.parse(stringified);

    assert.strictEqual(stringified, '{"number":3,"reel":"BOONE_SM","trackType":"V","transition":"C","sourceStart":"01;01;43;05","sourceEnd":"01;01;57;00","recordStart":"01;00;07;26","recordEnd":"01;00;21;21"}');
    assert.strictEqual(json.number, 3);
    assert.strictEqual(json.reel, 'BOONE_SM');
    assert.strictEqual(json.trackType, 'V');
    assert.strictEqual(json.transition, 'C');
    assert.strictEqual(json.sourceStart, '01;01;43;05');
    assert.strictEqual(json.sourceEnd, '01;01;57;00');
    assert.strictEqual(json.recordStart, '01;00;07;26');
    assert.strictEqual(json.recordEnd, '01;00;21;21');
  });

  it('new Event(invalidString) should throw a TypeError', () => {
    assert.throws(() => new Event(5), TypeError);
  });
});
