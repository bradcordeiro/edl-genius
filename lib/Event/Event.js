const Timecode = require('timecode-boss');
const MotionEffect = require('../MotionEffect/MotionEffect');

class Event {
  constructor(input, sourceFrameRate, recordFrameRate) {
    if (input) {
      this.sourceFrameRate = Number.isNaN(sourceFrameRate) ? 29.97 : parseFloat(sourceFrameRate);
      this.recordFrameRate = Number.isNaN(recordFrameRate) ? 29.97 : parseFloat(recordFrameRate);

      if (typeof input === 'object') {
        Object.assign(this, input);
        if (input.sourceStart) this.sourceStart = new Timecode(input.sourceStart);
        if (input.sourceEnd) this.sourceEnd = new Timecode(input.sourceEnd);
        if (input.recordStart) this.recordStart = new Timecode(input.recordStart);
        if (input.recordEnd) this.recordEnd = new Timecode(input.recordEnd);
        if (input.motionEffect) this.motionEffect = new MotionEffect(input.motionEffect);
      } else {
        throw new TypeError('Event must be created from an Object or String.');
      }

      this.convertTimecodeProperties(this.sourceFrameRate, this.recordFrameRate);

      delete this.sourceFrameRate;
      delete this.recordFrameRate;
    }
  }

  setMotionEffect(input) {
    try {
      this.motionEffect = new MotionEffect(input);
    } catch (TypeError) {
      // do nothing, no motionEffect is set
    }
  }

  addComment(input) {
    const parsedComment = { comment: input };

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

  toObject() {
    // TODO: make this more programmatic
    const obj = {};

    if (this.sourceFrameRate) obj.sourceFrameRate = this.sourceFrameRate;
    if (this.recordFrameRate) obj.recordFrameRate = this.recordFrameRate;
    if (this.number) obj.number = this.number;
    if (this.reel) obj.reel = this.reel;
    if (this.trackType) obj.trackType = this.trackType;
    if (this.transition) obj.transition = this.transition;
    if (this.sourceStart) obj.sourceStart = this.sourceStart.toObject();
    if (this.sourceEnd) obj.sourceEnd = this.sourceEnd.toObject();
    if (this.recordStart) obj.recordStart = this.recordStart.toObject();
    if (this.recordEnd) obj.recordEnd = this.recordEnd.toObject();
    if (this.sourceClip) obj.sourceClip = this.sourceClip;
    if (this.sourceFile) obj.sourceFile = this.sourceFile;
    if (this.motionEffect) obj.motionEffect = this.motionEffect.toObject();
    if (this.comment) obj.comment = this.comment;

    return obj;
  }

  toJSON() {
    return JSON.stringify(this.toObject());
  }

  convertTimecodeProperties(sourceFrameRate, recordFrameRate) {
    if (this.sourceStart && !(this.sourceStart instanceof Timecode)) {
      this.sourceStart = new Timecode(this.sourceStart, sourceFrameRate);
    }
    if (this.sourceEnd && !(this.sourceEnd instanceof Timecode)) {
      this.sourceEnd = new Timecode(this.sourceEnd, sourceFrameRate);
    }
    if (this.recordStart && !(this.recordStart instanceof Timecode)) {
      this.recordStart = new Timecode(this.recordStart, recordFrameRate);
    }
    if (this.recordEnd && !(this.recordEnd instanceof Timecode)) {
      this.recordEnd = new Timecode(this.recordEnd, recordFrameRate);
    }
  }
}

module.exports = Event;
