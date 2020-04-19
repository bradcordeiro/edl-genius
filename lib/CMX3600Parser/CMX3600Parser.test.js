/* eslint-env mocha */
/* eslint-disable new-cap */
const assert = require('assert');
const { Readable } = require('stream');
const CMX3600Parser = require('./CMX3600Parser');
const Event = require('../Event/Event');

async function* generateEvent() {
  yield '003  BOONE_SM V     C        01:01:43:05 01:01:57:00 01:00:07:26 01:00:21:21';
}

async function* generateAudioEvent() {
  yield '004  BFD_CHIL A10   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19 ';
}

async function* generateEventWithComments() {
  yield '002  EVL1_ESC V     C        06:00:02:01 06:00:07:12 01:00:00:25 01:00:01:16 ';
  yield 'M2   EVL1_ESC       108.5                06:00:02:01 ';
  yield '* GETTY__QEVL1ESCP001_GREAT ESCAPES_MECKLENBURG SIX_AERIAL AROUND PRISON ON ALCATR ';
  yield '* AZ ISLAND _622-21 ';
  yield '* FROM CLIP NAME:  QEVL1ESCP001.NEW.01';
}

async function* generateEventwithSourceFile() {
  yield '006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 ';
  yield 'M2   AQ100          059.6                00:02:18:05 ';
  yield '* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ';
  yield '* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 ';
  yield '* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING';
}

async function* generateEventwithTransition() {
  yield '000002  AX       V     D    024 00:00:00:10 00:00:02:14 01:01:25:10 01:01:27:14';
  yield 'EFFECTS NAME IS CROSS DISSOLVE';
  yield '* FROM CLIP NAME: Clip_01.mov';
  yield '* TO CLIP NAME: Clip_02.mov';
}

async function* generateEventwithMotionEffect() {
  yield '006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 ';
  yield 'M2   AQ100          059.6                00:02:18:05 ';
  yield '* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ';
  yield '* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 ';
  yield '* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING';
}

async function* generateEventwithMotionEffectwithNegativeSpeed() {
  yield '006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 ';
  yield 'M2   AQ100          -092.8                00:02:18:05 ';
  yield '* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ';
  yield '* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 ';
  yield '* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING';
}

describe('CMX3600Parser', () => {
  describe('Events', () => {
    it('new Event(CMXstring) should parse to Event properties', (done) => {
      const input = new Readable.from(generateEvent()); // eslint-disable-line new-cap
      const output = new CMX3600Parser();
      input.pipe(output);
      const results = [];

      output.on('data', data => results.push(data));
      output.on('end', () => {
        assert.strictEqual(results[0].number, 3);
        assert.strictEqual(results[0].reel, 'BOONE_SM');
        assert.strictEqual(results[0].trackType, 'V');
        assert.strictEqual(results[0].transition, 'C');
        assert.strictEqual(results[0].sourceStart.toString(), '01:01:43;05');
        assert.strictEqual(results[0].sourceEnd.toString(), '01:01:57;00');
        assert.strictEqual(results[0].recordStart.toString(), '01:00:07;26');
        assert.strictEqual(results[0].recordEnd.toString(), '01:00:21;21');

        done();
      });
    });

    it('new Event(CMXstring) should split track to type and number', (done) => {
      const input = new Readable.from(generateAudioEvent());
      const output = new CMX3600Parser();
      input.pipe(output);
      const results = [];

      output.on('data', data => results.push(data));
      output.on('end', () => {
        assert.strictEqual(results[0].trackType, 'A');
        assert.strictEqual(results[0].trackNumber, 10);

        done();
      });
    });
  });

  describe('Comments', () => {
    it('addComment("* SOURCE FILE: ...") should add a sourceFile property to Event', (done) => {
      const input = new Readable.from(generateEventwithSourceFile());
      const output = new CMX3600Parser();
      input.pipe(output);
      const results = [];

      output.on('data', data => results.push(data));
      output.on('end', () => {
        assert.strictEqual(results[0].sourceFile, 'DTB RE EDIT - HD 720P VIDEO SHARING');
        done();
      });
    });

    it('addComment("* FROM CLIP NAME: ...") should add a sourceClip property to Event', (done) => {
      const input = new Readable.from(generateEventWithComments());
      const output = new CMX3600Parser();
      input.pipe(output);
      const results = [];

      output.on('data', data => results.push(data));
      output.on('end', () => {
        assert.strictEqual(results[0].sourceClip, 'QEVL1ESCP001.NEW.01');
        done();
      });
    });

    it('addComment("* Misc") should add a comment property to Event', (done) => {
      const input = new Readable.from(generateEventWithComments());
      const output = new CMX3600Parser();
      input.pipe(output);
      const results = [];

      output.on('data', data => results.push(data));
      output.on('end', () => {
        assert.strictEqual(results[0].comment, 'GETTY__QEVL1ESCP001_GREAT ESCAPES_MECKLENBURG SIX_AERIAL AROUND PRISON ON ALCATRAZ ISLAND _622-21');
        done();
      });
    });

    it('addComment() should add exact text of passed string if is not an EDL comment', () => {
      const event = new Event();
      event.addComment('004  BFD_CHIL A10   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19 ');

      assert.strictEqual(event.comment, '004  BFD_CHIL A10   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19');
    });

    it('should parse "* TO CLIP NAME:" to transtionTo property', (done) => {
      const input = new Readable.from(generateEventwithTransition());
      const output = new CMX3600Parser();
      input.pipe(output);
      const results = [];

      output.on('data', data => results.push(data));
      output.on('end', () => {
        assert.strictEqual(results[0].toClip, 'Clip_02.mov');
        done();
      });
    });
  });

  describe('Motion Effects', () => {
    it('Should get a reel', (done) => {
      const input = new Readable.from(generateEventwithMotionEffect());
      const output = new CMX3600Parser();
      input.pipe(output);
      const results = [];

      output.on('data', data => results.push(data));
      output.on('end', () => {
        assert.strictEqual(results[0].motionEffect.reel, 'AQ100');
        done();
      });
    });

    it('Should get speed as a float', (done) => {
      const input = new Readable.from(generateEventwithMotionEffect());
      const output = new CMX3600Parser();
      input.pipe(output);
      const results = [];

      output.on('data', data => results.push(data));
      output.on('end', () => {
        assert.strictEqual(results[0].motionEffect.speed, 59.6);
        done();
      });
    });

    it('Should correctly parse a negative speed', (done) => {
      const input = new Readable.from(generateEventwithMotionEffectwithNegativeSpeed());
      const output = new CMX3600Parser();
      input.pipe(output);
      const results = [];

      output.on('data', data => results.push(data));
      output.on('end', () => {
        assert.strictEqual(results[0].motionEffect.speed, -92.8);
        done();
      });
    });

    it('Should get entryPoint as a Timecode object', (done) => {
      const input = new Readable.from(generateEventwithMotionEffect());
      const output = new CMX3600Parser();
      input.pipe(output);
      const results = [];

      output.on('data', data => results.push(data));
      output.on('end', () => {
        assert.strictEqual(results[0].motionEffect.reel, 'AQ100');
        assert.strictEqual(results[0].motionEffect.entryPoint.toString(), '00:02:18;05');
        done();
      });
    });
  });
});
