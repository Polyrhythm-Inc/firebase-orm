import { Column, OneToMany, PrimaryColumn, FirebaseEntity, ManyToOne, OneToOne} from "../../Entity";
import { Article } from "./Article";

@FirebaseEntity('article_stats')
export class ArticleStat {
    @PrimaryColumn()
    id: string;

    @OneToOne(() => Article, {joinColumnName: 'article_id'})
    article: Article;

    @Column({name: 'num_of_views'})
    numOfViews: number;
}