import { findMeta, ColumnSetting, ClassType, EntityMetaData, _ManyToOneSetting, _OneToManySetting, _OneToOneSetting, _ColumnSetting } from './Entity';
import * as admin from 'firebase-admin';
import { plainToClass } from 'class-transformer';

export type FetchOption = {
    relations: string[];
}

export type ReferenceWrap = admin.firestore.DocumentReference | admin.firestore.Query;
export type SnapShotWrap = admin.firestore.DocumentSnapshot | admin.firestore.QuerySnapshot;

export class SnapShotBox {
    constructor(private snapshot: SnapShotWrap) {}

    unbox() {
        if(this.snapshot instanceof admin.firestore.DocumentSnapshot) {
            return [{...{id: this.snapshot.id}, ...this.snapshot.data()}];
        }
        else if(this.snapshot instanceof admin.firestore.QuerySnapshot) {
            return this.snapshot.docs.map(x => {
                return {...{id: x.id}, ...x.data()};
            });
        }
        return null;
    }
}

export class FirestoreReference {

    constructor(public ref: ReferenceWrap, public transaction?: admin.firestore.Transaction) {}

    public async get() {
        if(this.transaction) {
            return new SnapShotBox(await this.transaction.get(this.ref as admin.firestore.Query));
        } else {
            return new SnapShotBox(await this.ref.get());
        }
    }

    public create() {

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

function relationGrouping(relations: string[]) {
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
            Object.assign(grouped[top], relationGrouping([comp.join('.')]));

        }
    }
    return grouped;
}

function groupingToRelation(grouped: {[key: string]: any}) {
    const keys = [];
    for(const key in grouped) {
        let relationKey = key;
        const childKey = groupingToRelation(grouped[key])[0];
        if(childKey) {
            relationKey += '.' + childKey;
        }
        keys.push(relationKey);
    }
    return keys;
}

class Fetcher<T> {
    constructor(private meta: EntityMetaData, private ref: FirestoreReference) {}

    public async fetchOne(options?: FetchOption): Promise<T|null> {
        const result = await this.ref.get();
        const unoboxed = result.unbox();
        if(!unoboxed || !unoboxed[0]) {
            return null;
        }
        return this.buildEntity(this.meta, unoboxed[0], options, this.ref.transaction);
    }

    public async fetchAll(options?: FetchOption): Promise<T[]> {
        const result = await this.ref.get();
        const docs = result.unbox();
        if(!docs) {
            return [];
        }
        const results: T[] = [];
        for(const data of docs) {
            results.push(await this.buildEntity(this.meta, data, options, this.ref.transaction) as any);
        }
        return results;
    }

    private async buildEntity(meta: EntityMetaData, data: any, options?: FetchOption, transaction?: admin.firestore.Transaction) {
        const groupedRelations = options?.relations ? relationGrouping(options.relations) : {};
        const plain: {[key: string]: any} = {};

        for(const relation of Object.keys(groupedRelations)) {
            if(!meta.columns.map(x => x.propertyKey).includes(relation)) {
                throw new RelationNotFoundError(relation);
            }
        }
        
        for(const setting of meta.columns) {
            let keyInForestore = setting.option?.name || setting.propertyKey;
            if(setting instanceof _ManyToOneSetting) {
                const relation = groupedRelations[setting.propertyKey];
                if(!relation) {
                    continue;
                }
                if(setting.option?.joinColumnName) {
                    keyInForestore = setting.option.joinColumnName;
                }
                const rawRef = (data as any)[keyInForestore];
                const hierarchy = await this.followHierarchy({
                    setting: setting, 
                    relations: {
                        top: setting.propertyKey,
                        hierarchy: relation
                    },
                    transaction: transaction,
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
                const hierarchy = await this.followHierarchy({
                    setting: setting, 
                    relations: {
                        top: setting.propertyKey,
                        hierarchy: relation
                    },
                    transaction: transaction,
                    fetchMode: {
                        mode: 'many',
                        parentId: data.id
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
                    const hierarchy = await this.followHierarchy({
                        setting: setting, 
                        relations: {
                            top: setting.propertyKey,
                            hierarchy: relation
                        },
                        transaction: transaction,
                        fetchMode: {
                            mode: 'ref',
                            reference: rawRef
                        }
                    });
                    Object.assign(plain, hierarchy);                    
                } else {
                    const hierarchy = await this.followHierarchy({
                        setting: setting, 
                        relations: {
                            top: setting.propertyKey,
                            hierarchy: relation
                        },
                        transaction: transaction,
                        fetchMode: {
                            mode: 'single',
                            parentId: data.id
                        }
                    });
                    Object.assign(plain, hierarchy);
                }
            } else {
                plain[setting.propertyKey] = (data as any)[keyInForestore];
            }
        }

        return plainToClass(meta.Entity as ClassType<T>, plain);
    }   
    
    private async followHierarchy(params: {
        setting: ColumnSetting & {getEntity: () => ClassType<T>}, 
        relations: {
            top: string,
            hierarchy?: {[key: string]: any}
        },
        fetchMode: {
            mode: 'ref',
            reference: ReferenceWrap
        }|{
            mode: 'single',
            parentId: string
        }|{
            mode: 'many',
            parentId: string
        },
        transaction?: admin.firestore.Transaction,
    }) {
        const results: {[key: string]: any} = {};

        switch(params.fetchMode.mode)  {
        case 'ref':
            const ref = new FirestoreReference(params.fetchMode.reference, params.transaction);
            const box = await ref.get();
            const unboxed = box.unbox();
            if(unboxed && unboxed[0]) {
                const meta = findMeta(params.setting.getEntity());
                results[params.setting.propertyKey] = await this.buildEntity(meta, unboxed[0], {relations: groupingToRelation(params.relations.hierarchy || {})}, params.transaction)
            }
            break;

        case 'single':
            const singleParentId = params.fetchMode.parentId;
            const singlRepo = getRepository(params.setting.getEntity());
            if(params.transaction) {
                singlRepo.setTransaction(params.transaction);
            }
            results[params.setting.propertyKey] = await singlRepo.prepareFetcher(db => db.doc(singleParentId)).fetchOne({
                relations: groupingToRelation(params.relations.hierarchy || {})
            });
            break;

        case 'many':
            const manyParentId = params.fetchMode.parentId;
            const manyRepo = getRepository(params.setting.getEntity());
            if(params.transaction) {
                manyRepo.setTransaction(params.transaction);
            }
            results[params.setting.propertyKey] = await manyRepo.prepareFetcher(db => db.doc(manyParentId)).fetchAll({
                relations: groupingToRelation(params.relations.hierarchy || {})
            });
            break;
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

export class Repository<T> {
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

    fetchOneById(id: string, options?: FetchOption) {
        return this.prepareFetcher(db => {
            return db.doc(id);
        }).fetchOne(options);
    }

    fetchAll(options?: FetchOption) {
        return this.prepareFetcher(db => db).fetchAll(options);
    }
}

export function getRepository<T>(Entity: new () => T): Repository<T> {
    return new Repository(Entity);
}

export class TransactionManager {
    constructor(private transaction?: admin.firestore.Transaction) {}

    getRepository<T>(Entity: new () => T): Repository<T> {
        return new Repository(Entity, this.transaction);
    }
}

export function runTransaction<T>(callback: (manager: TransactionManager) => Promise<T>): Promise<T> {
    return getCurrentDB().runTransaction(async transaction => {
        const manager = new TransactionManager(transaction);
        return callback(manager);
    });
}