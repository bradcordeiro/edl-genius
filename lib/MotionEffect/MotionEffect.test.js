/* eslint-env mocha */
const assert = require('assert');
const MotionEffect = require('./MotionEffect');

describe('Motion Effect Parser', () => {
  it('Should get a reel', () => {
    const motionEffect = new MotionEffect('M2   KIRA_PAS       024.5                01:01:25:14 ');
    assert.strictEqual(motionEffect.reel, 'KIRA_PAS');
  });

  it('Should get speed as a float', () => {
    const motionEffect = new MotionEffect('M2   KIRA_PAS       024.5                01:01:25:14 ');
    assert.strictEqual(motionEffect.speed, 24.5);
  });

  it('Should correctly parse a negative speed', () => {
    const motionEffect = new MotionEffect('M2   EVL1_HEI      -092.8                00:05:43:02 ');

    assert.strictEqual(motionEffect.speed, -92.8);
  });

  it('Should get entryPoint as a Timecode object', () => {
    const motionEffect = new MotionEffect('M2   KIRA_PAS       024.5                01:01:25:14 ');
    assert.strictEqual(motionEffect.entryPoint.toString(), '01;01;25;14');
  });

  it('Should deep copy a MotionEffect passed to the constructor', () => {
    const firstMotionEffect = new MotionEffect('M2   KIRA_PAS       024.5                01:01:25:14 ');
    const secondMotionEffect = new MotionEffect(firstMotionEffect);

    firstMotionEffect.reel = null;
    firstMotionEffect.speed = null;
    firstMotionEffect.entryPoint = null;

    assert.strictEqual(secondMotionEffect.reel, 'KIRA_PAS');
    assert.strictEqual(secondMotionEffect.speed, 24.5);
    assert.strictEqual(secondMotionEffect.entryPoint.toString(), '01;01;25;14');
  });

  it('Should throw a TypeError when a non-MotionEffect or non-string is passed', () => {
    assert.throws(() => new MotionEffect(84), TypeError);
  });
});
