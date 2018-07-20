const fs = require('fs');
const readline = require('readline');
const EventParser = require('../eventParser/eventParser');
const commentParser = require('../commentParser/commentParser');
const motionEffectParser = require('../motionEffectParser/motionEffectParser');

const EVENT_REGEX = /^\d+/;
const MOTION_EFFECT_REGEX = /^M2/;
const COMMENT_REGEX = /^\*/;

async function parse(inputFile) {
  const events = [];
  let currentEvent = {};

  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
  });

  rl.on('line', (line) => {
    if (EVENT_REGEX.test(line)) {
      if (Object.prototype.hasOwnProperty.call(currentEvent, 'eventNumber')) events.push(currentEvent);
      currentEvent = EventParser(line);
      //
    } else if (MOTION_EFFECT_REGEX.test(line)) {
      currentEvent.motionEffect = motionEffectParser(line);
      //
    } else if (COMMENT_REGEX.test(line)) {
      const parsedComment = commentParser(line);
      //
      if (Object.prototype.hasOwnProperty.call(parsedComment, 'sourceFile')) {
        currentEvent.sourceFile = parsedComment.sourceFile;
      } else if (Object.prototype.hasOwnProperty.call(parsedComment, 'sourceClip')) {
        currentEvent.sourceClip = parsedComment.sourceClip;
      } else if (currentEvent.comment) {
        currentEvent.comment += parsedComment;
      } else {
        currentEvent.comment = parsedComment.comment;
      }
    }
  });

  return new Promise((resolve) => {
    rl.on('close', () => resolve(events));
  });
}

module.exports = parse;
