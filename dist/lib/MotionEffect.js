var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "timecode-boss"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const timecode_boss_1 = __importDefault(require("timecode-boss"));
    class MotionEffect {
        constructor(input) {
            this.reel = input.reel || '';
            this.speed = input.speed || 0;
            this.entryPoint = new timecode_boss_1.default(input.entryPoint || 0);
        }
        toObject() {
            return {
                reel: this.reel,
                speed: this.speed,
                entryPoint: this.entryPoint.toObject(),
            };
        }
    }
    exports.default = MotionEffect;
});
