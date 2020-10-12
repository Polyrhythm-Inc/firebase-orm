import { ClassType } from "./Entity";
export declare const referenceCluePath = "__reference_clue__";
export declare class FirebaseEntitySerializer {
    static serializeToJSON(object: any, parentId?: string): {
        [key: string]: any;
    };
    static serializeToJSONString(object: any, parentId?: string): string;
}
export declare class FirebaseEntityDeserializer {
    static deserializeFromJSON<T extends {
        id: string;
    }>(Entity: ClassType<T>, object: object, parentId?: string): T;
    static deserializeFromJSONString<T extends {
        id: string;
    }>(Entity: ClassType<T>, str: string, parentId?: string): T;
}
