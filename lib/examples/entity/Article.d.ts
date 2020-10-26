import { ArticleStat } from "./ArticleStat";
import { Category } from "./Category";
import { User } from './User';
import { firestore } from 'firebase-admin';
export declare class Article {
    id: string;
    beforeSave(): void;
    afterSave(): void;
    afterLoad(): void;
    title: string;
    user: User;
    stat: ArticleStat;
    categories: Category[];
    contentText: string;
    postedAt: firestore.Timestamp;
}
