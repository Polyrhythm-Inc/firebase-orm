"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordNotFoundError = void 0;
var RecordNotFoundError = /** @class */ (function (_super) {
    __extends(RecordNotFoundError, _super);
    function RecordNotFoundError(Entity) {
        var _this = _super.call(this, Entity.name + " was not found.") || this;
        _this.Entity = Entity;
        _this.name = 'RecordNotFoundError';
        Object.setPrototypeOf(_this, RecordNotFoundError.prototype);
        return _this;
    }
    RecordNotFoundError.prototype.toString = function () {
        return this.name + ': ' + this.message;
    };
    return RecordNotFoundError;
}(Error));
exports.RecordNotFoundError = RecordNotFoundError;
//# sourceMappingURL=Error.js.map