var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Transform } from 'stream';
import Timecode from 'timecode-boss';
import Event from '../Event/Event';
var CMX_FRAME_RATE_LINE_BEGINNING = 'F';
var CMX_MOTION_EFFECT_LINE_BEGINNING = 'M';
var CMX_EVENT_REGEX_LINE_BEGINNING = /^\d/;
var CMX_COMMENT_LINE_BEGINNING = '*';
var CMX_MOTION_EFFECT_REGEX = /^M2\s+(\w+)\s+(\S+)\s+(\d{2}:\d{2}:\d{2}:\d{2})(?:\s+)?$/;
var CMX_EVENT_REGEX = /^(\d+)\s+(\S+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/;
var CMX_SOURCE_FILE_REGEX = /^\*(?:\s+)?SOURCE FILE:\s+(.*)$/;
var CMX_SOURCE_CLIP_REGEX = /^\*(?:\s+)?FROM CLIP NAME:\s+(.*)$/;
var CMX_TO_CLIP_REGEX = /^\*(?:\s+)?TO CLIP NAME:\s+(.*)$/;
var CMX_COMMENT_REGEX = /^\*(?:\s+)?(.*)$/;
var CMX3600Parser = (function (_super) {
    __extends(CMX3600Parser, _super);
    function CMX3600Parser(recordFrameRate) {
        if (recordFrameRate === void 0) { recordFrameRate = 29.97; }
        var _this = _super.call(this, { objectMode: true }) || this;
        _this.recordFrameRate = recordFrameRate;
        _this.sourceFrameRate = recordFrameRate;
        _this.currentEvent = new Event(null, _this.sourceFrameRate, _this.recordFrameRate);
        return _this;
    }
    CMX3600Parser.prototype.changeFrameRate = function (line) {
        if (line === 'FCM: NON-DROP FRAME') {
            this.sourceFrameRate = Math.ceil(this.sourceFrameRate);
        }
        if (line === 'FCM: DROP FRAME') {
            this.sourceFrameRate = (this.sourceFrameRate * 1000) / 1001;
        }
    };
    CMX3600Parser.prototype.parseEvent = function (input) {
        var matches;
        try {
            matches = CMX_EVENT_REGEX.exec(input);
        }
        catch (_) {
            return;
        }
        if (matches.length !== 9) {
            return;
        }
        var number = matches[1], reel = matches[2], track = matches[3], transition = matches[4], sourceStart = matches[5], sourceEnd = matches[6], recordStart = matches[7], recordEnd = matches[8];
        var _a = /(\w)(\d+)?/.exec(track), trackType = _a[1], tn = _a[2];
        this.currentEvent = new Event({
            number: parseInt(number, 10),
            reel: reel,
            trackType: trackType,
            transition: transition,
            sourceStart: new Timecode(sourceStart, this.sourceFrameRate),
            sourceEnd: new Timecode(sourceEnd, this.sourceFrameRate),
            recordStart: new Timecode(recordStart, this.recordFrameRate),
            recordEnd: new Timecode(recordEnd, this.recordFrameRate),
            comment: '',
        }, this.sourceFrameRate, this.recordFrameRate);
        if (tn)
            this.currentEvent.trackNumber = parseInt(tn, 10);
    };
    CMX3600Parser.prototype.parseSourceFileLine = function (input) {
        var _a = CMX_SOURCE_FILE_REGEX.exec(input), sourceFile = _a[1];
        this.currentEvent.sourceFile = sourceFile.trim();
    };
    CMX3600Parser.prototype.parseSourceClipLine = function (input) {
        var _a = CMX_SOURCE_CLIP_REGEX.exec(input), sourceClip = _a[1];
        this.currentEvent.sourceClip = sourceClip.trim();
    };
    CMX3600Parser.prototype.parseToClipLine = function (input) {
        var _a = CMX_TO_CLIP_REGEX.exec(input), toClip = _a[1];
        this.currentEvent.toClip = toClip.trim();
    };
    CMX3600Parser.prototype.parseComment = function (line) {
        if (CMX_SOURCE_FILE_REGEX.test(line)) {
            this.parseSourceFileLine(line);
        }
        else if (CMX_SOURCE_CLIP_REGEX.test(line)) {
            this.parseSourceClipLine(line);
        }
        else if (CMX_TO_CLIP_REGEX.test(line)) {
            this.parseToClipLine(line);
        }
        else {
            var _a = CMX_COMMENT_REGEX.exec(line), comment = _a[1];
            this.currentEvent.comment += comment.trim();
        }
    };
    CMX3600Parser.prototype.parseMotionEffect = function (line) {
        try {
            var _a = CMX_MOTION_EFFECT_REGEX.exec(line), reel = _a[1], s = _a[2], e = _a[3];
            var speed = parseFloat(s);
            this.currentEvent.setMotionEffect({ reel: reel, speed: speed, entryPoint: new Timecode(e) });
        }
        catch (_) {
        }
    };
    CMX3600Parser.prototype.parseNextEvent = function (line) {
        if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) {
            this.push(this.currentEvent);
        }
        this.parseEvent(line);
    };
    CMX3600Parser.prototype._transform = function (obj, enc, done) {
        if (done === void 0) { done = function () { }; }
        var line = obj.toString(enc);
        if (line[0] === CMX_MOTION_EFFECT_LINE_BEGINNING) {
            this.parseMotionEffect(line);
        }
        else if (line[0] === CMX_COMMENT_LINE_BEGINNING) {
            this.parseComment(line);
        }
        else if (line[0] === CMX_FRAME_RATE_LINE_BEGINNING) {
            this.changeFrameRate(line);
        }
        else if (CMX_EVENT_REGEX_LINE_BEGINNING.test(line)) {
            this.parseNextEvent(line);
        }
        done();
    };
    CMX3600Parser.prototype._flush = function (done) {
        if (done === void 0) { done = function () { }; }
        if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) {
            this.push(this.currentEvent);
        }
        done();
    };
    return CMX3600Parser;
}(Transform));
export default CMX3600Parser;
