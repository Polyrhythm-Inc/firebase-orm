"use strict";
/// <reference path="firebase.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var firebase;
if (process.env.BUILD_MODE == "client") {
    firebase = require('firebase');
}
else {
    firebase = require('firebase-admin');
}
exports.default = firebase;
//# sourceMappingURL=firebase.js.map