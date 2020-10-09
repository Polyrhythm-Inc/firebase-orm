import { 
    findMeta, 
    ColumnSetting, 
    ClassType, 
    EntityMetaData, 
    _ManyToOneSetting, 
    _OneToManySetting, 
    _OneToOneSetting, 
    _ColumnSetting, 
    _ArrayReference,
    JoinColumnSetting
} from './Entity';
import { FetchOption, getRepository } from "./Repository";
import { DocumentReference, DocumentSnapshot, Query, QuerySnapshot, firestore, Transaction } from './type-mapper';

export type ReferenceWrap = DocumentReference | Query;
export type SnapShotWrap = DocumentSnapshot | QuerySnapshot;

export declare type QueryPartialEntity<T> = {
    [P in keyof T]?: T[P] | (() => string);
};

export declare type QueryDeepPartialEntity<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<QueryDeepPartialEntity<U>> : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<QueryDeepPartialEntity<U>> : QueryDeepPartialEntity<T[P]> | (() => string);
};

export const documentReferencePath = '__firestore_document_reference__';

function isBrowserOptimizedDocumentSnapshot(snapshot: any) {
    return snapshot.data && "exists" in snapshot
}

function isBrowserOptimizedQuerySnapshot(snapshot: any) {
    return snapshot.docs && "size" in snapshot
}

function isBrowserOptimizedDocumentReference(snapshot: any) {
    return snapshot.set && snapshot.delete && snapshot.get;
}

export class SnapShotBox {
    constructor(private snapshot: SnapShotWrap) {}

    unbox() {
        if(this.snapshot instanceof firestore.DocumentSnapshot || isBrowserOptimizedDocumentSnapshot(this.snapshot)) {
            const snapshot = this.snapshot as DocumentSnapshot;
            if(!snapshot.exists) {
                return null;
            }
            return [{...{id: snapshot.id, [documentReferencePath]: snapshot.ref}, ...snapshot.data()}];
        }
        else if(this.snapshot instanceof firestore.QuerySnapshot || isBrowserOptimizedQuerySnapshot(this.snapshot)) {
            if(this.snapshot.size == 0) {
                return [];
            }
            return this.snapshot.docs.map(x => {
                return {...{id: x.id, [documentReferencePath]: x.ref}, ...x.data()};
            });
        }
        return null;
    }
}

export class FirestoreReference<T> {

    constructor(public ref: ReferenceWrap, public transaction?: Transaction) {}

    public async get() {
        if(this.transaction) {
            const box = new SnapShotBox(await this.transaction.get(this.ref as any));
            return box;
        } else {
            return new SnapShotBox(await this.ref.get());
        }
    }

    public async set(params: QueryPartialEntity<T>) {
        if(this.ref instanceof firestore.DocumentReference || isBrowserOptimizedDocumentReference(this.ref)) {
            const ref = this.ref as DocumentReference;
            if(this.transaction) {
                await this.transaction.set(ref, params);
                return;
            } else {
                await ref.set(params);
                return;
            }
        }

        throw new Error('reference should be DocumentReference');
    }
}

export class RelationNotFoundError extends Error {
    public name = 'RelationNotFoundError';

    constructor(public relation: string) {
        super(`relation ${relation} is not exists.`);
        Object.setPrototypeOf(this, RelationNotFoundError.prototype);
    }

    public toString() {
        return this.name + ': ' + this.message;
    }
}

function relationToGroup(relations: string[]) {
    const grouped: {[key: string]: any} = {};

    for(const relation of relations) {
        const comp = relation.split('.');
        if(comp.length == 1) {
            if(!grouped[comp[0]]) {
                grouped[comp[0]] = {};
            }
        } else {
            const top = comp.shift()!;
            if(!grouped[top]) {
                grouped[top] = {};
            }
            Object.assign(grouped[top], relationToGroup([comp.join('.')]));

        }
    }
    return grouped;
}

function groupToRelation(grouped: {[key: string]: any}) {
    const keys = [];
    for(const key in grouped) {
        let relationKey = key;
        const childKey = groupToRelation(grouped[key])[0];
        if(childKey) {
            relationKey += '.' + childKey;
        }
        keys.push(relationKey);
    }
    return keys;
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}

function getName(setting: ColumnSetting|JoinColumnSetting) {
    if(!setting.option) {
        return undefined;
    }
    if(hasOwnProperty(setting.option, 'name')) {
        return setting.option.name as string;
    }
    return undefined;
}

export async function buildEntity<T>(meta: EntityMetaData, data: any, reference: FirestoreReference<T>, options?: FetchOption) {
    const groupedRelations = options?.relations ? relationToGroup(options.relations) : {};
    const plain: {[key: string]: any} = {};

    for(const relation of Object.keys(groupedRelations)) {
        if(!meta.columns.map(x => x.propertyKey).includes(relation)) {
            throw new RelationNotFoundError(relation);
        }
    }
    
    for(const setting of meta.columns) {
        let keyInForestore = getName(setting) || setting.propertyKey;
        if(setting instanceof _ManyToOneSetting) {
            const relation = groupedRelations[setting.propertyKey];
            if(!relation) {
                continue;
            }
            if(setting.option?.joinColumnName) {
                keyInForestore = setting.option.joinColumnName;
            }
            const rawRef = (data as any)[keyInForestore];
            const hierarchy = await followHierarchy({
                setting: setting, 
                relations: {
                    top: setting.propertyKey,
                    hierarchy: relation
                },
                reference: reference,
                fetchMode: {
                    mode: 'ref',
                    reference: rawRef
                }
            });
            Object.assign(plain, hierarchy);
        }
        else if(setting instanceof _OneToManySetting) {
            const relation = groupedRelations[setting.propertyKey];
            if(!relation) {
                continue;
            }
            const hierarchy = await followHierarchy({
                setting: setting, 
                relations: {
                    top: setting.propertyKey,
                    hierarchy: relation
                },
                reference: reference,
                fetchMode: {
                    mode: 'many'
                }
            });
            Object.assign(plain, hierarchy);
        }
        else if(setting instanceof _OneToOneSetting) {
            const relation = groupedRelations[setting.propertyKey];
            if(!relation) {
                continue;
            }
            if(setting.option?.joinColumnName) {
                keyInForestore = setting.option.joinColumnName;
                const rawRef = (data as any)[keyInForestore];
                const hierarchy = await followHierarchy({
                    setting: setting, 
                    relations: {
                        top: setting.propertyKey,
                        hierarchy: relation
                    },
                    reference: reference,
                    fetchMode: {
                        mode: 'ref',
                        reference: rawRef
                    }
                });
                Object.assign(plain, hierarchy);
            } else if(setting.option?.relationColumn) {
                const hierarchy = await followHierarchy({
                    setting: setting, 
                    relations: {
                        top: setting.propertyKey,
                        hierarchy: relation
                    },
                    reference: reference,
                    fetchMode: {
                        mode: 'single',
                        reference: data[documentReferencePath]
                    }
                });
                Object.assign(plain, hierarchy);
            }
        } else if(setting instanceof _ArrayReference) {
            const relation = groupedRelations[setting.propertyKey];
            if(!relation) {
                continue;
            }
            const hierarchy = await followHierarchy({
                setting: setting, 
                relations: {
                    top: setting.propertyKey,
                    hierarchy: relation
                },
                reference: reference,
                fetchMode: {
                    mode: 'array',
                    references: data[keyInForestore]
                }
            });
            Object.assign(plain, hierarchy);
        } else {
            plain[setting.propertyKey] = (data as any)[keyInForestore];
        }
    }
    const instance = new (meta.Entity as any)();
    for(const key in plain) {
        instance[key] = plain[key];
    }
    instance[documentReferencePath] = data[documentReferencePath];
    return instance;
}   


async function followHierarchy<T>(params: {
    setting: JoinColumnSetting & {getEntity: () => ClassType<T & {id: string}>}, 
    relations: {
        top: string,
        hierarchy?: {[key: string]: any}
    },
    fetchMode: {
        mode: 'ref',
        reference: ReferenceWrap
    }|{
        mode: 'single',
        reference: ReferenceWrap
    }|{
        mode: 'many'
    }|{
        mode: 'array',
        references: ReferenceWrap[]
    },
    reference?: FirestoreReference<T>,
}) {
    const results: {[key: string]: any} = {};

    switch(params.fetchMode.mode)  {
    case 'ref':
        const ref = new FirestoreReference(params.fetchMode.reference, params.reference?.transaction);
        const box = await ref.get();
        const unboxed = box.unbox();
        if(unboxed && unboxed[0]) {
            const meta = findMeta(params.setting.getEntity());
            results[params.setting.propertyKey] = await buildEntity(meta, unboxed[0], ref, {relations: groupToRelation(params.relations.hierarchy || {})})
        }
        break;

    case 'single':
        const singleRef = params.fetchMode.reference;
        const singlRepo = getRepository(params.setting.getEntity());
        if(params.reference?.transaction) {
            singlRepo.setTransaction(params.reference.transaction);
        }
        results[params.setting.propertyKey] = await singlRepo.prepareFetcher(db => {
            return db.where(params.setting.option!.relationColumn!, '==',  singleRef);
        }).fetchOne({
            relations: groupToRelation(params.relations.hierarchy || {})
        });
        break;

    case 'many':
        const manyRepo = getRepository(params.setting.getEntity());
        if(params.reference?.transaction) {
            manyRepo.setTransaction(params.reference?.transaction);
        }
        results[params.setting.propertyKey] = await manyRepo.prepareFetcher(db => {
            return db.where(params.setting.option!.relationColumn!, '==', params.reference?.ref);
        }).fetchAll({
            relations: groupToRelation(params.relations.hierarchy || {})
        });
        break;

    case 'array':
        const refs = params.fetchMode.references.map(ref => new FirestoreReference(ref, params.reference?.transaction))
        results[params.setting.propertyKey] = await Promise.all(refs.map(ref => {
            return ref.get().then(box => {
                const unboxed = box.unbox();
                if(unboxed && unboxed[0]) {
                    const meta = findMeta(params.setting.getEntity());
                    return buildEntity(meta, unboxed[0], ref, {relations: groupToRelation(params.relations.hierarchy || {})});
                }     
                return null;
            })
        }));
        break;
    }

    return results;
}