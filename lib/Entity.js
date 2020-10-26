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
exports.NestedFirebaseEntity = exports.FirebaseEntity = exports.AfterLoad = exports.AfterSave = exports.BeforeSave = exports.UpdateDateColumn = exports.CreateDateColumn = exports.ArrayReference = exports.ManyToOne = exports.OneToOne = exports.OneToMany = exports.Column = exports.PrimaryColumn = exports.findMetaFromTableName = exports.findMeta = exports.callHook = exports._HookFunction = exports._UpdateDateColumnSetting = exports._CreateDateColumnSetting = exports._ArrayReference = exports._ManyToOneSetting = exports._OneToOneSetting = exports._OneToManySetting = exports._ColumnSetting = exports._PrimaryColumnSetting = void 0;
require("reflect-metadata");
var _PrimaryColumnSetting = /** @class */ (function () {
    function _PrimaryColumnSetting(propertyKey) {
        this.propertyKey = propertyKey;
    }
    return _PrimaryColumnSetting;
}());
exports._PrimaryColumnSetting = _PrimaryColumnSetting;
var _ColumnSetting = /** @class */ (function () {
    function _ColumnSetting(propertyKey, columnType, option) {
        this.propertyKey = propertyKey;
        this.columnType = columnType;
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
var _ArrayReference = /** @class */ (function () {
    function _ArrayReference(propertyKey, getEntity, option) {
        this.propertyKey = propertyKey;
        this.getEntity = getEntity;
        this.option = option;
    }
    return _ArrayReference;
}());
exports._ArrayReference = _ArrayReference;
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
var _HookFunction = /** @class */ (function () {
    function _HookFunction(timing, functionName) {
        this.timing = timing;
        this.functionName = functionName;
    }
    return _HookFunction;
}());
exports._HookFunction = _HookFunction;
var hookSettings = [];
function addHooks(getEntity, hook) {
    hookSettings.push({ getEntity: getEntity, hook: hook });
}
function callHook(meta, resource, timing) {
    if (!meta.hooks) {
        return;
    }
    for (var _i = 0, _a = meta.hooks; _i < _a.length; _i++) {
        var hook = _a[_i];
        if (hook.timing === timing) {
            if (resource[hook.functionName]) {
                resource[hook.functionName]();
            }
            break;
        }
    }
}
exports.callHook = callHook;
var entityMetaInfo = [];
var columnSettings = [];
var entityMetaData = {};
var SYMBOL_KEY = Symbol('__firebase_orm_symbol__');
var ENTITY_META_DATA_PROP_KEY = "entityMetaData";
// having side effects getter
function findMeta(Entity) {
    var meta = Reflect.getMetadata(SYMBOL_KEY, Entity.prototype, ENTITY_META_DATA_PROP_KEY);
    if (meta) {
        return meta;
    }
    var tableInfo = entityMetaInfo.filter(function (x) { return x.Entity == Entity; })[0];
    var setting = columnSettings.map(function (x) {
        return {
            column: x.column,
            Entity: x.getEntity()
        };
    }).filter(function (x) { return x.Entity == Entity; });
    var hooks = hookSettings.filter(function (x) { return x.getEntity() == Entity; }).map(function (x) { return x.hook; });
    var metaData = __assign(__assign({}, tableInfo), { columns: setting.map(function (x) { return x.column; }), hooks: hooks });
    Reflect.defineMetadata(SYMBOL_KEY, metaData, Entity.prototype, ENTITY_META_DATA_PROP_KEY);
    return metaData;
}
exports.findMeta = findMeta;
function findMetaFromTableName(tableName) {
    var index = entityMetaInfo.findIndex(function (x) { return x.tableName == tableName; });
    if (index == -1) {
        return null;
    }
    var info = entityMetaInfo[index];
    var meta = Reflect.getMetadata(SYMBOL_KEY, info.Entity.prototype, ENTITY_META_DATA_PROP_KEY);
    return meta;
}
exports.findMetaFromTableName = findMetaFromTableName;
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
        var ColumnType = Reflect.getMetadata("design:type", target, propertyKey);
        addColumnSettings(function () { return target.constructor; }, new _ColumnSetting(propertyKey, ColumnType, options));
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
function ArrayReference(getEntity, options) {
    return function (target, propertyKey) {
        addColumnSettings(function () { return target.constructor; }, new _ArrayReference(propertyKey, getEntity, options));
    };
}
exports.ArrayReference = ArrayReference;
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
function BeforeSave(options) {
    return function (target, propertyKey) {
        addHooks(function () { return target.constructor; }, new _HookFunction('beforeSave', propertyKey));
    };
}
exports.BeforeSave = BeforeSave;
function AfterSave(options) {
    return function (target, propertyKey) {
        addHooks(function () { return target.constructor; }, new _HookFunction('afterSave', propertyKey));
    };
}
exports.AfterSave = AfterSave;
function AfterLoad(options) {
    return function (target, propertyKey) {
        addHooks(function () { return target.constructor; }, new _HookFunction('afterLoad', propertyKey));
    };
}
exports.AfterLoad = AfterLoad;
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