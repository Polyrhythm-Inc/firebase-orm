import { Column, PrimaryColumn, NestedFirebaseEntity} from "../../Entity";
import { Article } from "./Article";

@NestedFirebaseEntity('article_comments', () => Article)
export class ArticleComment {
    @PrimaryColumn()
    id: string;

    @Column()
    text: string;
}