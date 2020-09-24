import * as admin from 'firebase-admin';
import { addDBToPool, getCurrentDB, getRepository, runTransaction, use } from "../Repository";
import { User } from "./entity/User";
import { ArticleStat } from "./entity/ArticleStat";
import { Article } from './entity/Article';

(async () => {
    const serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-e1dd189e07.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://polyrhythm-dev-example.firebaseio.com"
    });
    const db = admin.firestore();

    addDBToPool('default', db);
    use('default');

    // const user = await getRepository(User).buildQuery(db => {
    //     return db.where('name', '==', 'たけちゃん');
    // }).fetchOne({relations: ['articles.category', 'articles.stat']});
    // console.log(user);
    
    // await getRepository(User).prepareFetcher(db => {
    //     return db.where('name', '==', 'たけちゃん');
    // }).fetchOne();

    // トランザクション新規
    await runTransaction(async manager => {
        const user = new User();
        user.id = '3';
        user.name = 'foo';
        await manager.getRepository(User).save(user);
    
        const article = new Article();
        article.id = '3';
        article.title = 'title';
        article.contentText = 'bodybody';
        article.user = user;
        await manager.getRepository(Article).save(article);
    });

    // トランザクション更新
    await runTransaction(async manager => {
        const user = await manager.getRepository(User).prepareFetcher(db => {
            return db.doc('1');
        }).fetchOne({relations: ['articles']});

        if(!user) {
            return;
        }
        user.name = 'noppoman2';
        await manager.getRepository(User).save(user);

        const article = user.articles[0];
        article.title = '更新しました';
        await manager.getRepository(Article).save(article);
    });
})();