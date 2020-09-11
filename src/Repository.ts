import { entityMetaInfo, EntityMetaInfo, FirebaseEntity, ClassType, Column, PrimaryColumn, ColumnMetaData, columnSettings, _ManyToOneSetting, _OneToManySetting, _OneToOneSetting } from './Entity';
import * as admin from 'firebase-admin';
import { plainToClass } from 'class-transformer';

export type FirestoreReference = admin.firestore.DocumentData|admin.firestore.Query;

export type FetchOption = {
    relations: string[];
}

export class Fetcher<T> {
    constructor(private meta: ColumnMetaData, private ref: FirestoreReference) {}

    public async fetchOne(options?: FetchOption): Promise<T> {
        const result = await this.ref.get() as admin.firestore.QueryDocumentSnapshot;
        const allData = {...{id: result.id}, ...result.data()}

        const plain: {[key: string]: any} = {};

        for(const key in allData) {
            const setting = this.meta.columnSettings
                                .filter(x => key == x.propertyKey || key == x.option?.name)[0];
            if(!setting) {
                throw new Error(`unknown column: ${key}`);
            }

            if(setting instanceof _ManyToOneSetting) {
                if(options?.relations && options.relations.includes(setting.propertyKey)) {
                    const ref = (allData as any)[key];
                    const data = (await ref.get()).data();
                    console.log(data);
                }                
                continue;
            }

            if(setting instanceof _OneToManySetting) {
                continue;
            }
            
            if(setting instanceof _OneToOneSetting) {
                continue;
            }

            plain[key] = (allData as any)[key];
        }

        return plainToClass(this.meta.constructor as ClassType<T>, plain);
    }

    public async fetchAll(options?: FetchOption): Promise<T[]> {
        const docs = (await this.ref.get()).docs as admin.firestore.QueryDocumentSnapshot[];
        return docs.map(result => {
            const plain = {...{id: result.id}, ...result.data()}
            return plainToClass(this.meta.constructor as ClassType<T>, plain) as any;            
        });
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

export function getCurrentDB(): admin.firestore.Firestore {
    return dbPool[currentConnectionName!];
}

export class Repository<T> {
    private meta: ColumnMetaData;

    constructor(private Entity: ClassType<T>) {
        const entityMeta = entityMetaInfo.filter(x => x.constructor == Entity)[0];
        const settingMeta = columnSettings.filter(x => x.constructor == Entity)[0];
        this.meta = {...entityMeta, ...settingMeta};
    }

    prepareFetcher(condition: (db: admin.firestore.CollectionReference) => FirestoreReference) {
        const ref = condition(getCurrentDB().collection(this.meta.tableName));
        return new Fetcher<T>(this.meta, ref);
    }
}

export function getRepository<T>(Entity: new () => T): Repository<T> {
    return new Repository(Entity);
}