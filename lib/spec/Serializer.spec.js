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
require("mocha");
var admin = require("firebase-admin");
var Repository_1 = require("../Repository");
var User_1 = require("../examples/entity/User");
var ArticleStat_1 = require("../examples/entity/ArticleStat");
var Article_1 = require("../examples/entity/Article");
var Category_1 = require("../examples/entity/Category");
var chai_1 = require("chai");
var ArticleComment_1 = require("../examples/entity/ArticleComment");
var Serializer_1 = require("../Serializer");
var EntityBuilder_1 = require("../EntityBuilder");
var Entity_1 = require("../Entity");
var child_process_1 = require("child_process");
var ArticleCommentLike_1 = require("../examples/entity/ArticleCommentLike");
var serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-e1dd189e07.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://polyrhythm-dev-example.firebaseio.com"
});
var db = admin.firestore();
function getInitialData() {
    var _this = this;
    return Repository_1.runTransaction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
        var user, category, article, articleStat, articleComment, like;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = new User_1.User();
                    user.name = 'test-user';
                    return [4 /*yield*/, manager.getRepository(User_1.User).save(user)];
                case 1:
                    _a.sent();
                    category = new Category_1.Category();
                    category.name = 'math';
                    return [4 /*yield*/, manager.getRepository(Category_1.Category).save(category)];
                case 2:
                    _a.sent();
                    article = new Article_1.Article();
                    article.title = 'title';
                    article.contentText = 'bodybody';
                    article.user = user;
                    article.categories = [category];
                    article.postedAt = admin.firestore.Timestamp.now();
                    return [4 /*yield*/, manager.getRepository(Article_1.Article).save(article)];
                case 3:
                    _a.sent();
                    articleStat = new ArticleStat_1.ArticleStat();
                    articleStat.article = article;
                    articleStat.numOfViews = 100;
                    return [4 /*yield*/, manager.getRepository(ArticleStat_1.ArticleStat).save(articleStat)];
                case 4:
                    _a.sent();
                    articleComment = new ArticleComment_1.ArticleComment();
                    articleComment.text = 'hello';
                    return [4 /*yield*/, manager.getRepository(ArticleComment_1.ArticleComment, { parentIdMapper: function (Entity) {
                                switch (Entity) {
                                    case Article_1.Article:
                                        return article.id;
                                }
                                throw new Error("Unknonwn Entity " + Entity.name);
                            } }).save(articleComment)];
                case 5:
                    _a.sent();
                    like = new ArticleCommentLike_1.ArticleCommentLike();
                    like.count = 100;
                    return [4 /*yield*/, manager.getRepository(ArticleCommentLike_1.ArticleCommentLike, { parentIdMapper: function (Entity) {
                                switch (Entity) {
                                    case Article_1.Article:
                                        return article.id;
                                    case ArticleComment_1.ArticleComment:
                                        return articleComment.id;
                                }
                                throw new Error("Unknonwn Entity " + Entity.name);
                            } }).save(like)];
                case 6:
                    _a.sent();
                    return [2 /*return*/, [article, articleStat, articleComment, like]];
            }
        });
    }); });
}
Repository_1.addDBToPool('default', db);
Repository_1.use('default');
function deleteAllData(Entity) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            child_process_1.execSync("firebase firestore:delete " + Entity_1.findMeta(Entity).tableName + " -r --project polyrhythm-dev-example -y");
            return [2 /*return*/];
        });
    });
}
function cleanTables() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, deleteAllData(User_1.User)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, deleteAllData(Article_1.Article)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, deleteAllData(ArticleStat_1.ArticleStat)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, deleteAllData(Category_1.Category)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
describe('FirebaseEntitySerializer and FirebaseEntityDeserializer test', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        before(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        }); });
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cleanTables()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        }); });
        after(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        }); });
        context('FirebaseEntitySerializer', function () {
            it("should serialize article", function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a, article, articleStat, articleComment, like, articleJson, articleStatJson, commnetJSON, likeJSON;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getInitialData()];
                        case 1:
                            _a = _b.sent(), article = _a[0], articleStat = _a[1], articleComment = _a[2], like = _a[3];
                            articleJson = Serializer_1.FirebaseEntitySerializer.serializeToJSON(article);
                            chai_1.expect(articleJson).haveOwnProperty(Serializer_1.referenceCluePath);
                            chai_1.expect(articleJson.user).haveOwnProperty(Serializer_1.referenceCluePath);
                            chai_1.expect(articleJson.categories[0]).haveOwnProperty(Serializer_1.referenceCluePath);
                            articleStatJson = Serializer_1.FirebaseEntitySerializer.serializeToJSON(articleStat);
                            chai_1.expect(articleStatJson).haveOwnProperty(Serializer_1.referenceCluePath);
                            commnetJSON = Serializer_1.FirebaseEntitySerializer.serializeToJSON(articleComment, function (Entity) {
                                switch (Entity) {
                                    case Article_1.Article:
                                        return article.id;
                                }
                                throw new Error("Unknonwn Entity " + Entity.name);
                            });
                            chai_1.expect(commnetJSON).haveOwnProperty(Serializer_1.referenceCluePath).to.haveOwnProperty('parent');
                            likeJSON = Serializer_1.FirebaseEntitySerializer.serializeToJSON(like, function (Entity) {
                                switch (Entity) {
                                    case Article_1.Article:
                                        return article.id;
                                    case ArticleComment_1.ArticleComment:
                                        return articleComment.id;
                                }
                                throw new Error("Unknonwn Entity " + Entity.name);
                            });
                            chai_1.expect(likeJSON).haveOwnProperty(Serializer_1.referenceCluePath).to.haveOwnProperty('parent').to.haveOwnProperty('child');
                            return [2 /*return*/];
                    }
                });
            }); });
            it("should failed to serialize articleComment without parentId", function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a, _1, _2, articleComment;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getInitialData()];
                        case 1:
                            _a = _b.sent(), _1 = _a[0], _2 = _a[1], articleComment = _a[2];
                            try {
                                Serializer_1.FirebaseEntitySerializer.serializeToJSON(articleComment);
                                throw new Error('never reached here');
                            }
                            catch (_c) { }
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        context('FirebaseEntityDeserializer', function () {
            it("should deserialize article", function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a, _article, _articleStat, _articleComment, _like, articleJson, commnetJSON, likeJSON, article, stat, comment, like;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getInitialData()];
                        case 1:
                            _a = _b.sent(), _article = _a[0], _articleStat = _a[1], _articleComment = _a[2], _like = _a[3];
                            articleJson = Serializer_1.FirebaseEntitySerializer.serializeToJSON(_article);
                            commnetJSON = Serializer_1.FirebaseEntitySerializer.serializeToJSON(_articleComment, function (Entity) {
                                switch (Entity) {
                                    case Article_1.Article:
                                        return _article.id;
                                }
                                throw new Error("Unknonwn Entity " + Entity.name);
                            });
                            likeJSON = Serializer_1.FirebaseEntitySerializer.serializeToJSON(_like, function (Entity) {
                                switch (Entity) {
                                    case Article_1.Article:
                                        return _article.id;
                                    case ArticleComment_1.ArticleComment:
                                        return _articleComment.id;
                                }
                                throw new Error("Unknonwn Entity " + Entity.name);
                            });
                            article = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(Article_1.Article, articleJson);
                            chai_1.expect(article).haveOwnProperty(EntityBuilder_1.documentReferencePath);
                            chai_1.expect(article.user).haveOwnProperty(EntityBuilder_1.documentReferencePath);
                            chai_1.expect(article.categories[0]).haveOwnProperty(EntityBuilder_1.documentReferencePath);
                            stat = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(ArticleStat_1.ArticleStat, _articleStat);
                            chai_1.expect(stat).haveOwnProperty(EntityBuilder_1.documentReferencePath);
                            comment = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(ArticleComment_1.ArticleComment, commnetJSON, function (Entity) {
                                switch (Entity) {
                                    case Article_1.Article:
                                        return article.id;
                                }
                                throw new Error("Unknonwn Entity " + Entity.name);
                            });
                            chai_1.expect(comment).haveOwnProperty(EntityBuilder_1.documentReferencePath);
                            like = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(ArticleCommentLike_1.ArticleCommentLike, likeJSON, function (Entity) {
                                switch (Entity) {
                                    case Article_1.Article:
                                        return _article.id;
                                    case ArticleComment_1.ArticleComment:
                                        return _articleComment.id;
                                }
                                throw new Error("Unknonwn Entity " + Entity.name);
                            });
                            chai_1.expect(like).haveOwnProperty(EntityBuilder_1.documentReferencePath);
                            return [2 /*return*/];
                    }
                });
            }); });
            it("should failed to deserialize articleComment without parentId", function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a, _1, _2, articleComment;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getInitialData()];
                        case 1:
                            _a = _b.sent(), _1 = _a[0], _2 = _a[1], articleComment = _a[2];
                            try {
                                Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(ArticleComment_1.ArticleComment, articleComment);
                                throw new Error('never reached here');
                            }
                            catch (_c) { }
                            return [2 /*return*/];
                    }
                });
            }); });
            it("should deserialize article from json string", function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a, _article, _1, _2, _3, serialized, article;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getInitialData()];
                        case 1:
                            _a = _b.sent(), _article = _a[0], _1 = _a[1], _2 = _a[2], _3 = _a[3];
                            serialized = Serializer_1.FirebaseEntitySerializer.serializeToJSONString(_article);
                            chai_1.expect(typeof serialized == "string").to.be.true;
                            article = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSONString(Article_1.Article, serialized);
                            chai_1.expect(article.id).eq(_article.id);
                            return [2 /*return*/];
                    }
                });
            }); });
            it("should serialize/deserialize article with timestamp type converts", function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a, article, _1, _2, _3, serialized, deserialized;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getInitialData()];
                        case 1:
                            _a = _b.sent(), article = _a[0], _1 = _a[1], _2 = _a[2], _3 = _a[3];
                            serialized = Serializer_1.FirebaseEntitySerializer.serializeToJSON(article, undefined, {
                                timeStampToString: true
                            });
                            chai_1.expect(typeof serialized.postedAt).eq('string');
                            deserialized = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(Article_1.Article, serialized, undefined, {
                                stringToTimeStamp: true
                            });
                            chai_1.expect(deserialized.postedAt.seconds).eq(article.postedAt.seconds);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        return [2 /*return*/];
    });
}); });
//# sourceMappingURL=Serializer.spec.js.map