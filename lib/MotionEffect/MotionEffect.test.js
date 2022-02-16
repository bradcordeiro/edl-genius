/* eslint-env mocha */
import assert from 'assert';
import MotionEffect from '../../dist/MotionEffect/MotionEffect.js';

describe('Motion Effect', () => {
  it('Should deep copy a MotionEffect passed to the constructor', () => {
    const firstMotionEffect = new MotionEffect({ reel: 'KIRA_PAS', speed: 24.5, entryPoint: '01:01:25:14' });
    const secondMotionEffect = new MotionEffect(firstMotionEffect);

    firstMotionEffect.reel = null;
    firstMotionEffect.speed = null;
    firstMotionEffect.entryPoint = null;

    assert.strictEqual(secondMotionEffect.reel, 'KIRA_PAS');
    assert.strictEqual(secondMotionEffect.speed, 24.5);
    assert.strictEqual(secondMotionEffect.entryPoint.toString(), '01:01:25;14');
  });

  it('Should throw a TypeError when a non-MotionEffect or non-string is passed', () => {
    assert.throws(() => new MotionEffect(84), TypeError);
  });
});
