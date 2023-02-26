var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "timecode-boss", "./MotionEffect.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const timecode_boss_1 = __importDefault(require("timecode-boss"));
    const MotionEffect_js_1 = __importDefault(require("./MotionEffect.js"));
    class Event {
        constructor(input = {}, sourceFrameRate = 29.97, recordFrameRate = 29.97) {
            this.sourceFrameRate = sourceFrameRate;
            this.recordFrameRate = recordFrameRate;
            this.number = input.number;
            this.reel = input.reel;
            this.trackType = input.trackType;
            this.transition = input.transition;
            this.sourceClip = input.sourceClip;
            this.sourceFile = input.sourceFile;
            this.comment = input.comment;
            this.sourceStart = input.sourceStart ? new timecode_boss_1.default(input.sourceStart, sourceFrameRate) : new timecode_boss_1.default({}, sourceFrameRate);
            this.sourceEnd = input.sourceEnd ? new timecode_boss_1.default(input.sourceEnd, sourceFrameRate) : new timecode_boss_1.default({}, sourceFrameRate);
            this.recordStart = input.recordStart ? new timecode_boss_1.default(input.recordStart, recordFrameRate) : new timecode_boss_1.default({}, recordFrameRate);
            this.recordEnd = input.recordEnd ? new timecode_boss_1.default(input.recordEnd, recordFrameRate) : new timecode_boss_1.default({}, recordFrameRate);
            this.motionEffect = input.motionEffect ? new MotionEffect_js_1.default(input.motionEffect) : undefined;
        }
        setMotionEffect(input) {
            this.motionEffect = new MotionEffect_js_1.default(input);
        }
        addComment(input) {
            const parsedComment = { comment: input };
            if (Object.prototype.hasOwnProperty.call(parsedComment, 'sourceFile')) {
                this.sourceFile = parsedComment.sourceFile;
            }
            else if (Object.prototype.hasOwnProperty.call(parsedComment, 'sourceClip')) {
                this.sourceClip = parsedComment.sourceClip;
            }
            else if (this.comment && parsedComment.comment) {
                this.comment += parsedComment.comment.trim();
            }
            else if (parsedComment.comment) {
                this.comment = parsedComment.comment.trim();
            }
        }
        toObject() {
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
                motionEffect: this.motionEffect ? this.motionEffect.toObject() : undefined,
                comment: this.comment,
            };
        }
    }
    exports.default = Event;
});
