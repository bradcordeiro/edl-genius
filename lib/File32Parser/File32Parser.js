const { Transform } = require('stream');
const Timecode = require('timecode-boss');
const Event = require('../Event/Event');

const REGEXP_LINE_BEGINNINGS = {
  CMX_FRAME_RATE_REGEX: /^FCM/,
  CMX_MOTION_EFFECT_REGEX: /^M2/,
  CMX_EVENT_REGEX: /^\d/,
  CMX_COMMENT_REGEX: /^\*/,
};

const REGEXP_PATTERNS = {
  FRAME_RATE_CHANGE: /^FCM:/,
  MOTION_EFFECT: /^M2\s+(\w+)\s+(\S+)\s+(\d{2}:\d{2}:\d{2}:\d{2})(?:\s+)?$/,
  EVENT: /^(\d+)\s+(\w+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/,
  SOURCE_FILE: /^\*(?:\s+)?SOURCE FILE:\s+(.*)$/,
  SOURCE_CLIP: /^\*(?:\s+)?FROM CLIP NAME:\s+(.*)$/,
  TO_CLIP: /^\*(?:\s+)?TO CLIP NAME:\s+(.*)$/,
  COMMENT: /^\*(?:\s+)?(.*)$/,
};

function parseEvent(input, sourceFrameRate, recordFrameRate) {
  const number = input.substring(0, 6).trim();
  const reel = input.substring(8, 41).trim();
  const track = input.substring(41, 48).trim();
  const transition = input.substring(47, 56).trim();
  const sourceStart = input.substring(56, 67).trim();
  const sourceEnd = input.substring(68, 79).trim();
  const recordStart = input.substring(80, 91).trim();
  const recordEnd = input.substring(92, 103).trim();

  const [,
    trackType,
    tn,
  ] = /(\w)(\d+)?/.exec(track);

  const obj = {
    number: parseInt(number, 10),
    reel,
    trackType,
    transition,
    sourceStart: new Timecode(sourceStart, sourceFrameRate),
    sourceEnd: new Timecode(sourceEnd, sourceFrameRate),
    recordStart: new Timecode(recordStart, recordFrameRate),
    recordEnd: new Timecode(recordEnd, recordFrameRate),
  };

  if (tn) obj.trackNumber = parseInt(tn, 10);

  return obj;
}

function parseComment(input) {
  if (REGEXP_PATTERNS.CMX_SOURCE_FILE_REGEX.test(input)) {
    const [, sourceFile] = REGEXP_PATTERNS.CMX_SOURCE_FILE_REGEX.exec(input);
    return { sourceFile: sourceFile.trim() };
  }

  if (REGEXP_PATTERNS.CMX_SOURCE_CLIP_REGEX.test(input)) {
    const [, sourceClip] = REGEXP_PATTERNS.CMX_SOURCE_CLIP_REGEX.exec(input);
    return { sourceClip: sourceClip.trim() };
  }

  if (REGEXP_PATTERNS.CMX_TO_CLIP_REGEX.test(input)) {
    const [, toClip] = REGEXP_PATTERNS.CMX_TO_CLIP_REGEX.exec(input);
    return { toClip: toClip.trim() };
  }

  const [, comment] = REGEXP_PATTERNS.CMX_COMMENT_REGEX.exec(input);
  return { comment: comment.trim() };
}

function parseMotionEffect(input) {
  const [, reel, s, e] = REGEXP_PATTERNS.CMX_MOTION_EFFECT_REGEX.exec(input);

  return { reel, speed: parseFloat(s), entryPoint: new Timecode(e) };
}

function changeFrameRate(line, frameRate) {
  if (frameRate === 29.97 && line === 'FCM: NON-DROP FRAME') {
    return 30;
  }
  if (frameRate === 59.94 && line === 'FCM: NON-DROP FRAME') {
    return 60;
  }
  if (frameRate === 30 && line === 'FCM: DROP FRAME') {
    return 29.97;
  }
  if (frameRate === 60 && line === 'FCM: DROP FRAME') {
    return 59.94;
  }

  return frameRate;
}

class CMX3600Parser extends Transform {
  constructor(recordFrameRate = 29.97) {
    super({ objectMode: true });
    this.recordFrameRate = recordFrameRate;
    this.sourceFrameRate = recordFrameRate;
    this.currentEvent = new Event(null, this.sourceFrameRate, this.recordFrameRate);
  }

  _transform(obj, enc, done = () => {}) {
    const line = obj.toString();

    if (REGEXP_LINE_BEGINNINGS.CMX_EVENT_REGEX.test(line)) {
      if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) {
        this.push(this.currentEvent);
      }
      const newEvent = parseEvent(line, this.sourceFrameRate, this.recordFrameRate);
      this.currentEvent = new Event(newEvent, this.sourceFrameRate, this.recordFrameRate);
    } else if (REGEXP_LINE_BEGINNINGS.CMX_MOTION_EFFECT_REGEX.test(line)) {
      const motionEffect = parseMotionEffect(line);
      this.currentEvent.setMotionEffect(motionEffect);
    } else if (REGEXP_LINE_BEGINNINGS.CMX_COMMENT_REGEX.test(line)) {
      const parsedComment = parseComment(line);
      if (parsedComment.comment && this.currentEvent.comment) {
        this.currentEvent.comment += parsedComment.comment;
      } else {
        Object.assign(this.currentEvent, parsedComment);
      }
    } else if (REGEXP_LINE_BEGINNINGS.CMX_FRAME_RATE_REGEX.test(line)) {
      this.sourceFrameRate = changeFrameRate(line);
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

module.exports = CMX3600Parser;
