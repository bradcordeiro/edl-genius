import Timecode from 'timecode-boss';

export interface MotionEffectAttributes {
  reel: string;
  speed: number;
  entryPoint: Timecode | string;
}

export default class MotionEffect {
  reel: string;

  speed: number;

  entryPoint: Timecode | string;

  constructor(input: MotionEffectAttributes) {
    if (input.reel) this.reel = input.reel;
    if (input.speed) this.speed = input.speed;
    if (input.entryPoint) this.entryPoint = new Timecode(input.entryPoint);
  }

  toObject() {
    const obj: Partial<MotionEffectAttributes> = {};

    if (this.reel) obj.reel = this.reel;
    if (this.speed) obj.speed = this.speed;
    if (this.entryPoint) obj.entryPoint = this.entryPoint.toString();

    return obj;
  }
}
