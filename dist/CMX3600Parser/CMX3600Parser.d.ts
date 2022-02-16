/// <reference types="node" />
import { Transform } from 'stream';
import Event from '../Event/Event';
declare class CMX3600Parser extends Transform {
    recordFrameRate: number;
    sourceFrameRate: number;
    currentEvent?: Event;
    constructor(recordFrameRate?: number);
    changeFrameRate(line: any): void;
    parseEvent(input: any): void;
    parseSourceFileLine(input: any): void;
    parseSourceClipLine(input: any): void;
    parseToClipLine(input: any): void;
    parseComment(line: any): void;
    parseMotionEffect(line: any): void;
    parseNextEvent(line: any): void;
    _transform(obj: any, enc: any, done?: () => void): void;
    _flush(done?: () => void): void;
}
export default CMX3600Parser;
