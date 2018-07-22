const patterns = {
  CMX_MOTION_EFFECT_REGEX: /^M2\s+(\w+)\s+(\S+)\s+(\d{2}:\d{2}:\d{2}:\d{2})(?:\s+)?$/,
  CMX_EVENT_REGEX: /^(\d+)\s+(\w+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/,
  CMX_EVENT_WITH_TRACKNUMBER_REGEX: /^(\d+)\s+(\w+)\s+(\S+)\s+(\w+)\s+(?:\w+\s+)?(?:\w+\s+)?(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})\s+(\d{2}:\d{2}:\d{2}:\d{2})/,
  CMX_SOURCE_FILE_REGEX: /^\*(?:\s+)?SOURCE FILE:\s+(.*)$/,
  CMX_SOURCE_CLIP_REGEX: /^\*(?:\s+)?FROM CLIP NAME:\s+(.*)$/,
  CMX_COMMENT_REGEX: /^\*(?:\s+)?(.*)$/,
  GVG_EVENT_REGEX: /\d+\s+\w+\s+\w\s+\w+\s+\d{2}[.:;]\d{2}[.:;]\d{2}[.:;]\d{2}\s+\d{2}[.:;]\d{2}[.:;]\d{2}[.:;]\d{2}\s+\d{2}[.:;]\d{2}[.:;]\d{2}[.:;]\d{2}\s+\d{2}[.:;]\d{2}[.:;]\d{2}[.:;]\d{2}/,
};

Object.freeze(patterns);
module.exports = patterns;
