import { addDBToPool, getRepository } from "../Repository";
import { Article } from "./entity/Article";
import { User } from "./entity/User";
import * as admin from 'firebase-admin';
import { columnSettings } from "../Entity";

(async () => {
    const serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-e1dd189e07.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://polyrhythm-dev-example.firebaseio.com"
    });
    const db = admin.firestore();

    addDBToPool('default', db);

    const user = await getRepository(User).prepareFetcher(db => {
        return db.doc("1");
    }).fetchOne();
    console.log(user);

    const users = await getRepository(User).prepareFetcher(db => {
        return db;
    }).fetchAll();
    console.log(users);

    const article = await getRepository(Article).prepareFetcher(db => {
        return db.doc("1");
    }).fetchOne({relations: ['user']});
    console.log(article);
})();