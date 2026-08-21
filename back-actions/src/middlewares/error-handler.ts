import type { ErrorRequestHandler, Request } from 'express';
import { BusinessRuleError } from '../services/errors/business-rule.error.js';
import { EntityNotFoundError } from '../services/errors/entity-not-found.error.js';
import { ValidationError } from '../services/errors/validation.error.js';

interface ErrorResponse {
    error: {
        code: string;
        message: string;
        entity?: string;
        id?: string;
        issues?: unknown;
    };
}

interface JsonSyntaxError extends SyntaxError {
    status?: number;
    body?: unknown;
    type?: string;
}

function isJsonSyntaxError(error: unknown): error is JsonSyntaxError {
    if (!(error instanceof SyntaxError)) {
        return false;
    }

    const candidate = error as JsonSyntaxError;

    return candidate.type === 'entity.parse.failed';
}

function createErrorResponse(error: unknown): {
    statusCode: number;
    body: ErrorResponse;
} {
    if (error instanceof ValidationError) {
        return {
            statusCode: 422,
            body: {
                error: {
                    code: error.code,
                    message: error.message
                }
            }
        };
    }

    if (error instanceof EntityNotFoundError) {
        return {
            statusCode: 404,
            body: {
                error: {
                    code: 'ENTITY_NOT_FOUND',
                    message: error.message,
                    entity: error.entity,
                    id: error.id
                }
            }
        };
    }

    if (error instanceof BusinessRuleError) {
        return {
            statusCode: error.statusCode,
            body: {
                error: {
                    code: error.code,
                    message: error.message
                }
            }
        };
    }

    if (isJsonSyntaxError(error)) {
        return {
            statusCode: 400,
            body: {
                error: {
                    code: 'INVALID_JSON',
                    message: 'Request body contains invalid JSON.'
                }
            }
        };
    }

    return {
        statusCode: 500,
        body: {
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred.'
            }
        }
    };
}

function logUnexpectedError(
    request: Request,
    error: unknown
): void {
    if (
        error instanceof ValidationError ||
        error instanceof EntityNotFoundError ||
        error instanceof BusinessRuleError ||
        isJsonSyntaxError(error)
    ) {
        return;
    }

    console.error(
        'Unhandled application error.',
        {
            method: request.method,
            path: request.originalUrl,
            error
        }
    );
}

export const globalErrorHandler:
    ErrorRequestHandler =
    (
        error,
        request,
        response,
        _next
    ): void => {
        if (response.headersSent) {
            return;
        }

        logUnexpectedError(
            request,
            error
        );

        const result = createErrorResponse(error);

        response.status(result.statusCode).json(result.body);
    };