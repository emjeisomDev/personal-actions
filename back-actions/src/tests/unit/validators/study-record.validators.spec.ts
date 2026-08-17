import { describe, expect, it } from 'vitest';

import {
    validateStudyRecordId,
    validateStudyRecordStudyAreaWeekId,
    validateCreateStudyRecord
} from '../../../validators/study-record.validators.js';

import { createRequest } from './validator-test.helpers.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('study-record.validators', () => {
    describe('validateStudyRecordId', () => {
        it('deve aceitar UUID válido', () => {
            expect(
                validateStudyRecordId(
                    createRequest({
                        id: VALID_UUID
                    })
                )
            ).toEqual([]);
        });

        it('deve rejeitar UUID inválido', () => {
            expect(
                validateStudyRecordId(
                    createRequest({
                        id: 'invalid'
                    })
                )
            ).toHaveLength(1);
        });
    });

    describe('validateStudyRecordStudyAreaWeekId', () => {
        it('deve aceitar UUID válido', () => {
            expect(
                validateStudyRecordStudyAreaWeekId(
                    createRequest({
                        studyAreaWeekId:
                            VALID_UUID
                    })
                )
            ).toEqual([]);
        });

        it('deve rejeitar UUID inválido', () => {
            expect(
                validateStudyRecordStudyAreaWeekId(
                    createRequest({
                        studyAreaWeekId:
                            'invalid'
                    })
                )
            ).toHaveLength(1);
        });
    });

    describe('validateCreateStudyRecord', () => {
        it('deve aceitar registro válido', () => {
            expect(
                validateCreateStudyRecord(
                    createRequest(
                        {
                            studyAreaWeekId:
                                VALID_UUID
                        },
                        {
                            date:
                                '2026-08-17',
                            minutes:
                                60
                        }
                    )
                )
            ).toEqual([]);
        });

        it('deve rejeitar StudyAreaWeek inválida', () => {
            const issues =
                validateCreateStudyRecord(
                    createRequest(
                        {
                            studyAreaWeekId:
                                'invalid'
                        },
                        {
                            date:
                                '2026-08-17',
                            minutes:
                                60
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field:
                            'params.studyAreaWeekId',
                        message:
                            'studyAreaWeekId must be a valid UUID.'
                    }
                ])
            );
        });

        it('deve rejeitar minutes igual a zero', () => {
            const issues =
                validateCreateStudyRecord(
                    createRequest(
                        {
                            studyAreaWeekId:
                                VALID_UUID
                        },
                        {
                            date:
                                '2026-08-17',
                            minutes:
                                0
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'minutes',
                        message:
                            'minutes must be a positive integer.'
                    }
                ])
            );
        });

        it('deve rejeitar minutes decimal', () => {
            const issues =
                validateCreateStudyRecord(
                    createRequest(
                        {
                            studyAreaWeekId:
                                VALID_UUID
                        },
                        {
                            date:
                                '2026-08-17',
                            minutes:
                                30.5
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'minutes',
                        message:
                            'minutes must be a positive integer.'
                    }
                ])
            );
        });

        it('deve rejeitar data inexistente', () => {
            const issues =
                validateCreateStudyRecord(
                    createRequest(
                        {
                            studyAreaWeekId:
                                VALID_UUID
                        },
                        {
                            date:
                                '2026-02-30',
                            minutes:
                                60
                        }
                    )
                );

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field: 'date',
                        message:
                            'date must be a valid date in YYYY-MM-DD format.'
                    }
                ])
            );
        });

        it('deve rejeitar body que não seja objeto', () => {
            const issues =
                validateCreateStudyRecord(
                    createRequest(
                        {
                            studyAreaWeekId:
                                VALID_UUID
                        },
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

        it('deve retornar todas as issues encontradas no payload', () => {
            const issues =
                validateCreateStudyRecord(
                    createRequest(
                        {
                            studyAreaWeekId:
                                'invalid'
                        },
                        {
                            date:
                                '2026-02-30',
                            minutes:
                                0
                        }
                    )
                );

            expect(issues).toHaveLength(3);

            expect(issues).toEqual(
                expect.arrayContaining([
                    {
                        field:
                            'params.studyAreaWeekId',
                        message:
                            'studyAreaWeekId must be a valid UUID.'
                    },
                    {
                        field: 'minutes',
                        message:
                            'minutes must be a positive integer.'
                    },
                    {
                        field: 'date',
                        message:
                            'date must be a valid date in YYYY-MM-DD format.'
                    }
                ])
            );
        });



    });
});