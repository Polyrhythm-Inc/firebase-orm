import { Column, PrimaryColumn, NestedFirebaseEntity} from "../../Entity";
import { Article } from "./Article";
import { ArticleComment } from "./ArticleComment";

@NestedFirebaseEntity('article_comment_likes', () => Article, () => ArticleComment)
export class ArticleCommentLike {
    @PrimaryColumn()
    id: string;

    @Column()
    count: number;
}