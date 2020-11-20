import { ClassType, EntityMetaData, findMeta, findMetaFromTableName, _ColumnSetting } from "./Entity";
import { documentReferencePath } from "./EntityBuilder";
import { getCurrentDB, getRepository, makeNestedCollectionReference, ParentIDMapper, _getDocumentReference } from "./Repository";
import { DocumentReference } from "./type-mapper";

type ReferenceClue = {
    collection: string;
    id: string;
    parent: {
        collection: string;
        id: string;        
    }|null
}

export type ParentInfo = {
    collection: string;
    id: string;
    child?: ParentInfo;
};

export const referenceCluePath = "__reference_clue__";

function makeClue(obj: any, parentIdMapper?: ParentIDMapper): ReferenceClue {
    const meta = findMeta(obj.constructor);

    let parentInfo: ParentInfo|null = null;
    if(meta.parentEntityGetters && parentIdMapper) {
        for(const getter of meta.parentEntityGetters) {
            const Entity = getter();
            const meta = findMeta(Entity);
            if(parentInfo) {
                parentInfo.child = {
                    collection: meta.tableName,
                    id: parentIdMapper(Entity)
                };
            } else {
                parentInfo = {
                    collection: meta.tableName,
                    id: parentIdMapper(Entity)
                }
            }
        }
    }

    return {
        collection: meta.tableName,
        id: obj.id,
        parent: parentInfo || null
    }
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>
  (obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}

export class FirebaseEntitySerializer {
    public static serializeToJSON(object: any, parentIdMapper?: ParentIDMapper, options?: {timeStampToString?: boolean}) {
        const meta = findMeta(object.constructor);
        if(!meta) {
            throw new Error('object is not an Entity.')
        }

        if(meta.parentEntityGetters && !parentIdMapper) {
            throw new Error(`${meta.tableName} is nested collection. So parentId have to be provided.`)
        }

        const columns = meta.columns.map(x => x.propertyKey);

        const serialized: {[key: string]: any} = {};

        for(const key in object) {
            if(!columns.includes(key)) {
                continue;
            }

            const item = object[key];
            if(!item) {
                continue;
            }

            if(Array.isArray(item)) {
                serialized[key] = item.map(x => {
                    const ref = _getDocumentReference(x);
                    if(ref) {
                        return {...FirebaseEntitySerializer.serializeToJSON(x), 
                            [referenceCluePath]: makeClue(x, object.id)
                        }
                    } else {
                        return x;
                    }
                });
            } else {
                const ref = _getDocumentReference(item);
                if(ref) {
                    serialized[key] = {...FirebaseEntitySerializer.serializeToJSON(item),
                        [referenceCluePath]: makeClue(item, object.id)
                    }
                } else {
                    if(options?.timeStampToString && item.toDate) {
                        serialized[key] = item.toDate().toString();
                    } else {
                        serialized[key] = item;
                    }
                }
            }
        }

        serialized[referenceCluePath] = makeClue(object, parentIdMapper);
        return serialized;
    }

    public static serializeToJSONString(object: any, parentIdMapper?: ParentIDMapper) {
        const json = this.serializeToJSON(object, parentIdMapper);
        return JSON.stringify(json);
    }
}

export class FirebaseEntityDeserializer {
    public static deserializeFromJSON<T extends {id: string}>(Entity: ClassType<T>, object: object, parentIdMapper?: ParentIDMapper, options?: {stringToTimeStamp?: boolean}) {
        const meta = findMeta(Entity);
        if(!meta) {
            throw new Error('object is not an Entity.')
        }

        const instance: {[key: string]: any} = new Entity();

        if(meta.parentEntityGetters) {
            if(!parentIdMapper) {
                throw new Error(`${meta.tableName} is nested collection. So parentId have to be provided.`)
            }
            const reference = makeNestedCollectionReference(meta, parentIdMapper).doc((object as any).id);
            instance[documentReferencePath] = reference;
        } else {
            const reference = getCurrentDB().collection(meta.tableName).doc((object as any).id);
            instance[documentReferencePath] = reference;
        }

        for(const key in object) {
            const item = (object as any)[key];
            if(!item) {
                continue;
            }
            if(item[referenceCluePath]) {
                instance[key] = plainToClass(item, parentIdMapper);
            } else if(Array.isArray(item))  {
                instance[key] = item.map(x => plainToClass(x, parentIdMapper));
            } else {
                if(key == referenceCluePath) {
                    continue;
                }

                const index = meta.columns.findIndex(x => x.propertyKey === key);
                const column = meta.columns[index];
                if(options?.stringToTimeStamp && column instanceof _ColumnSetting && column.columnType &&(column.columnType as any).now) {
                    const date = new Date(item);
                    instance[key] = new(column.columnType as any)(Math.floor(date.getTime() / 1000), date.getMilliseconds());
                } else {
                    instance[key] = item;
                }
            }
        }
        return instance as T;
    }

    public static deserializeFromJSONString<T extends {id: string}>(Entity: ClassType<T>, str: string, parentIdMapper?: ParentIDMapper) {
        return this.deserializeFromJSON(Entity, JSON.parse(str), parentIdMapper);
    }
}

function plainToClass(item: any, parentIdMapper?: ParentIDMapper) {
    const clue = item[referenceCluePath] as ReferenceClue;
    const meta = findMetaFromTableName(clue.collection);
    if(!meta) {
        throw new Error(`Cloud not find a collection: ${clue.collection}`)
    }
    const child = new (meta.Entity as any)();
    for(const key in item) {
        if(key == referenceCluePath) {
            continue;
        }
        if(item[key][referenceCluePath]) {
            child[key] = FirebaseEntityDeserializer.deserializeFromJSON(meta.Entity as any, item[key], parentIdMapper)
        } else {
            child[key] = item[key];
        }
    }

    let reference: DocumentReference;
    if(meta.parentEntityGetters) {
        if(!parentIdMapper) {
            throw new Error(`${meta.tableName} is nested collection. So parentId have to be provided.`)
        }
        reference = makeNestedCollectionReference(meta, parentIdMapper).doc(clue.id);
    } else {
        reference = getCurrentDB().collection(meta.tableName).doc(clue.id);
    }
    child[documentReferencePath] = reference;
    return child;
}