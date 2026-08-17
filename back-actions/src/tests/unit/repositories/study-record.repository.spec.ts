import { describe, expect, it } from 'vitest';
import { StudyRecordRepository } from '../../../repositories/study-record.repository.js';
import { createDatabaseExecutorMock, createQueryResult } from './database-executor.mock.js';

describe('StudyRecordRepository', () => {
    const createdAt =
        new Date('2026-08-17T15:00:00.000Z');

    describe('findById', () => {
        it('Must return the mapped record', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'record-1',
                        date: '2026-08-17',
                        minutes: 60,
                        created_at: createdAt,
                        study_area_week_id: 'week-1'
                    }
                ])
            );

            await expect(
                repository.findById('record-1')
            ).resolves.toEqual({
                id: 'record-1',
                date: '2026-08-17',
                minutes: 60,
                createdAt,
                studyAreaWeekId: 'week-1'
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'WHERE id = $1'
                ),
                ['record-1']
            );
        });

        it('Should return null when the record does not exist', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult([])
            );

            await expect(
                repository.findById('missing-id')
            ).resolves.toBeNull();
        });
    });

    describe('findByStudyAreaWeekId', () => {
        it('Must return all records for the week', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'record-1',
                        date: '2026-08-17',
                        minutes: 30,
                        created_at:
                            new Date(
                                '2026-08-17T10:00:00.000Z'
                            ),
                        study_area_week_id: 'week-1'
                    },
                    {
                        id: 'record-2',
                        date: '2026-08-17',
                        minutes: 60,
                        created_at:
                            new Date(
                                '2026-08-17T11:00:00.000Z'
                            ),
                        study_area_week_id: 'week-1'
                    }
                ])
            );

            const result =
                await repository.findByStudyAreaWeekId(
                    'week-1'
                );

            expect(result).toHaveLength(2);

            expect(result[0]).toEqual({
                id: 'record-1',
                date: '2026-08-17',
                minutes: 30,
                createdAt:
                    new Date(
                        '2026-08-17T10:00:00.000Z'
                    ),
                studyAreaWeekId: 'week-1'
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'ORDER BY date ASC, created_at ASC, id ASC'
                ),
                ['week-1']
            );
        });

        it('Should return an empty list when there are no records', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult([])
            );

            await expect(
                repository.findByStudyAreaWeekId(
                    'week-1'
                )
            ).resolves.toEqual([]);
        });
    });

    describe('findLatestByStudyAreaWeekId', () => {
        it('Should query the latest record using `created_at` and `id` in descending order.', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'record-latest',
                        date: '2026-08-17',
                        minutes: 90,
                        created_at: createdAt,
                        study_area_week_id: 'week-1'
                    }
                ])
            );

            await expect(
                repository.findLatestByStudyAreaWeekId(
                    'week-1'
                )
            ).resolves.toEqual({
                id: 'record-latest',
                date: '2026-08-17',
                minutes: 90,
                createdAt,
                studyAreaWeekId: 'week-1'
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'ORDER BY created_at DESC, id DESC'
                ),
                ['week-1']
            );

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'LIMIT 1'
                ),
                ['week-1']
            );
        });

        it('Should return null when there are no records', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult([])
            );

            await expect(
                repository.findLatestByStudyAreaWeekId(
                    'week-1'
                )
            ).resolves.toBeNull();
        });
    });

    describe('create', () => {
        it('Should create the record without sending created_at.', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'record-1',
                        date: '2026-08-17',
                        minutes: 60,
                        created_at: createdAt,
                        study_area_week_id: 'week-1'
                    }
                ])
            );

            const result =
                await repository.create({
                    date: '2026-08-17',
                    minutes: 60,
                    studyAreaWeekId: 'week-1'
                });

            expect(result).toEqual({
                id: 'record-1',
                date: '2026-08-17',
                minutes: 60,
                createdAt,
                studyAreaWeekId: 'week-1'
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'INSERT INTO study_record'
                ),
                [
                    '2026-08-17',
                    60,
                    'week-1'
                ]
            );
        });
    });

    describe('deleteById', () => {
        it('Should return true when a record is deleted', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult(
                    [],
                    1
                )
            );

            await expect(
                repository.deleteById('record-1')
            ).resolves.toBe(true);
        });

        it('Should return false when no record is deleted', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult(
                    [],
                    0
                )
            );

            await expect(
                repository.deleteById('missing-id')
            ).resolves.toBe(false);
        });
    });

    describe('deleteLatestByStudyAreaWeekId', () => {
        it('Must delete the last record using LIFO', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'record-latest',
                        date: '2026-08-17',
                        minutes: 90,
                        created_at: createdAt,
                        study_area_week_id: 'week-1'
                    }
                ])
            );

            const result =
                await repository
                    .deleteLatestByStudyAreaWeekId(
                        'week-1'
                    );

            expect(result).toEqual({
                id: 'record-latest',
                date: '2026-08-17',
                minutes: 90,
                createdAt,
                studyAreaWeekId: 'week-1'
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'ORDER BY created_at DESC, id DESC'
                ),
                ['week-1']
            );

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'DELETE FROM study_record'
                ),
                ['week-1']
            );
        });

        it('Should return null when there is no record to delete', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyRecordRepository(database);

            query.mockResolvedValue(
                createQueryResult([])
            );

            await expect(
                repository
                    .deleteLatestByStudyAreaWeekId(
                        'week-1'
                    )
            ).resolves.toBeNull();
        });
    });
});