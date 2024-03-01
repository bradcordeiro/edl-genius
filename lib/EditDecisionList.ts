import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { Readable } from 'stream';
import Event, { EventAttributes } from './Event.js';
import CMX3600Parser from './CMX3600Parser.js';

function getBasicStream(contents?: string | string[]) {
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

export interface EditDecisionListAttributes {
  frameRate: number;
  type: string;
  events: EventAttributes[];
}

export default class EditDecisionList implements EditDecisionListAttributes {
  frameRate: number;

  type: string;

  events: Event[];

  constructor(frameRate = 29.97, type = 'cmx3600') {
    this.frameRate = frameRate;
    this.type = type;
    this.events = [];
  }

  private getParser() {
    switch (this.type) {
      case 'cmx3600':
      default:
        return new CMX3600Parser(this.frameRate);
    }
  }

  private async readStream(input: Readable) : Promise<this> {
    const parser = this.getParser();
    parser.on('data', (data: EventAttributes) => {
      const event = new Event(data, data.sourceFrameRate, data.recordFrameRate);
      this.events.push(event);
    });

    const rl = createInterface({
      input,
      crlfDelay: Infinity,
      terminal: false,
      historySize: 0,
    });

    return new Promise((resolve, reject) => {
      rl
        .on('line', (line) => parser.write(line))
        .on('error', (error) => reject(error))
        .on('close', () => parser.end());

      parser
        .on('error', (error) => reject(error))
        .on('end', () => resolve(this));
    });
  }

  private async readBuffer(buf: Buffer, encoding: BufferEncoding = 'utf8') : Promise<this> {
    const stream = getBasicStream();

    stream.push(buf, encoding);
    stream.push(null);

    return this.readStream(stream);
  }

  private async readString(str: string) : Promise<this> {
    const buf = Buffer.from(str);

    return this.readBuffer(buf);
  }

  private async fromObject(obj: EditDecisionListAttributes) : Promise<this> {
    this.frameRate = obj.frameRate;
    this.type = obj.type;
    this.events = obj.events.map(((e) => new Event(e)));

    return this;
  }

  async read(input: Readable | Buffer | string | EditDecisionListAttributes) : Promise<this> {
    if (input instanceof Readable) return this.readStream(input);
    if (input instanceof Buffer) return this.readBuffer(input);
    if (typeof input === 'string') return this.readString(input);

    return this.fromObject(input);
  }

  async readFile(inputFile: string) : Promise<this> {
    const input = createReadStream(inputFile);

    return this.readStream(input);
  }

  toObject() : EditDecisionListAttributes {
    return {
      frameRate: this.frameRate,
      type: this.type,
      events: this.events.map((event) => event.toObject()),
    };
  }

  filterDuplicateMultitrack() : EditDecisionList {
    const filtered = new EditDecisionList(this.frameRate);

    filtered.events = this.events.filter((event, index) => {
      if (index === 0) return true;
      const prevEvent = this.events[index - 1];
      if (!prevEvent) return true;
      if (event.reel === prevEvent.reel
          && event.trackType === prevEvent.trackType
          && event.sourceClip === prevEvent.sourceClip
          && event.sourceFile === prevEvent.sourceFile
          && event.sourceStart.toString() === prevEvent.sourceStart.toString()
          && event.sourceEnd.toString() === prevEvent.sourceEnd.toString()
          && event.recordStart.toString() === prevEvent.recordStart.toString()
          && event.recordEnd.toString() === prevEvent.recordEnd.toString()
      ) return false;

      return true;
    });

    return filtered;
  }
}
