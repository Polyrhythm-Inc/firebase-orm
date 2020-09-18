import { Column, OneToMany, PrimaryColumn, FirebaseEntity, ManyToOne} from "../../Entity";

@FirebaseEntity('categories')
export class Category {
    @PrimaryColumn()
    id: string;
    
    @Column()
    name: string;
}