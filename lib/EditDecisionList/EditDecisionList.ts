import * as fs from 'fs';
import * as readline from 'readline';
import { Readable, Transform } from 'stream';
import fastJson from 'fast-json-stringify';
import Event, { EventAttributes } from '../Event/Event';
import CMX3600Parser from '../CMX3600Parser/CMX3600Parser';

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

class EditDecisionList {
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

  async read(input) {
    if (input instanceof Readable) return this.fromStream(input);
    if (input instanceof Buffer) return this.fromBuffer(input);
    if (typeof input === 'string') return this.fromString(input);

    return this.fromObject(input);
  }

  async readFile(inputFile) {
    const input = fs.createReadStream(inputFile);

    return this.fromStream(input);
  }

  async fromStream(stream) {
    this.parser.on('data', (data) => this.events.push(data));

    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
      terminal: false,
      historySize: 0,
    });

    rl.on('line', (line) => this.parser.write(line));

    return new Promise((resolve, reject) => {
      rl.on('error', (error) => reject(error));
      rl.on('close', () => this.parser.end());

      this.parser.on('error', (error) => reject(error));
      this.parser.on('end', () => resolve(this));
    });
  }

  async fromBuffer(buf: Buffer, encoding: BufferEncoding = 'utf8') {
    const stream = getBasicStream();

    stream.push(buf, encoding);
    stream.push(null);

    return this.fromStream(stream);
  }

  async fromString(str: string) {
    const buf = Buffer.from(str);

    return this.fromBuffer(buf);
  }

  fromObject(obj) {
    this.frameRate = obj.frameRate;
    this.type = obj.type;
    this.events = obj.events.map(((e) => new Event(e)));

    return this;
  }

  toObject() : EditDecisionListAttributes {
    return {
      frameRate: this.frameRate,
      type: this.type,
      events: this.events.map((event) => event.toObject()),
    };
  }

  toJSON() {
    const stringify = fastJson({
      definitions: {
        timecode: {
          type: 'object',
          properties: {
            hours: { type: 'integer' },
            minutes: { type: 'integer' },
            seconds: { type: 'integer' },
            frames: { type: 'integer' },
            frameRate: { type: 'integer' },
          },
        },
      },
      type: 'object',
      properties: {
        frameRate: { type: 'number' },
        type: { type: 'string' },
        events: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              number: { type: 'integer' },
              reel: { type: 'string' },
              trackType: { type: 'string' },
              transition: { type: 'string' },
              sourceStart: { $ref: '#/definitions/timecode' },
              sourceEnd: { $ref: '#/definitions/timecode' },
              recordStart: { $ref: '#/definitions/timecode' },
              recordEnd: { $ref: '#/definitions/timecode' },
              sourceClip: { type: 'string' },
              sourceFile: { type: 'string' },
              motionEffect: {
                type: 'object',
                properties: {
                  reel: { type: 'string' },
                  speed: { type: 'number' },
                  entryPoint: { $ref: '#/definitions/timecode' },
                },
              },
              comment: { type: 'string' },
            },
          },
        },
      },
    });
    return stringify(this.toObject());
  }

  filterDuplicateMultitrack() {
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

export default EditDecisionList;
