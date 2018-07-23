const fs = require('fs');
const readline = require('readline');
const RegexPatterns = require('../common/RegexPatterns');
const Event = require('../Event/Event');

class EDL {
  constructor(frameRate) {
    if (!frameRate) this.frameRate = 29.97;

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

  toJSON() {
    return JSON.stringify(this.events.map(event => event.toJSON(false)));
  }

  setEventFrameRate(line) {
    if (line === 'FCM: NON-DROP FRAME') return 30;
    if (line === 'FCM: DROP FRAME') return 29.97;

    return this.frameRate;
  }
}

module.exports = EDL;
