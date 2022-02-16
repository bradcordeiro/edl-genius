import { Transform } from 'stream';
import Timecode from 'timecode-boss';
import Event from '../Event/Event';

const CMX_FRAME_RATE_LINE_BEGINNING = 'F';
const CMX_MOTION_EFFECT_LINE_BEGINNING = 'M';
const CMX_EVENT_REGEX_LINE_BEGINNING = /^\d/;
const CMX_COMMENT_LINE_BEGINNING = '*';

const CMX_MOTION_EFFECT_REGEX = /^M2\s+(\w+)\s+(\S+)\s+(\d{2}:\d{2}:\d{2}:\d{2})(?:\s+)?$/;
const CMX_EVENT_REGEX = /^(\d+)\s+(\S+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/;
const CMX_SOURCE_FILE_REGEX = /^\*(?:\s+)?SOURCE FILE:\s+(.*)$/;
const CMX_SOURCE_CLIP_REGEX = /^\*(?:\s+)?FROM CLIP NAME:\s+(.*)$/;
const CMX_TO_CLIP_REGEX = /^\*(?:\s+)?TO CLIP NAME:\s+(.*)$/;
const CMX_COMMENT_REGEX = /^\*(?:\s+)?(.*)$/;

class CMX3600Parser extends Transform {
  recordFrameRate: number;

  sourceFrameRate: number;

  currentEvent?: Event;

  constructor(recordFrameRate = 29.97) {
    super({ objectMode: true });

    this.recordFrameRate = recordFrameRate;
    this.sourceFrameRate = recordFrameRate;
    this.currentEvent = new Event(null, this.sourceFrameRate, this.recordFrameRate);
  }

  changeFrameRate(line) {
    if (line === 'FCM: NON-DROP FRAME') {
      this.sourceFrameRate = Math.ceil(this.sourceFrameRate);
    }

    if (line === 'FCM: DROP FRAME') {
      this.sourceFrameRate = (this.sourceFrameRate * 1000) / 1001;
    }
  }

  parseEvent(input) {
    let matches;

    try {
      matches = CMX_EVENT_REGEX.exec(input);
    } catch (_) {
      return;
    }

    if (matches.length !== 9) {
      return;
    }

    const [,
      number,
      reel,
      track,
      transition,
      sourceStart,
      sourceEnd,
      recordStart,
      recordEnd,
    ] = matches;

    const [, trackType, tn] = /(\w)(\d+)?/.exec(track);

    this.currentEvent = new Event({
      number: parseInt(number, 10),
      reel,
      trackType,
      transition,
      sourceStart: new Timecode(sourceStart, this.sourceFrameRate),
      sourceEnd: new Timecode(sourceEnd, this.sourceFrameRate),
      recordStart: new Timecode(recordStart, this.recordFrameRate),
      recordEnd: new Timecode(recordEnd, this.recordFrameRate),
      comment: '',
    }, this.sourceFrameRate, this.recordFrameRate);

    if (tn) this.currentEvent.trackNumber = parseInt(tn, 10);
  }

  parseSourceFileLine(input) {
    const [, sourceFile] = CMX_SOURCE_FILE_REGEX.exec(input);
    this.currentEvent.sourceFile = sourceFile.trim();
  }

  parseSourceClipLine(input) {
    const [, sourceClip] = CMX_SOURCE_CLIP_REGEX.exec(input);
    this.currentEvent.sourceClip = sourceClip.trim();
  }

  parseToClipLine(input) {
    const [, toClip] = CMX_TO_CLIP_REGEX.exec(input);
    this.currentEvent.toClip = toClip.trim();
  }

  parseComment(line) {
    if (CMX_SOURCE_FILE_REGEX.test(line)) {
      this.parseSourceFileLine(line);
    } else if (CMX_SOURCE_CLIP_REGEX.test(line)) {
      this.parseSourceClipLine(line);
    } else if (CMX_TO_CLIP_REGEX.test(line)) {
      this.parseToClipLine(line);
    } else {
      const [, comment] = CMX_COMMENT_REGEX.exec(line);
      this.currentEvent.comment += comment.trim();
    }
  }

  parseMotionEffect(line) {
    try {
      const [, reel, s, e] = CMX_MOTION_EFFECT_REGEX.exec(line);
      const speed = parseFloat(s);
      this.currentEvent.setMotionEffect({ reel, speed, entryPoint: new Timecode(e) });
    } catch (_) {
      // do nothing
    }
  }

  parseNextEvent(line) {
    if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) {
      this.push(this.currentEvent);
    }
    this.parseEvent(line);
  }

  _transform(obj, enc, done = () => {}) {
    const line = obj.toString(enc);

    if (line[0] === CMX_MOTION_EFFECT_LINE_BEGINNING) {
      this.parseMotionEffect(line);
    } else if (line[0] === CMX_COMMENT_LINE_BEGINNING) {
      this.parseComment(line);
    } else if (line[0] === CMX_FRAME_RATE_LINE_BEGINNING) {
      this.changeFrameRate(line);
    } else if (CMX_EVENT_REGEX_LINE_BEGINNING.test(line)) {
      this.parseNextEvent(line);
    }

    done();
  }

  _flush(done = () => {}) {
    if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) {
      this.push(this.currentEvent);
    }
    done();
  }
}

export default CMX3600Parser;
