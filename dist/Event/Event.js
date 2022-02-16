import Timecode from 'timecode-boss';
import MotionEffect from '../MotionEffect/MotionEffect';
var Event = (function () {
    function Event(input, sourceFrameRate, recordFrameRate) {
        if (sourceFrameRate === void 0) { sourceFrameRate = 29.97; }
        if (recordFrameRate === void 0) { recordFrameRate = 29.97; }
        this.sourceFrameRate = sourceFrameRate;
        this.recordFrameRate = recordFrameRate;
        this.number = input.number || 0;
        this.reel = input.reel;
        this.trackType = input.trackType;
        this.transition = input.transition;
        this.sourceStart = new Timecode(input.sourceStart, sourceFrameRate);
        this.sourceEnd = new Timecode(input.sourceEnd, sourceFrameRate);
        this.recordStart = new Timecode(input.recordStart, recordFrameRate);
        this.recordEnd = new Timecode(input.recordEnd, recordFrameRate);
        this.sourceClip = input.sourceClip;
        this.sourceFile = input.sourceFile;
        this.motionEffect = new MotionEffect(input.motionEffect);
        this.comment = input.comment;
        this.convertTimecodeProperties(sourceFrameRate, recordFrameRate);
    }
    Event.prototype.setMotionEffect = function (input) {
        try {
            this.motionEffect = new MotionEffect(input);
        }
        catch (TypeError) {
        }
    };
    Event.prototype.addComment = function (input) {
        var parsedComment = { comment: input };
        if (Object.prototype.hasOwnProperty.call(parsedComment, 'sourceFile')) {
            this.sourceFile = parsedComment.sourceFile;
        }
        else if (Object.prototype.hasOwnProperty.call(parsedComment, 'sourceClip')) {
            this.sourceClip = parsedComment.sourceClip;
        }
        else if (this.comment) {
            this.comment += parsedComment.comment.trim();
        }
        else {
            this.comment = parsedComment.comment.trim();
        }
    };
    Event.prototype.toObject = function () {
        return {
            sourceFrameRate: this.sourceFrameRate,
            recordFrameRate: this.recordFrameRate,
            number: this.number,
            reel: this.reel,
            trackType: this.trackType,
            transition: this.transition,
            sourceStart: this.sourceStart.toObject(),
            sourceEnd: this.sourceEnd.toObject(),
            recordStart: this.recordStart.toObject(),
            recordEnd: this.recordEnd.toObject(),
            sourceClip: this.sourceClip,
            sourceFile: this.sourceFile,
            motionEffect: this.motionEffect.toObject(),
            comment: this.comment,
        };
    };
    Event.prototype.toJSON = function () {
        return JSON.stringify(this.toObject());
    };
    Event.prototype.convertTimecodeProperties = function (sourceFrameRate, recordFrameRate) {
        if (this.sourceStart && !(this.sourceStart instanceof Timecode)) {
            this.sourceStart = new Timecode(this.sourceStart, sourceFrameRate);
        }
        if (this.sourceEnd && !(this.sourceEnd instanceof Timecode)) {
            this.sourceEnd = new Timecode(this.sourceEnd, sourceFrameRate);
        }
        if (this.recordStart && !(this.recordStart instanceof Timecode)) {
            this.recordStart = new Timecode(this.recordStart, recordFrameRate);
        }
        if (this.recordEnd && !(this.recordEnd instanceof Timecode)) {
            this.recordEnd = new Timecode(this.recordEnd, recordFrameRate);
        }
    };
    return Event;
}());
export default Event;
