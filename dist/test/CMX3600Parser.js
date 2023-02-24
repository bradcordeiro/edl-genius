/* eslint-env mocha */
import assert from 'assert';
import { Readable } from 'stream';
import CMX3600Parser from '../lib/CMX3600Parser.js';
import Event from '../lib/Event.js';
function getBasicStream(contents) {
    if (Array.isArray(contents)) {
        return new Readable({
            read() {
                contents.forEach((line) => this.push(line));
                this.push(null);
            },
        });
    }
    return new Readable({
        read() {
            this.push(contents);
            this.push(null);
        },
    });
}
function generateEvent() {
    return getBasicStream('003  BOONE_SM V     C        01:01:43:05 01:01:57:00 01:00:07:26 01:00:21:21');
}
function generateAudioEvent() {
    return getBasicStream('004  BFD_CHIL A10   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19 ');
}
function generateEventWithComments() {
    return getBasicStream([
        '002  EVL1_ESC V     C        06:00:02:01 06:00:07:12 01:00:00:25 01:00:01:16 ',
        'M2   EVL1_ESC       108.5                06:00:02:01 ',
        '* GETTY__QEVL1ESCP001_GREAT ESCAPES_MECKLENBURG SIX_AERIAL AROUND PRISON ON ALCATR ',
        '* AZ ISLAND _622-21 ',
        '* FROM CLIP NAME:  QEVL1ESCP001.NEW.01',
    ]);
}
function generateEventwithSourceFile() {
    return getBasicStream([
        '006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 ',
        'M2   AQ100          059.6                00:02:18:05 ',
        '* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ',
        '* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 ',
        '* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING',
    ]);
}
function generateEventwithTransition() {
    return getBasicStream([
        '000002  AX       V     D    024 00:00:00:10 00:00:02:14 01:01:25:10 01:01:27:14',
        'EFFECTS NAME IS CROSS DISSOLVE',
        '* FROM CLIP NAME: Clip_01.mov',
        '* TO CLIP NAME: Clip_02.mov',
    ]);
}
function generateEventwithMotionEffect() {
    return getBasicStream([
        '006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 ',
        'M2   AQ100          059.6                00:02:18:05 ',
        '* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ',
        '* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 ',
        '* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING',
    ]);
}
function generateEventwithMotionEffectwithNegativeSpeed() {
    return getBasicStream([
        '006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 ',
        'M2   AQ100          -092.8                00:02:18:05 ',
        '* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ',
        '* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 ',
        '* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING',
    ]);
}
describe('CMX3600Parser', () => {
    describe('Events', () => {
        it('new Event(CMXstring) should parse to Event properties', (done) => {
            const input = generateEvent();
            const output = new CMX3600Parser();
            input.pipe(output);
            const results = [];
            output.on('data', (data) => results.push(data));
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
            const input = generateAudioEvent();
            const output = new CMX3600Parser();
            input.pipe(output);
            const results = [];
            output.on('data', (data) => results.push(data));
            output.on('end', () => {
                assert.strictEqual(results[0].trackType, 'A');
                assert.strictEqual(results[0].trackNumber, 10);
                done();
            });
        });
    });
    describe('Comments', () => {
        it('addComment("* SOURCE FILE: ...") should add a sourceFile property to Event', (done) => {
            const input = generateEventwithSourceFile();
            const output = new CMX3600Parser();
            input.pipe(output);
            const results = [];
            output.on('data', (data) => results.push(data));
            output.on('end', () => {
                assert.strictEqual(results[0].sourceFile, 'DTB RE EDIT - HD 720P VIDEO SHARING');
                done();
            });
        });
        it('addComment("* FROM CLIP NAME: ...") should add a sourceClip property to Event', (done) => {
            const input = generateEventWithComments();
            const output = new CMX3600Parser();
            input.pipe(output);
            const results = [];
            output.on('data', (data) => results.push(data));
            output.on('end', () => {
                assert.strictEqual(results[0].sourceClip, 'QEVL1ESCP001.NEW.01');
                done();
            });
        });
        it('addComment("* Misc") should add a comment property to Event', (done) => {
            const input = generateEventWithComments();
            const output = new CMX3600Parser();
            input.pipe(output);
            const results = [];
            output.on('data', (data) => results.push(data));
            output.on('end', () => {
                /* eslint-disable-next-line max-len */
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
            const input = generateEventwithTransition();
            const output = new CMX3600Parser();
            input.pipe(output);
            const results = [];
            output.on('data', (data) => results.push(data));
            output.on('end', () => {
                assert.strictEqual(results[0].toClip, 'Clip_02.mov');
                done();
            });
        });
    });
    describe('Motion Effects', () => {
        it('Should get a reel', (done) => {
            const input = generateEventwithMotionEffect();
            const output = new CMX3600Parser();
            input.pipe(output);
            const results = [];
            output.on('data', (data) => results.push(data));
            output.on('end', () => {
                if (results[0]) {
                    if (results[0].motionEffect) {
                        assert.strictEqual(results[0].motionEffect.reel, 'AQ100');
                    }
                    else {
                        assert.strictEqual(true, false, 'MotionEffect is undefined');
                    }
                }
                else {
                    assert.strictEqual(true, false, 'Events array is empty.');
                }
                done();
            });
        });
        it('Should get speed as a float', (done) => {
            const input = generateEventwithMotionEffect();
            const output = new CMX3600Parser();
            input.pipe(output);
            const results = [];
            output.on('data', (data) => results.push(data));
            output.on('end', () => {
                if (results[0]) {
                    if (results[0].motionEffect) {
                        assert.strictEqual(results[0].motionEffect.speed, 59.6);
                    }
                    else {
                        assert.strictEqual(true, false, 'MotionEffect is undefined');
                    }
                }
                else {
                    assert.strictEqual(true, false, 'Events array is empty.');
                }
                done();
            });
        });
        it('Should correctly parse a negative speed', (done) => {
            const input = generateEventwithMotionEffectwithNegativeSpeed();
            const output = new CMX3600Parser();
            input.pipe(output);
            const results = [];
            output.on('data', (data) => results.push(data));
            output.on('end', () => {
                if (results[0]) {
                    if (results[0].motionEffect) {
                        assert.strictEqual(results[0].motionEffect.speed, -92.8);
                    }
                    else {
                        assert.strictEqual(true, false, 'MotionEffect is undefined');
                    }
                }
                else {
                    assert.strictEqual(true, false, 'Events array is empty.');
                }
                done();
            });
        });
        it('Should get entryPoint as a Timecode object', (done) => {
            const input = generateEventwithMotionEffect();
            const output = new CMX3600Parser();
            input.pipe(output);
            const results = [];
            output.on('data', (data) => results.push(data));
            output.on('end', () => {
                if (results[0]) {
                    if (results[0].motionEffect) {
                        assert.strictEqual(results[0].motionEffect.reel, 'AQ100');
                        assert.strictEqual(results[0].motionEffect.entryPoint.toString(), '00:02:18;05');
                    }
                    else {
                        assert.strictEqual(true, false, 'MotionEffect is undefined');
                    }
                }
                else {
                    assert.strictEqual(true, false, 'Events array is empty.');
                }
                done();
            });
        });
    });
});
