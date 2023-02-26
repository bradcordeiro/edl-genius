var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "readline", "stream", "./Event.js", "./CMX3600Parser.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs_1 = require("fs");
    const readline_1 = require("readline");
    const stream_1 = require("stream");
    const Event_js_1 = __importDefault(require("./Event.js"));
    const CMX3600Parser_js_1 = __importDefault(require("./CMX3600Parser.js"));
    function getBasicStream(contents) {
        if (Array.isArray(contents)) {
            return new stream_1.Readable({
                read() {
                    contents.forEach((line) => this.push(line));
                },
            });
        }
        return new stream_1.Readable({
            read() {
                this.push(contents);
            },
        });
    }
    class EditDecisionList {
        constructor(frameRate = 29.97, type = 'cmx3600') {
            this.frameRate = frameRate;
            this.type = type;
            this.events = [];
        }
        getParser() {
            switch (this.type) {
                case 'cmx3600':
                default:
                    return new CMX3600Parser_js_1.default(this.frameRate);
            }
        }
        async readStream(input) {
            const parser = this.getParser();
            parser.on('data', (data) => {
                const event = new Event_js_1.default(data, data.sourceFrameRate, data.recordFrameRate);
                this.events.push(event);
            });
            const rl = (0, readline_1.createInterface)({
                input,
                crlfDelay: Infinity,
                terminal: false,
                historySize: 0,
            });
            return new Promise((resolve, reject) => {
                rl
                    .on('line', (line) => parser.write(line))
                    .on('error', (error) => reject(error))
                    .on('close', () => parser.end());
                parser
                    .on('error', (error) => reject(error))
                    .on('end', () => resolve(this));
            });
        }
        async readBuffer(buf, encoding = 'utf8') {
            const stream = getBasicStream();
            stream.push(buf, encoding);
            stream.push(null);
            return this.readStream(stream);
        }
        async readString(str) {
            const buf = Buffer.from(str);
            return this.readBuffer(buf);
        }
        async fromObject(obj) {
            this.frameRate = obj.frameRate;
            this.type = obj.type;
            this.events = obj.events.map(((e) => new Event_js_1.default(e)));
            return this;
        }
        async read(input) {
            if (input instanceof stream_1.Readable)
                return this.readStream(input);
            if (input instanceof Buffer)
                return this.readBuffer(input);
            if (typeof input === 'string')
                return this.readString(input);
            return this.fromObject(input);
        }
        async readFile(inputFile) {
            const input = (0, fs_1.createReadStream)(inputFile);
            return this.readStream(input);
        }
        toObject() {
            return {
                frameRate: this.frameRate,
                type: this.type,
                events: this.events.map((event) => event.toObject()),
            };
        }
        filterDuplicateMultitrack() {
            const filtered = new EditDecisionList(this.frameRate);
            filtered.events = this.events.filter((event, index) => {
                if (index === 0)
                    return true;
                if (event.reel === this.events[index - 1].reel
                    && event.trackType === this.events[index - 1].trackType
                    && event.sourceClip === this.events[index - 1].sourceClip
                    && event.sourceFile === this.events[index - 1].sourceFile
                    && event.sourceStart.toString() === this.events[index - 1].sourceStart.toString()
                    && event.sourceEnd.toString() === this.events[index - 1].sourceEnd.toString()
                    && event.recordStart.toString() === this.events[index - 1].recordStart.toString()
                    && event.recordEnd.toString() === this.events[index - 1].recordEnd.toString())
                    return false;
                return true;
            });
            return filtered;
        }
    }
    exports.default = EditDecisionList;
});
