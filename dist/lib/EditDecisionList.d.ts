/// <reference types="node" />
/// <reference types="node" />
import { Readable } from 'stream';
import Event, { EventAttributes } from './Event.js';
export interface EditDecisionListAttributes {
    frameRate: number;
    type: string;
    events: EventAttributes[];
}
export default class EditDecisionList implements EditDecisionListAttributes {
    frameRate: number;
    type: string;
    events: Event[];
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
