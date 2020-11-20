import * as admin from 'firebase-admin';
import { addDBToPool, getCurrentDB, getRepository, runTransaction, use } from "../Repository";
import { User } from "./entity/User";
import { ArticleStat } from "./entity/ArticleStat";
import { Article } from './entity/Article';
import { Category } from './entity/Category';
import { FirebaseEntityDeserializer, FirebaseEntitySerializer } from '../Serializer';
import { ArticleComment } from './entity/ArticleComment';

(async () => {
    const serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-e1dd189e07.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://polyrhythm-dev-example.firebaseio.com"
    });
    const db = admin.firestore();

    addDBToPool('default', db);
    use('default');

    const [article, comment] = await runTransaction(async manager => {
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
        
        await manager.getRepository(ArticleComment, {parentIdMapper: (_) => {
            return article.id;
        }}).save(articleComment);

        return [article, articleComment];
    });

    const json = FirebaseEntitySerializer.serializeToJSON(article);

    const instance = FirebaseEntityDeserializer.deserializeFromJSON(Article, json);
    console.log(instance);
})();