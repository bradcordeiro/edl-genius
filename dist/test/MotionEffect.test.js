var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "timecode-boss", "../lib/MotionEffect.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-env mocha */
    const assert_1 = __importDefault(require("assert"));
    const timecode_boss_1 = __importDefault(require("timecode-boss"));
    const MotionEffect_js_1 = __importDefault(require("../lib/MotionEffect.js"));
    describe('Motion Effect', () => {
        it('Should deep copy a MotionEffect passed to the constructor', () => {
            const firstMotionEffect = new MotionEffect_js_1.default({
                reel: 'KIRA_PAS',
                speed: 24.5,
                entryPoint: {
                    hours: 1,
                    minutes: 1,
                    seconds: 25,
                    frames: 14,
                    frameRate: 29.97,
                },
            });
            const secondMotionEffect = new MotionEffect_js_1.default(firstMotionEffect);
            firstMotionEffect.reel = '';
            firstMotionEffect.speed = 0;
            firstMotionEffect.entryPoint = new timecode_boss_1.default(0);
            assert_1.default.strictEqual(secondMotionEffect.reel, 'KIRA_PAS');
            assert_1.default.strictEqual(secondMotionEffect.speed, 24.5);
            assert_1.default.strictEqual(secondMotionEffect.entryPoint.toString(), '01:01:25;14');
        });
    });
});
