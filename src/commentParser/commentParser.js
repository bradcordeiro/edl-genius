const RegexPatterns = require('../common/RegexPatterns');

function parse(input) {
  if (!RegexPatterns.CMX_COMMENT_REGEX.test(input)) return undefined;

  if (RegexPatterns.CMX_SOURCE_FILE_REGEX.test(input)) {
    const [, sourceFile] = RegexPatterns.CMX_SOURCE_FILE_REGEX.exec(input);
    return {
      sourceFile: sourceFile.trim(),
    };
  }

  if (RegexPatterns.CMX_SOURCE_CLIP_REGEX.test(input)) {
    const [, sourceClip] = RegexPatterns.CMX_SOURCE_CLIP_REGEX.exec(input);
    return {
      sourceClip: sourceClip.trim(),
    };
  }

  const [, comment] = RegexPatterns.CMX_COMMENT_REGEX.exec(input);
  return { comment };
}

module.exports = parse;
