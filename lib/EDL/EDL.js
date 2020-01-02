const fs = require('fs');
const readline = require('readline');
const RegexPatterns = require('../common/RegexPatterns');
const Event = require('../Event/Event');

class EDL {
  constructor(frameRate) {
    this.frameRate = frameRate || 29.97;
    this.events = [];
    this.parseLine = this.parseLine.bind(this);
  }

  async readFile(inputFile) {
    this.currentEvent = {};
    this.sourceFrameRate = this.frameRate;

    const rl = readline.createInterface({
      input: fs.createReadStream(inputFile),
      crlfDelay: Infinity,
    });

    rl.on('line', this.parseLine);

    delete this.sourceFrameRate;

    return new Promise((resolve) => {
      rl.on('close', () => {
        this.events.push(this.currentEvent);
        delete this.currentEvent;
        resolve(this);
      });
    });
  }

  fromString(string) {
    this.currentEvent = {};
    this.sourceFrameRate = this.frameRate;

    string.split('\n').forEach(this.parseLine);

    this.events.push(this.currentEvent);
    delete this.currentEvent;
    delete this.sourceFrameRate;

    return this;
  }

  toJSON(stringify) {
    const json = this.events.map((event) => event.toJSON(false));

    if (stringify === true) return JSON.stringify(json);

    return json;
  }

  filterDuplicateMultitrack() {
    const filtered = new EDL(this.frameRate);

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

  setEventFrameRate(line) {
    if (line === 'FCM: NON-DROP FRAME') {
      this.sourceFrameRate = 30;
    } else if (line === 'FCM: DROP FRAME') {
      this.sourceFrameRate = 29.97;
    }
  }

  parseLine(line) {
    if (RegexPatterns.CMX_EVENT_REGEX.test(line)) {
      if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) this.events.push(this.currentEvent);
      this.currentEvent = new Event(line, this.sourceFrameRate, this.frameRate);
    } else if (RegexPatterns.CMX_MOTION_EFFECT_REGEX.test(line)) {
      this.currentEvent.setMotionEffect(line, this.sourceFrameRate);
    } else if (RegexPatterns.CMX_COMMENT_REGEX.test(line)) {
      this.currentEvent.addComment(line);
    } else if (RegexPatterns.CMX_FRAME_RATE_REGEX.test(line)) {
      this.setEventFrameRate(line);
    }
  }
}

module.exports = EDL;
