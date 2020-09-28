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

    getRepository(User).prepareFetcher(db => {
        return db.limit(5);
    }).onSnapShot(async result => {
        if(result.type === "added") {
            console.log(result.item);
        }
    }, {
        relations: ['articles']
    });
})();