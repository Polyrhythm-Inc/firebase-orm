import { Column, OneToMany, PrimaryColumn, FirebaseEntity} from "../../Entity";
import { Article } from './Article';

@FirebaseEntity('users')
export class User {
    @PrimaryColumn()
    id: string;
    
    @Column()
    name: string;

    @Column()
    age: number;

    @OneToMany(() => Article, {relationColumn: 'user_id'})
    articles: Article[];
}