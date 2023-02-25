import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { Readable } from 'stream';
import Event from './Event.js';
import CMX3600Parser from './CMX3600Parser.js';
function getBasicStream(contents) {
    if (Array.isArray(contents)) {
        return new Readable({
            read() {
                contents.forEach((line) => this.push(line));
            },
        });
    }
    return new Readable({
        read() {
            this.push(contents);
        },
    });
}
export default class EditDecisionList {
    constructor(frameRate = 29.97, type = 'cmx3600') {
        this.frameRate = frameRate;
        this.type = type;
        this.events = [];
    }
    getParser() {
        switch (this.type) {
            case 'cmx3600':
            default:
                return new CMX3600Parser(this.frameRate);
        }
    }
    async readStream(input) {
        const parser = this.getParser();
        const rl = createInterface({
            input,
            crlfDelay: Infinity,
            terminal: false,
            historySize: 0,
        });
        return new Promise((resolve, reject) => {
            rl.on('line', (line) => parser.push(line));
            rl.on('error', (error) => reject(error));
            rl.on('close', () => parser.end());
            parser.on('error', (error) => reject(error));
            parser.on('end', () => resolve(this));
        });
    }
    async readBuffer(buf, encoding = 'utf8') {
        const stream = getBasicStream();
        stream.push(buf, encoding);
        stream.push(null);
        return this.readStream(stream);
    }
    async readString(str) {
        const buf = Buffer.from(str);
        return this.readBuffer(buf);
    }
    async fromObject(obj) {
        this.frameRate = obj.frameRate;
        this.type = obj.type;
        this.events = obj.events.map(((e) => new Event(e)));
        return this;
    }
    async read(input) {
        if (input instanceof Readable)
            return this.readStream(input);
        if (input instanceof Buffer)
            return this.readBuffer(input);
        if (typeof input === 'string')
            return this.readString(input);
        return this.fromObject(input);
    }
    async readFile(inputFile) {
        const input = createReadStream(inputFile);
        return this.readStream(input);
    }
    toObject() {
        return {
            frameRate: this.frameRate,
            type: this.type,
            events: this.events.map((event) => event.toObject()),
        };
    }
    filterDuplicateMultitrack() {
        const filtered = new EditDecisionList(this.frameRate);
        filtered.events = this.events.filter((event, index) => {
            if (index === 0)
                return true;
            if (event.reel === this.events[index - 1].reel
                && event.trackType === this.events[index - 1].trackType
                && event.sourceClip === this.events[index - 1].sourceClip
                && event.sourceFile === this.events[index - 1].sourceFile
                && event.sourceStart.toString() === this.events[index - 1].sourceStart.toString()
                && event.sourceEnd.toString() === this.events[index - 1].sourceEnd.toString()
                && event.recordStart.toString() === this.events[index - 1].recordStart.toString()
                && event.recordEnd.toString() === this.events[index - 1].recordEnd.toString())
                return false;
            return true;
        });
        return filtered;
    }
}
