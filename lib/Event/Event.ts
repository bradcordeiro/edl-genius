import Timecode, { TimecodeAttributes } from 'timecode-boss';
import MotionEffect, { type MotionEffectAttributes } from '../MotionEffect/MotionEffect';

export type EventAttributes = {
  sourceFrameRate: number;
  recordFrameRate: number;
  number: number;
  reel: string;
  trackType?: string;
  trackNumber?: number;
  transition?: string;
  toClip?: string;
  sourceStart: TimecodeAttributes;
  sourceEnd: TimecodeAttributes;
  recordStart: TimecodeAttributes;
  recordEnd: TimecodeAttributes;
  sourceClip?: string;
  sourceFile?: string;
  motionEffect?: Partial<MotionEffectAttributes>;
  comment?: string;
};

type EventConstructorAttributes = Partial<EventAttributes> & {
  sourceStart: Timecode | TimecodeAttributes;
  sourceEnd: Timecode | TimecodeAttributes;
  recordStart: Timecode | TimecodeAttributes;
  recordEnd: Timecode | TimecodeAttributes;
  motionEffect?: MotionEffectAttributes;
};

interface Event extends EventAttributes {
  sourceStart: Timecode;
  sourceEnd: Timecode;
  recordStart: Timecode;
  recordEnd: Timecode;
  motionEffect: MotionEffect;
}

class Event {
  constructor(input: EventConstructorAttributes, sourceFrameRate = 29.97, recordFrameRate = 29.97) {
    this.sourceFrameRate = sourceFrameRate;
    this.recordFrameRate = recordFrameRate;
    this.number = input.number || 0;
    this.reel = input.reel;
    this.trackType = input.trackType;
    this.transition = input.transition;
    this.sourceStart = new Timecode(input.sourceStart, sourceFrameRate);
    this.sourceEnd = new Timecode(input.sourceEnd, sourceFrameRate);
    this.recordStart = new Timecode(input.recordStart, recordFrameRate);
    this.recordEnd = new Timecode(input.recordEnd, recordFrameRate);
    this.sourceClip = input.sourceClip;
    this.sourceFile = input.sourceFile;
    this.motionEffect = new MotionEffect(input.motionEffect);
    this.comment = input.comment;

    this.convertTimecodeProperties(sourceFrameRate, recordFrameRate);
  }

  setMotionEffect(input) {
    try {
      this.motionEffect = new MotionEffect(input);
    } catch (TypeError) {
      // do nothing, no motionEffect is set
    }
  }

  addComment(input: string) {
    const parsedComment: Pick<EventAttributes, 'comment' | 'sourceFile' | 'sourceClip'> = { comment: input };

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

  toObject() : EventAttributes {
    return {
      sourceFrameRate: this.sourceFrameRate,
      recordFrameRate: this.recordFrameRate,
      number: this.number,
      reel: this.reel,
      trackType: this.trackType,
      transition: this.transition,
      sourceStart: this.sourceStart.toObject(),
      sourceEnd: this.sourceEnd.toObject(),
      recordStart: this.recordStart.toObject(),
      recordEnd: this.recordEnd.toObject(),
      sourceClip: this.sourceClip,
      sourceFile: this.sourceFile,
      motionEffect: this.motionEffect.toObject(),
      comment: this.comment,
    };
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

export default Event;
