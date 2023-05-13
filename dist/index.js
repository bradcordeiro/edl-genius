var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./lib/EditDecisionList", "./lib/Event", "./lib/MotionEffect"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MotionEffect = exports.Event = void 0;
    const EditDecisionList_1 = __importDefault(require("./lib/EditDecisionList"));
    const Event_1 = __importDefault(require("./lib/Event"));
    exports.Event = Event_1.default;
    const MotionEffect_1 = __importDefault(require("./lib/MotionEffect"));
    exports.MotionEffect = MotionEffect_1.default;
    exports.default = EditDecisionList_1.default;
});
