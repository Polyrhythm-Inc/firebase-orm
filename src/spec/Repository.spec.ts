import 'mocha';
import * as admin from 'firebase-admin';
import { addDBToPool, getRepository, Repository, runTransaction, takeDBFromPool, use } from "../Repository";
import { User } from '../examples/entity/User';
import { ArticleStat } from '../examples/entity/ArticleStat';
import { Article } from '../examples/entity/Article';
import { Category } from '../examples/entity/Category';
import { expect } from 'chai';
import { EventEmitter } from 'events';
import { ArticleComment } from '../examples/entity/ArticleComment';
import { PureReference } from '..';
import { RecordNotFoundError } from '../Error';
import { ArticleCommentLike } from '../examples/entity/ArticleCommentLike';
import { execSync } from 'child_process';
import { findMeta } from '../Entity';

const serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-272223a77d.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

function getRandomIntString(max: number = 1000) {
    return Math.floor(Math.random() * Math.floor(max)).toString();
}

addDBToPool('default', db);
use('default');

async function deleteAllData<T extends {id: string}>(Entity: new () => T) {
    execSync(`firebase firestore:delete ${findMeta(Entity).tableName} -r --project ${serviceAccount.project_id} -y`);
}

async function cleanTables() {
    await deleteAllData(User);
    await deleteAllData(Article);
    await deleteAllData(ArticleStat);
    await deleteAllData(Category);
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

    context('AutoGenerated ID', () => {
        it('should attach autogenerated id to the resource if the id is not provided', async () => {
            const user = new User();
            user.name = 'hoge';
            await getRepository(User).save(user);
            expect(user.id).to.not.undefined;
            expect(user.id).to.not.null;
            expect(user.id).to.not.empty;
        });
    });

    context('simple CRUD', () => {
        it("should perform simple CRUD", async () => {
            const repo = getRepository(User);

            // create
            const user = new User();
            user.id = getRandomIntString();
            user.name = 'test-user';
            user.age = 30;
            await repo.save(user);

            // fetch
            expect((await repo.fetchOneById(user.id))?.id).eq(user.id);

            // partial fields update
            await repo.update(user, {
                name: 'updated'
            });

            const fetched = await repo.fetchOneById(user.id);
            expect(fetched?.name).eq('updated');
            expect(fetched?.age).eq(30); // keep old

            // delete
            await repo.delete(user);
            expect((await repo.fetchOneById(user.id))).to.be.null;
        });

        it("should update value as null", async () => {
            const repo = getRepository(User);

            // create
            const user = new User();
            user.id = getRandomIntString();
            user.name = 'test-user';
            user.age = 30;
            user.description = "this is test";
            await repo.save(user);

            await repo.update(user, {
                description: null
            });
            expect(user.description).to.be.null;
        });
    });

    context('relations', () => {
        it("Many to One", async () => {
            const article = await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;

                await manager.getRepository(Article).save(article);

                return article;
            });            

            const item = await getRepository(Article).fetchOneById(article.id, {
                relations: ['user']
            });

            expect(item?.id).eq(article.id);
            expect(article?.user.id).eq(article.user.id);
        });

        it("One to One", async () => {
            const article = await runTransaction(async manager => {
                const stat = new ArticleStat();
                stat.id = getRandomIntString();
                stat.numOfViews = 10000;
                await manager.getRepository(ArticleStat).save(stat);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.stat = stat;

                await manager.getRepository(Article).save(article);

                return article;
            });            

            const item = await getRepository(Article).fetchOneById(article.id, {
                relations: ['stat']
            });

            expect(item?.id).eq(article.id);
            expect(article?.stat.id).eq(article.stat.id);
        });   
        
        it("One to Many", async () => {
            const article = await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;

                await manager.getRepository(Article).save(article);

                return article;
            });            

            const user = await getRepository(User).fetchOneById(article.user.id, {
                relations: ['articles']
            });

            expect(user?.id).eq(article.user.id);
            expect(user?.articles[0].id).eq(article.id);
        });     
        
        it("ArrayreReference", async () => {
            const user = new User();
            user.id = getRandomIntString();
            user.name = 'test-user';
            await getRepository(User).save(user);

            const category = new Category();
            category.id = getRandomIntString();
            category.name = 'math';
            await getRepository(Category).save(category);

            const article = new Article();
            article.id = getRandomIntString();
            article.title = 'title';
            article.contentText = 'bodybody';
            article.user = user;
            article.categories = [category];
            await getRepository(Article).save(article);            

            const result = await getRepository(Article).prepareFetcher(db => {
                return db.where('categories', 'array-contains', PureReference(category))
            }).fetchAll({
                relations: ['categories']
            });

            expect(result[0].categories[0].id).eq(category.id);
        });             

        it("should fetch nested relation data", async () => {
            const userId = await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const category = new Category();
                category.id = getRandomIntString();
                category.name = 'math';
                await manager.getRepository(Category).save(category);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;
                article.categories = [category];

                await manager.getRepository(Article).save(article);

                const articleStat = new ArticleStat();
                articleStat.id = getRandomIntString();
                articleStat.article = article;
                articleStat.numOfViews = 100;

                await manager.getRepository(ArticleStat).save(articleStat);

                return user.id;
            });

            const user = await getRepository(User).fetchOneById(userId, {
                relations: ['articles.categories', 'articles.stat']
            });

            expect(user?.articles.length).eq(1);
            expect(user?.articles[0]).haveOwnProperty('stat');
            expect(user?.articles[0]).haveOwnProperty('categories');
        });

        it("fetchOneByIdOrFail", async () => {
            const repo = getRepository(User);

            // create
            const user = new User();
            user.id = getRandomIntString();
            user.name = 'test-user';
            await repo.save(user);

            // fetch
            expect((await repo.fetchOneByIdOrFail(user.id))?.id).eq(user.id);

            try {
                await repo.fetchOneByIdOrFail("100000000000000");
                throw new Error('never reached here.');
            } catch(e) {
                expect(e).instanceOf(RecordNotFoundError);
            }
        });   
    });

    context('transactions', () => {
        it("should update resource partially", async () => {
            const user = await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                user.age = 30;
                await manager.getRepository(User).save(user);

                await manager.getRepository(User).update(user, {
                    name: 'updated'
                })

                return user;
            });

            const fetched = await getRepository(User).fetchOneById(user.id);
            expect(fetched?.name).eq('updated');
            expect(fetched?.age).eq(30); // keep old
        });

        it("should rollback creation", async () => {
            try {
                await runTransaction(async manager => {
                    const user = new User();
                    user.id = getRandomIntString();
                    user.name = 'test-user';
                    await manager.getRepository(User).save(user);

                    const article = new Article();
                    article.id = getRandomIntString();
                    article.title = 'title';
                    article.contentText = 'bodybody';
                    article.user = user;

                    await manager.getRepository(Article).save(article);

                    throw new Error('rollback');
                });            
            } catch(e) {
                const users = await getRepository(User).fetchAll();
                const articles = await getRepository(Article).fetchAll();
                expect(users.length).eq(0);
                expect(articles.length).eq(0);
            }
        });

        it("should rollback deletion", async () => {
            const userId = getRandomIntString();
            const user = new User();
            user.id = userId;
            user.name = 'test-user';
            await getRepository(User).save(user);            
            try {
                await runTransaction(async manager => {
                    const user = await manager.getRepository(User).fetchOneById(userId);
                    await manager.getRepository(User).delete(user!);
                    throw new Error('rollback');
                });            
            } catch(e) {
                const user = await getRepository(User).fetchOneById(userId);
                expect(user?.id).eq(userId);
            }
        });        
    });

    context('nestedCollection', () => {
        it("should perform curd for nested collection", async () => {
            const result = await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;

                await manager.getRepository(Article).save(article);

                const articleComment = new ArticleComment();
                articleComment.id = getRandomIntString();
                articleComment.text = 'hello';
                
                await manager.getRepository(ArticleComment, {parentIdMapper: (Entity) => {
                    switch(Entity) {
                    case Article:
                        return article.id;
                    }
                    throw new Error(`Unknonwn Entity ${Entity.name}`);
                }}).save(articleComment);

                return [article, articleComment];
            });

            const article = result[0] as Article;

            const commentRepo = getRepository(ArticleComment, {parentIdMapper: (Entity) => {
                switch(Entity) {
                case Article:
                    return article.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);
            }});

            let comments = await commentRepo.fetchAll();
            expect(comments.length).eq(1);

            let comment = comments[0];
            comment.text = 'updated';
            await commentRepo.save(comment);

            comments = await commentRepo.fetchAll();
            comment = comments[0];
            expect(comment.text).eq("updated");

            const likeRepo = await getRepository(ArticleCommentLike, {parentIdMapper: (Entity) => {
                switch(Entity) {
                case Article:
                    return article.id;
                case ArticleComment:
                    return comment.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);
            }});

            const like = new ArticleCommentLike();
            like.count = 100;
            await likeRepo.save(like);

            let likes = await likeRepo.fetchAll();
            expect(likes.length).eq(1);

            /**
             * Delete
             */
            await likeRepo.delete(like);
            likes = await likeRepo.fetchAll();
            expect(likes.length).eq(0);

            await commentRepo.delete(comment);
            comments = await commentRepo.fetchAll();
            expect(comments.length).eq(0);
        })
    });

    context('Multiple connections', () => {
        async function saveTestData(repos: Repository<User>[]) {
            let i = 1;
            for(const repo of repos) {
                let user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user' + i.toString();
                user.age = 30;
                await repo.save(user);
                i++;
            }
        }

        it("Should perform read/write with specified db", async () => {
            addDBToPool('con1', db);
            addDBToPool('con2', db);

            const repo1 = getRepository(User, undefined, takeDBFromPool('con1'));
            const repo2 = getRepository(User, undefined, takeDBFromPool('con2'));

            await saveTestData([repo1, repo2]);

            const results = await Promise.all([
                repo1.fetchAll(),
                repo2.fetchAll()
            ]);

            results.forEach(r => {
                expect(r.length).eq(2)
            });
        });

        it("Should perform write with specified db in transaction", async () => {
            addDBToPool('con1', db);
            addDBToPool('con2', db);

            await runTransaction(async manager => {
                const repo1 = manager.getRepository(User, undefined, takeDBFromPool('con1'));
                const repo2 = manager.getRepository(User, undefined, takeDBFromPool('con2'));
                await saveTestData([repo1, repo2]);
            });
        });
    });    

    context('onSnapshot', () => {
        it("should sync snap shot with relations", async () => {
            const evm = new EventEmitter();
            let phase = 1;

            const unsubscribe = getRepository(User).prepareFetcher(db => {
                return db.limit(5);
            }).onSnapShot(async result => {
                const type = result.type;
                switch(phase) {
                case 1:
                    expect(type).eq('added');
                    const user = result.item;
                    expect(user?.articles.length).eq(1);
                    expect(user?.articles[0]).haveOwnProperty('stat');
                    expect(user?.articles[0]).haveOwnProperty('categories');
                    phase++;
                    evm.emit(phase.toString(), result.item);
                    break;

                case 2:
                    expect(type).eq('modified');
                    phase++;
                    evm.emit(phase.toString(), result.item);                    
                    break;

                case 3:
                    expect(type).eq('removed');
                    expect(result.id).to.not.empty;
                    unsubscribe();
                    break;
                }
            }, {
                relations: ['articles.categories', 'articles.stat']
            });

            // phase 1
            await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const category = new Category();
                category.id = getRandomIntString();
                category.name = 'math';
                await manager.getRepository(Category).save(category);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;
                article.categories = [category];

                await manager.getRepository(Article).save(article);

                const articleStat = new ArticleStat();
                articleStat.id = getRandomIntString();
                articleStat.article = article;
                articleStat.numOfViews = 100;

                await manager.getRepository(ArticleStat).save(articleStat);
            });

            evm.on('2', async (user: User) => {
                user.name = 'updated';
                await getRepository(User).save(user);
            });

            evm.on('3', async (user: User) => {
                await getRepository(User).delete(user);
            }); 
        });
    });
});