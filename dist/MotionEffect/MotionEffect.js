import Timecode from 'timecode-boss';
var MotionEffect = (function () {
    function MotionEffect(input) {
        if (input.reel)
            this.reel = input.reel;
        if (input.speed)
            this.speed = input.speed;
        if (input.entryPoint)
            this.entryPoint = new Timecode(input.entryPoint);
    }
    MotionEffect.prototype.toObject = function () {
        var obj = {};
        if (this.reel)
            obj.reel = this.reel;
        if (this.speed)
            obj.speed = this.speed;
        if (this.entryPoint)
            obj.entryPoint = this.entryPoint.toString();
        return obj;
    };
    return MotionEffect;
}());
export default MotionEffect;
