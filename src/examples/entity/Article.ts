import { Column, PrimaryColumn, FirebaseEntity, ManyToOne, OneToOne, ArrayReference, BeforeSave, AfterSave, AfterLoad} from "../../Entity";
import { ArticleStat } from "./ArticleStat";
import { Category } from "./Category";
import { User } from './User';

@FirebaseEntity('articles')
export class Article {
    @PrimaryColumn()
    id: string;

    @BeforeSave()
    beforeSave() {
        console.log('before save');
    }

    @AfterSave()
    afterSave() {
        console.log('after save');
    }

    @AfterLoad()
    afterLoad() {
        console.log('after load');
    }

    @Column()
    title: string;

    @ManyToOne(() => User, {joinColumnName: 'user_id'})
    user: User;

    @OneToOne(() => ArticleStat, {relationColumn: 'article_id'})
    stat: ArticleStat;
    
    @ArrayReference(() => Category, {joinColumnName: 'categories'})
    categories: Category[];

    @Column({name: "content_text"})
    contentText: string;
}