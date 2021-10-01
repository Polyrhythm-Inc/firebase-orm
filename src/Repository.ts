import { findMeta, ClassType, EntityMetaData, _ManyToOneSetting, _OneToManySetting, _OneToOneSetting, _ColumnSetting, _ArrayReference, callHook } from './Entity';
import { buildEntity, ReferenceWrap, FirestoreReference, documentReferencePath, QueryPartialEntity } from './EntityBuilder';
import { RecordNotFoundError } from './Error';
import { Firestore, CollectionReference, DocumentReference, Transaction, DocumentChangeType, Query } from './type-mapper';

export type FetchOption = {
    relations: string[];
}

export type OnsnapShotResult<T> = {
    type: DocumentChangeType;
    id: string;
    item?: T
};

export class Fetcher<T> {
    constructor(private meta: EntityMetaData, private ref: FirestoreReference<T>) {}

    public async fetchOne(options?: FetchOption): Promise<T|null> {
        const result = await this.ref.get();
        const unoboxed = result.unbox();
        if(!unoboxed || !unoboxed[0]) {
            return null;
        }
        const resource = buildEntity(this.meta, unoboxed[0], this.ref, options);
        callHook(this.meta, resource, 'afterLoad')
        return resource;
    }

    public async fetchOneOrFail(options?: FetchOption): Promise<T> {
        const item = await this.fetchOne(options)
        if(!item) {
            throw new RecordNotFoundError(this.meta.Entity);
        }
        return item;
    }    

    public async fetchAll(options?: FetchOption): Promise<T[]> {
        const result = await this.ref.get();
        const docs = result.unbox();
        if(!docs) {
            return [];
        }
        const results: T[] = [];
        for(const data of docs) {
            const resource = await buildEntity(this.meta, data, this.ref, options as any);
            callHook(this.meta, resource, 'afterLoad')
            results.push(resource);
        }
        return results;
    }

    public onSnapShot(callback: (result: OnsnapShotResult<T>) => Promise<void>, options?: FetchOption) {
        const unsubscribe = (this.ref.ref as Query).onSnapshot(async snapshot => {
            for(const change of snapshot.docChanges()) {
                const ref = new FirestoreReference(change.doc.ref);
                const result = await ref.get();
                const unoboxed = result.unbox();
                if(!unoboxed || !unoboxed[0]) {
                    callback({
                        type: change.type,
                        id: (ref.ref as DocumentReference).id
                    });                    
                } else {
                    const resource = await buildEntity(this.meta, unoboxed[0], ref, options as any);
                    callHook(this.meta, resource, 'afterLoad')
                    callback({
                        type: change.type,
                        id: (ref.ref as DocumentReference).id,
                        item: resource
                    });
                }
            }
        });
        
        return unsubscribe;
    }
}

const dbPool: {[key: string]: Firestore} = {};
let currentConnectionName: string|null = null;

export function addDBToPool(name: string, db: Firestore) {
    if(!currentConnectionName) {
        currentConnectionName = name;
    }
    dbPool[name] = db;
}

export function use(name: string) {
    const keys = Object.keys(dbPool);
    if(!keys.includes(name)) {
        throw new Error(`Could not find db named: ${name}`);
    }
    currentConnectionName = name;
}

export function takeDBFromPool(name: string) {
    return dbPool[name];
}

export function getCurrentDB(): Firestore {
    return dbPool[currentConnectionName!];
}

function createSavingParams(meta: EntityMetaData, resource: any) {
    const savingParams: {[key: string]: any} = {};

    for(const key in resource) {
        if(resource[key] === undefined) {
            continue;
        }
        const column = meta.columns.filter(x => key === x.propertyKey)[0];
        if(!column) {
            continue;
        }
        if(column instanceof _ColumnSetting) {
            const keyInForestore = column.option?.name || column.propertyKey;
            savingParams[keyInForestore] = resource[key];
        }
        else if(column instanceof _ManyToOneSetting)  {
            if(!column.option?.joinColumnName) {
                continue;
            }
            const joinColumnName = column.option.joinColumnName;
            const ref = _getDocumentReference(resource[key]);
            if(!ref) {
                throw new Error('document reference should not be empty');
            }
            savingParams[joinColumnName] = ref;
        }
        else if(column instanceof _OneToOneSetting)  {
            if(!column.option?.joinColumnName) {
                continue;
            }
            const joinColumnName = column.option.joinColumnName;
            const ref = _getDocumentReference(resource[key]);
            if(!ref) {
                throw new Error('document reference should not be empty');
            }
            savingParams[joinColumnName] = ref;
        }
        else if(column instanceof _ArrayReference) {
            if(!column.option?.joinColumnName) {
                continue;
            }            
            const joinColumnName = column.option.joinColumnName;
            const children = resource[key];
            
            if(!Array.isArray(children)) {
                throw new Error(`${key} is not an array`);
            }

            const refs = [];
            for(const child of children) {
                const ref = _getDocumentReference(child);
                if(!ref) {
                    throw new Error('document reference should not be empty');
                }
                refs.push(ref);
            }
            savingParams[joinColumnName] = refs;
        }
    }

    return savingParams;
}

function createUpdatingParams(meta: EntityMetaData, resource: any, paramsForUpdate: any) {
    const copied = {...resource};
    Object.assign(copied, paramsForUpdate);
    const savingParams = createSavingParams(meta, copied);

    const updatingParams: ReturnType<typeof createSavingParams> = {}
    const savingKeys = Object.keys(paramsForUpdate);
    for(const key in savingParams) {
        if(!savingKeys.includes(key)) {
            continue;
        }
        updatingParams[key] = savingParams[key];
    }
    return updatingParams;
}

export type ParentIDMapper = (Entity: Function) => string;

export class Repository<T extends {id: string}> {
    constructor(private Entity: ClassType<T>, private transaction?: Transaction, private parentIdMapper?: ParentIDMapper, public db?: Firestore) {}

    public setTransaction(transaction: Transaction) {
        this.transaction = transaction;
    }

    public prepareFetcher(condition: (db: CollectionReference) => ReferenceWrap) {
        const meta = findMeta(this.Entity);
        const colRef = this.collectionReference(meta);
        const ref = new FirestoreReference(condition(colRef), this.transaction)
        return new Fetcher<T>(meta, ref);
    }

    public fetchOneById(id: string, options?: FetchOption) {
        return this.prepareFetcher(ref => ref.doc(id)).fetchOne(options);
    }

    public fetchOneByIdOrFail(id: string, options?: FetchOption) {
        return this.prepareFetcher(ref => ref.doc(id)).fetchOneOrFail(options);
    }

    public fetchAll(options?: FetchOption) {
        return this.prepareFetcher(ref => ref).fetchAll(options);
    }

    public onSnapShot(callback: (result: OnsnapShotResult<T>) => Promise<void>, options?: FetchOption) {
        return this.prepareFetcher(ref => ref).onSnapShot(callback, options);
    }

    public async save(resource: T): Promise<T> {
        const documentReference = _getDocumentReference(resource);
        if(this.transaction && documentReference) {
            if(documentReference.id !== resource.id) {
                throw new Error('The resource is broken.');
            }

            const Entity = (resource as any).constructor;
            const meta = findMeta(Entity);
            callHook(meta, resource, 'beforeSave');
            const params = createSavingParams(meta, resource);
            await this.transaction.set(documentReference, params);
            callHook(meta, resource, 'afterSave');
            return resource;
        } else {
            const meta = findMeta(this.Entity);
            let _ref: DocumentReference;
            if(resource.id) {
                _ref = this.collectionReference(meta).doc(resource.id);
            } else {
                _ref = this.collectionReference(meta).doc();
            }
            const ref = new FirestoreReference(
                _ref,
                this.transaction
            )
            callHook(meta, resource, 'beforeSave');
            const savingParams = createSavingParams(meta, resource);
            await ref.set(savingParams);
            if(!resource.id) {
                resource.id = (ref.ref as DocumentReference).id;
            }
            (resource as any)[documentReferencePath] = _ref;
            callHook(meta, resource, 'afterSave');
            return resource;
        }
    }

    public async update(resource: T, params: QueryPartialEntity<T>): Promise<T> {
        const documentReference = _getDocumentReference(resource);
        if(!documentReference) {
            throw new Error('Can not update the resource due to non existed resource on firestore.');
        }

        if(documentReference.id !== resource.id) {
            throw new Error('The resource is broken.');
        }

        if(this.transaction && documentReference) {
            const Entity = (resource as any).constructor;
            const meta = findMeta(Entity);
            callHook(meta, [resource, params], 'beforeSave');
            const updatingParams = createUpdatingParams(meta, resource, params);
            await this.transaction.update(documentReference, updatingParams);
            Object.assign(resource, params);
            callHook(meta, resource, 'afterSave');
            return resource;
        } else {
            const meta = findMeta(this.Entity);

            const ref = new FirestoreReference(
                this.collectionReference(meta).doc(resource.id),
                this.transaction
            )

            const updatingParams = createUpdatingParams(meta, resource, params);

            callHook(meta, [resource, params], 'beforeSave');
            await ref.update(updatingParams);
            Object.assign(resource, params);
            callHook(meta, resource, 'afterSave');
        }
        return resource;
    }

    public async delete(resourceOrId: string|T) {
        const ref = _getDocumentReference(resourceOrId);
        if(ref) {
            if(this.transaction) {
                await this.transaction.delete(ref);
            } else {
                await ref.delete();
            }
        } else {
            const meta = findMeta(this.Entity);
            const ref = this.collectionReference(meta).doc(resourceOrId as string)
            if(this.transaction) {
                await this.transaction.delete(ref);
            } else {
                await ref.delete();
            }
        }
    }

    private collectionReference(meta: EntityMetaData) {
        if(this.parentIdMapper) {
            return makeNestedCollectionReference(meta, this.parentIdMapper, this.db);
        } else {
            if(this.db) {
                return this.db.collection(meta.tableName);
            } else {
                return getCurrentDB().collection(meta.tableName);
            }
        }
    }    
}

export function makeNestedCollectionReference(meta: EntityMetaData, parentIdMapper: ParentIDMapper, _db?: Firestore) {
    let ref: DocumentReference|null = null;
    for(const parentEntityGetter of meta.parentEntityGetters || []) {
        const parentMeta = findMeta(parentEntityGetter());
        const parentId = parentIdMapper(parentMeta.Entity);
        if(ref) {
            ref = ref.collection(parentMeta.tableName).doc(parentId);
        } else {
            const db = _db || getCurrentDB();
            ref = db.collection(parentMeta.tableName).doc(parentId);
        }
    }
    if(!ref) {
        throw new Error(`${this.Entity} is not NestedFirebaseEntity`);
    }
    return ref.collection(meta.tableName);    
}

export function getRepository<T extends {id: string}>(Entity: new () => T, params?: {parentIdMapper: ParentIDMapper}, db?: Firestore): Repository<T> {
    if(params) {
        return new Repository(Entity, undefined, params.parentIdMapper, db);
    }
    return new Repository(Entity, undefined, undefined, db);
}

export class TransactionManager {
    constructor(private transaction: Transaction) {}

    getRepository<T extends {id: string}>(Entity: new () => T, params?: {parentIdMapper: ParentIDMapper}, db?: Firestore): Repository<T> {
        if(params) {
            return new Repository(Entity, this.transaction, params.parentIdMapper, db);
        }
        return new Repository(Entity, this.transaction, undefined, db);
    }
}

export function runTransaction<T>(callback: (manager: TransactionManager) => Promise<T>): Promise<T> {
    return getCurrentDB().runTransaction(async transaction => {
        const manager = new TransactionManager(transaction);
        return callback(manager);
    });
}

export function _getDocumentReference<T>(item: T): DocumentReference|undefined {
    return (item as any)[documentReferencePath];
}