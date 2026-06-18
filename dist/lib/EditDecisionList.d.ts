import { Readable } from 'node:stream';
import EdlEvent from './EdlEvent.js';
import type { EdlEventAttributes } from './EdlEvent.js';
export interface EditDecisionListAttributes {
    frameRate: number;
    type: string;
    events: EdlEventAttributes[];
}
export default class EditDecisionList implements EditDecisionListAttributes {
    frameRate: number;
    type: string;
    events: EdlEvent[];
    constructor(frameRate?: number, type?: string);
    private getParser;
    private readStream;
    private readBuffer;
    private readString;
    private fromObject;
    read(input: Readable | Buffer | string | EditDecisionListAttributes): Promise<this>;
    readFile(inputFile: string): Promise<this>;
    toObject(): EditDecisionListAttributes;
    filterDuplicateMultitrack(): EditDecisionList;
}
