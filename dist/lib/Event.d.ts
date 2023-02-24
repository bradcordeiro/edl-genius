import Timecode from 'timecode-boss';
import MotionEffect, { type MotionEffectAttributes } from './MotionEffect.js';
export type EventAttributes = {
    number?: number;
    reel?: string;
    trackType?: string;
    trackNumber?: number;
    transition?: string;
    toClip?: string;
    sourceStart?: ConstructorParameters<typeof Timecode>[0];
    sourceEnd?: ConstructorParameters<typeof Timecode>[0];
    recordStart?: ConstructorParameters<typeof Timecode>[0];
    recordEnd?: ConstructorParameters<typeof Timecode>[0];
    sourceClip?: string;
    sourceFile?: string;
    motionEffect?: ConstructorParameters<typeof MotionEffect>[0];
    comment?: string;
};
export default class Event implements EventAttributes {
    sourceFrameRate: number;
    recordFrameRate: number;
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
    constructor(input?: Partial<EventAttributes>, sourceFrameRate?: number, recordFrameRate?: number);
    setMotionEffect(input: MotionEffectAttributes): void;
    addComment(input: string): void;
    toObject(): EventAttributes & {
        sourceFrameRate: number;
        recordFrameRate: number;
    };
}
