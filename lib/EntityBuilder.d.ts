import { EntityMetaData } from './Entity';
import { FetchOption } from "./Repository";
import { DocumentReference, DocumentSnapshot, Query, QuerySnapshot } from './type-mapper';
export declare type ReferenceWrap = DocumentReference | Query;
export declare type SnapShotWrap = DocumentSnapshot | QuerySnapshot;
export declare type QueryPartialEntity<T> = {
    [P in keyof T]?: T[P] | (() => string);
};
export declare type QueryDeepPartialEntity<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<QueryDeepPartialEntity<U>> : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<QueryDeepPartialEntity<U>> : QueryDeepPartialEntity<T[P]> | (() => string);
};
export declare const documentReferencePath = "__firestore_document_reference__";
export declare class SnapShotBox {
    private snapshot;
    constructor(snapshot: SnapShotWrap);
    unbox(): {
        id: string;
        __firestore_document_reference__: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
    }[] | null;
}
export declare class FirestoreReference<T> {
    ref: ReferenceWrap;
    transaction?: FirebaseFirestore.Transaction | undefined;
    constructor(ref: ReferenceWrap, transaction?: FirebaseFirestore.Transaction | undefined);
    get(): Promise<SnapShotBox>;
    set(params: QueryPartialEntity<T>): Promise<void>;
}
export declare class RelationNotFoundError extends Error {
    relation: string;
    name: string;
    constructor(relation: string);
    toString(): string;
}
export declare function buildEntity<T>(meta: EntityMetaData, data: any, reference: FirestoreReference<T>, options?: FetchOption): Promise<any>;
