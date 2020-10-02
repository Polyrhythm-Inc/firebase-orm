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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEntity = exports.RelationNotFoundError = exports.FirestoreReference = exports.SnapShotBox = exports.documentReferencePath = void 0;
var Entity_1 = require("./Entity");
var Repository_1 = require("./Repository");
var type_mapper_1 = require("./type-mapper");
exports.documentReferencePath = '__firestore_document_reference__';
function isBrowserOptimizedDocumentSnapshot(snapshot) {
    return snapshot.data && "exists" in snapshot;
}
function isBrowserOptimizedQuerySnapshot(snapshot) {
    return snapshot.docs && "size" in snapshot;
}
function isBrowserOptimizedDocumentReference(snapshot) {
    return snapshot.set && snapshot.delete && snapshot.get;
}
var SnapShotBox = /** @class */ (function () {
    function SnapShotBox(snapshot) {
        this.snapshot = snapshot;
    }
    SnapShotBox.prototype.unbox = function () {
        var _a;
        if (this.snapshot instanceof type_mapper_1.firestore.DocumentSnapshot || isBrowserOptimizedDocumentSnapshot(this.snapshot)) {
            var snapshot = this.snapshot;
            if (!snapshot.exists) {
                return null;
            }
            return [__assign((_a = { id: snapshot.id }, _a[exports.documentReferencePath] = snapshot.ref, _a), snapshot.data())];
        }
        else if (this.snapshot instanceof type_mapper_1.firestore.QuerySnapshot || isBrowserOptimizedQuerySnapshot(this.snapshot)) {
            if (this.snapshot.size == 0) {
                return [];
            }
            return this.snapshot.docs.map(function (x) {
                var _a;
                return __assign((_a = { id: x.id }, _a[exports.documentReferencePath] = x.ref, _a), x.data());
            });
        }
        return null;
    };
    return SnapShotBox;
}());
exports.SnapShotBox = SnapShotBox;
var FirestoreReference = /** @class */ (function () {
    function FirestoreReference(ref, transaction) {
        this.ref = ref;
        this.transaction = transaction;
    }
    FirestoreReference.prototype.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            var box, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.transaction) return [3 /*break*/, 2];
                        _a = SnapShotBox.bind;
                        return [4 /*yield*/, this.transaction.get(this.ref)];
                    case 1:
                        box = new (_a.apply(SnapShotBox, [void 0, _c.sent()]))();
                        return [2 /*return*/, box];
                    case 2:
                        _b = SnapShotBox.bind;
                        return [4 /*yield*/, this.ref.get()];
                    case 3: return [2 /*return*/, new (_b.apply(SnapShotBox, [void 0, _c.sent()]))()];
                }
            });
        });
    };
    FirestoreReference.prototype.set = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var ref;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.ref instanceof type_mapper_1.firestore.DocumentReference || isBrowserOptimizedDocumentReference(this.ref))) return [3 /*break*/, 4];
                        ref = this.ref;
                        if (!this.transaction) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.transaction.set(ref, params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, ref.set(params)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                    case 4: throw new Error('reference should be DocumentReference');
                }
            });
        });
    };
    return FirestoreReference;
}());
exports.FirestoreReference = FirestoreReference;
var RelationNotFoundError = /** @class */ (function (_super) {
    __extends(RelationNotFoundError, _super);
    function RelationNotFoundError(relation) {
        var _this = _super.call(this, "relation " + relation + " is not exists.") || this;
        _this.relation = relation;
        _this.name = 'RelationNotFoundError';
        Object.setPrototypeOf(_this, RelationNotFoundError.prototype);
        return _this;
    }
    RelationNotFoundError.prototype.toString = function () {
        return this.name + ': ' + this.message;
    };
    return RelationNotFoundError;
}(Error));
exports.RelationNotFoundError = RelationNotFoundError;
function relationToGroup(relations) {
    var grouped = {};
    for (var _i = 0, relations_1 = relations; _i < relations_1.length; _i++) {
        var relation = relations_1[_i];
        var comp = relation.split('.');
        if (comp.length == 1) {
            if (!grouped[comp[0]]) {
                grouped[comp[0]] = {};
            }
        }
        else {
            var top_1 = comp.shift();
            if (!grouped[top_1]) {
                grouped[top_1] = {};
            }
            Object.assign(grouped[top_1], relationToGroup([comp.join('.')]));
        }
    }
    return grouped;
}
function groupToRelation(grouped) {
    var keys = [];
    for (var key in grouped) {
        var relationKey = key;
        var childKey = groupToRelation(grouped[key])[0];
        if (childKey) {
            relationKey += '.' + childKey;
        }
        keys.push(relationKey);
    }
    return keys;
}
function buildEntity(meta, data, reference, options) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var groupedRelations, plain, _i, _e, relation, _f, _g, setting, keyInForestore, relation, rawRef, hierarchy, relation, hierarchy, relation, rawRef, hierarchy, hierarchy, instance, key;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    groupedRelations = (options === null || options === void 0 ? void 0 : options.relations) ? relationToGroup(options.relations) : {};
                    plain = {};
                    for (_i = 0, _e = Object.keys(groupedRelations); _i < _e.length; _i++) {
                        relation = _e[_i];
                        if (!meta.columns.map(function (x) { return x.propertyKey; }).includes(relation)) {
                            throw new RelationNotFoundError(relation);
                        }
                    }
                    _f = 0, _g = meta.columns;
                    _h.label = 1;
                case 1:
                    if (!(_f < _g.length)) return [3 /*break*/, 12];
                    setting = _g[_f];
                    keyInForestore = ((_a = setting.option) === null || _a === void 0 ? void 0 : _a.name) || setting.propertyKey;
                    if (!(setting instanceof Entity_1._ManyToOneSetting)) return [3 /*break*/, 3];
                    relation = groupedRelations[setting.propertyKey];
                    if (!relation) {
                        return [3 /*break*/, 11];
                    }
                    if ((_b = setting.option) === null || _b === void 0 ? void 0 : _b.joinColumnName) {
                        keyInForestore = setting.option.joinColumnName;
                    }
                    rawRef = data[keyInForestore];
                    return [4 /*yield*/, followHierarchy({
                            setting: setting,
                            relations: {
                                top: setting.propertyKey,
                                hierarchy: relation
                            },
                            reference: reference,
                            fetchMode: {
                                mode: 'ref',
                                reference: rawRef
                            }
                        })];
                case 2:
                    hierarchy = _h.sent();
                    Object.assign(plain, hierarchy);
                    return [3 /*break*/, 11];
                case 3:
                    if (!(setting instanceof Entity_1._OneToManySetting)) return [3 /*break*/, 5];
                    relation = groupedRelations[setting.propertyKey];
                    if (!relation) {
                        return [3 /*break*/, 11];
                    }
                    return [4 /*yield*/, followHierarchy({
                            setting: setting,
                            relations: {
                                top: setting.propertyKey,
                                hierarchy: relation
                            },
                            reference: reference,
                            fetchMode: {
                                mode: 'many'
                            }
                        })];
                case 4:
                    hierarchy = _h.sent();
                    Object.assign(plain, hierarchy);
                    return [3 /*break*/, 11];
                case 5:
                    if (!(setting instanceof Entity_1._OneToOneSetting)) return [3 /*break*/, 10];
                    relation = groupedRelations[setting.propertyKey];
                    if (!relation) {
                        return [3 /*break*/, 11];
                    }
                    if (!((_c = setting.option) === null || _c === void 0 ? void 0 : _c.joinColumnName)) return [3 /*break*/, 7];
                    keyInForestore = setting.option.joinColumnName;
                    rawRef = data[keyInForestore];
                    return [4 /*yield*/, followHierarchy({
                            setting: setting,
                            relations: {
                                top: setting.propertyKey,
                                hierarchy: relation
                            },
                            reference: reference,
                            fetchMode: {
                                mode: 'ref',
                                reference: rawRef
                            }
                        })];
                case 6:
                    hierarchy = _h.sent();
                    Object.assign(plain, hierarchy);
                    return [3 /*break*/, 9];
                case 7:
                    if (!((_d = setting.option) === null || _d === void 0 ? void 0 : _d.relationColumn)) return [3 /*break*/, 9];
                    return [4 /*yield*/, followHierarchy({
                            setting: setting,
                            relations: {
                                top: setting.propertyKey,
                                hierarchy: relation
                            },
                            reference: reference,
                            fetchMode: {
                                mode: 'single',
                                reference: data[exports.documentReferencePath]
                            }
                        })];
                case 8:
                    hierarchy = _h.sent();
                    Object.assign(plain, hierarchy);
                    _h.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    plain[setting.propertyKey] = data[keyInForestore];
                    _h.label = 11;
                case 11:
                    _f++;
                    return [3 /*break*/, 1];
                case 12:
                    instance = new meta.Entity();
                    for (key in plain) {
                        instance[key] = plain[key];
                    }
                    instance[exports.documentReferencePath] = data[exports.documentReferencePath];
                    return [2 /*return*/, instance];
            }
        });
    });
}
exports.buildEntity = buildEntity;
function followHierarchy(params) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var results, _e, ref, box, unboxed, meta, _f, _g, singleRef_1, singlRepo, _h, _j, manyRepo, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    results = {};
                    _e = params.fetchMode.mode;
                    switch (_e) {
                        case 'ref': return [3 /*break*/, 1];
                        case 'single': return [3 /*break*/, 5];
                        case 'many': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 1:
                    ref = new FirestoreReference(params.fetchMode.reference, (_a = params.reference) === null || _a === void 0 ? void 0 : _a.transaction);
                    return [4 /*yield*/, ref.get()];
                case 2:
                    box = _m.sent();
                    unboxed = box.unbox();
                    if (!(unboxed && unboxed[0])) return [3 /*break*/, 4];
                    meta = Entity_1.findMeta(params.setting.getEntity());
                    _f = results;
                    _g = params.setting.propertyKey;
                    return [4 /*yield*/, buildEntity(meta, unboxed[0], ref, { relations: groupToRelation(params.relations.hierarchy || {}) })];
                case 3:
                    _f[_g] = _m.sent();
                    _m.label = 4;
                case 4: return [3 /*break*/, 9];
                case 5:
                    singleRef_1 = params.fetchMode.reference;
                    singlRepo = Repository_1.getRepository(params.setting.getEntity());
                    if ((_b = params.reference) === null || _b === void 0 ? void 0 : _b.transaction) {
                        singlRepo.setTransaction(params.reference.transaction);
                    }
                    _h = results;
                    _j = params.setting.propertyKey;
                    return [4 /*yield*/, singlRepo.prepareFetcher(function (db) {
                            return db.where(params.setting.option.relationColumn, '==', singleRef_1);
                        }).fetchOne({
                            relations: groupToRelation(params.relations.hierarchy || {})
                        })];
                case 6:
                    _h[_j] = _m.sent();
                    return [3 /*break*/, 9];
                case 7:
                    manyRepo = Repository_1.getRepository(params.setting.getEntity());
                    if ((_c = params.reference) === null || _c === void 0 ? void 0 : _c.transaction) {
                        manyRepo.setTransaction((_d = params.reference) === null || _d === void 0 ? void 0 : _d.transaction);
                    }
                    _k = results;
                    _l = params.setting.propertyKey;
                    return [4 /*yield*/, manyRepo.prepareFetcher(function (db) {
                            var _a;
                            return db.where(params.setting.option.relationColumn, '==', (_a = params.reference) === null || _a === void 0 ? void 0 : _a.ref);
                        }).fetchAll({
                            relations: groupToRelation(params.relations.hierarchy || {})
                        })];
                case 8:
                    _k[_l] = _m.sent();
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, results];
            }
        });
    });
}
//# sourceMappingURL=EntityBuilder.js.map