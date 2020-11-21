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
  CMX_FRAME_RATE_REGEX: /^FCM:/,
  CMX_MOTION_EFFECT_REGEX: /^M2\s+(\w+)\s+(\S+)\s+(\d{2}:\d{2}:\d{2}:\d{2})(?:\s+)?$/,
  CMX_EVENT_REGEX: /^(\d+)\s+(\S+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/,
  CMX_EVENT_WITH_TRACKNUMBER_REGEX: /^(\d+)\s+(\w+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/,
  CMX_SOURCE_FILE_REGEX: /^\*(?:\s+)?SOURCE FILE:\s+(.*)$/,
  CMX_SOURCE_CLIP_REGEX: /^\*(?:\s+)?FROM CLIP NAME:\s+(.*)$/,
  CMX_TO_CLIP_REGEX: /^\*(?:\s+)?TO CLIP NAME:\s+(.*)$/,
  CMX_COMMENT_REGEX: /^\*(?:\s+)?(.*)$/,
};

function parseEvent(input, sourceFrameRate, recordFrameRate) {
  let matches;

  try {
    matches = REGEXP_PATTERNS.CMX_EVENT_REGEX.exec(input);

    if (matches.length !== 9) {
      return {};
    }
  } catch (_) {
    return {};
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
  try {
    const [, reel, s, e] = REGEXP_PATTERNS.CMX_MOTION_EFFECT_REGEX.exec(input);
    return { reel, speed: parseFloat(s), entryPoint: new Timecode(e) };
  } catch (_) {
    return null;
  }
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
      if (motionEffect) {
        this.currentEvent.setMotionEffect(motionEffect);
      }
    } else if (REGEXP_LINE_BEGINNINGS.CMX_COMMENT_REGEX.test(line)) {
      const parsedComment = parseComment(line);
      if (parsedComment.comment && this.currentEvent.comment) {
        this.currentEvent.comment += parsedComment.comment;
      } else {
        Object.assign(this.currentEvent, parsedComment);
      }
    } else if (REGEXP_LINE_BEGINNINGS.CMX_FRAME_RATE_REGEX.test(line)) {
      this.sourceFrameRate = changeFrameRate(line, this.sourceFrameRate);
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
