const SOURCE_FILE_REGEX = /^\*(?:\s+)?SOURCE FILE:\s+(.*)$/;
const SOURCE_CLIP_REGEX = /^\*(?:\s+)?FROM CLIP NAME:\s+(.*)$/;
const COMMENT_REGEX = /^\*(?:\s+)?(.*)$/;

function parse(input) {
  if (!COMMENT_REGEX.test(input)) return undefined;

  if (SOURCE_FILE_REGEX.test(input)) {
    const [, sourceFile] = SOURCE_FILE_REGEX.exec(input);
    return {
      sourceFile: sourceFile.trim(),
    };
  }

  if (SOURCE_CLIP_REGEX.test(input)) {
    const [, sourceClip] = SOURCE_CLIP_REGEX.exec(input);
    return {
      sourceClip: sourceClip.trim(),
    };
  }

  const [, comment] = COMMENT_REGEX.exec(input);
  return { comment };
}

module.exports = parse;
