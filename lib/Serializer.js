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
function makeClue(obj, parentId) {
    var meta = Entity_1.findMeta(obj.constructor);
    var parentInfo;
    if (meta.parentEntityGetter && parentId) {
        var Parent = meta.parentEntityGetter();
        var parentMeta = Entity_1.findMeta(Parent);
        parentInfo = {
            collection: parentMeta.tableName,
            id: parentId
        };
    }
    return {
        collection: meta.tableName,
        id: obj.id,
        parent: parentInfo || null
    };
}
var FirebaseEntitySerializer = /** @class */ (function () {
    function FirebaseEntitySerializer() {
    }
    FirebaseEntitySerializer.serializeToJSON = function (object, parentId) {
        var _a;
        var meta = Entity_1.findMeta(object.constructor);
        if (!meta) {
            throw new Error('object is not an Entity.');
        }
        if (meta.parentEntityGetter && !parentId) {
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
                    serialized[key] = item;
                }
            }
        }
        serialized[exports.referenceCluePath] = makeClue(object, parentId);
        return serialized;
    };
    FirebaseEntitySerializer.serializeToJSONString = function (object, parentId) {
        var json = this.serializeToJSON(object, parentId);
        return JSON.stringify(json);
    };
    return FirebaseEntitySerializer;
}());
exports.FirebaseEntitySerializer = FirebaseEntitySerializer;
var FirebaseEntityDeserializer = /** @class */ (function () {
    function FirebaseEntityDeserializer() {
    }
    FirebaseEntityDeserializer.deserializeFromJSON = function (Entity, object, parentId) {
        var meta = Entity_1.findMeta(Entity);
        if (!meta) {
            throw new Error('object is not an Entity.');
        }
        var instance = new Entity();
        if (meta.parentEntityGetter) {
            if (!parentId) {
                throw new Error(meta.tableName + " is nested collection. So parentId have to be provided.");
            }
            var parentEntity = meta.parentEntityGetter();
            var parentMeta = Entity_1.findMeta(parentEntity);
            var reference = Repository_1.getCurrentDB()
                .collection(parentMeta.tableName)
                .doc(parentId)
                .collection(meta.tableName)
                .doc(object.id);
            instance[EntityBuilder_1.documentReferencePath] = reference;
        }
        else {
            var reference = Repository_1.getCurrentDB().collection(meta.tableName).doc(object.id);
            instance[EntityBuilder_1.documentReferencePath] = reference;
        }
        for (var key in object) {
            var item = object[key];
            if (!item) {
                continue;
            }
            if (item[exports.referenceCluePath]) {
                instance[key] = plainToClass(item, parentId);
            }
            else if (Array.isArray(item)) {
                instance[key] = item.map(function (x) { return plainToClass(x, parentId); });
            }
            else {
                if (key == exports.referenceCluePath) {
                    continue;
                }
                instance[key] = item;
            }
        }
        return instance;
    };
    FirebaseEntityDeserializer.deserializeFromJSONString = function (Entity, str, parentId) {
        return this.deserializeFromJSON(Entity, JSON.parse(str), parentId);
    };
    return FirebaseEntityDeserializer;
}());
exports.FirebaseEntityDeserializer = FirebaseEntityDeserializer;
function plainToClass(item, parentId) {
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
            child[key] = FirebaseEntityDeserializer.deserializeFromJSON(meta.Entity, item[key], parentId);
        }
        else {
            child[key] = item[key];
        }
    }
    var reference;
    if (meta.parentEntityGetter) {
        if (!parentId) {
            throw new Error(meta.tableName + " is nested collection. So parentId have to be provided.");
        }
        var parentEntity = meta.parentEntityGetter();
        var parentMeta = Entity_1.findMeta(parentEntity);
        reference = Repository_1.getCurrentDB()
            .collection(parentMeta.tableName)
            .doc(parentId)
            .collection(meta.tableName)
            .doc(clue.id);
    }
    else {
        reference = Repository_1.getCurrentDB().collection(meta.tableName).doc(clue.id);
    }
    child[EntityBuilder_1.documentReferencePath] = reference;
    return child;
}
//# sourceMappingURL=Serializer.js.map