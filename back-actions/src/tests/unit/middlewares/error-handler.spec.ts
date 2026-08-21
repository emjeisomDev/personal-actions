import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { globalErrorHandler } from '../../../middlewares/error-handler.js';
import { ValidationError } from '../../../services/errors/validation.error.js';
import { EntityNotFoundError } from '../../../services/errors/entity-not-found.error.js';
import { BusinessRuleError } from '../../../services/errors/business-rule.error.js';

function createRequest(): Request {
    return {
        method: 'GET',
        originalUrl: '/api/test'
    } as Request;
}

function createResponse(
    headersSent = false
): {
    response: Response;
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
} {
    const status =
        vi.fn();

    const json =
        vi.fn();

    status.mockReturnValue({
        json
    });

    const response = {
        headersSent,
        status,
        json
    } as unknown as Response;

    return {
        response,
        status,
        json
    };
}

describe(
    'globalErrorHandler',
    () => {
        afterEach(
            () => {
                vi.restoreAllMocks();
            }
        );

        it(
            'deve responder 422 para ValidationError preservando code e message',
            () => {
                const {
                    response,
                    status,
                    json
                } = createResponse();

                const next =
                    vi.fn();

                const consoleErrorSpy =
                    vi.spyOn(
                        console,
                        'error'
                    ).mockImplementation(
                        () => undefined
                    );

                const error =
                    new ValidationError(
                        'Invalid field.',
                        'INVALID_FIELD'
                    );

                globalErrorHandler(
                    error,
                    createRequest(),
                    response,
                    next
                );

                expect(
                    status
                ).toHaveBeenCalledWith(
                    422
                );

                expect(
                    json
                ).toHaveBeenCalledWith({
                    error: {
                        code:
                            'INVALID_FIELD',
                        message:
                            'Invalid field.'
                    }
                });

                expect(
                    next
                ).not.toHaveBeenCalled();

                expect(
                    consoleErrorSpy
                ).not.toHaveBeenCalled();
            }
        );

        it('deve responder 404 para EntityNotFoundError com entity e id',
            () => {
                const {
                    response,
                    status,
                    json
                } = createResponse();

                const next =
                    vi.fn();

                const consoleErrorSpy =
                    vi.spyOn(
                        console,
                        'error'
                    ).mockImplementation(
                        () => undefined
                    );

                const error =
                    new EntityNotFoundError(
                        'StudyArea',
                        'area-1'
                    );

                globalErrorHandler(
                    error,
                    createRequest(),
                    response,
                    next
                );

                expect(
                    status
                ).toHaveBeenCalledWith(
                    404
                );

                expect(
                    json
                ).toHaveBeenCalledWith({
                    error: {
                        code:
                            'ENTITY_NOT_FOUND',
                        message:
                            error.message,
                        entity:
                            'StudyArea',
                        id:
                            'area-1'
                    }
                });

                expect(
                    next
                ).not.toHaveBeenCalled();

                expect(
                    consoleErrorSpy
                ).not.toHaveBeenCalled();
            }
        );

        it(
            'deve responder 409 para BusinessRuleError quando nenhum status customizado for informado',
            () => {
                const {
                    response,
                    status,
                    json
                } = createResponse();

                const next =
                    vi.fn();

                const consoleErrorSpy =
                    vi.spyOn(
                        console,
                        'error'
                    ).mockImplementation(
                        () => undefined
                    );

                const error =
                    new BusinessRuleError(
                        'Business rule violated.',
                        'BUSINESS_RULE_VIOLATION'
                    );

                globalErrorHandler(
                    error,
                    createRequest(),
                    response,
                    next
                );

                expect(
                    status
                ).toHaveBeenCalledWith(
                    409
                );

                expect(
                    json
                ).toHaveBeenCalledWith({
                    error: {
                        code:
                            'BUSINESS_RULE_VIOLATION',
                        message:
                            'Business rule violated.'
                    }
                });

                expect(
                    next
                ).not.toHaveBeenCalled();

                expect(
                    consoleErrorSpy
                ).not.toHaveBeenCalled();
            }
        );

        it(
            'deve respeitar status customizado do BusinessRuleError',
            () => {
                const {
                    response,
                    status,
                    json
                } = createResponse();

                const next =
                    vi.fn();

                const error =
                    new BusinessRuleError(
                        'Conflict with current state.',
                        'STATE_CONFLICT',
                        422
                    );

                globalErrorHandler(
                    error,
                    createRequest(),
                    response,
                    next
                );

                expect(
                    status
                ).toHaveBeenCalledWith(
                    422
                );

                expect(
                    json
                ).toHaveBeenCalledWith({
                    error: {
                        code:
                            'STATE_CONFLICT',
                        message:
                            'Conflict with current state.'
                    }
                });

                expect(
                    next
                ).not.toHaveBeenCalled();
            }
        );

        it(
            'deve responder 400 para JSON inválido',
            () => {
                const {
                    response,
                    status,
                    json
                } = createResponse();

                const next =
                    vi.fn();

                const consoleErrorSpy =
                    vi.spyOn(
                        console,
                        'error'
                    ).mockImplementation(
                        () => undefined
                    );

                const error =
                    Object.assign(
                        new SyntaxError(
                            'Unexpected token'
                        ),
                        {
                            type:
                                'entity.parse.failed'
                        }
                    );

                globalErrorHandler(
                    error,
                    createRequest(),
                    response,
                    next
                );

                expect(
                    status
                ).toHaveBeenCalledWith(
                    400
                );

                expect(
                    json
                ).toHaveBeenCalledWith({
                    error: {
                        code:
                            'INVALID_JSON',
                        message:
                            'Request body contains invalid JSON.'
                    }
                });

                expect(
                    next
                ).not.toHaveBeenCalled();

                expect(
                    consoleErrorSpy
                ).not.toHaveBeenCalled();
            }
        );

        it(
            'não deve tratar SyntaxError comum como JSON inválido',
            () => {
                const {
                    response,
                    status,
                    json
                } = createResponse();

                const next =
                    vi.fn();

                const consoleErrorSpy =
                    vi.spyOn(
                        console,
                        'error'
                    ).mockImplementation(
                        () => undefined
                    );

                const error =
                    new SyntaxError(
                        'Unexpected token'
                    );

                globalErrorHandler(
                    error,
                    createRequest(),
                    response,
                    next
                );

                expect(
                    status
                ).toHaveBeenCalledWith(
                    500
                );

                expect(
                    json
                ).toHaveBeenCalledWith({
                    error: {
                        code:
                            'INTERNAL_SERVER_ERROR',
                        message:
                            'An unexpected error occurred.'
                    }
                });

                expect(
                    json
                ).not.toHaveBeenCalledWith(
                    expect.objectContaining({
                        error:
                            expect.objectContaining({
                                message:
                                    'Unexpected token'
                            })
                    })
                );

                expect(
                    next
                ).not.toHaveBeenCalled();

                expect(
                    consoleErrorSpy
                ).toHaveBeenCalledTimes(
                    1
                );
            }
        );

        it(
            'deve responder 500 para erro desconhecido sem expor detalhes internos',
            () => {
                const {
                    response,
                    status,
                    json
                } = createResponse();

                const next =
                    vi.fn();

                const consoleErrorSpy =
                    vi.spyOn(
                        console,
                        'error'
                    ).mockImplementation(
                        () => undefined
                    );

                const error =
                    new Error(
                        'Database password leaked internally'
                    );

                globalErrorHandler(
                    error,
                    createRequest(),
                    response,
                    next
                );

                expect(
                    status
                ).toHaveBeenCalledWith(
                    500
                );

                expect(
                    json
                ).toHaveBeenCalledWith({
                    error: {
                        code:
                            'INTERNAL_SERVER_ERROR',
                        message:
                            'An unexpected error occurred.'
                    }
                });

                expect(
                    json
                ).not.toHaveBeenCalledWith(
                    expect.objectContaining({
                        error:
                            expect.objectContaining({
                                message:
                                    'Database password leaked internally'
                            })
                    })
                );

                expect(
                    next
                ).not.toHaveBeenCalled();

                expect(
                    consoleErrorSpy
                ).toHaveBeenCalledTimes(
                    1
                );

                expect(
                    consoleErrorSpy
                ).toHaveBeenCalledWith(
                    'Unhandled application error.',
                    expect.objectContaining({
                        method:
                            'GET',
                        path:
                            '/api/test',
                        error
                    })
                );
            }
        );

        it(
            'deve encaminhar o erro quando os headers já foram enviados',
            () => {
                const {
                    response,
                    status,
                    json
                } = createResponse(
                    true
                );

                const next =
                    vi.fn();

                const consoleErrorSpy =
                    vi.spyOn(
                        console,
                        'error'
                    ).mockImplementation(
                        () => undefined
                    );

                const error =
                    new Error(
                        'Response stream failure'
                    );

                globalErrorHandler(
                    error,
                    createRequest(),
                    response,
                    next
                );

                expect(
                    next
                ).toHaveBeenCalledTimes(
                    1
                );

                expect(
                    next
                ).toHaveBeenCalledWith(
                    error
                );

                expect(
                    status
                ).not.toHaveBeenCalled();

                expect(
                    json
                ).not.toHaveBeenCalled();

                expect(
                    consoleErrorSpy
                ).not.toHaveBeenCalled();
            }
        );
    }
);