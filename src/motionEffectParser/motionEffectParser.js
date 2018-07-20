const Timecode = require('timecode-boss');

const MOTION_EFFECT_REGEX = /^M2\s+(\w+)\s+(\S+)\s+(\d{2}:\d{2}:\d{2}:\d{2})(?:\s+)?$/;


function parseMotionEffect(input) {
  const [, reel, s, e] = MOTION_EFFECT_REGEX.exec(input);
  return {
    reel,
    speed: parseFloat(s),
    entryPoint: new Timecode(e),
  };
}
module.exports = parseMotionEffect;
