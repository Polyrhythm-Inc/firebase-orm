import { ClassType } from "./Entity";
import { ParentIDMapper } from "./Repository";
export declare type ParentInfo = {
    collection: string;
    id: string;
    child?: ParentInfo;
};
export declare const referenceCluePath = "__reference_clue__";
export declare class FirebaseEntitySerializer {
    static serializeToJSON(object: any, parentIdMapper?: ParentIDMapper, options?: {
        timeStampToString?: boolean;
    }): {
        [key: string]: any;
    };
    static serializeToJSONString(object: any, parentIdMapper?: ParentIDMapper): string;
}
export declare class FirebaseEntityDeserializer {
    static deserializeFromJSON<T extends {
        id: string;
    }>(Entity: ClassType<T>, object: object, parentIdMapper?: ParentIDMapper, options?: {
        stringToTimeStamp?: boolean;
    }): T;
    static deserializeFromJSONString<T extends {
        id: string;
    }>(Entity: ClassType<T>, str: string, parentIdMapper?: ParentIDMapper): T;
}
