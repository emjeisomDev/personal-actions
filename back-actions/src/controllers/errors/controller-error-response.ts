import type { Response } from 'express';

import { BusinessRuleError } from '../../services/errors/business-rule.error.js';
import { EntityNotFoundError } from '../../services/errors/entity-not-found.error.js';
import { ValidationError } from '../../services/errors/validation.error.js';

export function sendControllerError(
    response: Response,
    error: unknown
): void {
    if (error instanceof ValidationError) {
        response.status(422).json({
            error: {
                code: error.code,
                message: error.message
            }
        });

        return;
    }

    if (error instanceof EntityNotFoundError) {
        response.status(404).json({
            error: {
                code: 'ENTITY_NOT_FOUND',
                message: error.message,
                entity: error.entity,
                id: error.id
            }
        });

        return;
    }

    if (error instanceof BusinessRuleError) {
        response.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message
            }
        });

        return;
    }

    response.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred.'
        }
    });
}