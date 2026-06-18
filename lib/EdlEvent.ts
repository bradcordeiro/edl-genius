import Timecode from 'timecode-boss';

import MotionEffect from './MotionEffect.js';

import type { ConvertibleToTimecode } from 'timecode-boss';

import type { MotionEffectAttributes } from './MotionEffect.js';

export interface EdlEventAttributes {
  number?: number;
  reel?: string;
  trackType?: string;
  trackNumber?: number;
  transition?: string;
  toClip?: string;
  sourceStart?: ConvertibleToTimecode;
  sourceEnd?: ConvertibleToTimecode;
  recordStart?: ConvertibleToTimecode;
  recordEnd?: ConvertibleToTimecode;
  sourceClip?: string;
  sourceFile?: string;
  motionEffect?: ConstructorParameters<typeof MotionEffect>[0];
  comment?: string;
  sourceFrameRate?: number;
  recordFrameRate?: number;
}

export default class EdlEvent implements EdlEventAttributes {
  number?: number;

  reel?: string;

  trackType?: string;

  trackNumber?: number;

  transition?: string;

  toClip?: string;

  sourceStart: Timecode;

  sourceEnd: Timecode;

  recordStart: Timecode;

  recordEnd: Timecode;

  sourceClip?: string;

  sourceFile?: string;

  motionEffect?: MotionEffect;

  comment?: string;

  sourceFrameRate?: number;

  recordFrameRate?: number;

  constructor(input: Partial<EdlEventAttributes> = {}, sourceFrameRate = 29.97, recordFrameRate = 29.97) {
    this.sourceFrameRate = sourceFrameRate;
    this.recordFrameRate = recordFrameRate;
    this.number = input.number;
    this.reel = input.reel;
    this.trackType = input.trackType;
    this.transition = input.transition;
    this.sourceClip = input.sourceClip;
    this.sourceFile = input.sourceFile;
    this.comment = input.comment;

    this.sourceStart = input.sourceStart ? new Timecode(input.sourceStart, sourceFrameRate) : new Timecode({}, sourceFrameRate);
    this.sourceEnd = input.sourceEnd ? new Timecode(input.sourceEnd, sourceFrameRate) : new Timecode({}, sourceFrameRate);
    this.recordStart = input.recordStart ? new Timecode(input.recordStart, recordFrameRate) : new Timecode({}, recordFrameRate);
    this.recordEnd = input.recordEnd ? new Timecode(input.recordEnd, recordFrameRate) : new Timecode({}, recordFrameRate);
    this.motionEffect = input.motionEffect ? new MotionEffect(input.motionEffect) : undefined;
  }

  setMotionEffect(input: MotionEffectAttributes): void {
    this.motionEffect = new MotionEffect(input);
  }

  addComment(input: string): void {
    const parsedComment: Pick<EdlEventAttributes, 'comment' | 'sourceFile' | 'sourceClip'> = { comment: input };

    if (parsedComment.sourceFile) {
      this.sourceFile = parsedComment.sourceFile;
    } else if (parsedComment.sourceClip) {
      this.sourceClip = parsedComment.sourceClip;
    } else if (this.comment && parsedComment.comment) {
      this.comment += parsedComment.comment.trim();
    } else if (parsedComment.comment) {
      this.comment = parsedComment.comment.trim();
    }
  }

  toObject(): EdlEventAttributes {
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
      motionEffect: this.motionEffect ? this.motionEffect.toObject() : undefined,
      comment: this.comment,
    };
  }
}
