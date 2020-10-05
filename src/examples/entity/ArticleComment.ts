import { Column, PrimaryColumn, NestedFirebaseEntity} from "../../Entity";
import { Article } from "./Article";

@NestedFirebaseEntity(() => Article, 'article_comments')
export class ArticleComment {
    @PrimaryColumn()
    id: string;

    @Column()
    text: string;
}