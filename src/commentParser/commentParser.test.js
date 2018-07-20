/* eslint-env mocha */
const assert = require('assert');
const commentParser = require('./commentParser');

describe('Comment Parsers', () => {
  it('Should return an object with a source file', () => {
    const { sourceFile } = commentParser('* SOURCE FILE: BOONE SMITH ON CAMERA HOST_-720P');
    assert.strictEqual(sourceFile, 'BOONE SMITH ON CAMERA HOST_-720P');
  });

  it('Should return an object with a source clip', () => {
    const { sourceClip } = commentParser('* FROM CLIP NAME:  BOONE SMITH ON CAMERA HOST_-720P.NEW.01 ');
    assert.strictEqual(sourceClip, 'BOONE SMITH ON CAMERA HOST_-720P.NEW.01');
  });

  it('Should return a regular comment', () => {
    const { comment } = commentParser('* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ');
    assert.strictEqual(comment, 'TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ');
  });
});
