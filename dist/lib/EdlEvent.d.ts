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
    constructor(input?: Partial<EdlEventAttributes>, sourceFrameRate?: number, recordFrameRate?: number);
    setMotionEffect(input: MotionEffectAttributes): void;
    addComment(input: string): void;
    toObject(): EdlEventAttributes;
}
