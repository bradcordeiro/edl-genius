const fs = require('fs');
const readline = require('readline');
const RegexPatterns = require('../common/RegexPatterns');
const Event = require('../Event/Event');

class EDL {
  constructor() {
    this.events = [];
  }

  async read(inputFile) {
    let currentEvent = {};

    const rl = readline.createInterface({
      input: fs.createReadStream(inputFile),
    });

    rl.on('line', (line) => {
      if (RegexPatterns.CMX_EVENT_REGEX.test(line)) {
        if (Object.prototype.hasOwnProperty.call(currentEvent, 'number')) this.events.push(currentEvent);
        currentEvent = new Event(line);
      } else if (RegexPatterns.CMX_MOTION_EFFECT_REGEX.test(line)) {
        currentEvent.setMotionEffect(line);
      } else if (RegexPatterns.CMX_COMMENT_REGEX.test(line)) {
        currentEvent.addComment(line);
      }
    });

    rl.on('close', () => {
      this.events.push(currentEvent);
      return this;
    });
  }
}

module.exports = EDL;
