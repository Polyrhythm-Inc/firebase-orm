import * as admin from 'firebase-admin';
import { addDBToPool, getRepository, runTransaction, use } from "../Repository";
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

    const user = await getRepository(User).prepareFetcher(db => {
        return db.where('name', '==', 'noppoman');
    }).fetchOne({relations: ['articles.category', 'articles.stat']});
    console.log(user);

    const stat = await getRepository(ArticleStat).prepareFetcher(db => {
        return db.doc("1");
    }).fetchOne({relations: ['article.category']});
    console.log(stat);

    const article = await getRepository(Article).fetchOneById("1", {relations: ['category']});
    console.log(article);

    const users = await getRepository(User).fetchAll({relations: ['articles']});
    console.log(users);

    await runTransaction(async manager => {
        const article = new Article();
        console.log(article);
        // manager.getRepository(Article);
    });
})();