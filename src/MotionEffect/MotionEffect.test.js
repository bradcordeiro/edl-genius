/* eslint-env mocha */
const assert = require('assert');
const MotionEffect = require('./MotionEffect');

describe('Motion Effect Parser', () => {
  const motionEffect = new MotionEffect('M2   KIRA_PAS       024.5                01:01:25:14 ');

  it('Should get a reel', () => {
    assert.strictEqual(motionEffect.reel, 'KIRA_PAS');
  });

  it('Should get speed as a float', () => {
    assert.strictEqual(motionEffect.speed, 24.5);
  });

  it('Should get entryPoint as a Timecode object', () => {
    assert.strictEqual(motionEffect.entryPoint.toString(), '01;01;25;14');
  });
});
