import { Column, OneToMany, PrimaryColumn, FirebaseEntity, ManyToOne} from "../../Entity";
import { User } from './User';

@FirebaseEntity('articles')
export class Article {
    @PrimaryColumn()
    id: string;
    
    @ManyToOne(User, {name: "user_id"})
    user: User;

    @Column()
    title: string;

    @Column({name: "content_text"})
    contentText: string;
}