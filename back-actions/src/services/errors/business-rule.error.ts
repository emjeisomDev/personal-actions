export class BusinessRuleError extends Error {
    public constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode: number = 409
    ) {
        super(message);
        this.name = 'BusinessRuleError';

        Object.setPrototypeOf(
            this,
            new.target.prototype
        );
    }
}