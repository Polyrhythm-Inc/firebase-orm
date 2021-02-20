import { Article } from './Article';
export declare class User {
    id: string;
    name: string;
    age: number;
    description?: string | null;
    articles: Article[];
}
