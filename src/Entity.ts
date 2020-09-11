export declare type ClassType<T> = {
    new (...args: any[]): T;
};

interface ColumnSetting {
    propertyKey: string;
    option?: {name: string};
}

export class _PrimaryColumnSetting implements ColumnSetting {
    constructor(public propertyKey: string) {}
}

export class _ColumnSetting implements ColumnSetting {
    constructor(public propertyKey: string, public option?: ColumOption) {}
}

export class _OneToManySetting<T> implements ColumnSetting {
    constructor(public propertyKey: string, public Entity: ClassType<T>) {}
}

export class _OneToOneSetting<T> implements ColumnSetting {
    constructor(public propertyKey: string, public Entity: ClassType<T>, public option?: RelationOption) {}
}

export class _ManyToOneSetting<T> implements ColumnSetting {
    constructor(public propertyKey: string, public Entity: ClassType<T>, public option?: RelationOption) {}
}

export class _CreateDateColumnSetting<T> implements ColumnSetting {
    constructor(public propertyKey: string) {}
}

export class _UpdateDateColumnSetting<T> implements ColumnSetting {
    constructor(public propertyKey: string) {}
}

export type EntityMetaInfo = {
    tableName: string;
    constructor: Function;
}

export type EntityColumn = {
    constructor: Function;
    columnSettings: ColumnSetting[];
}

export type ColumnMetaData = EntityMetaInfo & EntityColumn;

export const entityMetaInfo: EntityMetaInfo[] = [];
export const columnSettings: EntityColumn[] = [];

function addColumnSettings(constructor: Function, setting: ColumnSetting) {
    const meta = columnSettings.filter(x => x.constructor == constructor)[0];
    if(meta) {
        meta.columnSettings.push(setting);
    } else {
        columnSettings.push({
            constructor: constructor,
            columnSettings: [setting]
        });
    }
}

export type ColumOption = {
    name: string;
}

export type RelationOption = {
    name: string;
}

export type DateOption = {
    name: string;
}

export function PrimaryColumn() {
    return (target: any, propertyKey: string) => {
        addColumnSettings(target.constructor, new _PrimaryColumnSetting(propertyKey));
    }
}

export function Column(options?: ColumOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(target.constructor, new _ColumnSetting(propertyKey, options));
    }
}

export function OneToMany<T>(Entity: ClassType<T>) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(target.constructor, new _OneToManySetting(propertyKey, Entity));
    }
}

export function OneToOne<T>(Entity: ClassType<T>, options?: RelationOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(target.constructor, new _OneToOneSetting(propertyKey, Entity, options));
    }
}

export function ManyToOne<T>(Entity: ClassType<T>, options?: RelationOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(target.constructor, new _ManyToOneSetting(propertyKey, Entity, options));
    }
}

export function CreateDateColumn<T>(options?: DateOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(target.constructor, new _CreateDateColumnSetting(propertyKey));
    }
}

export function UpdateDateColumn<T>(options?: DateOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(target.constructor, new _UpdateDateColumnSetting(propertyKey));
    }
}

export function FirebaseEntity(tableName: string) {
    return (constructor: Function) => {
        entityMetaInfo.push({
            tableName: tableName,
            constructor: constructor
        });
    }
}