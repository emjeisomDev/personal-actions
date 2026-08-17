import { describe, expect, it } from 'vitest';

import {
    validateStudyAreaWeekId,
    validateStudyAreaWeekByAreaAndWeek,
    validateStudyAreaWeekByWeek,
    validateCreateStudyAreaWeek
} from '../../../validators/study-area-week.validators.js';

import { createRequest } from './validator-test.helpers.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('study-area-week.validators', () => {
    describe('validateStudyAreaWeekId', () => {
        it('deve aceitar UUID válido', () => {
            expect(
                validateStudyAreaWeekId(
                    createRequest({
                        id: VALID_UUID
                    })
                )
            ).toEqual([]);
        });

        it('deve rejeitar UUID inválido', () => {
            expect(
                validateStudyAreaWeekId(
                    createRequest({
                        id: 'invalid'
                    })
                )
            ).toHaveLength(1);
        });
    });

    describe('validateStudyAreaWeekByAreaAndWeek', () => {
        it('deve aceitar área e semana válidas', () => {
            expect(
                validateStudyAreaWeekByAreaAndWeek(
                    createRequest({
                        studyAreaId:
                            VALID_UUID,
                        weekStartDate:
                            '2026-08-17'
                    })
                )
            ).toEqual([]);
        });

        it('deve rejeitar área inválida', () => {
            const issues =
                validateStudyAreaWeekByAreaAndWeek(
                    createRequest({
                        studyAreaId:
                            'invalid',
                        weekStartDate:
                            '2026-08-17'
                    })
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field:
                            'params.studyAreaId',
                        message:
                            'studyAreaId must be a valid UUID.'
                    }
                ])
            );
        });

        it('deve rejeitar data inexistente', () => {
            const issues =
                validateStudyAreaWeekByAreaAndWeek(
                    createRequest({
                        studyAreaId:
                            VALID_UUID,
                        weekStartDate:
                            '2026-02-30'
                    })
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field:
                            'params.weekStartDate',
                        message:
                            'weekStartDate must be a valid date in YYYY-MM-DD format.'
                    }
                ])
            );
        });
    });

    describe('validateStudyAreaWeekByWeek', () => {
        it('deve aceitar semana válida', () => {
            expect(
                validateStudyAreaWeekByWeek(
                    createRequest({
                        weekStartDate:
                            '2026-08-17'
                    })
                )
            ).toEqual([]);
        });

        it('deve rejeitar formato inválido', () => {
            expect(
                validateStudyAreaWeekByWeek(
                    createRequest({
                        weekStartDate:
                            '17-08-2026'
                    })
                )
            ).toHaveLength(1);
        });
    });

    describe('validateCreateStudyAreaWeek', () => {
        it('deve aceitar configuração válida', () => {
            expect(
                validateCreateStudyAreaWeek(
                    createRequest(
                        {},
                        {
                            studyAreaId:
                                VALID_UUID,
                            studyPlanId:
                                VALID_UUID,
                            weekStartDate:
                                '2026-08-17'
                        }
                    )
                )
            ).toEqual([]);
        });

        it('deve rejeitar studyAreaId inválido', () => {
            const issues =
                validateCreateStudyAreaWeek(
                    createRequest(
                        {},
                        {
                            studyAreaId:
                                'invalid',
                            studyPlanId:
                                VALID_UUID,
                            weekStartDate:
                                '2026-08-17'
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field:
                            'studyAreaId',
                        message:
                            'studyAreaId must be a valid UUID.'
                    }
                ])
            );
        });

        it('deve rejeitar studyPlanId inválido', () => {
            const issues =
                validateCreateStudyAreaWeek(
                    createRequest(
                        {},
                        {
                            studyAreaId:
                                VALID_UUID,
                            studyPlanId:
                                'invalid',
                            weekStartDate:
                                '2026-08-17'
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field:
                            'studyPlanId',
                        message:
                            'studyPlanId must be a valid UUID.'
                    }
                ])
            );
        });

        it('deve rejeitar weekStartDate inválida', () => {
            const issues =
                validateCreateStudyAreaWeek(
                    createRequest(
                        {},
                        {
                            studyAreaId:
                                VALID_UUID,
                            studyPlanId:
                                VALID_UUID,
                            weekStartDate:
                                '2026-02-30'
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field:
                            'weekStartDate',
                        message:
                            'weekStartDate must be a valid date in YYYY-MM-DD format.'
                    }
                ])
            );
        });
    });
});