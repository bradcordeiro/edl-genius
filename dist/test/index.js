(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./EditDecisionList.test.js", "./MotionEffect.test.js", "./Event.test.js", "./CMX3600Parser.test.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("./EditDecisionList.test.js");
    require("./MotionEffect.test.js");
    require("./Event.test.js");
    require("./CMX3600Parser.test.js");
});
