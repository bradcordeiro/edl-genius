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
    constructor(input: MotionEffectAttributes);
    toObject(): Partial<MotionEffectAttributes>;
}
