const Timecode = require('timecode-boss');
const RegexPatterns = require('../common/RegexPatterns');

class MotionEffect {
  constructor(input, frameRate = 29.97) {
    if (typeof input === 'string') {
      const [, reel, s, e] = RegexPatterns.CMX_MOTION_EFFECT_REGEX.exec(input);
      this.reel = reel;
      this.speed = parseFloat(s);
      this.entryPoint = new Timecode(e, frameRate);
    } else if (input instanceof MotionEffect || typeof input === 'object') {
      if (input.reel) this.reel = input.reel;
      if (input.speed) this.speed = input.speed;
      if (input.entryPoint) this.entryPoint = input.entryPoint;
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
