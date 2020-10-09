import { findMeta, ClassType, EntityMetaData, _ManyToOneSetting, _OneToManySetting, _OneToOneSetting, _ColumnSetting, _ArrayReference, callHook } from './Entity';
import { buildEntity, ReferenceWrap, FirestoreReference, documentReferencePath } from './EntityBuilder';
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

export function getCurrentDB(): Firestore {
    return dbPool[currentConnectionName!];
}

function createSavingParams(meta: EntityMetaData, resource: any) {
    const savingParams: {[key: string]: any} = {};

    for(const key in resource) {
        if(!resource[key]) {
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

export class Repository<T extends {id: string}> {
    constructor(private Entity: ClassType<T>, private transaction?: Transaction, private parentId?: string) {}

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
        const meta = findMeta(this.Entity);
        return this.prepareFetcher(db => this.collectionReference(meta).doc(id)).fetchOne(options);
    }

    public fetchAll(options?: FetchOption) {
        const meta = findMeta(this.Entity);
        return this.prepareFetcher(db => this.collectionReference(meta)).fetchAll(options);
    }

    public onSnapShot(callback: (result: OnsnapShotResult<T>) => Promise<void>, options?: FetchOption) {
        const meta = findMeta(this.Entity);
        return this.prepareFetcher(db => this.collectionReference(meta)).onSnapShot(callback, options);
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
        if(this.parentId) {
            if(!meta.parentEntityGetter) {
                throw new Error(`${this.Entity} is not NestedFirebaseEntity`);
            }
            const parentMeta = findMeta(meta.parentEntityGetter());
            return getCurrentDB()
                    .collection(parentMeta.tableName)
                    .doc(this.parentId)
                    .collection(meta.tableName);
        } else {
            return getCurrentDB().collection(meta.tableName);
        }
    }    
}

export function getRepository<T extends {id: string}>(Entity: new () => T): Repository<T>
export function getRepository<T extends {id: string}>(Entity: new () => T, params: {withParentId: string}): Repository<T>
export function getRepository<T extends {id: string}>(Entity: new () => T, params?: {withParentId: string}): Repository<T> {
    if(params) {
        return new Repository(Entity, undefined, params.withParentId);
    }
    return new Repository(Entity);
}

export class TransactionManager {
    constructor(private transaction: Transaction) {}

    getRepository<T extends {id: string}>(Entity: new () => T): Repository<T>
    getRepository<T extends {id: string}>(Entity: new () => T, params: {withParentId: string}): Repository<T>    
    getRepository<T extends {id: string}>(Entity: new () => T, params?: {withParentId: string}): Repository<T> {
        if(params) {
            return new Repository(Entity, this.transaction, params.withParentId);
        }
        return new Repository(Entity, this.transaction);
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