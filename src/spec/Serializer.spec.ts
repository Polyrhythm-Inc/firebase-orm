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
import { findMeta } from '../Entity';
import { execSync } from 'child_process';
import { ArticleCommentLike } from '../examples/entity/ArticleCommentLike';

const serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-e1dd189e07.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://polyrhythm-dev-example.firebaseio.com"
});

const db = admin.firestore();

function getInitialData(): Promise<[Article, ArticleStat, ArticleComment, ArticleCommentLike]> {
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
        article.postedAt = admin.firestore.Timestamp.now();

        await manager.getRepository(Article).save(article);

        const articleStat = new ArticleStat();
        articleStat.article = article;
        articleStat.numOfViews = 100;

        await manager.getRepository(ArticleStat).save(articleStat);

        const articleComment = new ArticleComment();
        articleComment.text = 'hello';           
        
        await manager.getRepository(ArticleComment, {parentIdMapper: (Entity) => {
            switch(Entity) {
            case Article:
                return article.id;
            }
            throw new Error(`Unknonwn Entity ${Entity.name}`);
        }}).save(articleComment);

        const like = new ArticleCommentLike();
        like.count = 100;

        await manager.getRepository(ArticleCommentLike, {parentIdMapper: (Entity) => {
            switch(Entity) {
            case Article:
                return article.id;
            case ArticleComment:
                return articleComment.id
            }
            throw new Error(`Unknonwn Entity ${Entity.name}`);
        }}).save(like);        

        return [article, articleStat, articleComment, like];
    });
}

addDBToPool('default', db);
use('default');

async function deleteAllData<T extends {id: string}>(Entity: new () => T) {
    execSync(`firebase firestore:delete ${findMeta(Entity).tableName} -r --project polyrhythm-dev-example -y`);
}

async function cleanTables() {
    await deleteAllData(User);
    await deleteAllData(Article);
    await deleteAllData(ArticleStat);
    await deleteAllData(Category);
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
            const [article, articleStat, articleComment, like] = await getInitialData();
        
            const articleJson = FirebaseEntitySerializer.serializeToJSON(article);
            expect(articleJson).haveOwnProperty(referenceCluePath);
            expect(articleJson.user).haveOwnProperty(referenceCluePath);
            expect(articleJson.categories[0]).haveOwnProperty(referenceCluePath);

            const articleStatJson = FirebaseEntitySerializer.serializeToJSON(articleStat);
            expect(articleStatJson).haveOwnProperty(referenceCluePath);

            const commnetJSON = FirebaseEntitySerializer.serializeToJSON(articleComment, (Entity) => {
                switch(Entity) {
                case Article:
                    return article.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);                
            });
            expect(commnetJSON).haveOwnProperty(referenceCluePath).to.haveOwnProperty('parent');

            const likeJSON = FirebaseEntitySerializer.serializeToJSON(like, (Entity) => {
                switch(Entity) {
                case Article:
                    return article.id;
                case ArticleComment:
                    return articleComment.id
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);                
            });
            expect(likeJSON).haveOwnProperty(referenceCluePath).to.haveOwnProperty('parent').to.haveOwnProperty('child');
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
            const [_article, _articleStat, _articleComment, _like] = await getInitialData();
        
            const articleJson = FirebaseEntitySerializer.serializeToJSON(_article);
            const commnetJSON = FirebaseEntitySerializer.serializeToJSON(_articleComment, (Entity) => {
                switch(Entity) {
                case Article:
                    return _article.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);                
            });

            const likeJSON = FirebaseEntitySerializer.serializeToJSON(_like, (Entity) => {
                switch(Entity) {
                case Article:
                    return _article.id;
                case ArticleComment:
                    return _articleComment.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);                
            });            

            const article = FirebaseEntityDeserializer.deserializeFromJSON(Article, articleJson);
            expect(article).haveOwnProperty(documentReferencePath);
            expect(article.user).haveOwnProperty(documentReferencePath);
            expect(article.categories[0]).haveOwnProperty(documentReferencePath);

            const stat = FirebaseEntityDeserializer.deserializeFromJSON(ArticleStat, _articleStat);
            expect(stat).haveOwnProperty(documentReferencePath);

            const comment = FirebaseEntityDeserializer.deserializeFromJSON(ArticleComment, commnetJSON, (Entity) => {
                switch(Entity) {
                case Article:
                    return article.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);                
            });
            expect(comment).haveOwnProperty(documentReferencePath);

            const like = FirebaseEntityDeserializer.deserializeFromJSON(ArticleCommentLike, likeJSON, (Entity) => {
                switch(Entity) {
                case Article:
                    return _article.id;
                case ArticleComment:
                    return _articleComment.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);                
            });
            expect(like).haveOwnProperty(documentReferencePath);
        });

        it("should failed to deserialize articleComment without parentId", async () => {
            const [_1, _2, articleComment] = await getInitialData();

            try {
                FirebaseEntityDeserializer.deserializeFromJSON(ArticleComment, articleComment);
                throw new Error('never reached here');
            } catch {}
        });        

        it("should deserialize article from json string", async () => {
            const [_article, _1, _2, _3] = await getInitialData();

            const serialized = FirebaseEntitySerializer.serializeToJSONString(_article);
            expect(typeof serialized == "string").to.be.true;
            const article = FirebaseEntityDeserializer.deserializeFromJSONString(Article, serialized);
            expect(article.id).eq(_article.id);
        });

        it("should serialize/deserialize article with timestamp type converts", async () => {
            const [article, _1, _2, _3] = await getInitialData();
        
            const serialized = FirebaseEntitySerializer.serializeToJSON(article, undefined, {
                timeStampToString: true
            });

            expect(typeof serialized.postedAt).eq('string');

            const deserialized = FirebaseEntityDeserializer.deserializeFromJSON(Article, serialized, undefined, {
                stringToTimeStamp: true
            });
            expect(deserialized.postedAt.seconds).eq(article.postedAt.seconds);
        });
    }); 
});