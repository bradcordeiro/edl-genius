const Timecode = require('timecode-boss');

const CMXEventRegex = /^(\d+)\s+(\w+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/;
const GVGEventRegex = /\d+\s+\w+\s+\w\s+\w+\s+\d{2}[.:;]\d{2}[.:;]\d{2}[.:;]\d{2}\s+\d{2}[.:;]\d{2}[.:;]\d{2}[.:;]\d{2}\s+\d{2}[.:;]\d{2}[.:;]\d{2}[.:;]\d{2}\s+\d{2}[.:;]\d{2}[.:;]\d{2}[.:;]\d{2}/;

function parseCMXEvent(input, frameRate) {
  const [,
    number,
    reel,
    trackType,
    transition,
    sourceStart,
    sourceEnd,
    recordStart,
    recordEnd,
  ] = CMXEventRegex.exec(input);

  return {
    number: parseInt(number, 10),
    reel,
    trackType,
    transition,
    sourceStart: new Timecode(sourceStart, frameRate),
    sourceEnd: new Timecode(sourceEnd, frameRate),
    recordStart: new Timecode(recordStart, frameRate),
    recordEnd: new Timecode(recordEnd, frameRate),
  };
}

function parseGVGEvent(input) {
  return input;
}

function parse(input, frameRate) {
  if (CMXEventRegex.test(input)) return parseCMXEvent(input, frameRate);
  if (GVGEventRegex.test(input)) return parseGVGEvent(input, frameRate);

  throw new TypeError('Invalid EDL Event string');
}

module.exports = parse;
