"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestedFirebaseEntity = exports.FirebaseEntity = exports.UpdateDateColumn = exports.CreateDateColumn = exports.ManyToOne = exports.OneToOne = exports.OneToMany = exports.Column = exports.PrimaryColumn = exports.findMeta = exports._UpdateDateColumnSetting = exports._CreateDateColumnSetting = exports._ManyToOneSetting = exports._OneToOneSetting = exports._OneToManySetting = exports._ColumnSetting = exports._PrimaryColumnSetting = void 0;
var _PrimaryColumnSetting = /** @class */ (function () {
    function _PrimaryColumnSetting(propertyKey) {
        this.propertyKey = propertyKey;
    }
    return _PrimaryColumnSetting;
}());
exports._PrimaryColumnSetting = _PrimaryColumnSetting;
var _ColumnSetting = /** @class */ (function () {
    function _ColumnSetting(propertyKey, option) {
        this.propertyKey = propertyKey;
        this.option = option;
    }
    return _ColumnSetting;
}());
exports._ColumnSetting = _ColumnSetting;
var _OneToManySetting = /** @class */ (function () {
    function _OneToManySetting(propertyKey, getEntity, option) {
        this.propertyKey = propertyKey;
        this.getEntity = getEntity;
        this.option = option;
    }
    return _OneToManySetting;
}());
exports._OneToManySetting = _OneToManySetting;
var _OneToOneSetting = /** @class */ (function () {
    function _OneToOneSetting(propertyKey, getEntity, option) {
        this.propertyKey = propertyKey;
        this.getEntity = getEntity;
        this.option = option;
    }
    return _OneToOneSetting;
}());
exports._OneToOneSetting = _OneToOneSetting;
var _ManyToOneSetting = /** @class */ (function () {
    function _ManyToOneSetting(propertyKey, getEntity, option) {
        this.propertyKey = propertyKey;
        this.getEntity = getEntity;
        this.option = option;
    }
    return _ManyToOneSetting;
}());
exports._ManyToOneSetting = _ManyToOneSetting;
var _CreateDateColumnSetting = /** @class */ (function () {
    function _CreateDateColumnSetting(propertyKey) {
        this.propertyKey = propertyKey;
    }
    return _CreateDateColumnSetting;
}());
exports._CreateDateColumnSetting = _CreateDateColumnSetting;
var _UpdateDateColumnSetting = /** @class */ (function () {
    function _UpdateDateColumnSetting(propertyKey) {
        this.propertyKey = propertyKey;
    }
    return _UpdateDateColumnSetting;
}());
exports._UpdateDateColumnSetting = _UpdateDateColumnSetting;
var entityMetaInfo = [];
var columnSettings = [];
var entityMetaData = {};
function findMeta(Entity) {
    if (entityMetaData[Entity.name]) {
        return entityMetaData[Entity.name];
    }
    var tableInfo = entityMetaInfo.filter(function (x) { return x.Entity == Entity; })[0];
    var setting = columnSettings.map(function (x) {
        return {
            column: x.column,
            Entity: x.getEntity()
        };
    }).filter(function (x) { return x.Entity == Entity; });
    entityMetaData[Entity.name] = __assign(__assign({}, tableInfo), { columns: setting.map(function (x) { return x.column; }) });
    return entityMetaData[Entity.name];
}
exports.findMeta = findMeta;
function addColumnSettings(getEntity, setting) {
    columnSettings.push({
        getEntity: getEntity,
        column: setting
    });
}
function PrimaryColumn() {
    return function (target, propertyKey) {
        addColumnSettings(function () { return target.constructor; }, new _PrimaryColumnSetting(propertyKey));
    };
}
exports.PrimaryColumn = PrimaryColumn;
function Column(options) {
    return function (target, propertyKey) {
        addColumnSettings(function () { return target.constructor; }, new _ColumnSetting(propertyKey, options));
    };
}
exports.Column = Column;
function OneToMany(getEntity, options) {
    return function (target, propertyKey) {
        addColumnSettings(function () { return target.constructor; }, new _OneToManySetting(propertyKey, getEntity, options));
    };
}
exports.OneToMany = OneToMany;
function OneToOne(getEntity, options) {
    return function (target, propertyKey) {
        addColumnSettings(function () { return target.constructor; }, new _OneToOneSetting(propertyKey, getEntity, options));
    };
}
exports.OneToOne = OneToOne;
function ManyToOne(getEntity, options) {
    return function (target, propertyKey) {
        addColumnSettings(function () { return target.constructor; }, new _ManyToOneSetting(propertyKey, getEntity, options));
    };
}
exports.ManyToOne = ManyToOne;
function CreateDateColumn(options) {
    return function (target, propertyKey) {
        addColumnSettings(function () { return target.constructor; }, new _CreateDateColumnSetting(propertyKey));
    };
}
exports.CreateDateColumn = CreateDateColumn;
function UpdateDateColumn(options) {
    return function (target, propertyKey) {
        addColumnSettings(function () { return target.constructor; }, new _UpdateDateColumnSetting(propertyKey));
    };
}
exports.UpdateDateColumn = UpdateDateColumn;
function FirebaseEntity(tableName) {
    return function (constructor) {
        entityMetaInfo.push({
            tableName: tableName,
            Entity: constructor
        });
    };
}
exports.FirebaseEntity = FirebaseEntity;
function NestedFirebaseEntity(parentEntityGetter, tableName) {
    return function (constructor) {
        entityMetaInfo.push({
            tableName: tableName,
            Entity: constructor,
            parentEntityGetter: parentEntityGetter
        });
    };
}
exports.NestedFirebaseEntity = NestedFirebaseEntity;
//# sourceMappingURL=Entity.js.map