var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "assert", "../lib/EditDecisionList.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-env mocha */
    /* eslint-disable prefer-arrow-callback */
    /* eslint-disable func-names */
    const fs = __importStar(require("fs"));
    const assert_1 = __importDefault(require("assert"));
    const EditDecisionList_js_1 = __importDefault(require("../lib/EditDecisionList.js"));
    describe('EditDecisionList Class', function () {
        describe('Constructor', function () {
            it('Should use a default frame rate of 29.97 if constructed with no arguments', function () {
                const edl = new EditDecisionList_js_1.default();
                assert_1.default.strictEqual(edl.frameRate, 29.97);
            });
            it('Should accept a frameRate as first argument', function () {
                const edl = new EditDecisionList_js_1.default(59.94);
                assert_1.default.strictEqual(edl.frameRate, 59.94);
            });
            it('Should set the recordStart and recordEnd framerates to this.frameRate', async function () {
                const edl = new EditDecisionList_js_1.default(23.98);
                await edl.readFile('./test/edl_files/070816_EG101_HEISTS_ROUGH_CUT_SOURCES_PART 1.edl');
                edl.events.forEach((event) => {
                    assert_1.default.strictEqual(event.recordStart.frameRate, 23.98);
                    assert_1.default.strictEqual(event.recordEnd.frameRate, 23.98);
                });
            });
        });
        describe('read', function () {
            it('Should store events where each Event number is its index+1', async function () {
                const edl = new EditDecisionList_js_1.default(29.97);
                await edl.readFile('./test/edl_files/cmx3600.edl');
                edl.events.forEach((event, index) => {
                    assert_1.default.strictEqual(index + 1, event.number);
                });
            });
            it('Should correctly construct Events with comments and motion effects', async function () {
                const edl = new EditDecisionList_js_1.default(29.97);
                await edl.readFile('./test/edl_files/070816_EG101_HEISTS_ROUGH_CUT_SOURCES_PART 1.edl');
                const event = edl.events[3];
                /*
                004  QEVL1GRN V     C        01:31:44:03 01:31:44:12 01:00:02:24 01:00:03:01
                M2   QEVL1GRN       037.5                01:31:44:03
                * GETTY IMAGES__QEVL1GRND130_UNDERGROUND_EL CHAPO TUNNELS_INTERIOR OF ALCATRAZ PRI
                * SON. ROW OF CELLS, CLOSE-UP OF CELL DOOR BARS, INSIDE OF JAIL CELL_180563302
                * FROM CLIP NAME:  QEVL1GRND130.NEW.01
                */
                assert_1.default.strictEqual(event.number, 4);
                assert_1.default.strictEqual(event.reel, 'QEVL1GRN');
                assert_1.default.strictEqual(event.trackType, 'V');
                assert_1.default.strictEqual(event.trackNumber, undefined);
                assert_1.default.strictEqual(event.sourceStart.toString(), '01:31:44;03');
                assert_1.default.strictEqual(event.sourceEnd.toString(), '01:31:44;12');
                assert_1.default.strictEqual(event.recordStart.toString(), '01:00:02;24');
                assert_1.default.strictEqual(event.recordEnd.toString(), '01:00:03;01');
                assert_1.default.deepStrictEqual(event.motionEffect?.toObject(), {
                    reel: 'QEVL1GRN',
                    speed: 37.5,
                    entryPoint: {
                        hours: 1,
                        minutes: 31,
                        seconds: 44,
                        frames: 3,
                        frameRate: 29.97,
                    },
                });
                assert_1.default.strictEqual(event.motionEffect.entryPoint.toString(), '01:31:44;03');
                assert_1.default.strictEqual(event.sourceClip, 'QEVL1GRND130.NEW.01');
                /* eslint-disable-next-line max-len */
                assert_1.default.strictEqual(event.comment, 'GETTY IMAGES__QEVL1GRND130_UNDERGROUND_EL CHAPO TUNNELS_INTERIOR OF ALCATRAZ PRISON. ROW OF CELLS, CLOSE-UP OF CELL DOOR BARS, INSIDE OF JAIL CELL_180563302');
            });
            it('Should accurately set source frameRates when encountering "FCM: XXX" in 29.97/30', async function () {
                const edl = new EditDecisionList_js_1.default(29.97);
                await edl.readFile('./test/edl_files/070816_EG101_HEISTS_ROUGH_CUT_SOURCES_PART 1.edl');
                const nonDropEvent = edl.events[1];
                const dropFramEvent = edl.events[2];
                assert_1.default.strictEqual(nonDropEvent.sourceStart.toString(), '06:00:02:01');
                assert_1.default.strictEqual(dropFramEvent.sourceStart.toString(), '01:31:42;26');
            });
            it('Should ignore "FCM: XXX" when frame rate is 24', async function () {
                const edl = new EditDecisionList_js_1.default(24);
                await edl.readFile('./test/edl_files/pull001_201109_exr.edl');
                assert_1.default.strictEqual(edl.events[0].sourceStart.toString(), '08:12:57:14');
                assert_1.default.strictEqual(edl.events[1].sourceStart.toString(), '10:01:05:16');
                assert_1.default.strictEqual(edl.events[2].sourceStart.toString(), '10:37:07:02');
            });
            it('toObject() should return an object', async function () {
                const edl = new EditDecisionList_js_1.default(29.97);
                await edl.readFile('./test/edl_files/cmx3600.edl');
                const json = edl.toObject();
                assert_1.default.strictEqual(typeof json, 'object');
                assert_1.default.strictEqual(json.type, 'cmx3600');
                assert_1.default.strictEqual(json.frameRate, 29.97);
                assert_1.default.strictEqual(Array.isArray(json.events), true);
            });
            it('filterDuplicateMultitrack() should filter out duplicate sources', async function () {
                const edl = new EditDecisionList_js_1.default(29.97);
                await edl.readFile('./test/edl_files/12_16 TL01 MUSIC.edl');
                const filtered = edl.filterDuplicateMultitrack();
                assert_1.default.strictEqual(filtered.events.length, 296);
            });
        });
        describe('readFile', function () {
            it('Should find 9 events in test file "cmx3600.edl"', async function () {
                const edl = new EditDecisionList_js_1.default(29.97);
                await edl.readFile('./test/edl_files/cmx3600.edl');
                assert_1.default.strictEqual(edl.events.length, 9);
            });
            it('Should find 588 events in test file "12_16 TL01 MUSIC.edl"', async function () {
                const edl = new EditDecisionList_js_1.default(29.97);
                await edl.readFile('./test/edl_files/12_16 TL01 MUSIC.edl');
                assert_1.default.strictEqual(edl.events.length, 588);
            });
        });
        describe('fromString', function () {
            it('Should find 9 events in text string from "cmx3600.edl"', async function () {
                const edl = new EditDecisionList_js_1.default(29.97);
                /* eslint-disable-next-line max-len */
                const edlstring = 'TITLE:   EDL Test SEQ \nFCM: DROP FRAME\n001  ACC112   V     C        01:49:40:01 01:49:46:18 01:00:00:00 01:00:06:17 \n* FROM CLIP NAME:  ACC112 WARBIRDS.NEW.01 \n* SOURCE FILE: ACC112 WARBIRDS\n002  IMG_6348 V     C        00:00:15:26 00:00:17:05 01:00:06:17 01:00:07:26 \n* FROM CLIP NAME:  IMG_6348.NEW.01 \n* SOURCE FILE: IMG_6348\n003  BOONE_SM V     C        01:01:43:05 01:01:57:00 01:00:07:26 01:00:21:21 \n* FROM CLIP NAME:  BOONE SMITH ON CAMERA HOST_-720P.NEW.01 \n* SOURCE FILE: BOONE SMITH ON CAMERA HOST_-720P\n004  BOONE_SM V     C        01:02:21:28 01:02:22:28 01:00:21:21 01:00:22:21 \n* FROM CLIP NAME:  BOONE SMITH ON CAMERA HOST_-720P.NEW.01 \n* TO CLIP NAME:  BOONE SMITH ON CAMERA HOST_-720P.NEW.01 \n* SOURCE FILE: BOONE SMITH ON CAMERA HOST_-720P\n005  BOONE_SM V     C        01:02:22:28 01:02:26:17 01:00:22:21 01:00:26:10 \n* FROM CLIP NAME:  BOONE SMITH ON CAMERA HOST_-720P.NEW.01 \n* SOURCE FILE: BOONE SMITH ON CAMERA HOST_-720P\n006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 \nM2   AQ100          059.6                00:02:18:05 \n* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. \n* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 \n* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING\n007  BR240    V     C        09:18:30:13 09:18:38:13 01:00:31:13 01:00:39:12 \nM2   BR240          024.0                09:18:30:13 \n* FROM CLIP NAME:  00004.NEW.01 \n* SOURCE FILE: 00004\n008  ACC112   V     C        01:50:58:03 01:51:00:27 01:00:38:14 01:00:41:06 \n* FROM CLIP NAME:  ACC112 WARBIRDS.NEW.01 \n* SOURCE FILE: ACC112 WARBIRDS\n009  KIRA_PAS V     C        01:01:25:14 01:01:32:07 01:00:40:25 01:00:47:15 \nM2   KIRA_PAS       024.0                01:01:25:14 \n* FROM CLIP NAME:  KIRA PASTA.NEW.01 \n* SOURCE FILE: KIRA PASTA';
                await edl.read(edlstring);
                assert_1.default.strictEqual(edl.events.length, 9);
            });
        });
        describe('fromBuffer', function () {
            it('should read from a buffer', async function () {
                const buf = fs.readFileSync('./test/edl_files/12_16 TL01 MUSIC.edl');
                const edl = new EditDecisionList_js_1.default(29.97);
                await edl.read(buf);
                assert_1.default.strictEqual(edl.events.length, 588);
            });
        });
    });
});
