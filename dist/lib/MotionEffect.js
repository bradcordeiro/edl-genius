import Timecode from 'timecode-boss';
export default class MotionEffect {
    constructor(input) {
        this.reel = input.reel || '';
        this.speed = input.speed || 0;
        this.entryPoint = new Timecode(input.entryPoint || 0);
    }
    toObject() {
        return {
            reel: this.reel,
            speed: this.speed,
            entryPoint: this.entryPoint.toObject(),
        };
    }
}
