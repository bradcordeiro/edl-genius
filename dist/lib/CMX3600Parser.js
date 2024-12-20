import { Transform } from 'stream';
import Timecode from 'timecode-boss';
const CMX_FRAME_RATE_LINE_BEGINNING = 'F';
const CMX_MOTION_EFFECT_LINE_BEGINNING = 'M';
const CMX_EVENT_REGEX_LINE_BEGINNING = /^\d/;
const CMX_COMMENT_LINE_BEGINNING = '*';
/* eslint-disable-next-line max-len */
const CMX_EVENT_REGEX = /^(\d+)\s+(\S+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/;
const CMX_MOTION_EFFECT_REGEX = /^M2\s+(\w+)\s+(\S+)\s+(\d{2}:\d{2}:\d{2}:\d{2})(?:\s+)?$/;
const CMX_SOURCE_FILE_REGEX = /^\*(?:\s+)?SOURCE FILE:\s+(.*)$/;
const CMX_SOURCE_CLIP_REGEX = /^\*(?:\s+)?FROM CLIP NAME:\s+(.*)$/;
const CMX_TO_CLIP_REGEX = /^\*(?:\s+)?TO CLIP NAME:\s+(.*)$/;
const CMX_COMMENT_REGEX = /^\*(?:\s+)?(.*)$/;
export default class CMX3600Parser extends Transform {
    constructor(recordFrameRate = 29.97) {
        super({ objectMode: true });
        this.currentEvent = {};
        this.recordFrameRate = recordFrameRate;
        this.sourceFrameRate = recordFrameRate;
    }
    changeSourceFrameRateToDropFrame() {
        if (this.sourceFrameRate > 29 && this.sourceFrameRate <= 30) {
            this.sourceFrameRate = 30000 / 1001;
        }
        else if (this.sourceFrameRate > 59 && this.sourceFrameRate <= 60) {
            this.sourceFrameRate = 60000 / 1001;
        }
    }
    changeSourceFrameRateToNonDropFrame() {
        if (this.sourceFrameRate > 29 && this.sourceFrameRate <= 30) {
            this.sourceFrameRate = 30;
        }
        if (this.sourceFrameRate > 59 && this.sourceFrameRate <= 60) {
            this.sourceFrameRate = 60;
        }
    }
    changeFrameRate(line) {
        if (line === 'FCM: NON-DROP FRAME') {
            this.changeSourceFrameRateToNonDropFrame();
        }
        else if (line === 'FCM: DROP FRAME') {
            this.changeSourceFrameRateToDropFrame();
        }
    }
    parseEvent(input) {
        const matches = CMX_EVENT_REGEX.exec(input);
        if (!matches || matches.length !== 9) {
            return;
        }
        const [, number, reel, track, transition, sourceStart, sourceEnd, recordStart, recordEnd,] = matches;
        let trackType;
        let tn;
        const trackTypeMatches = /([AV/]+)(\d+)?/.exec(track);
        if (trackTypeMatches) {
            [, trackType, tn] = trackTypeMatches;
        }
        this.currentEvent = {
            reel,
            trackType,
            transition,
            number: parseInt(number, 10),
            sourceStart: new Timecode(sourceStart, this.sourceFrameRate).toObject(),
            sourceEnd: new Timecode(sourceEnd, this.sourceFrameRate).toObject(),
            recordStart: new Timecode(recordStart, this.recordFrameRate).toObject(),
            recordEnd: new Timecode(recordEnd, this.recordFrameRate).toObject(),
            comment: '',
            sourceFrameRate: this.sourceFrameRate,
            recordFrameRate: this.recordFrameRate,
        };
        if (tn)
            this.currentEvent.trackNumber = parseInt(tn, 10);
    }
    parseSourceFileLine(input) {
        const matches = CMX_SOURCE_FILE_REGEX.exec(input);
        if (matches && matches.length > 1) {
            const [, sourceFile] = matches;
            if (this.currentEvent)
                this.currentEvent.sourceFile = sourceFile.trim();
        }
    }
    parseSourceClipLine(input) {
        const matches = CMX_SOURCE_CLIP_REGEX.exec(input);
        if (matches && matches.length > 1) {
            const [, sourceClip] = matches;
            if (this.currentEvent)
                this.currentEvent.sourceClip = sourceClip.trim();
        }
    }
    parseToClipLine(input) {
        const matches = CMX_TO_CLIP_REGEX.exec(input);
        if (matches && matches.length > 1) {
            const [, toClip] = matches;
            if (this.currentEvent)
                this.currentEvent.toClip = toClip.trim();
        }
    }
    parseComment(line) {
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
            const matches = CMX_COMMENT_REGEX.exec(line);
            if (matches && matches.length > 1 && this.currentEvent) {
                const [, comment] = matches;
                if (this.currentEvent.comment) {
                    this.currentEvent.comment += comment.trim();
                }
                else {
                    this.currentEvent.comment = comment.trim();
                }
            }
        }
    }
    parseMotionEffect(line) {
        const matches = CMX_MOTION_EFFECT_REGEX.exec(line);
        if (matches && matches.length > 3) {
            const [, reel, s, e] = matches;
            const speed = parseFloat(s);
            if (this.currentEvent)
                this.currentEvent.motionEffect = { reel, speed, entryPoint: new Timecode(e) };
        }
    }
    parseNextEvent(line) {
        this.pushCurrentEventConditionally();
        this.parseEvent(line);
    }
    pushCurrentEventConditionally() {
        if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) {
            this.push(this.currentEvent);
        }
    }
    _transform(obj, enc, callback = () => { }) {
        const line = typeof obj === 'string' ? obj : obj.toString();
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
    }
    _flush(callback = () => { }) {
        this.pushCurrentEventConditionally();
        callback();
    }
}
