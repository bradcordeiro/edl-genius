const fs = require('fs');
const readline = require('readline');
const RegexPatterns = require('../common/RegexPatterns');
const Event = require('../Event/Event');

class EDL {
  constructor(frameRate) {
    this.frameRate = frameRate || 29.97;

    this.events = [];
  }

  async read(inputFile) {
    let currentEvent = {};
    let sourceFrameRate = this.frameRate;

    const rl = readline.createInterface({
      input: fs.createReadStream(inputFile),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (RegexPatterns.CMX_EVENT_REGEX.test(line)) {
        if (Object.prototype.hasOwnProperty.call(currentEvent, 'number')) this.events.push(currentEvent);
        // TODO: Add support for framerates when creating Events
        currentEvent = new Event(line, sourceFrameRate, this.frameRate);
      } else if (RegexPatterns.CMX_MOTION_EFFECT_REGEX.test(line)) {
        // TODO: Add support for framerates when creating Motion Effects
        currentEvent.setMotionEffect(line, sourceFrameRate);
      } else if (RegexPatterns.CMX_COMMENT_REGEX.test(line)) {
        currentEvent.addComment(line);
      } else if (RegexPatterns.CMX_FRAME_RATE_REGEX.test(line)) {
        sourceFrameRate = this.setEventFrameRate(line);
      }
    });

    return new Promise((resolve) => {
      rl.on('close', () => {
        this.events.push(currentEvent);
        resolve(this);
      });
    });
  }

  toJSON(stringify) {
    const json = this.events.map(event => event.toJSON(false));

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
    if (line === 'FCM: NON-DROP FRAME') return 30;
    if (line === 'FCM: DROP FRAME') return 29.97;

    return this.frameRate;
  }
}

module.exports = EDL;
