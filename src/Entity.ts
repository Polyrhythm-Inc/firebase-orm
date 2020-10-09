export declare type ClassType<T> = {
    new (...args: any[]): T;
};

export type ColumOption = {
    name: string;
}

export type RelationOption = {
    name: string;
}

export type DateOption = {
    name: string;
}

export interface ColumnSetting {
    propertyKey: string;
    option?: {name?: string};
}

export type JoinOption = {
    relationColumn?: string;
    joinColumnName?: string;
}

export interface JoinColumnSetting {
    propertyKey: string;
    option?: JoinOption;
}

export class _PrimaryColumnSetting implements ColumnSetting {
    constructor(public propertyKey: string) {}
}

export class _ColumnSetting implements ColumnSetting {
    constructor(public propertyKey: string, public option?: ColumOption) {}
}

export class _OneToManySetting<T> implements JoinColumnSetting {
    constructor(public propertyKey: string, public getEntity: () => ClassType<T>, public option?: JoinOption) {}
}

export class _OneToOneSetting<T> implements JoinColumnSetting {
    constructor(public propertyKey: string, public getEntity: () => ClassType<T>, public option?: JoinOption) {}
}

export class _ManyToOneSetting<T> implements JoinColumnSetting {
    constructor(public propertyKey: string, public getEntity: () => ClassType<T>, public option?: JoinOption) {}
}

export class _ArrayReference<T> implements JoinColumnSetting {
    constructor(public propertyKey: string, public getEntity: () => ClassType<T>, public option?: JoinOption) {}
}

export class _CreateDateColumnSetting<T> implements ColumnSetting {
    constructor(public propertyKey: string) {}
}

export class _UpdateDateColumnSetting<T> implements ColumnSetting {
    constructor(public propertyKey: string) {}
}

export type EntityMetaInfo = {
    tableName: string;
    Entity: Function;
    parentEntityGetter?: () => Function;
}

export type EntityColumnInfo = {
    columns: (ColumnSetting|JoinColumnSetting)[];
}

export type EntityMetaData = EntityMetaInfo & EntityColumnInfo;

const entityMetaInfo: EntityMetaInfo[] = [];
const columnSettings: {getEntity: () => Function, column: ColumnSetting|JoinColumnSetting}[] = [];
const entityMetaData: {[key: string]: EntityMetaInfo & EntityColumnInfo} = {};

export function findMeta(Entity: Function) {
    if(entityMetaData[Entity.name]) {
        return entityMetaData[Entity.name];
    }

    const tableInfo = entityMetaInfo.filter(x => x.Entity == Entity)[0];
    const setting = columnSettings.map(x => {
        return {
            column: x.column,
            Entity: x.getEntity()
        }
    }).filter(x => x.Entity == Entity);

    entityMetaData[Entity.name] = {...tableInfo, ...{columns: setting.map(x => x.column)}};
    return entityMetaData[Entity.name];
}

function addColumnSettings(getEntity: () => Function, setting: ColumnSetting|JoinColumnSetting) {
    columnSettings.push({
        getEntity: getEntity,
        column: setting
    });
}

export function PrimaryColumn() {
    return (target: any, propertyKey: string) => {
        addColumnSettings(() => target.constructor, new _PrimaryColumnSetting(propertyKey));
    }
}

export function Column(options?: ColumOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(() => target.constructor, new _ColumnSetting(propertyKey, options));
    }
}

export function OneToMany<T>(getEntity: () => ClassType<T>, options?: JoinOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(() => target.constructor, new _OneToManySetting(propertyKey, getEntity, options));
    }
}

export function OneToOne<T>(getEntity: () => ClassType<T>, options?: JoinOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(() => target.constructor, new _OneToOneSetting(propertyKey, getEntity, options));
    }
}

export function ManyToOne<T>(getEntity: () => ClassType<T>, options?: JoinOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(() => target.constructor, new _ManyToOneSetting(propertyKey, getEntity, options));
    }
}

export function ArrayReference<T>(getEntity: () => ClassType<T>, options?: JoinOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(() => target.constructor, new _ArrayReference(propertyKey, getEntity, options));
    }
}

export function CreateDateColumn<T>(options?: DateOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(() => target.constructor, new _CreateDateColumnSetting(propertyKey));
    }
}

export function UpdateDateColumn<T>(options?: DateOption) {
    return (target: any, propertyKey: string) => {
        addColumnSettings(() => target.constructor, new _UpdateDateColumnSetting(propertyKey));
    }
}

export function FirebaseEntity(tableName: string) {
    return (constructor: Function) => {
        entityMetaInfo.push({
            tableName: tableName,
            Entity: constructor
        });
    }
}

export function NestedFirebaseEntity<T>(parentEntityGetter: () => ClassType<T>, tableName: string) {
    return (constructor: Function) => {
        entityMetaInfo.push({
            tableName: tableName,
            Entity: constructor,
            parentEntityGetter: parentEntityGetter
        });
    }
}