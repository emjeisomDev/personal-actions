import { describe, expect, it } from 'vitest';
import { validateStudyPlanId, validateCreateStudyPlan } from '../../../validators/study-plan.validators.js';
import { createRequest } from './validator-test.helpers.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('study-plan.validators', () => {
    describe('validateStudyPlanId', () => {
        it('deve aceitar UUID válido', () => {
            expect(
                validateStudyPlanId(
                    createRequest({
                        id: VALID_UUID
                    })
                )
            ).toEqual([]);
        });

        it('deve rejeitar UUID inválido', () => {
            expect(
                validateStudyPlanId(
                    createRequest({
                        id: 'invalid'
                    })
                )
            ).toHaveLength(1);
        });
    });

    describe('validateCreateStudyPlan', () => {
        it('deve aceitar plano ativo válido', () => {
            expect(
                validateCreateStudyPlan(
                    createRequest(
                        {},
                        {
                            name: 'Plano padrão',
                            coefficient: 1.5,
                            status: 'active'
                        }
                    )
                )
            ).toEqual([]);
        });

        it('deve aceitar plano inativo válido', () => {
            expect(
                validateCreateStudyPlan(
                    createRequest(
                        {},
                        {
                            name: 'Plano antigo',
                            coefficient: 1,
                            status: 'inactive'
                        }
                    )
                )
            ).toEqual([]);
        });

        it('deve rejeitar nome vazio', () => {
            const issues =
                validateCreateStudyPlan(
                    createRequest(
                        {},
                        {
                            name: '',
                            coefficient: 1,
                            status: 'active'
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'name',
                        message:
                            'name is required and must be a non-empty string.'
                    }
                ])
            );
        });

        it('deve rejeitar coefficient igual a zero', () => {
            const issues =
                validateCreateStudyPlan(
                    createRequest(
                        {},
                        {
                            name: 'Plano',
                            coefficient: 0,
                            status: 'active'
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'coefficient',
                        message:
                            'coefficient must be a finite number greater than zero.'
                    }
                ])
            );
        });

        it('deve rejeitar coefficient negativo', () => {
            const issues =
                validateCreateStudyPlan(
                    createRequest(
                        {},
                        {
                            name: 'Plano',
                            coefficient: -1,
                            status: 'active'
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'coefficient',
                        message:
                            'coefficient must be a finite number greater than zero.'
                    }
                ])
            );
        });

        it('deve rejeitar status diferente de active ou inactive', () => {
            const issues =
                validateCreateStudyPlan(
                    createRequest(
                        {},
                        {
                            name: 'Plano',
                            coefficient: 1,
                            status: 'archived'
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'status',
                        message:
                            'status must be either active or inactive.'
                    }
                ])
            );
        });

        it('deve rejeitar status ausente', () => {
            const issues =
                validateCreateStudyPlan(
                    createRequest(
                        {},
                        {
                            name: 'Plano',
                            coefficient: 1
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'status',
                        message:
                            'status must be either active or inactive.'
                    }
                ])
            );
        });
    });
});