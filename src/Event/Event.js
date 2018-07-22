const Timecode = require('timecode-boss');
const RegexPatterns = require('../common/RegexPatterns');
const MotionEffect = require('../MotionEffect/MotionEffect');
const commentParser = require('../commentParser/commentParser');

function parseCMXEvent(input, frameRate) {
  const [,
    number,
    reel,
    track,
    transition,
    sourceStart,
    sourceEnd,
    recordStart,
    recordEnd,
  ] = RegexPatterns.CMX_EVENT_REGEX.exec(input);

  const [,
    trackType,
    tn,
  ] = /(\w)(\d+)?/.exec(track);

  const obj = {
    number: parseInt(number, 10),
    reel,
    trackType,
    transition,
    sourceStart: new Timecode(sourceStart, frameRate),
    sourceEnd: new Timecode(sourceEnd, frameRate),
    recordStart: new Timecode(recordStart, frameRate),
    recordEnd: new Timecode(recordEnd, frameRate),
  };

  if (tn) obj.trackNumber = parseInt(tn, 10);

  return obj;
}

class Event {
  constructor(input, frameRate) {
    let parsedEvent;
    const fps = frameRate || 29.97;

    if (typeof input === 'string') {
      parsedEvent = this.parse(input, fps);
    } else if (typeof input === 'object') {
      parsedEvent = input;
    } else {
      throw new TypeError('Event must be created from an Object or String.');
    }

    Object.assign(this, parsedEvent);
    this.convertTimecodeProperties(fps);
  }

  parse(input, frameRate) {
    if (RegexPatterns.CMX_EVENT_REGEX.test(input)) {
      Object.assign(this, parseCMXEvent(input, frameRate));
    } else {
      throw new TypeError('Invalid EDL Event string');
    }
  }

  setMotionEffect(input) {
    this.motionEffect = new MotionEffect(input);
  }

  addComment(input) {
    const parsedComment = commentParser(input);
    if (Object.prototype.hasOwnProperty.call(parsedComment, 'sourceFile')) {
      this.sourceFile = parsedComment.sourceFile;
    } else if (Object.prototype.hasOwnProperty.call(parsedComment, 'sourceClip')) {
      this.sourceClip = parsedComment.sourceClip;
    } else if (this.comment) {
      this.comment += parsedComment.comment.trim();
    } else {
      this.comment = parsedComment.comment.trim();
    }
  }

  convertTimecodeProperties(frameRate) {
    if (this.sourceStart && !(this.sourceStart instanceof Timecode)) {
      this.sourceStart = new Timecode(this.sourceStart, frameRate);
    }
    if (this.sourceEnd && !(this.sourceEnd instanceof Timecode)) {
      this.sourceEnd = new Timecode(this.sourceEnd, frameRate);
    }
    if (this.recordStart && !(this.recordStart instanceof Timecode)) {
      this.recordStart = new Timecode(this.recordStart, frameRate);
    }
    if (this.recordEnd && !(this.recordEnd instanceof Timecode)) {
      this.recordEnd = new Timecode(this.recordEnd, frameRate);
    }
  }
}

module.exports = Event;
