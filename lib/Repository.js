"use strict";
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
exports._getDocumentReference = exports.runTransaction = exports.TransactionManager = exports.getRepository = exports.Repository = exports.getCurrentDB = exports.use = exports.addDBToPool = exports.Fetcher = void 0;
var Entity_1 = require("./Entity");
var EntityBuilder_1 = require("./EntityBuilder");
var Fetcher = /** @class */ (function () {
    function Fetcher(meta, ref) {
        this.meta = meta;
        this.ref = ref;
    }
    Fetcher.prototype.fetchOne = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var result, unoboxed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ref.get()];
                    case 1:
                        result = _a.sent();
                        unoboxed = result.unbox();
                        if (!unoboxed || !unoboxed[0]) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, EntityBuilder_1.buildEntity(this.meta, unoboxed[0], this.ref, options)];
                }
            });
        });
    };
    Fetcher.prototype.fetchAll = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var result, docs, results, _i, docs_1, data, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.ref.get()];
                    case 1:
                        result = _c.sent();
                        docs = result.unbox();
                        if (!docs) {
                            return [2 /*return*/, []];
                        }
                        results = [];
                        _i = 0, docs_1 = docs;
                        _c.label = 2;
                    case 2:
                        if (!(_i < docs_1.length)) return [3 /*break*/, 5];
                        data = docs_1[_i];
                        _b = (_a = results).push;
                        return [4 /*yield*/, EntityBuilder_1.buildEntity(this.meta, data, this.ref, options)];
                    case 3:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, results];
                }
            });
        });
    };
    Fetcher.prototype.onSnapShot = function (callback, options) {
        var _this = this;
        var unsubscribe = this.ref.ref.onSnapshot(function (snapshot) { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, change, ref, result, unoboxed, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _i = 0, _a = snapshot.docChanges();
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        change = _a[_i];
                        ref = new EntityBuilder_1.FirestoreReference(change.doc.ref);
                        return [4 /*yield*/, ref.get()];
                    case 2:
                        result = _d.sent();
                        unoboxed = result.unbox();
                        if (!(!unoboxed || !unoboxed[0])) return [3 /*break*/, 3];
                        callback({
                            type: change.type,
                            id: ref.ref.id
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        _b = callback;
                        _c = {
                            type: change.type,
                            id: ref.ref.id
                        };
                        return [4 /*yield*/, EntityBuilder_1.buildEntity(this.meta, unoboxed[0], ref, options)];
                    case 4:
                        _b.apply(void 0, [(_c.item = _d.sent(),
                                _c)]);
                        _d.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        return unsubscribe;
    };
    return Fetcher;
}());
exports.Fetcher = Fetcher;
var dbPool = {};
var currentConnectionName = null;
function addDBToPool(name, db) {
    if (!currentConnectionName) {
        currentConnectionName = name;
    }
    dbPool[name] = db;
}
exports.addDBToPool = addDBToPool;
function use(name) {
    var keys = Object.keys(dbPool);
    if (!keys.includes(name)) {
        throw new Error("Could not find db named: " + name);
    }
    currentConnectionName = name;
}
exports.use = use;
function getCurrentDB() {
    return dbPool[currentConnectionName];
}
exports.getCurrentDB = getCurrentDB;
function createSavingParams(meta, resource) {
    var _a, _b, _c;
    var savingParams = {};
    var _loop_1 = function (key) {
        if (!resource[key]) {
            return "continue";
        }
        var column = meta.columns.filter(function (x) { return key === x.propertyKey; })[0];
        if (!column) {
            return "continue";
        }
        if (column instanceof Entity_1._ColumnSetting) {
            var keyInForestore = ((_a = column.option) === null || _a === void 0 ? void 0 : _a.name) || column.propertyKey;
            savingParams[keyInForestore] = resource[key];
        }
        else if (column instanceof Entity_1._ManyToOneSetting) {
            if (!((_b = column.option) === null || _b === void 0 ? void 0 : _b.joinColumnName)) {
                return "continue";
            }
            var joinColumnName = column.option.joinColumnName;
            var ref = _getDocumentReference(resource[key]);
            if (!ref) {
                throw new Error('document reference should not be empty');
            }
            savingParams[joinColumnName] = ref;
        }
        else if (column instanceof Entity_1._OneToOneSetting) {
            if (!((_c = column.option) === null || _c === void 0 ? void 0 : _c.joinColumnName)) {
                return "continue";
            }
            var joinColumnName = column.option.joinColumnName;
            var ref = _getDocumentReference(resource[key]);
            if (!ref) {
                throw new Error('document reference should not be empty');
            }
            savingParams[joinColumnName] = ref;
        }
    };
    for (var key in resource) {
        _loop_1(key);
    }
    return savingParams;
}
var Repository = /** @class */ (function () {
    function Repository(Entity, transaction, parentId) {
        this.Entity = Entity;
        this.transaction = transaction;
        this.parentId = parentId;
    }
    Repository.prototype.setTransaction = function (transaction) {
        this.transaction = transaction;
    };
    Repository.prototype.prepareFetcher = function (condition) {
        var meta = Entity_1.findMeta(this.Entity);
        var colRef = this.collectionReference(meta);
        var ref = new EntityBuilder_1.FirestoreReference(condition(colRef), this.transaction);
        return new Fetcher(meta, ref);
    };
    Repository.prototype.fetchOneById = function (id, options) {
        var _this = this;
        var meta = Entity_1.findMeta(this.Entity);
        return this.prepareFetcher(function (db) { return _this.collectionReference(meta).doc(id); }).fetchOne(options);
    };
    Repository.prototype.fetchAll = function (options) {
        var _this = this;
        var meta = Entity_1.findMeta(this.Entity);
        return this.prepareFetcher(function (db) { return _this.collectionReference(meta); }).fetchAll(options);
    };
    Repository.prototype.onSnapShot = function (callback, options) {
        var _this = this;
        var meta = Entity_1.findMeta(this.Entity);
        return this.prepareFetcher(function (db) { return _this.collectionReference(meta); }).onSnapShot(callback, options);
    };
    Repository.prototype.save = function (resource) {
        return __awaiter(this, void 0, void 0, function () {
            var documentReference, Entity, meta, params, meta, _ref, ref, savingParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        documentReference = _getDocumentReference(resource);
                        if (!(this.transaction && documentReference)) return [3 /*break*/, 2];
                        if (documentReference.id !== resource.id) {
                            throw new Error('The resource is broken.');
                        }
                        Entity = resource.constructor;
                        meta = Entity_1.findMeta(Entity);
                        params = createSavingParams(meta, resource);
                        return [4 /*yield*/, this.transaction.set(documentReference, params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, resource];
                    case 2:
                        meta = Entity_1.findMeta(this.Entity);
                        _ref = void 0;
                        if (resource.id) {
                            _ref = this.collectionReference(meta).doc(resource.id);
                        }
                        else {
                            _ref = this.collectionReference(meta).doc();
                        }
                        ref = new EntityBuilder_1.FirestoreReference(_ref, this.transaction);
                        savingParams = createSavingParams(meta, resource);
                        return [4 /*yield*/, ref.set(savingParams)];
                    case 3:
                        _a.sent();
                        if (!resource.id) {
                            resource.id = ref.ref.id;
                        }
                        resource[EntityBuilder_1.documentReferencePath] = _ref;
                        return [2 /*return*/, resource];
                }
            });
        });
    };
    Repository.prototype.delete = function (resourceOrId) {
        return __awaiter(this, void 0, void 0, function () {
            var ref, meta, ref_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ref = _getDocumentReference(resourceOrId);
                        if (!ref) return [3 /*break*/, 5];
                        if (!this.transaction) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.transaction.delete(ref)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, ref.delete()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 9];
                    case 5:
                        meta = Entity_1.findMeta(this.Entity);
                        ref_1 = this.collectionReference(meta).doc(resourceOrId);
                        if (!this.transaction) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.transaction.delete(ref_1)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, ref_1.delete()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.collectionReference = function (meta) {
        if (this.parentId) {
            if (!meta.parentEntityGetter) {
                throw new Error(this.Entity + " is not NestedFirebaseEntity");
            }
            var parentMeta = Entity_1.findMeta(meta.parentEntityGetter());
            return getCurrentDB()
                .collection(parentMeta.tableName)
                .doc(this.parentId)
                .collection(meta.tableName);
        }
        else {
            return getCurrentDB().collection(meta.tableName);
        }
    };
    return Repository;
}());
exports.Repository = Repository;
function getRepository(Entity, params) {
    if (params) {
        return new Repository(Entity, undefined, params.withParentId);
    }
    return new Repository(Entity);
}
exports.getRepository = getRepository;
var TransactionManager = /** @class */ (function () {
    function TransactionManager(transaction) {
        this.transaction = transaction;
    }
    TransactionManager.prototype.getRepository = function (Entity, params) {
        if (params) {
            return new Repository(Entity, this.transaction, params.withParentId);
        }
        return new Repository(Entity, this.transaction);
    };
    return TransactionManager;
}());
exports.TransactionManager = TransactionManager;
function runTransaction(callback) {
    var _this = this;
    return getCurrentDB().runTransaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
        var manager;
        return __generator(this, function (_a) {
            manager = new TransactionManager(transaction);
            return [2 /*return*/, callback(manager)];
        });
    }); });
}
exports.runTransaction = runTransaction;
function _getDocumentReference(item) {
    return item[EntityBuilder_1.documentReferencePath];
}
exports._getDocumentReference = _getDocumentReference;
//# sourceMappingURL=Repository.js.map