import { describe, expect, it } from 'vitest';
import type { Request } from 'express';
import {
    isValidUuid,
    isValidDateString,
    validateUuidParam,
    validateDateParam,
    validateRequiredString,
    validatePositiveInteger,
    validatePositiveNumber,
    validateBodyIsObject
} from '../../../validators/common.validators.js';

function createRequest(
    params: Record<string, string> = {},
    body: unknown = {}
): Request {
    return {
        params,
        body
    } as Request;
}

describe('common.validators', () => {
    describe('isValidUuid', () => {
        it('deve aceitar UUID válido', () => {
            expect(
                isValidUuid(
                    '550e8400-e29b-41d4-a716-446655440000'
                )
            ).toBe(true);
        });

        it('deve rejeitar UUID inválido', () => {
            expect(
                isValidUuid('invalid-uuid')
            ).toBe(false);
        });

        it('deve rejeitar valor que não seja string', () => {
            expect(
                isValidUuid(123)
            ).toBe(false);
        });

        it('deve rejeitar UUID com versão inválida', () => {
            expect(
                isValidUuid(
                    '550e8400-e29b-61d4-a716-446655440000'
                )
            ).toBe(false);
        });
    });

    describe('isValidDateString', () => {
        it('deve aceitar data válida no formato YYYY-MM-DD', () => {
            expect(
                isValidDateString('2026-08-17')
            ).toBe(true);
        });

        it('deve rejeitar formato diferente de YYYY-MM-DD', () => {
            expect(
                isValidDateString('17-08-2026')
            ).toBe(false);
        });

        it('deve rejeitar data inexistente', () => {
            expect(
                isValidDateString('2026-02-30')
            ).toBe(false);
        });

        it('deve rejeitar mês inexistente', () => {
            expect(
                isValidDateString('2026-13-01')
            ).toBe(false);
        });

        it('deve rejeitar dia inexistente', () => {
            expect(
                isValidDateString('2026-04-31')
            ).toBe(false);
        });

        it('deve rejeitar valor que não seja string', () => {
            expect(
                isValidDateString(null)
            ).toBe(false);
        });
    });

    describe('validateUuidParam', () => {
        it('deve aceitar parâmetro UUID válido', () => {
            const request = createRequest({
                id: '550e8400-e29b-41d4-a716-446655440000'
            });

            expect(
                validateUuidParam(
                    request,
                    'id'
                )
            ).toEqual([]);
        });

        it('deve retornar issue para UUID inválido', () => {
            const request = createRequest({
                id: 'invalid'
            });

            expect(
                validateUuidParam(
                    request,
                    'id'
                )
            ).toEqual([
                {
                    field: 'params.id',
                    message:
                        'id must be a valid UUID.'
                }
            ]);
        });
    });

    describe('validateDateParam', () => {
        it('deve aceitar data válida', () => {
            const request = createRequest({
                weekStartDate: '2026-08-17'
            });

            expect(
                validateDateParam(
                    request,
                    'weekStartDate'
                )
            ).toEqual([]);
        });

        it('deve rejeitar data inválida', () => {
            const request = createRequest({
                weekStartDate: '2026-02-30'
            });

            expect(
                validateDateParam(
                    request,
                    'weekStartDate'
                )
            ).toEqual([
                {
                    field:
                        'params.weekStartDate',
                    message:
                        'weekStartDate must be a valid date in YYYY-MM-DD format.'
                }
            ]);
        });
    });

    describe('validateRequiredString', () => {
        it('deve aceitar string preenchida', () => {
            expect(
                validateRequiredString(
                    'Angular',
                    'name'
                )
            ).toEqual([]);
        });

        it('deve rejeitar string vazia', () => {
            expect(
                validateRequiredString(
                    '',
                    'name'
                )
            ).toEqual([
                {
                    field: 'name',
                    message:
                        'name is required and must be a non-empty string.'
                }
            ]);
        });

        it('deve rejeitar string contendo somente espaços', () => {
            expect(
                validateRequiredString(
                    '   ',
                    'name'
                )
            ).toEqual([
                {
                    field: 'name',
                    message:
                        'name is required and must be a non-empty string.'
                }
            ]);
        });

        it('deve rejeitar valor que não seja string', () => {
            expect(
                validateRequiredString(
                    123,
                    'name'
                )
            ).toEqual([
                {
                    field: 'name',
                    message:
                        'name is required and must be a non-empty string.'
                }
            ]);
        });
    });

    describe('validatePositiveInteger', () => {
        it('deve aceitar inteiro positivo', () => {
            expect(
                validatePositiveInteger(
                    60,
                    'minutes'
                )
            ).toEqual([]);
        });

        it('deve rejeitar zero', () => {
            expect(
                validatePositiveInteger(
                    0,
                    'minutes'
                )
            ).toEqual([
                {
                    field: 'minutes',
                    message:
                        'minutes must be a positive integer.'
                }
            ]);
        });

        it('deve rejeitar número negativo', () => {
            expect(
                validatePositiveInteger(
                    -1,
                    'minutes'
                )
            ).toEqual([
                {
                    field: 'minutes',
                    message:
                        'minutes must be a positive integer.'
                }
            ]);
        });

        it('deve rejeitar número decimal', () => {
            expect(
                validatePositiveInteger(
                    30.5,
                    'minutes'
                )
            ).toEqual([
                {
                    field: 'minutes',
                    message:
                        'minutes must be a positive integer.'
                }
            ]);
        });

        it('deve rejeitar string numérica', () => {
            expect(
                validatePositiveInteger(
                    '30',
                    'minutes'
                )
            ).toEqual([
                {
                    field: 'minutes',
                    message:
                        'minutes must be a positive integer.'
                }
            ]);
        });
    });

    describe('validatePositiveNumber', () => {
        it('deve aceitar número positivo finito', () => {
            expect(
                validatePositiveNumber(
                    1.5,
                    'coefficient'
                )
            ).toEqual([]);
        });

        it('deve rejeitar zero', () => {
            expect(
                validatePositiveNumber(
                    0,
                    'coefficient'
                )
            ).toEqual([
                {
                    field: 'coefficient',
                    message:
                        'coefficient must be a finite number greater than zero.'
                }
            ]);
        });

        it('deve rejeitar número negativo', () => {
            expect(
                validatePositiveNumber(
                    -1,
                    'coefficient'
                )
            ).toEqual([
                {
                    field: 'coefficient',
                    message:
                        'coefficient must be a finite number greater than zero.'
                }
            ]);
        });

        it('deve rejeitar Infinity', () => {
            expect(
                validatePositiveNumber(
                    Infinity,
                    'coefficient'
                )
            ).toEqual([
                {
                    field: 'coefficient',
                    message:
                        'coefficient must be a finite number greater than zero.'
                }
            ]);
        });

        it('deve rejeitar string numérica', () => {
            expect(
                validatePositiveNumber(
                    '1.5',
                    'coefficient'
                )
            ).toEqual([
                {
                    field: 'coefficient',
                    message:
                        'coefficient must be a finite number greater than zero.'
                }
            ]);
        });
    });

    describe('validateBodyIsObject', () => {
        it('deve aceitar objeto JSON', () => {
            expect(
                validateBodyIsObject(
                    createRequest(
                        {},
                        {
                            name: 'Angular'
                        }
                    )
                )
            ).toEqual([]);
        });

        it('deve rejeitar null', () => {
            expect(
                validateBodyIsObject(
                    createRequest({}, null)
                )
            ).toEqual([
                {
                    field: 'body',
                    message:
                        'Request body must be a JSON object.'
                }
            ]);
        });

        it('deve rejeitar array', () => {
            expect(
                validateBodyIsObject(
                    createRequest(
                        {},
                        []
                    )
                )
            ).toEqual([
                {
                    field: 'body',
                    message:
                        'Request body must be a JSON object.'
                }
            ]);
        });

        it('deve rejeitar string', () => {
            expect(
                validateBodyIsObject(
                    createRequest(
                        {},
                        'invalid'
                    )
                )
            ).toEqual([
                {
                    field: 'body',
                    message:
                        'Request body must be a JSON object.'
                }
            ]);
        });
    });
});