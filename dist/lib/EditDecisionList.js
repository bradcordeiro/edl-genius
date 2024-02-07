"use strict";
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
var fs_1 = require("fs");
var readline_1 = require("readline");
var stream_1 = require("stream");
var Event_js_1 = __importDefault(require("./Event.js"));
var CMX3600Parser_js_1 = __importDefault(require("./CMX3600Parser.js"));
function getBasicStream(contents) {
    if (Array.isArray(contents)) {
        return new stream_1.Readable({
            read: function () {
                var _this = this;
                contents.forEach(function (line) { return _this.push(line); });
            },
        });
    }
    return new stream_1.Readable({
        read: function () {
            this.push(contents);
        },
    });
}
var EditDecisionList = (function () {
    function EditDecisionList(frameRate, type) {
        if (frameRate === void 0) { frameRate = 29.97; }
        if (type === void 0) { type = 'cmx3600'; }
        this.frameRate = frameRate;
        this.type = type;
        this.events = [];
    }
    EditDecisionList.prototype.getParser = function () {
        switch (this.type) {
            case 'cmx3600':
            default:
                return new CMX3600Parser_js_1.default(this.frameRate);
        }
    };
    EditDecisionList.prototype.readStream = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var parser, rl;
            var _this = this;
            return __generator(this, function (_a) {
                parser = this.getParser();
                parser.on('data', function (data) {
                    var event = new Event_js_1.default(data, data.sourceFrameRate, data.recordFrameRate);
                    _this.events.push(event);
                });
                rl = (0, readline_1.createInterface)({
                    input: input,
                    crlfDelay: Infinity,
                    terminal: false,
                    historySize: 0,
                });
                return [2, new Promise(function (resolve, reject) {
                        rl
                            .on('line', function (line) { return parser.write(line); })
                            .on('error', function (error) { return reject(error); })
                            .on('close', function () { return parser.end(); });
                        parser
                            .on('error', function (error) { return reject(error); })
                            .on('end', function () { return resolve(_this); });
                    })];
            });
        });
    };
    EditDecisionList.prototype.readBuffer = function (buf, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return __awaiter(this, void 0, void 0, function () {
            var stream;
            return __generator(this, function (_a) {
                stream = getBasicStream();
                stream.push(buf, encoding);
                stream.push(null);
                return [2, this.readStream(stream)];
            });
        });
    };
    EditDecisionList.prototype.readString = function (str) {
        return __awaiter(this, void 0, void 0, function () {
            var buf;
            return __generator(this, function (_a) {
                buf = Buffer.from(str);
                return [2, this.readBuffer(buf)];
            });
        });
    };
    EditDecisionList.prototype.fromObject = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.frameRate = obj.frameRate;
                this.type = obj.type;
                this.events = obj.events.map((function (e) { return new Event_js_1.default(e); }));
                return [2, this];
            });
        });
    };
    EditDecisionList.prototype.read = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (input instanceof stream_1.Readable)
                    return [2, this.readStream(input)];
                if (input instanceof Buffer)
                    return [2, this.readBuffer(input)];
                if (typeof input === 'string')
                    return [2, this.readString(input)];
                return [2, this.fromObject(input)];
            });
        });
    };
    EditDecisionList.prototype.readFile = function (inputFile) {
        return __awaiter(this, void 0, void 0, function () {
            var input;
            return __generator(this, function (_a) {
                input = (0, fs_1.createReadStream)(inputFile);
                return [2, this.readStream(input)];
            });
        });
    };
    EditDecisionList.prototype.toObject = function () {
        return {
            frameRate: this.frameRate,
            type: this.type,
            events: this.events.map(function (event) { return event.toObject(); }),
        };
    };
    EditDecisionList.prototype.filterDuplicateMultitrack = function () {
        var _this = this;
        var filtered = new EditDecisionList(this.frameRate);
        filtered.events = this.events.filter(function (event, index) {
            if (index === 0)
                return true;
            if (event.reel === _this.events[index - 1].reel
                && event.trackType === _this.events[index - 1].trackType
                && event.sourceClip === _this.events[index - 1].sourceClip
                && event.sourceFile === _this.events[index - 1].sourceFile
                && event.sourceStart.toString() === _this.events[index - 1].sourceStart.toString()
                && event.sourceEnd.toString() === _this.events[index - 1].sourceEnd.toString()
                && event.recordStart.toString() === _this.events[index - 1].recordStart.toString()
                && event.recordEnd.toString() === _this.events[index - 1].recordEnd.toString())
                return false;
            return true;
        });
        return filtered;
    };
    return EditDecisionList;
}());
exports.default = EditDecisionList;
