export declare class RecordNotFoundError extends Error {
    Entity: Function;
    name: string;
    constructor(Entity: Function);
    toString(): string;
}
