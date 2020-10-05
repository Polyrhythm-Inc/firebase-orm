export declare type ClassType<T> = {
    new (...args: any[]): T;
};
export interface ColumnSetting {
    propertyKey: string;
    option?: {
        name: string;
    };
}
export declare class _PrimaryColumnSetting implements ColumnSetting {
    propertyKey: string;
    constructor(propertyKey: string);
}
export declare class _ColumnSetting implements ColumnSetting {
    propertyKey: string;
    option?: ColumOption | undefined;
    constructor(propertyKey: string, option?: ColumOption | undefined);
}
export declare class _OneToManySetting<T> implements ColumnSetting {
    propertyKey: string;
    getEntity: () => ClassType<T>;
    option?: (RelationOption & {
        relationColumn: string;
    }) | undefined;
    constructor(propertyKey: string, getEntity: () => ClassType<T>, option?: (RelationOption & {
        relationColumn: string;
    }) | undefined);
}
export declare class _OneToOneSetting<T> implements ColumnSetting {
    propertyKey: string;
    getEntity: () => ClassType<T>;
    option?: (RelationOption & {
        relationColumn: string;
        joinColumnName: string;
    }) | undefined;
    constructor(propertyKey: string, getEntity: () => ClassType<T>, option?: (RelationOption & {
        relationColumn: string;
        joinColumnName: string;
    }) | undefined);
}
export declare class _ManyToOneSetting<T> implements ColumnSetting {
    propertyKey: string;
    getEntity: () => ClassType<T>;
    option?: (RelationOption & {
        joinColumnName: string;
    }) | undefined;
    constructor(propertyKey: string, getEntity: () => ClassType<T>, option?: (RelationOption & {
        joinColumnName: string;
    }) | undefined);
}
export declare class _CreateDateColumnSetting<T> implements ColumnSetting {
    propertyKey: string;
    constructor(propertyKey: string);
}
export declare class _UpdateDateColumnSetting<T> implements ColumnSetting {
    propertyKey: string;
    constructor(propertyKey: string);
}
export declare type EntityMetaInfo = {
    tableName: string;
    Entity: Function;
    parentEntityGetter?: () => Function;
};
export declare type EntityColumnInfo = {
    columns: ColumnSetting[];
};
export declare type EntityMetaData = EntityMetaInfo & EntityColumnInfo;
export declare function findMeta(Entity: Function): EntityMetaInfo & EntityColumnInfo;
export declare type ColumOption = {
    name: string;
};
export declare type RelationOption = {
    name: string;
};
export declare type DateOption = {
    name: string;
};
export declare function PrimaryColumn(): (target: any, propertyKey: string) => void;
export declare function Column(options?: ColumOption): (target: any, propertyKey: string) => void;
export declare function OneToMany<T>(getEntity: () => ClassType<T>, options?: {
    relationColumn: string;
}): (target: any, propertyKey: string) => void;
export declare function OneToOne<T>(getEntity: () => ClassType<T>, options?: {
    relationColumn?: string;
    joinColumnName?: string;
}): (target: any, propertyKey: string) => void;
export declare function ManyToOne<T>(getEntity: () => ClassType<T>, options?: {
    joinColumnName: string;
}): (target: any, propertyKey: string) => void;
export declare function CreateDateColumn<T>(options?: DateOption): (target: any, propertyKey: string) => void;
export declare function UpdateDateColumn<T>(options?: DateOption): (target: any, propertyKey: string) => void;
export declare function FirebaseEntity(tableName: string): (constructor: Function) => void;
export declare function NestedFirebaseEntity<T>(parentEntityGetter: () => ClassType<T>, tableName: string): (constructor: Function) => void;
