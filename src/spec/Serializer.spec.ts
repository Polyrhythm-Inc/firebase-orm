import 'mocha';
import * as admin from 'firebase-admin';
import { addDBToPool, getRepository, runTransaction, use } from "../Repository";
import { User } from '../examples/entity/User';
import { ArticleStat } from '../examples/entity/ArticleStat';
import { Article } from '../examples/entity/Article';
import { Category } from '../examples/entity/Category';
import { expect } from 'chai';
import { EventEmitter } from 'events';
import { ArticleComment } from '../examples/entity/ArticleComment';
import { PureReference } from '..';
import { FirebaseEntityDeserializer, FirebaseEntitySerializer, referenceCluePath } from '../Serializer';
import { documentReferencePath } from '../EntityBuilder';

const serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-e1dd189e07.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://polyrhythm-dev-example.firebaseio.com"
});

const db = admin.firestore();

function getInitialData() {
    return runTransaction(async manager => {
        const user = new User();
        user.name = 'test-user';
        await manager.getRepository(User).save(user);

        const category = new Category();
        category.name = 'math';
        await manager.getRepository(Category).save(category);

        const article = new Article();
        article.title = 'title';
        article.contentText = 'bodybody';
        article.user = user;
        article.categories = [category];

        await manager.getRepository(Article).save(article);

        const articleStat = new ArticleStat();
        articleStat.article = article;
        articleStat.numOfViews = 100;

        await manager.getRepository(ArticleStat).save(articleStat);

        const articleComment = new ArticleComment();
        articleComment.text = 'hello';           
        
        await manager.getRepository(ArticleComment, {withParentId: article.id}).save(articleComment);

        return [article, articleStat, articleComment];
    });
}

addDBToPool('default', db);
use('default');

async function deleteAllData<T extends {id: string}>(Entity: new () => T) {
    const resources = await getRepository(Entity).fetchAll();
    for(const r of resources) {
        await getRepository(Entity).delete(r);
    }    
}

async function cleanTables() {
    await deleteAllData(User);
    await deleteAllData(Article);
    await deleteAllData(ArticleStat);
    await deleteAllData(Category);
    await deleteAllData(ArticleComment);
}

describe('FirebaseEntitySerializer and FirebaseEntityDeserializer test', async () => {
    before(async () => {
        
    });

    beforeEach(async () => {
        await cleanTables();
    });

    afterEach(async () => {
        
    });

    after(async () => {
        
    });

    context('FirebaseEntitySerializer', () => {
        it("should serialize article", async () => {
            const [article, articleStat, articleComment] = await getInitialData();
        
            const articleJson = FirebaseEntitySerializer.serializeToJSON(article);
            expect(articleJson).haveOwnProperty(referenceCluePath);
            expect(articleJson.user).haveOwnProperty(referenceCluePath);
            expect(articleJson.categories[0]).haveOwnProperty(referenceCluePath);

            const articleStatJson = FirebaseEntitySerializer.serializeToJSON(articleStat);
            expect(articleStatJson).haveOwnProperty(referenceCluePath);

            const commnetJSON = FirebaseEntitySerializer.serializeToJSON(articleComment, article.id);
            expect(commnetJSON).haveOwnProperty(referenceCluePath).to.haveOwnProperty('parent');
        });

        it("should failed to serialize articleComment without parentId", async () => {
            const [_1, _2, articleComment] = await getInitialData();

            try {
                FirebaseEntitySerializer.serializeToJSON(articleComment);
                throw new Error('never reached here');
            } catch {}
        });
    });

    context('FirebaseEntityDeserializer', () => {
        it("should deserialize article", async () => {
            const [_article, _articleStat, _articleComment] = await getInitialData();
        
            const articleJson = FirebaseEntitySerializer.serializeToJSON(_article);
            const articleStatJson = FirebaseEntitySerializer.serializeToJSON(_articleStat);
            const commnetJSON = FirebaseEntitySerializer.serializeToJSON(_articleComment, _article.id);

            const article = FirebaseEntityDeserializer.deserializeFromJSON(Article, articleJson);
            expect(article).haveOwnProperty(documentReferencePath);
            expect(article.user).haveOwnProperty(documentReferencePath);
            expect(article.categories[0]).haveOwnProperty(documentReferencePath);

            const stat = FirebaseEntityDeserializer.deserializeFromJSON(ArticleStat, _articleStat);
            expect(stat).haveOwnProperty(documentReferencePath);

            const comment = FirebaseEntityDeserializer.deserializeFromJSON(ArticleComment, commnetJSON, article.id);
            expect(comment).haveOwnProperty(documentReferencePath);
        });

        it("should failed to deserialize articleComment without parentId", async () => {
            const [_1, _2, articleComment] = await getInitialData();

            try {
                FirebaseEntityDeserializer.deserializeFromJSON(ArticleComment, articleComment);
                throw new Error('never reached here');
            } catch {}
        });        

        it("should deserialize article from json string", async () => {
            const [_article, _1, _2] = await getInitialData();

            const serialized = FirebaseEntitySerializer.serializeToJSONString(_article);
            expect(typeof serialized == "string").to.be.true;
            const article = FirebaseEntityDeserializer.deserializeFromJSONString(Article, serialized);
            expect(article.id).eq(_article.id);
        });
    }); 
});