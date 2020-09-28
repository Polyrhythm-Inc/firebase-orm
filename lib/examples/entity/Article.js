"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
var Entity_1 = require("../../Entity");
var ArticleStat_1 = require("./ArticleStat");
var Category_1 = require("./Category");
var User_1 = require("./User");
var Article = /** @class */ (function () {
    function Article() {
    }
    __decorate([
        Entity_1.PrimaryColumn(),
        __metadata("design:type", String)
    ], Article.prototype, "id", void 0);
    __decorate([
        Entity_1.Column(),
        __metadata("design:type", String)
    ], Article.prototype, "title", void 0);
    __decorate([
        Entity_1.ManyToOne(function () { return User_1.User; }, { joinColumnName: 'user_id' }),
        __metadata("design:type", User_1.User)
    ], Article.prototype, "user", void 0);
    __decorate([
        Entity_1.OneToOne(function () { return ArticleStat_1.ArticleStat; }, { relationColumn: 'article_id' }),
        __metadata("design:type", ArticleStat_1.ArticleStat)
    ], Article.prototype, "stat", void 0);
    __decorate([
        Entity_1.ManyToOne(function () { return Category_1.Category; }, { joinColumnName: 'category_id' }),
        __metadata("design:type", Category_1.Category)
    ], Article.prototype, "category", void 0);
    __decorate([
        Entity_1.Column({ name: "content_text" }),
        __metadata("design:type", String)
    ], Article.prototype, "contentText", void 0);
    Article = __decorate([
        Entity_1.FirebaseEntity('articles')
    ], Article);
    return Article;
}());
exports.Article = Article;
//# sourceMappingURL=Article.js.map