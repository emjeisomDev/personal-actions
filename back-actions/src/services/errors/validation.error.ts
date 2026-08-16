export class ValidationError extends Error {
    public constructor(
        message: string,
        public readonly code: string
    ) {
        super(message);
        this.name = 'ValidationError';

        Object.setPrototypeOf(
            this,
            new.target.prototype
        );
    }
}