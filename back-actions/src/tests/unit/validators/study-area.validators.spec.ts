import { describe, expect, it } from 'vitest';
import { validateStudyAreaId, validateCreateStudyArea, validateUpdateStudyArea } from '../../../validators/study-area.validators.js';
import { createRequest } from './validator-test.helpers.js';



const VALID_UUID =
    '550e8400-e29b-41d4-a716-446655440000';

describe('study-area.validators', () => {
    describe('validateStudyAreaId', () => {
        it('deve aceitar UUID válido', () => {
            expect(
                validateStudyAreaId(
                    createRequest({
                        id: VALID_UUID
                    })
                )
            ).toEqual([]);
        });

        it('deve rejeitar UUID inválido', () => {
            expect(
                validateStudyAreaId(
                    createRequest({
                        id: 'invalid'
                    })
                )
            ).toHaveLength(1);
        });
    });

    describe('validateCreateStudyArea', () => {
        it('deve aceitar dados válidos', () => {
            expect(
                validateCreateStudyArea(
                    createRequest(
                        {},
                        {
                            name: 'Angular',
                            weeklyGoalMinutes: 600
                        }
                    )
                )
            ).toEqual([]);
        });

        it('deve rejeitar body inválido', () => {
            const issues =
                validateCreateStudyArea(
                    createRequest(
                        {},
                        null
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'body',
                        message:
                            'Request body must be a JSON object.'
                    }
                ])
            );
        });

        it('deve rejeitar nome vazio', () => {
            const issues =
                validateCreateStudyArea(
                    createRequest(
                        {},
                        {
                            name: '',
                            weeklyGoalMinutes: 600
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

        it('deve rejeitar meta semanal igual a zero', () => {
            const issues =
                validateCreateStudyArea(
                    createRequest(
                        {},
                        {
                            name: 'Angular',
                            weeklyGoalMinutes: 0
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'weeklyGoalMinutes',
                        message:
                            'weeklyGoalMinutes must be a positive integer.'
                    }
                ])
            );
        });

        it('deve rejeitar meta semanal decimal', () => {
            const issues =
                validateCreateStudyArea(
                    createRequest(
                        {},
                        {
                            name: 'Angular',
                            weeklyGoalMinutes: 600.5
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'weeklyGoalMinutes',
                        message:
                            'weeklyGoalMinutes must be a positive integer.'
                    }
                ])
            );
        });
    });

    describe('validateUpdateStudyArea', () => {
        it('deve aceitar dados válidos', () => {
            expect(
                validateUpdateStudyArea(
                    createRequest(
                        {
                            id: VALID_UUID
                        },
                        {
                            name: 'Angular',
                            weeklyGoalMinutes: 600
                        }
                    )
                )
            ).toEqual([]);
        });

        it('deve rejeitar id inválido', () => {
            const issues =
                validateUpdateStudyArea(
                    createRequest(
                        {
                            id: 'invalid'
                        },
                        {
                            name: 'Angular',
                            weeklyGoalMinutes: 600
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'params.id',
                        message:
                            'id must be a valid UUID.'
                    }
                ])
            );
        });
    });
});