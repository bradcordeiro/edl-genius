var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./lib/EditDecisionList.js", "./lib/Event.js", "./lib/MotionEffect.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MotionEffect = exports.Event = void 0;
    const EditDecisionList_js_1 = __importDefault(require("./lib/EditDecisionList.js"));
    const Event_js_1 = __importDefault(require("./lib/Event.js"));
    exports.Event = Event_js_1.default;
    const MotionEffect_js_1 = __importDefault(require("./lib/MotionEffect.js"));
    exports.MotionEffect = MotionEffect_js_1.default;
    exports.default = EditDecisionList_js_1.default;
});
