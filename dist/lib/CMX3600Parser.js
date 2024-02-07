"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var timecode_boss_1 = __importDefault(require("timecode-boss"));
var CMX_FRAME_RATE_LINE_BEGINNING = 'F';
var CMX_MOTION_EFFECT_LINE_BEGINNING = 'M';
var CMX_EVENT_REGEX_LINE_BEGINNING = /^\d/;
var CMX_COMMENT_LINE_BEGINNING = '*';
var CMX_EVENT_REGEX = /^(\d+)\s+(\S+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/;
var CMX_MOTION_EFFECT_REGEX = /^M2\s+(\w+)\s+(\S+)\s+(\d{2}:\d{2}:\d{2}:\d{2})(?:\s+)?$/;
var CMX_SOURCE_FILE_REGEX = /^\*(?:\s+)?SOURCE FILE:\s+(.*)$/;
var CMX_SOURCE_CLIP_REGEX = /^\*(?:\s+)?FROM CLIP NAME:\s+(.*)$/;
var CMX_TO_CLIP_REGEX = /^\*(?:\s+)?TO CLIP NAME:\s+(.*)$/;
var CMX_COMMENT_REGEX = /^\*(?:\s+)?(.*)$/;
var CMX3600Parser = (function (_super) {
    __extends(CMX3600Parser, _super);
    function CMX3600Parser(recordFrameRate) {
        if (recordFrameRate === void 0) { recordFrameRate = 29.97; }
        var _this = _super.call(this, { objectMode: true }) || this;
        _this.currentEvent = {};
        _this.recordFrameRate = recordFrameRate;
        _this.sourceFrameRate = recordFrameRate;
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
        var matches = CMX_EVENT_REGEX.exec(input);
        if (!matches || matches.length !== 9) {
            return;
        }
        var number = matches[1], reel = matches[2], track = matches[3], transition = matches[4], sourceStart = matches[5], sourceEnd = matches[6], recordStart = matches[7], recordEnd = matches[8];
        var trackType;
        var tn;
        var trackTypeMatches = /([AV/]+)(\d+)?/.exec(track);
        if (trackTypeMatches) {
            trackType = trackTypeMatches[1], tn = trackTypeMatches[2];
        }
        this.currentEvent = {
            reel: reel,
            trackType: trackType,
            transition: transition,
            number: parseInt(number, 10),
            sourceStart: new timecode_boss_1.default(sourceStart, this.sourceFrameRate).toObject(),
            sourceEnd: new timecode_boss_1.default(sourceEnd, this.sourceFrameRate).toObject(),
            recordStart: new timecode_boss_1.default(recordStart, this.recordFrameRate).toObject(),
            recordEnd: new timecode_boss_1.default(recordEnd, this.recordFrameRate).toObject(),
            comment: '',
            sourceFrameRate: this.sourceFrameRate,
            recordFrameRate: this.recordFrameRate,
        };
        if (tn)
            this.currentEvent.trackNumber = parseInt(tn, 10);
    };
    CMX3600Parser.prototype.parseSourceFileLine = function (input) {
        var matches = CMX_SOURCE_FILE_REGEX.exec(input);
        if (matches && matches.length > 1) {
            var sourceFile = matches[1];
            if (this.currentEvent)
                this.currentEvent.sourceFile = sourceFile.trim();
        }
    };
    CMX3600Parser.prototype.parseSourceClipLine = function (input) {
        var matches = CMX_SOURCE_CLIP_REGEX.exec(input);
        if (matches && matches.length > 1) {
            var sourceClip = matches[1];
            if (this.currentEvent)
                this.currentEvent.sourceClip = sourceClip.trim();
        }
    };
    CMX3600Parser.prototype.parseToClipLine = function (input) {
        var matches = CMX_TO_CLIP_REGEX.exec(input);
        if (matches && matches.length > 1) {
            var toClip = matches[1];
            if (this.currentEvent)
                this.currentEvent.toClip = toClip.trim();
        }
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
            var matches = CMX_COMMENT_REGEX.exec(line);
            if (matches && matches.length > 1 && this.currentEvent) {
                var comment = matches[1];
                if (this.currentEvent.comment) {
                    this.currentEvent.comment += comment.trim();
                }
                else {
                    this.currentEvent.comment = comment.trim();
                }
            }
        }
    };
    CMX3600Parser.prototype.parseMotionEffect = function (line) {
        var matches = CMX_MOTION_EFFECT_REGEX.exec(line);
        if (matches && matches.length > 3) {
            var reel = matches[1], s = matches[2], e = matches[3];
            var speed = parseFloat(s);
            if (this.currentEvent)
                this.currentEvent.motionEffect = { reel: reel, speed: speed, entryPoint: new timecode_boss_1.default(e) };
        }
    };
    CMX3600Parser.prototype.parseNextEvent = function (line) {
        this.pushCurrentEventConditionally();
        this.parseEvent(line);
    };
    CMX3600Parser.prototype.pushCurrentEventConditionally = function () {
        if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) {
            this.push(this.currentEvent);
        }
    };
    CMX3600Parser.prototype._transform = function (obj, enc, callback) {
        if (callback === void 0) { callback = function () { }; }
        var line = typeof obj === 'string' ? obj : obj.toString();
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
        callback();
    };
    CMX3600Parser.prototype._flush = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        this.pushCurrentEventConditionally();
        callback();
    };
    return CMX3600Parser;
}(stream_1.Transform));
exports.default = CMX3600Parser;
