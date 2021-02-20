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
var admin = require("firebase-admin");
var Repository_1 = require("../Repository");
var User_1 = require("./entity/User");
var ArticleStat_1 = require("./entity/ArticleStat");
var Article_1 = require("./entity/Article");
var Category_1 = require("./entity/Category");
var Serializer_1 = require("../Serializer");
var ArticleComment_1 = require("./entity/ArticleComment");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var serviceAccount, db, _a, article, comment, json, instance;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-272223a77d.json");
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    databaseURL: "https://" + serviceAccount.project_id + ".firebaseio.com"
                });
                db = admin.firestore();
                Repository_1.addDBToPool('default', db);
                Repository_1.use('default');
                return [4 /*yield*/, Repository_1.runTransaction(function (manager) { return __awaiter(void 0, void 0, void 0, function () {
                        var user, category, article, articleStat, articleComment;
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
                                    return [4 /*yield*/, manager.getRepository(ArticleComment_1.ArticleComment, { parentIdMapper: function (_) {
                                                return article.id;
                                            } }).save(articleComment)];
                                case 5:
                                    _a.sent();
                                    return [2 /*return*/, [article, articleComment]];
                            }
                        });
                    }); })];
            case 1:
                _a = _b.sent(), article = _a[0], comment = _a[1];
                json = Serializer_1.FirebaseEntitySerializer.serializeToJSON(article);
                instance = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(Article_1.Article, json);
                console.log(instance);
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=main.js.map