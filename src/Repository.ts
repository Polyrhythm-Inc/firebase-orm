import { findMeta, ClassType, EntityMetaData, _ManyToOneSetting, _OneToManySetting, _OneToOneSetting, _ColumnSetting } from './Entity';
import * as admin from 'firebase-admin';
import { buildEntity, ReferenceWrap, FirestoreReference, documentReferencePath } from './EntityBuilder';

export type FetchOption = {
    relations: string[];
}

class Fetcher<T> {
    constructor(private meta: EntityMetaData, private ref: FirestoreReference<T>) {}

    public async fetchOne(options?: FetchOption): Promise<T|null> {
        const result = await this.ref.get();
        const unoboxed = result.unbox();
        if(!unoboxed || !unoboxed[0]) {
            return null;
        }
        return buildEntity(this.meta, unoboxed[0], this.ref, options);
    }

    public async fetchAll(options?: FetchOption): Promise<T[]> {
        const result = await this.ref.get();
        const docs = result.unbox();
        if(!docs) {
            return [];
        }
        const results: T[] = [];
        for(const data of docs) {
            results.push(await buildEntity(this.meta, data, this.ref, options as any));
        }
        return results;
    }
}

const dbPool: {[key: string]: admin.firestore.Firestore} = {};
let currentConnectionName: string|null = null;

export function addDBToPool(name: string, db: admin.firestore.Firestore) {
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

export function getCurrentDB(): admin.firestore.Firestore {
    return dbPool[currentConnectionName!];
}

function createSavingParams(meta: EntityMetaData, resource: any) {
    const savingParams: {[key: string]: any} = {};

    for(const key in resource) {
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
            const ref = getDocumentReference(resource[key]);
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
            const ref = getDocumentReference(resource[key]);
            if(!ref) {
                throw new Error('document reference should not be empty');
            }
            savingParams[joinColumnName] = ref;
        }        
    }

    return savingParams;
}

export class Repository<T extends {id: string}> {
    constructor(private Entity: ClassType<T>, private transaction?: admin.firestore.Transaction) {}

    public setTransaction(transaction: admin.firestore.Transaction) {
        this.transaction = transaction;
    }

    public prepareFetcher(condition: (db: admin.firestore.CollectionReference<admin.firestore.DocumentData>) => ReferenceWrap) {
        const meta = findMeta(this.Entity);
        const ref = new FirestoreReference(
            condition(getCurrentDB().collection(meta.tableName)),
            this.transaction
        )
        return new Fetcher<T>(meta, ref);
    }

    public prepareUpdate(condition: (db: admin.firestore.CollectionReference<admin.firestore.DocumentData>) => ReferenceWrap) {
        const meta = findMeta(this.Entity);
        const ref = new FirestoreReference(
            condition(getCurrentDB().collection(meta.tableName)),
            this.transaction
        )
        return new Fetcher<T>(meta, ref);
    }    

    fetchOneById(id: string, options?: FetchOption) {
        return this.prepareFetcher(db => {
            return db.doc(id);
        }).fetchOne(options);
    }

    fetchAll(options?: FetchOption) {
        return this.prepareFetcher(db => db).fetchAll(options);
    } 

    public async save(resource: T): Promise<T> {
        const documentReference = getDocumentReference(resource);
        if(this.transaction && documentReference) {
            if(documentReference.id !== resource.id) {
                throw new Error('The resource is broken.');
            }

            const Entity = (resource as any).constructor;
            const meta = findMeta(Entity);
            const params = createSavingParams(meta, resource);
    
            await this.transaction.set(documentReference, params);
            return resource;
        } else {
            const meta = findMeta(this.Entity);
            const _ref = getCurrentDB().collection(meta.tableName).doc(resource.id);
            const ref = new FirestoreReference(
                _ref,
                this.transaction
            )
            const savingParams = createSavingParams(meta, resource);
            await ref.set(savingParams);
            (resource as any)[documentReferencePath] = _ref;
            return resource;
        }
    }

    public async delete(resourceOrId: string|T) {
        const ref = getDocumentReference(resourceOrId);
        if(ref) {
            if(this.transaction) {
                await this.transaction.delete(ref);
            } else {
                await ref.delete();
            }
        } else {
            const meta = findMeta(this.Entity);
            const ref = getCurrentDB().collection(meta.tableName).doc(resourceOrId as string);
            if(this.transaction) {
                await this.transaction.delete(ref);
            } else {
                await ref.delete();
            }
        }
    }
}

export function getRepository<T extends {id: string}>(Entity: new () => T): Repository<T> {
    return new Repository(Entity);
}

export class TransactionManager {
    constructor(private transaction: admin.firestore.Transaction) {}

    getRepository<T extends {id: string}>(Entity: new () => T): Repository<T> {
        return new Repository(Entity, this.transaction);
    }
}

export function runTransaction<T>(callback: (manager: TransactionManager) => Promise<T>): Promise<T> {
    return getCurrentDB().runTransaction(async transaction => {
        const manager = new TransactionManager(transaction);
        return callback(manager);
    });
}

export function getDocumentReference<T>(item: T): admin.firestore.DocumentReference|undefined {
    return (item as any)[documentReferencePath];
}