/* eslint-env mocha */
import assert from 'assert';
import Timecode from 'timecode-boss';
import MotionEffect from '../lib/MotionEffect.js';
describe('Motion Effect', () => {
    it('Should deep copy a MotionEffect passed to the constructor', () => {
        const firstMotionEffect = new MotionEffect({
            reel: 'KIRA_PAS',
            speed: 24.5,
            entryPoint: {
                hours: 1,
                minutes: 1,
                seconds: 25,
                frames: 14,
                frameRate: 29.97,
            },
        });
        const secondMotionEffect = new MotionEffect(firstMotionEffect);
        firstMotionEffect.reel = '';
        firstMotionEffect.speed = 0;
        firstMotionEffect.entryPoint = new Timecode(0);
        assert.strictEqual(secondMotionEffect.reel, 'KIRA_PAS');
        assert.strictEqual(secondMotionEffect.speed, 24.5);
        assert.strictEqual(secondMotionEffect.entryPoint.toString(), '01:01:25;14');
    });
});
