const fs = require('fs');
const RegexPatterns = require('../common/RegexPatterns');
const Event = require('../Event/Event');

class EDL {
  constructor(inputFile) {
    this.events = [];
    this.currentEvent = {};

    const lines = fs.readFileSync(inputFile, { encoding: 'utf8' }).split(/[\n\r]/);

    lines.forEach((line) => {
      if (RegexPatterns.CMX_EVENT_REGEX.test(line)) {
        if (Object.prototype.hasOwnProperty.call(this.currentEvent, 'number')) this.events.push(this.currentEvent);
        this.currentEvent = new Event(line);
      } else if (RegexPatterns.CMX_MOTION_EFFECT_REGEX.test(line)) {
        this.currentEvent.setMotionEffect(line);
      } else if (RegexPatterns.CMX_COMMENT_REGEX.test(line)) {
        this.currentEvent.addComment(line);
      }
    });

    this.events.push(this.currentEvent);
    delete this.currentEvent;
  }
}

module.exports = EDL;
