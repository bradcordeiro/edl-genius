/// <reference types="node" />
import { Transform } from 'stream';
import Event, { EventAttributes } from '../Event/Event';
export interface EditDecisionListAttributes {
    frameRate: number;
    type: string;
    events: EventAttributes[];
}
declare class EditDecisionList {
    parser: Transform;
    frameRate: number;
    type: string;
    events: Event[];
    constructor(frameRate?: number, type?: string);
    read(input: any): Promise<unknown>;
    readFile(inputFile: any): Promise<unknown>;
    fromStream(stream: any): Promise<unknown>;
    fromBuffer(buf: Buffer, encoding?: BufferEncoding): Promise<unknown>;
    fromString(str: string): Promise<unknown>;
    fromObject(obj: any): this;
    toObject(): EditDecisionListAttributes;
    toJSON(): string;
    filterDuplicateMultitrack(): EditDecisionList;
}
export default EditDecisionList;
