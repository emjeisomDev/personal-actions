import { describe, expect, it } from 'vitest';
import { BusinessRuleError } from '../../../services/errors/business-rule.error.js';
import { EntityNotFoundError } from '../../../services/errors/entity-not-found.error.js';
import { ValidationError } from '../../../services/errors/validation.error.js';
import { sendControllerError } from '../../../controllers/errors/controller-error-response.js';
import { createMockResponse } from '../helpers/request-test.helpers.js';

describe('sendControllerError', () => {
    it('Deve responder 422 para ValidationError.', () => {
        const {
            response,
            status,
            json
        } = createMockResponse();

        const error = new ValidationError('Invalid field.', 'INVALID_FIELD');
        sendControllerError(response, error);
        expect(status).toHaveBeenCalledWith(422);
        expect(json).toHaveBeenCalledWith({
            error: {
                code: 'INVALID_FIELD',
                message: 'Invalid field.'
            }
        });
    });

    it('Deve responder 404 para EntityNotFoundError', () => {
        const {
            response,
            status,
            json
        } = createMockResponse();

        const error =
            new EntityNotFoundError(
                'StudyArea',
                'area-1'
            );

        sendControllerError(
            response,
            error
        );

        expect(status)
            .toHaveBeenCalledWith(404);

        expect(json)
            .toHaveBeenCalledWith({
                error: {
                    code: 'ENTITY_NOT_FOUND',
                    message: error.message,
                    entity: error.entity,
                    id: error.id
                }
            });
    });

    it('Deve responder com o status do BusinessRuleError', () => {
        const {
            response,
            status,
            json
        } = createMockResponse();

        const error =
            new BusinessRuleError(
                'Business rule violated.',
                'BUSINESS_RULE_VIOLATION',
                409
            );

        sendControllerError(
            response,
            error
        );

        expect(status)
            .toHaveBeenCalledWith(409);

        expect(json)
            .toHaveBeenCalledWith({
                error: {
                    code: 'BUSINESS_RULE_VIOLATION',
                    message:
                        'Business rule violated.'
                }
            });
    });

    it('Deve responder 500 para erro desconhecido', () => {
        const {
            response,
            status,
            json
        } = createMockResponse();

        sendControllerError(
            response,
            new Error('Unexpected error')
        );

        expect(status)
            .toHaveBeenCalledWith(500);

        expect(json)
            .toHaveBeenCalledWith({
                error: {
                    code:
                        'INTERNAL_SERVER_ERROR',
                    message:
                        'An unexpected error occurred.'
                }
            });
    });
});