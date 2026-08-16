export class EntityNotFoundError extends Error {
    public constructor(
        public readonly entity: string,
        public readonly id: string
    ) {
        super(`${entity} with id "${id}" was not found.`);
        this.name = 'EntityNotFoundError';

        Object.setPrototypeOf(
            this,
            new.target.prototype
        );
    }
}