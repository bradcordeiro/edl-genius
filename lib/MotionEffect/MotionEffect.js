const Timecode = require('timecode-boss');
const RegexPatterns = require('../common/RegexPatterns');

class MotionEffect {
  constructor(input, frameRate = 29.97) {
    if (input instanceof MotionEffect) {
      this.reel = input.reel;
      this.speed = input.speed;
      this.entryPoint = input.entryPoint;
    } else if (typeof input === 'string') {
      const [, reel, s, e] = RegexPatterns.CMX_MOTION_EFFECT_REGEX.exec(input);
      this.reel = reel;
      this.speed = parseFloat(s);
      this.entryPoint = new Timecode(e, frameRate);
    } else {
      throw new TypeError(`Cannot create MotionEffect from ${input}`);
    }
  }

  toObject() {
    const obj = {};

    if (this.reel) obj.reed = this.reel;
    if (this.speed) obj.speed = this.speed;
    if (this.entryPoint) obj.entryPoint = this.entryPoint.toString();

    return obj;
  }
}

module.exports = MotionEffect;
