const fs = require('fs');
const readline = require('readline');
const { Readable } = require('stream');
const detectCharacterEncoding = require('detect-character-encoding');
const fastJson = require('fast-json-stringify');
const Event = require('../Event/Event');
const CMX3600Parser = require('../CMX3600Parser/CMX3600Parser');

function getBasicStream(contents) {
  if (Array.isArray(contents)) {
    return new Readable({
      read() {
        contents.forEach(line => this.push(line));
      },
    });
  }

  return new Readable({
    read() {
      this.push(contents);
    },
  });
}

class EditDecisionList {
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

  async read(stream) {
    this.parser.on('data', data => this.events.push(data));

    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
      terminal: false,
      historySize: 0,
    });

    rl.on('line', line => this.parser.write(line));
    rl.on('close', () => this.parser.end());

    return new Promise((resolve, reject) => {
      rl.on('error', error => reject(error));
      this.parser.on('end', () => resolve(this));
      this.parser.on('error', error => reject(error));
    });
  }

  async readFile(inputFile) {
    const input = fs.createReadStream(inputFile);

    return this.read(input);
  }

  async fromString(string) {
    const buf = Buffer.from(string);

    return this.fromBuffer(buf);
  }

  fromObject(obj) {
    this.frameRate = obj.frameRate;
    this.type = obj.type;
    this.events = obj.events.map((e => new Event(e)));

    return this;
  }

  async fromBuffer(buf) {
    const stream = getBasicStream();
    const { encoding } = detectCharacterEncoding(buf);

    stream.push(buf, { encoding });
    stream.push(null);

    return this.read(stream);
  }

  toObject() {
    const obj = {
      frameRate: this.frameRate,
      type: this.type,
    };

    obj.events = this.events.map(event => event.toObject());

    return obj;
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

module.exports = EditDecisionList;
