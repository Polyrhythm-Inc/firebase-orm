export class RecordNotFoundError extends Error {
    public name = 'RecordNotFoundError';

    constructor(public Entity: Function) {
        super(`${Entity.name} was not found.`);
        Object.setPrototypeOf(this, RecordNotFoundError.prototype);
    }

    public toString() {
        return this.name + ': ' + this.message;
    }
}