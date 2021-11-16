/* eslint-env mocha */
const assert = require('assert');
const Timecode = require('timecode-boss');
const Event = require('./Event');

describe('Event Class', () => {
  it('new Event() should create an empty event', () => {
    const event = new Event();

    assert.strictEqual(event.number, undefined);
  });

  it('new Event({Object}) should copy argument\'s properties to Event', () => {
    const obj = {
      number: 3,
      reel: 'BOONE_SM',
      trackType: 'V',
      transition: 'C',
      sourceStart: new Timecode('01:01:43:05'),
      sourceEnd: new Timecode('01:01:57:00'),
      recordStart: new Timecode('01:00:07:26'),
      recordEnd: new Timecode('01:00:21:21'),
    };

    const event = new Event(obj);

    assert.strictEqual(event.number, obj.number);
    assert.strictEqual(event.reel, obj.reel);
    assert.strictEqual(event.trackType, obj.trackType);
    assert.strictEqual(event.transition, obj.transition);
    assert.strictEqual(event.sourceStart.toString(), obj.sourceStart.toString());
    assert.strictEqual(event.sourceEnd.toString(), obj.sourceEnd.toString());
    assert.strictEqual(event.recordStart.toString(), obj.recordStart.toString());
    assert.strictEqual(event.recordEnd.toString(), obj.recordEnd.toString());
  });

  it('new Event({Object}) with Timecode string properties should convert Timecode strings to Timecode class) ', () => {
    const event = new Event({
      sourceStart: '01:01:43:05',
      sourceEnd: '01:01:57:00',
      recordStart: '01:00:07:26',
      recordEnd: '01:00:21:21',
    });

    assert.strictEqual(event.sourceStart instanceof Timecode, true);
    assert.strictEqual(event.sourceEnd instanceof Timecode, true);
    assert.strictEqual(event.recordStart instanceof Timecode, true);
    assert.strictEqual(event.recordEnd instanceof Timecode, true);
  });

  it('setMotionEffect() should add a motionEffect property', () => {
    const event = new Event();
    event.setMotionEffect({ reel: 'KIRA_PAS', speed: 24.5, entryPoint: new Timecode('01:01:25:14 ') });

    assert.strictEqual(event.motionEffect.reel, 'KIRA_PAS');
    assert.strictEqual(event.motionEffect.speed, 24.5);
    assert.strictEqual(event.motionEffect.entryPoint.toString(), '01:01:25;14');
  });

  it('setMotionEffect() should ignore an invalid Motion Effect line', () => {
    const event = new Event();
    event.setMotionEffect('blarg');

    assert.strictEqual(event.motionEffect, undefined);
  });

  it('toObject() should return an object with the correct properties', () => {
    const event = new Event({
      number: 3,
      reel: 'BOONE_SM',
      trackType: 'V',
      transition: 'C',
      sourceStart: '01:01:43:05',
      sourceEnd: '01:01:57:00',
      recordStart: '01:00:07:26',
      recordEnd: '01:00:21:21',
    });
    const json = event.toObject();

    assert.strictEqual(json.number, 3);
    assert.strictEqual(json.reel, 'BOONE_SM');
    assert.strictEqual(json.trackType, 'V');
    assert.strictEqual(json.transition, 'C');
    assert.deepStrictEqual(json.sourceStart, { hours: 1, minutes: 1, seconds: 43, frames: 5, frameRate: 29.97 }); // eslint-disable-line
    assert.deepStrictEqual(json.sourceEnd, { hours: 1, minutes: 1, seconds: 57, frames: 0, frameRate: 29.97 }); // eslint-disable-line
    assert.deepStrictEqual(json.recordStart, { hours: 1, minutes: 0, seconds: 7, frames: 26, frameRate: 29.97 }); // eslint-disable-line
    assert.deepStrictEqual(json.recordEnd, { hours: 1, minutes: 0, seconds: 21, frames: 21, frameRate: 29.97 }); // eslint-disable-line
  });

  it('toJSON() should return a JSON string', () => {
    const event = new Event({
      number: 3,
      reel: 'BOONE_SM',
      trackType: 'V',
      transition: 'C',
      sourceStart: '01:01:43:05',
      sourceEnd: '01:01:57:00',
      recordStart: '01:00:07:26',
      recordEnd: '01:00:21:21',
    });
    const stringified = event.toJSON(true);

    assert.strictEqual(stringified, '{"number":3,"reel":"BOONE_SM","trackType":"V","transition":"C","sourceStart":{"hours":1,"minutes":1,"seconds":43,"frames":5,"frameRate":29.97},"sourceEnd":{"hours":1,"minutes":1,"seconds":57,"frames":0,"frameRate":29.97},"recordStart":{"hours":1,"minutes":0,"seconds":7,"frames":26,"frameRate":29.97},"recordEnd":{"hours":1,"minutes":0,"seconds":21,"frames":21,"frameRate":29.97}}');
  });

  it('new Event(invalidString) should throw a TypeError', () => {
    assert.throws(() => new Event(5), TypeError);
  });
});
