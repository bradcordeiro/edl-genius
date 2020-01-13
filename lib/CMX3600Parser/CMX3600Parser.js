const Event = require('../Event/Event');

const REGEX_PATTERNS = {
  CMX_FRAME_RATE_REGEX: /^FCM:/,
  CMX_MOTION_EFFECT_REGEX: /^M2\s+(\w+)\s+(\S+)\s+(\d{2}:\d{2}:\d{2}:\d{2})(?:\s+)?$/,
  CMX_EVENT_REGEX: /^(\d+)\s+(\w+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/,
  CMX_EVENT_WITH_TRACKNUMBER_REGEX: /^(\d+)\s+(\w+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/,
  CMX_SOURCE_FILE_REGEX: /^\*(?:\s+)?SOURCE FILE:\s+(.*)$/,
  CMX_SOURCE_CLIP_REGEX: /^\*(?:\s+)?FROM CLIP NAME:\s+(.*)$/,
  CMX_COMMENT_REGEX: /^\*(?:\s+)?(.*)$/,
};

function changeFrameRate(line) {
  if (line === 'FCM: NON-DROP FRAME') {
    return 30;
  }

  return 29.97;
}

async function CMX3600Parser(stream, recordFrameRate = 29.97) {
  let sourceFrameRate = recordFrameRate;
  const events = [];
  let currentEvent = {};

  stream.on('line', (line) => {
    if (REGEX_PATTERNS.CMX_EVENT_REGEX.test(line)) {
      if (Object.prototype.hasOwnProperty.call(currentEvent, 'number')) events.push(currentEvent);
      currentEvent = new Event(line, sourceFrameRate, recordFrameRate);
    } else if (REGEX_PATTERNS.CMX_MOTION_EFFECT_REGEX.test(line)) {
      currentEvent.setMotionEffect(line, sourceFrameRate);
    } else if (REGEX_PATTERNS.CMX_COMMENT_REGEX.test(line)) {
      currentEvent.addComment(line);
    } else if (REGEX_PATTERNS.CMX_FRAME_RATE_REGEX.test(line)) {
      sourceFrameRate = changeFrameRate(line);
    }
  });

  return new Promise((resolve, reject) => {
    stream.on('close', () => {
      events.push(currentEvent);
      resolve(events);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = CMX3600Parser;
