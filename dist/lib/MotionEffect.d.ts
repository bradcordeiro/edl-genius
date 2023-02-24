import Timecode from 'timecode-boss';
export interface MotionEffectAttributes {
    reel: string;
    speed: number;
    entryPoint: Timecode | string;
}
export default class MotionEffect implements MotionEffectAttributes {
    reel: string;
    speed: number;
    entryPoint: Timecode;
    constructor(input: MotionEffectAttributes);
    toObject(): MotionEffectAttributes;
}
