import { ClassType, EntityMetaData, findMeta, findMetaFromTableName, _ColumnSetting } from "./Entity";
import { documentReferencePath } from "./EntityBuilder";
import { getCurrentDB, getRepository, _getDocumentReference } from "./Repository";
import { DocumentReference } from "./type-mapper";

type ReferenceClue = {
    collection: string;
    id: string;
    parent: {
        collection: string;
        id: string;        
    }|null
}

export const referenceCluePath = "__reference_clue__";

function makeClue(obj: any, parentId?: string): ReferenceClue {
    const meta = findMeta(obj.constructor);

    let parentInfo;
    if(meta.parentEntityGetter && parentId) {
        const Parent = meta.parentEntityGetter();
        const parentMeta = findMeta(Parent);
        parentInfo = {
            collection: parentMeta.tableName,
            id: parentId
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
    public static serializeToJSON(object: any, parentId?: string, options?: {timeStampToString?: boolean}) {
        const meta = findMeta(object.constructor);
        if(!meta) {
            throw new Error('object is not an Entity.')
        }

        if(meta.parentEntityGetter && !parentId) {
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

        serialized[referenceCluePath] = makeClue(object, parentId);
        return serialized;
    }

    public static serializeToJSONString(object: any, parentId?: string) {
        const json = this.serializeToJSON(object, parentId);
        return JSON.stringify(json);
    }
}

export class FirebaseEntityDeserializer {
    public static deserializeFromJSON<T extends {id: string}>(Entity: ClassType<T>, object: object, parentId?: string, options?: {stringToTimeStamp?: boolean}) {
        const meta = findMeta(Entity);
        if(!meta) {
            throw new Error('object is not an Entity.')
        }

        const instance: {[key: string]: any} = new Entity();

        if(meta.parentEntityGetter) {
            if(!parentId) {
                throw new Error(`${meta.tableName} is nested collection. So parentId have to be provided.`)
            }
            const parentEntity = meta.parentEntityGetter();
            const parentMeta = findMeta(parentEntity);
            const reference = getCurrentDB()
                .collection(parentMeta.tableName)
                .doc(parentId)
                .collection(meta.tableName)
                .doc((object as any).id);
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
                instance[key] = plainToClass(item, parentId);
            } else if(Array.isArray(item))  {
                instance[key] = item.map(x => plainToClass(x, parentId));
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

    public static deserializeFromJSONString<T extends {id: string}>(Entity: ClassType<T>, str: string, parentId?: string) {
        return this.deserializeFromJSON(Entity, JSON.parse(str), parentId);
    }
}

function plainToClass(item: any, parentId?: string) {
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
            child[key] = FirebaseEntityDeserializer.deserializeFromJSON(meta.Entity as any, item[key], parentId)
        } else {
            child[key] = item[key];
        }
    }

    let reference: DocumentReference;
    if(meta.parentEntityGetter) {
        if(!parentId) {
            throw new Error(`${meta.tableName} is nested collection. So parentId have to be provided.`)
        }
        const parentEntity = meta.parentEntityGetter();
        const parentMeta = findMeta(parentEntity);
        reference = getCurrentDB()
                    .collection(parentMeta.tableName)
                    .doc(parentId)
                    .collection(meta.tableName)
                    .doc(clue.id);
    } else {
        reference = getCurrentDB().collection(meta.tableName).doc(clue.id);
    }
    child[documentReferencePath] = reference;
    return child;
}