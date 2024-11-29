"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var assert_1 = __importDefault(require("assert"));
var EditDecisionList_js_1 = __importDefault(require("../lib/EditDecisionList.js"));
describe('EditDecisionList Class', function () {
    describe('Constructor', function () {
        it('Should use a default frame rate of 29.97 if constructed with no arguments', function () {
            var edl = new EditDecisionList_js_1.default();
            assert_1.default.strictEqual(edl.frameRate, 29.97);
        });
        it('Should accept a frameRate as first argument', function () {
            var edl = new EditDecisionList_js_1.default(59.94);
            assert_1.default.strictEqual(edl.frameRate, 59.94);
        });
        it('Should set the recordStart and recordEnd framerates to this.frameRate', function () {
            return __awaiter(this, void 0, void 0, function () {
                var edl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            edl = new EditDecisionList_js_1.default(23.98);
                            return [4, edl.readFile('./test/edl_files/070816_EG101_HEISTS_ROUGH_CUT_SOURCES_PART 1.edl')];
                        case 1:
                            _a.sent();
                            edl.events.forEach(function (event) {
                                assert_1.default.strictEqual(event.recordStart.frameRate, 23.98);
                                assert_1.default.strictEqual(event.recordEnd.frameRate, 23.98);
                            });
                            return [2];
                    }
                });
            });
        });
    });
    describe('read', function () {
        it('Should store events where each Event number is its index+1', function () {
            return __awaiter(this, void 0, void 0, function () {
                var edl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            edl = new EditDecisionList_js_1.default(29.97);
                            return [4, edl.readFile('./test/edl_files/cmx3600.edl')];
                        case 1:
                            _a.sent();
                            edl.events.forEach(function (event, index) {
                                assert_1.default.strictEqual(index + 1, event.number);
                            });
                            return [2];
                    }
                });
            });
        });
        it('Should correctly construct Events with comments and motion effects', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var edl, event;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            edl = new EditDecisionList_js_1.default(29.97);
                            return [4, edl.readFile('./test/edl_files/070816_EG101_HEISTS_ROUGH_CUT_SOURCES_PART 1.edl')];
                        case 1:
                            _b.sent();
                            event = edl.events[3];
                            assert_1.default.strictEqual(event.number, 4);
                            assert_1.default.strictEqual(event.reel, 'QEVL1GRN');
                            assert_1.default.strictEqual(event.trackType, 'V');
                            assert_1.default.strictEqual(event.trackNumber, undefined);
                            assert_1.default.strictEqual(event.sourceStart.toString(), '01:31:44;03');
                            assert_1.default.strictEqual(event.sourceEnd.toString(), '01:31:44;12');
                            assert_1.default.strictEqual(event.recordStart.toString(), '01:00:02;24');
                            assert_1.default.strictEqual(event.recordEnd.toString(), '01:00:03;01');
                            assert_1.default.deepStrictEqual((_a = event.motionEffect) === null || _a === void 0 ? void 0 : _a.toObject(), {
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
                            assert_1.default.strictEqual(event.comment, 'GETTY IMAGES__QEVL1GRND130_UNDERGROUND_EL CHAPO TUNNELS_INTERIOR OF ALCATRAZ PRISON. ROW OF CELLS, CLOSE-UP OF CELL DOOR BARS, INSIDE OF JAIL CELL_180563302');
                            return [2];
                    }
                });
            });
        });
        it('Should accurately set source frameRates when encountering "FCM: XXX" in 29.97/30', function () {
            return __awaiter(this, void 0, void 0, function () {
                var edl, nonDropEvent, dropFramEvent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            edl = new EditDecisionList_js_1.default(29.97);
                            return [4, edl.readFile('./test/edl_files/070816_EG101_HEISTS_ROUGH_CUT_SOURCES_PART 1.edl')];
                        case 1:
                            _a.sent();
                            nonDropEvent = edl.events[1];
                            dropFramEvent = edl.events[2];
                            assert_1.default.strictEqual(nonDropEvent.sourceStart.toString(), '06:00:02:01');
                            assert_1.default.strictEqual(dropFramEvent.sourceStart.toString(), '01:31:42;26');
                            return [2];
                    }
                });
            });
        });
        it('Should ignore "FCM: XXX" when frame rate is 24', function () {
            return __awaiter(this, void 0, void 0, function () {
                var edl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            edl = new EditDecisionList_js_1.default(24);
                            return [4, edl.readFile('./test/edl_files/pull001_201109_exr.edl')];
                        case 1:
                            _a.sent();
                            assert_1.default.strictEqual(edl.events[0].sourceStart.toString(), '08:12:57:14');
                            assert_1.default.strictEqual(edl.events[1].sourceStart.toString(), '10:01:05:16');
                            assert_1.default.strictEqual(edl.events[2].sourceStart.toString(), '10:37:07:02');
                            return [2];
                    }
                });
            });
        });
        it('toObject() should return an object', function () {
            return __awaiter(this, void 0, void 0, function () {
                var edl, json;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            edl = new EditDecisionList_js_1.default(29.97);
                            return [4, edl.readFile('./test/edl_files/cmx3600.edl')];
                        case 1:
                            _a.sent();
                            json = edl.toObject();
                            assert_1.default.strictEqual(typeof json, 'object');
                            assert_1.default.strictEqual(json.type, 'cmx3600');
                            assert_1.default.strictEqual(json.frameRate, 29.97);
                            assert_1.default.strictEqual(Array.isArray(json.events), true);
                            return [2];
                    }
                });
            });
        });
        it('filterDuplicateMultitrack() should filter out duplicate sources', function () {
            return __awaiter(this, void 0, void 0, function () {
                var edl, filtered;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            edl = new EditDecisionList_js_1.default(29.97);
                            return [4, edl.readFile('./test/edl_files/12_16 TL01 MUSIC.edl')];
                        case 1:
                            _a.sent();
                            filtered = edl.filterDuplicateMultitrack();
                            assert_1.default.strictEqual(filtered.events.length, 296);
                            return [2];
                    }
                });
            });
        });
    });
    describe('readFile', function () {
        it('Should find 9 events in test file "cmx3600.edl"', function () {
            return __awaiter(this, void 0, void 0, function () {
                var edl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            edl = new EditDecisionList_js_1.default(29.97);
                            return [4, edl.readFile('./test/edl_files/cmx3600.edl')];
                        case 1:
                            _a.sent();
                            assert_1.default.strictEqual(edl.events.length, 9);
                            return [2];
                    }
                });
            });
        });
        it('Should find 588 events in test file "12_16 TL01 MUSIC.edl"', function () {
            return __awaiter(this, void 0, void 0, function () {
                var edl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            edl = new EditDecisionList_js_1.default(29.97);
                            return [4, edl.readFile('./test/edl_files/12_16 TL01 MUSIC.edl')];
                        case 1:
                            _a.sent();
                            assert_1.default.strictEqual(edl.events.length, 588);
                            return [2];
                    }
                });
            });
        });
    });
    describe('fromString', function () {
        it('Should find 9 events in text string from "cmx3600.edl"', function () {
            return __awaiter(this, void 0, void 0, function () {
                var edl, edlstring;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            edl = new EditDecisionList_js_1.default(29.97);
                            edlstring = 'TITLE:   EDL Test SEQ \nFCM: DROP FRAME\n001  ACC112   V     C        01:49:40:01 01:49:46:18 01:00:00:00 01:00:06:17 \n* FROM CLIP NAME:  ACC112 WARBIRDS.NEW.01 \n* SOURCE FILE: ACC112 WARBIRDS\n002  IMG_6348 V     C        00:00:15:26 00:00:17:05 01:00:06:17 01:00:07:26 \n* FROM CLIP NAME:  IMG_6348.NEW.01 \n* SOURCE FILE: IMG_6348\n003  BOONE_SM V     C        01:01:43:05 01:01:57:00 01:00:07:26 01:00:21:21 \n* FROM CLIP NAME:  BOONE SMITH ON CAMERA HOST_-720P.NEW.01 \n* SOURCE FILE: BOONE SMITH ON CAMERA HOST_-720P\n004  BOONE_SM V     C        01:02:21:28 01:02:22:28 01:00:21:21 01:00:22:21 \n* FROM CLIP NAME:  BOONE SMITH ON CAMERA HOST_-720P.NEW.01 \n* TO CLIP NAME:  BOONE SMITH ON CAMERA HOST_-720P.NEW.01 \n* SOURCE FILE: BOONE SMITH ON CAMERA HOST_-720P\n005  BOONE_SM V     C        01:02:22:28 01:02:26:17 01:00:22:21 01:00:26:10 \n* FROM CLIP NAME:  BOONE SMITH ON CAMERA HOST_-720P.NEW.01 \n* SOURCE FILE: BOONE SMITH ON CAMERA HOST_-720P\n006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 \nM2   AQ100          059.6                00:02:18:05 \n* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. \n* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 \n* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING\n007  BR240    V     C        09:18:30:13 09:18:38:13 01:00:31:13 01:00:39:12 \nM2   BR240          024.0                09:18:30:13 \n* FROM CLIP NAME:  00004.NEW.01 \n* SOURCE FILE: 00004\n008  ACC112   V     C        01:50:58:03 01:51:00:27 01:00:38:14 01:00:41:06 \n* FROM CLIP NAME:  ACC112 WARBIRDS.NEW.01 \n* SOURCE FILE: ACC112 WARBIRDS\n009  KIRA_PAS V     C        01:01:25:14 01:01:32:07 01:00:40:25 01:00:47:15 \nM2   KIRA_PAS       024.0                01:01:25:14 \n* FROM CLIP NAME:  KIRA PASTA.NEW.01 \n* SOURCE FILE: KIRA PASTA';
                            return [4, edl.read(edlstring)];
                        case 1:
                            _a.sent();
                            assert_1.default.strictEqual(edl.events.length, 9);
                            return [2];
                    }
                });
            });
        });
    });
    describe('fromBuffer', function () {
        it('should read from a buffer', function () {
            return __awaiter(this, void 0, void 0, function () {
                var buf, edl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            buf = fs.readFileSync('./test/edl_files/12_16 TL01 MUSIC.edl');
                            edl = new EditDecisionList_js_1.default(29.97);
                            return [4, edl.read(buf)];
                        case 1:
                            _a.sent();
                            assert_1.default.strictEqual(edl.events.length, 588);
                            return [2];
                    }
                });
            });
        });
    });
});
