import * as fs from 'fs';
import * as readline from 'readline';
import { Readable, Transform } from 'stream';
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
  parser: Transform;

  frameRate: number;

  type: string;

  events: Event[];

  constructor(frameRate = 29.97, type = 'cmx3600') {
    this.frameRate = frameRate;
    this.type = type;
    this.events = [];

    switch (this.type) {
      case 'cmx3600':
      default:
        this.parser = new CMX3600Parser(frameRate);
    }
  }

  private async readStream(input: Readable) : Promise<this> {
    this.parser.on('data', (data) => this.events.push(data));

    const rl = readline.createInterface({
      input,
      output: this.parser,
      crlfDelay: Infinity,
      terminal: false,
      historySize: 0,
    });

    return new Promise((resolve, reject) => {
      rl.on('error', (error) => reject(error));
      rl.on('close', () => this.parser.end());

      this.parser.on('error', (error) => reject(error));
      this.parser.on('end', () => resolve(this));
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
    const input = fs.createReadStream(inputFile);

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

      if (event.reel === this.events[index - 1].reel
          && event.trackType === this.events[index - 1].trackType
          && event.sourceClip === this.events[index - 1].sourceClip
          && event.sourceFile === this.events[index - 1].sourceFile
          && event.sourceStart.toString() === this.events[index - 1].sourceStart.toString()
          && event.sourceEnd.toString() === this.events[index - 1].sourceEnd.toString()
          && event.recordStart.toString() === this.events[index - 1].recordStart.toString()
          && event.recordEnd.toString() === this.events[index - 1].recordEnd.toString()
      ) return false;

      return true;
    });

    return filtered;
  }
}
