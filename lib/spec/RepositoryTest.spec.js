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
var events_1 = require("events");
var ArticleComment_1 = require("../examples/entity/ArticleComment");
var serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-e1dd189e07.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://polyrhythm-dev-example.firebaseio.com"
});
var db = admin.firestore();
function getRandomIntString(max) {
    if (max === void 0) { max = 1000; }
    return Math.floor(Math.random() * Math.floor(max)).toString();
}
Repository_1.addDBToPool('default', db);
Repository_1.use('default');
function deleteAllData(Entity) {
    return __awaiter(this, void 0, void 0, function () {
        var resources, _i, resources_1, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Repository_1.getRepository(Entity).fetchAll()];
                case 1:
                    resources = _a.sent();
                    _i = 0, resources_1 = resources;
                    _a.label = 2;
                case 2:
                    if (!(_i < resources_1.length)) return [3 /*break*/, 5];
                    r = resources_1[_i];
                    return [4 /*yield*/, Repository_1.getRepository(Entity).delete(r)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
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
describe('Repository test', function () { return __awaiter(void 0, void 0, void 0, function () {
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
        context('AutoGenerated ID', function () {
            it('should attach autogenerated id to the resource if the id is not provided', function () { return __awaiter(void 0, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            user = new User_1.User();
                            user.name = 'hoge';
                            return [4 /*yield*/, Repository_1.getRepository(User_1.User).save(user)];
                        case 1:
                            _a.sent();
                            chai_1.expect(user.id).to.not.undefined;
                            chai_1.expect(user.id).to.not.null;
                            chai_1.expect(user.id).to.not.empty;
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        context('simple CRUD', function () {
            it("should perform simple CRUD", function () { return __awaiter(void 0, void 0, void 0, function () {
                var repo, user, _a, _b, _c;
                var _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            repo = Repository_1.getRepository(User_1.User);
                            user = new User_1.User();
                            user.id = getRandomIntString();
                            user.name = 'test-user';
                            return [4 /*yield*/, repo.save(user)];
                        case 1:
                            _f.sent();
                            // fetch
                            _a = chai_1.expect;
                            return [4 /*yield*/, repo.fetchOneById(user.id)];
                        case 2:
                            // fetch
                            _a.apply(void 0, [(_d = (_f.sent())) === null || _d === void 0 ? void 0 : _d.id]).eq(user.id);
                            // update
                            user.name = 'updated';
                            return [4 /*yield*/, repo.save(user)];
                        case 3:
                            _f.sent();
                            _b = chai_1.expect;
                            return [4 /*yield*/, repo.fetchOneById(user.id)];
                        case 4:
                            _b.apply(void 0, [(_e = (_f.sent())) === null || _e === void 0 ? void 0 : _e.name]).eq('updated');
                            // delete
                            return [4 /*yield*/, repo.delete(user)];
                        case 5:
                            // delete
                            _f.sent();
                            _c = chai_1.expect;
                            return [4 /*yield*/, repo.fetchOneById(user.id)];
                        case 6:
                            _c.apply(void 0, [(_f.sent())]).to.be.null;
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        context('relations', function () {
            it("Many to One", function () { return __awaiter(void 0, void 0, void 0, function () {
                var article, item;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Repository_1.runTransaction(function (manager) { return __awaiter(void 0, void 0, void 0, function () {
                                var user, article;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            user = new User_1.User();
                                            user.id = getRandomIntString();
                                            user.name = 'test-user';
                                            return [4 /*yield*/, manager.getRepository(User_1.User).save(user)];
                                        case 1:
                                            _a.sent();
                                            article = new Article_1.Article();
                                            article.id = getRandomIntString();
                                            article.title = 'title';
                                            article.contentText = 'bodybody';
                                            article.user = user;
                                            return [4 /*yield*/, manager.getRepository(Article_1.Article).save(article)];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/, article];
                                    }
                                });
                            }); })];
                        case 1:
                            article = _a.sent();
                            return [4 /*yield*/, Repository_1.getRepository(Article_1.Article).fetchOneById(article.id, {
                                    relations: ['user']
                                })];
                        case 2:
                            item = _a.sent();
                            chai_1.expect(item === null || item === void 0 ? void 0 : item.id).eq(article.id);
                            chai_1.expect(article === null || article === void 0 ? void 0 : article.user.id).eq(article.user.id);
                            return [2 /*return*/];
                    }
                });
            }); });
            it("One to One", function () { return __awaiter(void 0, void 0, void 0, function () {
                var article, item;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Repository_1.runTransaction(function (manager) { return __awaiter(void 0, void 0, void 0, function () {
                                var stat, article;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            stat = new ArticleStat_1.ArticleStat();
                                            stat.id = getRandomIntString();
                                            stat.numOfViews = 10000;
                                            return [4 /*yield*/, manager.getRepository(ArticleStat_1.ArticleStat).save(stat)];
                                        case 1:
                                            _a.sent();
                                            article = new Article_1.Article();
                                            article.id = getRandomIntString();
                                            article.title = 'title';
                                            article.contentText = 'bodybody';
                                            article.stat = stat;
                                            return [4 /*yield*/, manager.getRepository(Article_1.Article).save(article)];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/, article];
                                    }
                                });
                            }); })];
                        case 1:
                            article = _a.sent();
                            return [4 /*yield*/, Repository_1.getRepository(Article_1.Article).fetchOneById(article.id, {
                                    relations: ['stat']
                                })];
                        case 2:
                            item = _a.sent();
                            chai_1.expect(item === null || item === void 0 ? void 0 : item.id).eq(article.id);
                            chai_1.expect(article === null || article === void 0 ? void 0 : article.stat.id).eq(article.stat.id);
                            return [2 /*return*/];
                    }
                });
            }); });
            it("One to Many", function () { return __awaiter(void 0, void 0, void 0, function () {
                var article, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Repository_1.runTransaction(function (manager) { return __awaiter(void 0, void 0, void 0, function () {
                                var user, article;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            user = new User_1.User();
                                            user.id = getRandomIntString();
                                            user.name = 'test-user';
                                            return [4 /*yield*/, manager.getRepository(User_1.User).save(user)];
                                        case 1:
                                            _a.sent();
                                            article = new Article_1.Article();
                                            article.id = getRandomIntString();
                                            article.title = 'title';
                                            article.contentText = 'bodybody';
                                            article.user = user;
                                            return [4 /*yield*/, manager.getRepository(Article_1.Article).save(article)];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/, article];
                                    }
                                });
                            }); })];
                        case 1:
                            article = _a.sent();
                            return [4 /*yield*/, Repository_1.getRepository(User_1.User).fetchOneById(article.user.id, {
                                    relations: ['articles']
                                })];
                        case 2:
                            user = _a.sent();
                            chai_1.expect(user === null || user === void 0 ? void 0 : user.id).eq(article.user.id);
                            chai_1.expect(user === null || user === void 0 ? void 0 : user.articles[0].id).eq(article.id);
                            return [2 /*return*/];
                    }
                });
            }); });
            it("should fetch nested relation data", function () { return __awaiter(void 0, void 0, void 0, function () {
                var userId, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Repository_1.runTransaction(function (manager) { return __awaiter(void 0, void 0, void 0, function () {
                                var user, category, article, articleStat;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            user = new User_1.User();
                                            user.id = getRandomIntString();
                                            user.name = 'test-user';
                                            return [4 /*yield*/, manager.getRepository(User_1.User).save(user)];
                                        case 1:
                                            _a.sent();
                                            category = new Category_1.Category();
                                            category.id = getRandomIntString();
                                            category.name = 'math';
                                            return [4 /*yield*/, manager.getRepository(Category_1.Category).save(category)];
                                        case 2:
                                            _a.sent();
                                            article = new Article_1.Article();
                                            article.id = getRandomIntString();
                                            article.title = 'title';
                                            article.contentText = 'bodybody';
                                            article.user = user;
                                            article.category = category;
                                            return [4 /*yield*/, manager.getRepository(Article_1.Article).save(article)];
                                        case 3:
                                            _a.sent();
                                            articleStat = new ArticleStat_1.ArticleStat();
                                            articleStat.id = getRandomIntString();
                                            articleStat.article = article;
                                            articleStat.numOfViews = 100;
                                            return [4 /*yield*/, manager.getRepository(ArticleStat_1.ArticleStat).save(articleStat)];
                                        case 4:
                                            _a.sent();
                                            return [2 /*return*/, user.id];
                                    }
                                });
                            }); })];
                        case 1:
                            userId = _a.sent();
                            return [4 /*yield*/, Repository_1.getRepository(User_1.User).fetchOneById(userId, {
                                    relations: ['articles.category', 'articles.stat']
                                })];
                        case 2:
                            user = _a.sent();
                            chai_1.expect(user === null || user === void 0 ? void 0 : user.articles.length).eq(1);
                            chai_1.expect(user === null || user === void 0 ? void 0 : user.articles[0]).haveOwnProperty('stat');
                            chai_1.expect(user === null || user === void 0 ? void 0 : user.articles[0]).haveOwnProperty('category');
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        context('transactions', function () {
            it("should rollback creation", function () { return __awaiter(void 0, void 0, void 0, function () {
                var e_1, users, articles;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 5]);
                            return [4 /*yield*/, Repository_1.runTransaction(function (manager) { return __awaiter(void 0, void 0, void 0, function () {
                                    var user, article;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                user = new User_1.User();
                                                user.id = getRandomIntString();
                                                user.name = 'test-user';
                                                return [4 /*yield*/, manager.getRepository(User_1.User).save(user)];
                                            case 1:
                                                _a.sent();
                                                article = new Article_1.Article();
                                                article.id = getRandomIntString();
                                                article.title = 'title';
                                                article.contentText = 'bodybody';
                                                article.user = user;
                                                return [4 /*yield*/, manager.getRepository(Article_1.Article).save(article)];
                                            case 2:
                                                _a.sent();
                                                throw new Error('rollback');
                                        }
                                    });
                                }); })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 2:
                            e_1 = _a.sent();
                            return [4 /*yield*/, Repository_1.getRepository(User_1.User).fetchAll()];
                        case 3:
                            users = _a.sent();
                            return [4 /*yield*/, Repository_1.getRepository(Article_1.Article).fetchAll()];
                        case 4:
                            articles = _a.sent();
                            chai_1.expect(users.length).eq(0);
                            chai_1.expect(articles.length).eq(0);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            it("should rollback deletion", function () { return __awaiter(void 0, void 0, void 0, function () {
                var userId, user, e_2, user_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            userId = getRandomIntString();
                            user = new User_1.User();
                            user.id = userId;
                            user.name = 'test-user';
                            return [4 /*yield*/, Repository_1.getRepository(User_1.User).save(user)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 6]);
                            return [4 /*yield*/, Repository_1.runTransaction(function (manager) { return __awaiter(void 0, void 0, void 0, function () {
                                    var user;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, manager.getRepository(User_1.User).fetchOneById(userId)];
                                            case 1:
                                                user = _a.sent();
                                                return [4 /*yield*/, manager.getRepository(User_1.User).delete(user)];
                                            case 2:
                                                _a.sent();
                                                throw new Error('rollback');
                                        }
                                    });
                                }); })];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 4:
                            e_2 = _a.sent();
                            return [4 /*yield*/, Repository_1.getRepository(User_1.User).fetchOneById(userId)];
                        case 5:
                            user_1 = _a.sent();
                            chai_1.expect(user_1 === null || user_1 === void 0 ? void 0 : user_1.id).eq(userId);
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
        });
        context('nestedCollection', function () {
            it("should perform curd for nested collection", function () { return __awaiter(void 0, void 0, void 0, function () {
                var result, article, commentRepo, comments, comment;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Repository_1.runTransaction(function (manager) { return __awaiter(void 0, void 0, void 0, function () {
                                var user, article, articleComment;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            user = new User_1.User();
                                            user.id = getRandomIntString();
                                            user.name = 'test-user';
                                            return [4 /*yield*/, manager.getRepository(User_1.User).save(user)];
                                        case 1:
                                            _a.sent();
                                            article = new Article_1.Article();
                                            article.id = getRandomIntString();
                                            article.title = 'title';
                                            article.contentText = 'bodybody';
                                            article.user = user;
                                            return [4 /*yield*/, manager.getRepository(Article_1.Article).save(article)];
                                        case 2:
                                            _a.sent();
                                            articleComment = new ArticleComment_1.ArticleComment();
                                            articleComment.id = getRandomIntString();
                                            articleComment.text = 'hello';
                                            return [4 /*yield*/, manager.getRepository(ArticleComment_1.ArticleComment, { withParentId: article.id }).save(articleComment)];
                                        case 3:
                                            _a.sent();
                                            return [2 /*return*/, [article, articleComment]];
                                    }
                                });
                            }); })];
                        case 1:
                            result = _a.sent();
                            article = result[0];
                            commentRepo = Repository_1.getRepository(ArticleComment_1.ArticleComment, { withParentId: article.id });
                            return [4 /*yield*/, commentRepo.fetchAll()];
                        case 2:
                            comments = _a.sent();
                            chai_1.expect(comments.length).eq(1);
                            comment = comments[0];
                            comment.text = 'updated';
                            return [4 /*yield*/, commentRepo.save(comment)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, commentRepo.fetchAll()];
                        case 4:
                            comments = _a.sent();
                            comment = comments[0];
                            chai_1.expect(comment.text).eq("updated");
                            return [4 /*yield*/, commentRepo.delete(comment)];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, commentRepo.fetchAll()];
                        case 6:
                            comments = _a.sent();
                            chai_1.expect(comments.length).eq(0);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        context('onSnapshot', function () {
            it("should sync snap shot with relations", function () { return __awaiter(void 0, void 0, void 0, function () {
                var evm, phase, unsubscribe;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            evm = new events_1.EventEmitter();
                            phase = 1;
                            unsubscribe = Repository_1.getRepository(User_1.User).prepareFetcher(function (db) {
                                return db.limit(5);
                            }).onSnapShot(function (result) { return __awaiter(void 0, void 0, void 0, function () {
                                var type, user;
                                return __generator(this, function (_a) {
                                    type = result.type;
                                    switch (phase) {
                                        case 1:
                                            chai_1.expect(type).eq('added');
                                            user = result.item;
                                            chai_1.expect(user === null || user === void 0 ? void 0 : user.articles.length).eq(1);
                                            chai_1.expect(user === null || user === void 0 ? void 0 : user.articles[0]).haveOwnProperty('stat');
                                            chai_1.expect(user === null || user === void 0 ? void 0 : user.articles[0]).haveOwnProperty('category');
                                            phase++;
                                            evm.emit(phase.toString(), result.item);
                                            break;
                                        case 2:
                                            chai_1.expect(type).eq('modified');
                                            phase++;
                                            evm.emit(phase.toString(), result.item);
                                            break;
                                        case 3:
                                            chai_1.expect(type).eq('removed');
                                            unsubscribe();
                                            break;
                                    }
                                    return [2 /*return*/];
                                });
                            }); }, {
                                relations: ['articles.category', 'articles.stat']
                            });
                            // phase 1
                            return [4 /*yield*/, Repository_1.runTransaction(function (manager) { return __awaiter(void 0, void 0, void 0, function () {
                                    var user, category, article, articleStat;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                user = new User_1.User();
                                                user.id = getRandomIntString();
                                                user.name = 'test-user';
                                                return [4 /*yield*/, manager.getRepository(User_1.User).save(user)];
                                            case 1:
                                                _a.sent();
                                                category = new Category_1.Category();
                                                category.id = getRandomIntString();
                                                category.name = 'math';
                                                return [4 /*yield*/, manager.getRepository(Category_1.Category).save(category)];
                                            case 2:
                                                _a.sent();
                                                article = new Article_1.Article();
                                                article.id = getRandomIntString();
                                                article.title = 'title';
                                                article.contentText = 'bodybody';
                                                article.user = user;
                                                article.category = category;
                                                return [4 /*yield*/, manager.getRepository(Article_1.Article).save(article)];
                                            case 3:
                                                _a.sent();
                                                articleStat = new ArticleStat_1.ArticleStat();
                                                articleStat.id = getRandomIntString();
                                                articleStat.article = article;
                                                articleStat.numOfViews = 100;
                                                return [4 /*yield*/, manager.getRepository(ArticleStat_1.ArticleStat).save(articleStat)];
                                            case 4:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        case 1:
                            // phase 1
                            _a.sent();
                            evm.on('2', function (user) { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            user.name = 'updated';
                                            return [4 /*yield*/, Repository_1.getRepository(User_1.User).save(user)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            evm.on('3', function (user) { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Repository_1.getRepository(User_1.User).delete(user)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        return [2 /*return*/];
    });
}); });
//# sourceMappingURL=RepositoryTest.spec.js.map