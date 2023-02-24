/// <reference types="node" />
import { Transform, Readable } from 'stream';
import { type EventAttributes } from './Event.js';
export default class CMX3600Parser extends Transform {
    recordFrameRate: number;
    sourceFrameRate: number;
    currentEvent: EventAttributes;
    constructor(recordFrameRate?: number);
    private changeFrameRate;
    private parseEvent;
    private parseSourceFileLine;
    private parseSourceClipLine;
    private parseToClipLine;
    private parseComment;
    private parseMotionEffect;
    private parseNextEvent;
    _transform(obj: Readable, enc: string, done?: () => void): void;
    _flush(done?: () => void): void;
}
