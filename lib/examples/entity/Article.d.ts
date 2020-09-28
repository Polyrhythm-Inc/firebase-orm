import { ArticleStat } from "./ArticleStat";
import { Category } from "./Category";
import { User } from './User';
export declare class Article {
    id: string;
    title: string;
    user: User;
    stat: ArticleStat;
    category: Category;
    contentText: string;
}
