import type {
    NextFunction,
    Request,
    RequestHandler,
    Response
} from 'express';

import type { ParamsDictionary } from 'express-serve-static-core';

export interface ValidationIssue {
    field: string;
    message: string;
}

export type RequestValidator<Params extends ParamsDictionary = ParamsDictionary> =
    (request: Request<Params>) => ValidationIssue[];

export function createValidationMiddleware<Params extends ParamsDictionary =
    ParamsDictionary>(validator: RequestValidator<Params>): RequestHandler<Params> {
    return (
        request: Request<Params>,
        response: Response,
        next: NextFunction
    ): void => {
        const issues = validator(request);

        if (issues.length > 0) {
            response.status(422).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Request validation failed.',
                    issues
                }
            });

            return;
        }

        next();
    };
}