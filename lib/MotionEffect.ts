import Timecode, { TimecodeAttributes } from 'timecode-boss';

export interface MotionEffectAttributes {
  reel: string;
  speed: number;
  entryPoint: TimecodeAttributes;
}

export default class MotionEffect implements MotionEffectAttributes {
  reel: string;

  speed: number;

  entryPoint: Timecode;

  constructor(input: MotionEffectAttributes) {
    this.reel = input.reel || '';
    this.speed = input.speed || 0;
    this.entryPoint = new Timecode(input.entryPoint || 0);
  }

  toObject() : MotionEffectAttributes {
    return {
      reel: this.reel,
      speed: this.speed,
      entryPoint: this.entryPoint.toObject(),
    };
  }
}
