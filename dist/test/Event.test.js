var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "timecode-boss", "../lib/Event.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-env mocha */
    const assert_1 = __importDefault(require("assert"));
    const timecode_boss_1 = __importDefault(require("timecode-boss"));
    const Event_js_1 = __importDefault(require("../lib/Event.js"));
    describe('Event Class', () => {
        it('new Event() should create an empty event', () => {
            const event = new Event_js_1.default();
            assert_1.default.strictEqual(event.number, undefined);
        });
        it('new Event({Object}) should copy argument\'s properties to Event', () => {
            const obj = {
                number: 3,
                reel: 'BOONE_SM',
                trackType: 'V',
                transition: 'C',
                sourceStart: new timecode_boss_1.default('01:01:43:05'),
                sourceEnd: new timecode_boss_1.default('01:01:57:00'),
                recordStart: new timecode_boss_1.default('01:00:07:26'),
                recordEnd: new timecode_boss_1.default('01:00:21:21'),
            };
            const event = new Event_js_1.default(obj);
            assert_1.default.strictEqual(event.number, obj.number);
            assert_1.default.strictEqual(event.reel, obj.reel);
            assert_1.default.strictEqual(event.trackType, obj.trackType);
            assert_1.default.strictEqual(event.transition, obj.transition);
            assert_1.default.strictEqual(event.sourceStart.toString(), obj.sourceStart.toString());
            assert_1.default.strictEqual(event.sourceEnd.toString(), obj.sourceEnd.toString());
            assert_1.default.strictEqual(event.recordStart.toString(), obj.recordStart.toString());
            assert_1.default.strictEqual(event.recordEnd.toString(), obj.recordEnd.toString());
        });
        it('new Event({Object}) with Timecode string properties should convert Timecode strings to Timecode class) ', () => {
            const event = new Event_js_1.default({
                sourceStart: '01:01:43:05',
                sourceEnd: '01:01:57:00',
                recordStart: '01:00:07:26',
                recordEnd: '01:00:21:21',
            });
            assert_1.default.strictEqual(event.sourceStart instanceof timecode_boss_1.default, true);
            assert_1.default.strictEqual(event.sourceEnd instanceof timecode_boss_1.default, true);
            assert_1.default.strictEqual(event.recordStart instanceof timecode_boss_1.default, true);
            assert_1.default.strictEqual(event.recordEnd instanceof timecode_boss_1.default, true);
        });
        it('setMotionEffect() should add a motionEffect property', () => {
            const event = new Event_js_1.default();
            event.setMotionEffect({ reel: 'KIRA_PAS', speed: 24.5, entryPoint: new timecode_boss_1.default('01:01:25:14') });
            assert_1.default.deepEqual(event.motionEffect, {
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
        });
        it('toObject() should return an object with the correct properties', () => {
            const event = new Event_js_1.default({
                number: 3,
                reel: 'BOONE_SM',
                trackType: 'V',
                transition: 'C',
                sourceStart: '01:01:43:05',
                sourceEnd: '01:01:57:00',
                recordStart: '01:00:07:26',
                recordEnd: '01:00:21:21',
            });
            const json = event.toObject();
            assert_1.default.strictEqual(json.number, 3);
            assert_1.default.strictEqual(json.reel, 'BOONE_SM');
            assert_1.default.strictEqual(json.trackType, 'V');
            assert_1.default.strictEqual(json.transition, 'C');
            assert_1.default.deepStrictEqual(json.sourceStart, { hours: 1, minutes: 1, seconds: 43, frames: 5, frameRate: 29.97 }); // eslint-disable-line
            assert_1.default.deepStrictEqual(json.sourceEnd, { hours: 1, minutes: 1, seconds: 57, frames: 0, frameRate: 29.97 }); // eslint-disable-line
            assert_1.default.deepStrictEqual(json.recordStart, { hours: 1, minutes: 0, seconds: 7, frames: 26, frameRate: 29.97 }); // eslint-disable-line
            assert_1.default.deepStrictEqual(json.recordEnd, { hours: 1, minutes: 0, seconds: 21, frames: 21, frameRate: 29.97 }); // eslint-disable-line
        });
    });
});
