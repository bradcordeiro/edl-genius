const { Transform } = require('stream');
const Timecode = require('timecode-boss');
const Event = require('../Event/Event');

const REGEX_PATTERNS = {
  CMX_FRAME_RATE_REGEX: /^FCM:/,
  CMX_MOTION_EFFECT_REGEX: /^M2\s+(\w+)\s+(\S+)\s+(\d{2}:\d{2}:\d{2}:\d{2})(?:\s+)?$/,
  CMX_EVENT_REGEX: /^(\d+)\s+(\w+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/,
  CMX_EVENT_WITH_TRACKNUMBER_REGEX: /^(\d+)\s+(\w+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/,
  CMX_SOURCE_FILE_REGEX: /^\*(?:\s+)?SOURCE FILE:\s+(.*)$/,
  CMX_SOURCE_CLIP_REGEX: /^\*(?:\s+)?FROM CLIP NAME:\s+(.*)$/,
  CMX_COMMENT_REGEX: /^\*(?:\s+)?(.*)$/,
};

function parseCMXEvent(input, sourceFrameRate, recordFrameRate) {
  const [,
    number,
    reel,
    track,
    transition,
    sourceStart,
    sourceEnd,
    recordStart,
    recordEnd,
  ] = REGEX_PATTERNS.CMX_EVENT_REGEX.exec(input);

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

function parseCMXComment(input) {
  if (REGEX_PATTERNS.CMX_SOURCE_FILE_REGEX.test(input)) {
    const [, sourceFile] = REGEX_PATTERNS.CMX_SOURCE_FILE_REGEX.exec(input);
    return { sourceFile: sourceFile.trim() };
  }

  if (REGEX_PATTERNS.CMX_SOURCE_CLIP_REGEX.test(input)) {
    const [, sourceClip] = REGEX_PATTERNS.CMX_SOURCE_CLIP_REGEX.exec(input);
    return { sourceClip: sourceClip.trim() };
  }

  const [, comment] = REGEX_PATTERNS.CMX_COMMENT_REGEX.exec(input);
  return { comment: comment.trim() };
}

function changeFrameRate(line) {
  if (line === 'FCM: NON-DROP FRAME') {
    return 30;
  }

  return 29.97;
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

    if (REGEX_PATTERNS.CMX_EVENT_REGEX.test(line)) {
      if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) {
        this.push(this.currentEvent);
      }
      const newEvent = parseCMXEvent(line, this.sourceFrameRate, this.recordFrameRate);
      this.currentEvent = new Event(newEvent, this.sourceFrameRate, this.recordFrameRate);
    } else if (REGEX_PATTERNS.CMX_MOTION_EFFECT_REGEX.test(line)) {
      this.currentEvent.setMotionEffect(line, this.sourceFrameRate);
    } else if (REGEX_PATTERNS.CMX_COMMENT_REGEX.test(line)) {
      const parsedComment = parseCMXComment(line);
      if (parsedComment.comment && this.currentEvent.comment) {
        this.currentEvent.comment += parsedComment.comment;
      } else {
        Object.assign(this.currentEvent, parsedComment);
      }
    } else if (REGEX_PATTERNS.CMX_FRAME_RATE_REGEX.test(line)) {
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
