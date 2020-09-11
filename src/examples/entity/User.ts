import { Column, OneToMany, PrimaryColumn, FirebaseEntity} from "../../Entity";
import { Article } from './Article';

@FirebaseEntity('users')
export class User {
    @PrimaryColumn()
    id: string;
    
    @Column()
    name: string;

    @OneToMany(Article)
    articles: Article[];
}