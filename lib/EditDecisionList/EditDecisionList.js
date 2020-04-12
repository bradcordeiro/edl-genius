const fs = require('fs');
const readline = require('readline');
const { Readable } = require('stream');
const Event = require('../Event/Event');
const CMX3600Parser = require('../CMX3600Parser/CMX3600Parser');

class EditDecisionList {
  constructor(frameRate = 29.97, type = 'cmx3600') {
    this.frameRate = frameRate;
    this.type = type;
    this.events = [];

    switch (this.type) {
      case 'cmx3600':
      default:
        this.parser = CMX3600Parser;
    }
  }

  async read(stream) {
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    this.events = await this.parser(rl, this.frameRate);

    return this;
  }

  async readFile(inputFile) {
    const stream = fs.createReadStream(inputFile);

    return this.read(stream);
  }

  async fromString(string) {
    const stream = Readable.from([string]);

    return this.read(stream);
  }

  fromObject(obj) {
    this.frameRate = obj.frameRate;
    this.type = obj.type;
    this.events = obj.events.map((e => new Event(e)));

    return this;
  }

  async fromBuffer(buf) {
    const stream = new Readable();

    this.parser(stream, this.frameRate)
      .then((events) => {
        this.events = events;
      });

    stream.push(buf);
    stream.push(null);

    return this;
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
    return JSON.stringify(this.toObject());
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
