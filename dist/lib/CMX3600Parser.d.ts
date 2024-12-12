/// <reference types="node" />
/// <reference types="node" />
import { Transform } from 'stream';
export default class CMX3600Parser extends Transform {
    private recordFrameRate;
    private sourceFrameRate;
    private currentEvent;
    constructor(recordFrameRate?: number);
    private changeSourceFrameRateToDropFrame;
    private changeSourceFrameRateToNonDropFrame;
    private changeFrameRate;
    private parseEvent;
    private parseSourceFileLine;
    private parseSourceClipLine;
    private parseToClipLine;
    private parseComment;
    private parseMotionEffect;
    private parseNextEvent;
    private pushCurrentEventConditionally;
    _transform(obj: string | Buffer, enc: string, callback?: () => void): void;
    _flush(callback?: () => void): void;
}
