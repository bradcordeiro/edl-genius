import { Transform, Readable } from 'stream';
import Timecode from 'timecode-boss';
import Event, { type EventAttributes } from './Event.js';

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
  recordFrameRate: number;

  sourceFrameRate: number;

  currentEvent: EventAttributes;

  constructor(recordFrameRate = 29.97) {
    super({ objectMode: true });

    this.currentEvent = {};
    this.recordFrameRate = recordFrameRate;
    this.sourceFrameRate = recordFrameRate;
  }

  private changeFrameRate(line: string) {
    if (line === 'FCM: NON-DROP FRAME') {
      this.sourceFrameRate = Math.ceil(this.sourceFrameRate);
    }

    if (line === 'FCM: DROP FRAME') {
      this.sourceFrameRate = (this.sourceFrameRate * 1000) / 1001;
    }
  }

  private parseEvent(input: string) {
    const matches = CMX_EVENT_REGEX.exec(input);

    if (matches === null || matches.length !== 9) {
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

    let trackType: string | undefined;
    let tn: string | undefined;

    const trackTypeMatches = /(\w)(\d+)?/.exec(track);
    if (trackTypeMatches) {
      [, trackType, tn] = trackTypeMatches;
    }

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

  private parseSourceFileLine(input: string) {
    const matches = CMX_SOURCE_FILE_REGEX.exec(input);

    if (matches && matches.length > 1) {
      const [, sourceFile] = matches;
      if (this.currentEvent) this.currentEvent.sourceFile = sourceFile.trim();
    }
  }

  private parseSourceClipLine(input: string) {
    const matches = CMX_SOURCE_CLIP_REGEX.exec(input);

    if (matches && matches.length > 1) {
      const [, sourceClip] = matches;
      if (this.currentEvent) this.currentEvent.sourceClip = sourceClip.trim();
    }
  }

  private parseToClipLine(input: string) {
    const matches = CMX_TO_CLIP_REGEX.exec(input);

    if (matches && matches.length > 1) {
      const [, toClip] = matches;
      if (this.currentEvent) this.currentEvent.toClip = toClip.trim();
    }
  }

  private parseComment(line: string) {
    if (CMX_SOURCE_FILE_REGEX.test(line)) {
      this.parseSourceFileLine(line);
    } else if (CMX_SOURCE_CLIP_REGEX.test(line)) {
      this.parseSourceClipLine(line);
    } else if (CMX_TO_CLIP_REGEX.test(line)) {
      this.parseToClipLine(line);
    } else {
      const matches = CMX_COMMENT_REGEX.exec(line);
      if (matches && matches.length > 1 && this.currentEvent) {
        const [, comment] = matches;
        if (this.currentEvent.comment) {
          this.currentEvent.comment += comment.trim();
        } else {
          this.currentEvent.comment = comment.trim();
        }
      }
    }
  }

  private parseMotionEffect(line: string) {
    const matches = CMX_MOTION_EFFECT_REGEX.exec(line);

    if (matches && matches.length > 3) {
      const [, reel, s, e] = matches;
      const speed = parseFloat(s);
      if (this.currentEvent) this.currentEvent.motionEffect = { reel, speed, entryPoint: new Timecode(e) };
    }
  }

  private parseNextEvent(line: string) {
    if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) {
      this.push(this.currentEvent);
    }
    this.parseEvent(line);
  }

  _transform(obj: Readable, enc: string, done = () => {}) {
    const line = obj.toString();

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
