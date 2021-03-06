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
exports.FirebaseEntityDeserializer = exports.FirebaseEntitySerializer = exports.referenceCluePath = void 0;
var Entity_1 = require("./Entity");
var EntityBuilder_1 = require("./EntityBuilder");
var Repository_1 = require("./Repository");
exports.referenceCluePath = "__reference_clue__";
function makeClue(obj, parentIdMapper) {
    var meta = Entity_1.findMeta(obj.constructor);
    var parentInfo = null;
    if (meta.parentEntityGetters && parentIdMapper) {
        for (var _i = 0, _a = meta.parentEntityGetters; _i < _a.length; _i++) {
            var getter = _a[_i];
            var Entity = getter();
            var meta_1 = Entity_1.findMeta(Entity);
            if (parentInfo) {
                parentInfo.child = {
                    collection: meta_1.tableName,
                    id: parentIdMapper(Entity)
                };
            }
            else {
                parentInfo = {
                    collection: meta_1.tableName,
                    id: parentIdMapper(Entity)
                };
            }
        }
    }
    return {
        collection: meta.tableName,
        id: obj.id,
        parent: parentInfo || null
    };
}
function hasOwnProperty(obj, prop) {
    return obj.hasOwnProperty(prop);
}
var FirebaseEntitySerializer = /** @class */ (function () {
    function FirebaseEntitySerializer() {
    }
    FirebaseEntitySerializer.serializeToJSON = function (object, parentIdMapper, options) {
        var _a;
        var meta = Entity_1.findMeta(object.constructor);
        if (!meta) {
            throw new Error('object is not an Entity.');
        }
        if (meta.parentEntityGetters && !parentIdMapper) {
            throw new Error(meta.tableName + " is nested collection. So parentId have to be provided.");
        }
        var columns = meta.columns.map(function (x) { return x.propertyKey; });
        var serialized = {};
        for (var key in object) {
            if (!columns.includes(key)) {
                continue;
            }
            var item = object[key];
            if (!item) {
                continue;
            }
            if (Array.isArray(item)) {
                serialized[key] = item.map(function (x) {
                    var _a;
                    var ref = Repository_1._getDocumentReference(x);
                    if (ref) {
                        return __assign(__assign({}, FirebaseEntitySerializer.serializeToJSON(x)), (_a = {}, _a[exports.referenceCluePath] = makeClue(x, object.id), _a));
                    }
                    else {
                        return x;
                    }
                });
            }
            else {
                var ref = Repository_1._getDocumentReference(item);
                if (ref) {
                    serialized[key] = __assign(__assign({}, FirebaseEntitySerializer.serializeToJSON(item)), (_a = {}, _a[exports.referenceCluePath] = makeClue(item, object.id), _a));
                }
                else {
                    if ((options === null || options === void 0 ? void 0 : options.timeStampToString) && item.toDate) {
                        serialized[key] = item.toDate().toString();
                    }
                    else {
                        serialized[key] = item;
                    }
                }
            }
        }
        serialized[exports.referenceCluePath] = makeClue(object, parentIdMapper);
        return serialized;
    };
    FirebaseEntitySerializer.serializeToJSONString = function (object, parentIdMapper) {
        var json = this.serializeToJSON(object, parentIdMapper);
        return JSON.stringify(json);
    };
    return FirebaseEntitySerializer;
}());
exports.FirebaseEntitySerializer = FirebaseEntitySerializer;
var FirebaseEntityDeserializer = /** @class */ (function () {
    function FirebaseEntityDeserializer() {
    }
    FirebaseEntityDeserializer.deserializeFromJSON = function (Entity, object, parentIdMapper, options) {
        var meta = Entity_1.findMeta(Entity);
        if (!meta) {
            throw new Error('object is not an Entity.');
        }
        var instance = new Entity();
        if (meta.parentEntityGetters) {
            if (!parentIdMapper) {
                throw new Error(meta.tableName + " is nested collection. So parentId have to be provided.");
            }
            var reference = Repository_1.makeNestedCollectionReference(meta, parentIdMapper).doc(object.id);
            instance[EntityBuilder_1.documentReferencePath] = reference;
        }
        else {
            var reference = Repository_1.getCurrentDB().collection(meta.tableName).doc(object.id);
            instance[EntityBuilder_1.documentReferencePath] = reference;
        }
        var _loop_1 = function (key) {
            var item = object[key];
            if (!item) {
                return "continue";
            }
            if (item[exports.referenceCluePath]) {
                instance[key] = plainToClass(item, parentIdMapper);
            }
            else if (Array.isArray(item)) {
                instance[key] = item.map(function (x) { return plainToClass(x, parentIdMapper); });
            }
            else {
                if (key == exports.referenceCluePath) {
                    return "continue";
                }
                var index = meta.columns.findIndex(function (x) { return x.propertyKey === key; });
                var column = meta.columns[index];
                if ((options === null || options === void 0 ? void 0 : options.stringToTimeStamp) && column instanceof Entity_1._ColumnSetting && column.columnType && column.columnType.now) {
                    var date = new Date(item);
                    instance[key] = new column.columnType(Math.floor(date.getTime() / 1000), date.getMilliseconds());
                }
                else {
                    instance[key] = item;
                }
            }
        };
        for (var key in object) {
            _loop_1(key);
        }
        return instance;
    };
    FirebaseEntityDeserializer.deserializeFromJSONString = function (Entity, str, parentIdMapper) {
        return this.deserializeFromJSON(Entity, JSON.parse(str), parentIdMapper);
    };
    return FirebaseEntityDeserializer;
}());
exports.FirebaseEntityDeserializer = FirebaseEntityDeserializer;
function plainToClass(item, parentIdMapper) {
    var clue = item[exports.referenceCluePath];
    var meta = Entity_1.findMetaFromTableName(clue.collection);
    if (!meta) {
        throw new Error("Cloud not find a collection: " + clue.collection);
    }
    var child = new meta.Entity();
    for (var key in item) {
        if (key == exports.referenceCluePath) {
            continue;
        }
        if (item[key][exports.referenceCluePath]) {
            child[key] = FirebaseEntityDeserializer.deserializeFromJSON(meta.Entity, item[key], parentIdMapper);
        }
        else {
            child[key] = item[key];
        }
    }
    var reference;
    if (meta.parentEntityGetters) {
        if (!parentIdMapper) {
            throw new Error(meta.tableName + " is nested collection. So parentId have to be provided.");
        }
        reference = Repository_1.makeNestedCollectionReference(meta, parentIdMapper).doc(clue.id);
    }
    else {
        reference = Repository_1.getCurrentDB().collection(meta.tableName).doc(clue.id);
    }
    child[EntityBuilder_1.documentReferencePath] = reference;
    return child;
}
//# sourceMappingURL=Serializer.js.map