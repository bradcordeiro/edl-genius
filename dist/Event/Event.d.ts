import Timecode, { TimecodeAttributes } from 'timecode-boss';
import MotionEffect, { type MotionEffectAttributes } from '../MotionEffect/MotionEffect';
export declare type EventAttributes = {
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
declare type EventConstructorAttributes = Partial<EventAttributes> & {
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
declare class Event {
    constructor(input: EventConstructorAttributes, sourceFrameRate?: number, recordFrameRate?: number);
    setMotionEffect(input: any): void;
    addComment(input: string): void;
    toObject(): EventAttributes;
    toJSON(): string;
    convertTimecodeProperties(sourceFrameRate: any, recordFrameRate: any): void;
}
export default Event;
