import { describe, expect, it, vi } from 'vitest';
import { createValidationMiddleware } from '../../../validators/validation-middleware.js';
import { createRequest } from './validator-test.helpers.js';
import { createMockResponse } from '../helpers/request-test.helpers.js';

describe('createValidationMiddleware', () => {
    it('deve chamar next quando não houver issues', () => {
        const next = vi.fn();
        const validator = vi.fn().mockReturnValue([]);
        const middleware = createValidationMiddleware(validator);
        const request = createRequest();
        const { response } = createMockResponse();

        middleware(request, response, next);

        expect(validator).toHaveBeenCalledWith(request);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 422 quando houver issues', () => {
        const next = vi.fn();

        const validator =
            vi.fn().mockReturnValue([
                {
                    field: 'name',
                    message: 'name is required and must be a non-empty string.'
                }
            ]);

        const middleware =
            createValidationMiddleware(
                validator
            );

        const request =
            createRequest();

        const {
            response,
            status,
            json
        } = createMockResponse();

        middleware(
            request,
            response,
            next
        );

        expect(
            validator
        ).toHaveBeenCalledWith(
            request
        );

        expect(status)
            .toHaveBeenCalledWith(422);

        expect(json)
            .toHaveBeenCalledWith({
                error: {
                    code:
                        'VALIDATION_ERROR',
                    message:
                        'Request validation failed.',
                    issues: [
                        {
                            field: 'name',
                            message:
                                'name is required and must be a non-empty string.'
                        }
                    ]
                }
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    it('não deve chamar next quando houver múltiplas issues', () => {
        const next =
            vi.fn();

        const validator =
            vi.fn().mockReturnValue([
                {
                    field: 'name',
                    message: 'Invalid name.'
                },
                {
                    field: 'coefficient',
                    message:
                        'Invalid coefficient.'
                }
            ]);

        const middleware =
            createValidationMiddleware(
                validator
            );

        const request =
            createRequest();

        const {
            response,
            status,
            json
        } = createMockResponse();

        middleware(
            request,
            response,
            next
        );

        expect(status)
            .toHaveBeenCalledWith(422);

        expect(json)
            .toHaveBeenCalledWith({
                error: {
                    code:
                        'VALIDATION_ERROR',
                    message:
                        'Request validation failed.',
                    issues: [
                        {
                            field: 'name',
                            message:
                                'Invalid name.'
                        },
                        {
                            field: 'coefficient',
                            message:
                                'Invalid coefficient.'
                        }
                    ]
                }
            });

        expect(next)
            .not.toHaveBeenCalled();
    });
});