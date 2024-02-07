"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var timecode_boss_1 = __importDefault(require("timecode-boss"));
var MotionEffect = (function () {
    function MotionEffect(input) {
        this.reel = input.reel || '';
        this.speed = input.speed || 0;
        this.entryPoint = new timecode_boss_1.default(input.entryPoint || 0);
    }
    MotionEffect.prototype.toObject = function () {
        return {
            reel: this.reel,
            speed: this.speed,
            entryPoint: this.entryPoint.toObject(),
        };
    };
    return MotionEffect;
}());
exports.default = MotionEffect;
