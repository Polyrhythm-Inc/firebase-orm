import 'mocha';
import * as admin from 'firebase-admin';
import { addDBToPool, getCurrentDB, getRepository, runTransaction, use } from "../Repository";
import { User } from '../examples/entity/User';
import { ArticleStat } from '../examples/entity/ArticleStat';
import { Article } from '../examples/entity/Article';
import { Category } from '../examples/entity/Category';
import { expect } from 'chai';

const serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-e1dd189e07.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://polyrhythm-dev-example.firebaseio.com"
});

const db = admin.firestore();

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
}

function createUser(params?: {id?: string; name?: string}) {
    const user = new User();
    user.id = params?.id || '1';
    user.name = params?.name || 'test-user';
    return getRepository(User).save(user);
}

describe('Repository test', async () => {
    before(async () => {
        
    });

    beforeEach(async () => {
        await cleanTables();
    });

    afterEach(async () => {
        
    });

    after(async () => {
        
    });

    context('simple CRUD', () => {
        it("should perform CRUD", async () => {
            const user = await createUser();
            const repo = getRepository(User);

            expect((await repo.fetchOneById(user.id))?.id).eq(user.id);

            user.name = 'updated';
            await repo.save(user);

            expect((await repo.fetchOneById(user.id))?.name).eq('updated');

            await repo.delete(user);
            expect((await repo.fetchOneById(user.id))).to.be.null;
        });
    });

    context('relations', () => {
        it("should save related data and fetch them.", async () => {
            await runTransaction(async manager => {
                const user = new User();
                user.id = '1';
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const category = new Category();
                category.id = '1';
                category.name = 'math';
                await manager.getRepository(Category).save(category);

                const article = new Article();
                article.id = '2';
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;
                article.category = category;

                await manager.getRepository(Article).save(article);

                const articleStat = new ArticleStat();
                articleStat.id = '1';
                articleStat.article = article;
                articleStat.numOfViews = 100;

                await manager.getRepository(ArticleStat).save(articleStat);
            });

            const user = await getRepository(User).fetchOneById("1", {
                relations: ['articles.category', 'articles.stat']
            });

            expect(user?.articles.length).eq(1);
            expect(user?.articles[0]).haveOwnProperty('stat');
            expect(user?.articles[0]).haveOwnProperty('category');
        });
    });    
});