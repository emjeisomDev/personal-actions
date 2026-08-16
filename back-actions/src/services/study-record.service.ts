import type { Pool } from 'pg';

import type { StudyRecord } from '../models/study-record.model.js';
import type { WeeklyAssessment } from '../models/weekly-assessment.model.js';

import { StudyAreaWeekRepository } from '../repositories/study-area-week.repository.js';
import { StudyRecordRepository } from '../repositories/study-record.repository.js';
import { WeeklyAssessmentRepository } from '../repositories/weekly-assessment.repository.js';

import { BusinessRuleError } from './errors/business-rule.error.js';
import { EntityNotFoundError } from './errors/entity-not-found.error.js';
import { ValidationError } from './errors/validation.error.js';
import { withTransaction } from './database-transaction.js';

import { getCurrentWeekStartDate } from './time/business-calendar.js';

export interface CreateStudyRecordInput {
    date: string;
    minutes: number;
    studyAreaWeekId: string;
}

export class StudyRecordService {
    public constructor(
        private readonly pool: Pool,
        private readonly studyAreaWeekRepository: StudyAreaWeekRepository,
        private readonly studyRecordRepository: StudyRecordRepository,
        private readonly assessmentRepository: WeeklyAssessmentRepository,
        private readonly nowProvider: () => Date = () => new Date()
    ) { }

    public async create(
        input: CreateStudyRecordInput
    ): Promise<StudyRecord> {
        this.validateDate(input.date);

        if (!Number.isInteger(input.minutes) || input.minutes <= 0) {
            throw new ValidationError(
                'Study record minutes must be a positive integer.',
                'INVALID_STUDY_RECORD_MINUTES'
            );
        }

        const studyAreaWeek = await this.studyAreaWeekRepository
            .findById(input.studyAreaWeekId);

        if (!studyAreaWeek) {
            throw new EntityNotFoundError('StudyAreaWeek', input.studyAreaWeekId);
        }

        return withTransaction(
            this.pool,
            async (client) => {
                const recordRepository =
                    new StudyRecordRepository(
                        client
                    );

                const assessmentRepository = new WeeklyAssessmentRepository(client);

                const record =
                    await recordRepository.create({
                        date: input.date,
                        minutes:
                            input.minutes,
                        studyAreaWeekId:
                            input.studyAreaWeekId
                    });

                const assessment =
                    await this.recalculateAssessment(
                        input.studyAreaWeekId,
                        assessmentRepository,
                        new StudyRecordRepository(client)
                    );

                if (!assessment) {
                    throw new BusinessRuleError(
                        'Weekly assessment could not be synchronized.',
                        'ASSESSMENT_SYNC_FAILED'
                    );
                }

                return record;
            }
        );
    }

    public async findById(id: string): Promise<StudyRecord> {
        const record = await this.studyRecordRepository
                .findById(id);

        if (!record) {
            throw new EntityNotFoundError(
                'StudyRecord',
                id
            );
        }

        return record;
    }

    public async findByStudyAreaWeekId(studyAreaWeekId: string): Promise<StudyRecord[]> {
        await this.ensureStudyAreaWeek(studyAreaWeekId);
        return this.studyRecordRepository.findByStudyAreaWeekId(studyAreaWeekId);
    }

    public async removeLatest(studyAreaWeekId: string): Promise<StudyRecord> {
        const studyAreaWeek = await this.studyAreaWeekRepository
                .findById(studyAreaWeekId);

        if (!studyAreaWeek) {
            throw new EntityNotFoundError('StudyAreaWeek', studyAreaWeekId);
        }

        const currentWeekStart = getCurrentWeekStartDate(this.nowProvider());

        if (studyAreaWeek.weekStartDate !== currentWeekStart) {
            throw new BusinessRuleError(
                'Study records can only be removed from the current week.',
                'STUDY_RECORD_WEEK_CONFLICT',
                409
            );
        }

        return withTransaction(
            this.pool,
            async (client) => {
                const recordRepository =
                    new StudyRecordRepository(
                        client
                    );

                const assessmentRepository =
                    new WeeklyAssessmentRepository(
                        client
                    );

                const latest =
                    await recordRepository
                        .findLatestByStudyAreaWeekId(
                            studyAreaWeekId
                        );

                if (!latest) {
                    throw new BusinessRuleError(
                        'There are no study records to remove.',
                        'NO_STUDY_RECORDS'
                    );
                }

                const removed =
                    await recordRepository
                        .deleteLatestByStudyAreaWeekId(
                            studyAreaWeekId
                        );

                if (!removed) {
                    throw new BusinessRuleError(
                        'The latest study record could not be removed.',
                        'STUDY_RECORD_REMOVAL_FAILED'
                    );
                }

                const assessment =
                    await this.recalculateAssessment(
                        studyAreaWeekId,
                        assessmentRepository,
                        recordRepository
                    );

                if (!assessment) {
                    throw new BusinessRuleError(
                        'Weekly assessment could not be synchronized.',
                        'ASSESSMENT_SYNC_FAILED'
                    );
                }

                return removed;
            }
        );
    }

    private async recalculateAssessment(
        studyAreaWeekId: string,
        assessmentRepository: WeeklyAssessmentRepository,
        recordRepository: StudyRecordRepository
    ): Promise<WeeklyAssessment | null> {
        const assessment =
            await assessmentRepository
                .findByStudyAreaWeekId(
                    studyAreaWeekId
                );

        if (!assessment) {
            return null;
        }

        const records =
            await recordRepository
                .findByStudyAreaWeekId(
                    studyAreaWeekId
                );

        const minutesStudied = records.reduce((total, record) => total + record.minutes, 0);

        const goalAchieved = minutesStudied >= assessment.weekGoal;

        return assessmentRepository.update(
            assessment.id,
            {
                studyAreaWeekId: assessment.studyAreaWeekId,
                weekGoal: assessment.weekGoal,
                minutesStudied,
                goalAchieved
            }
        );
    }

    private async ensureStudyAreaWeek(id: string): Promise<void> {
        const studyAreaWeek = await this.studyAreaWeekRepository.findById(id);

        if (!studyAreaWeek) {
            throw new EntityNotFoundError('StudyAreaWeek', id);
        }
    }

    private validateDate(value: string): void {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
            throw new ValidationError(
                'Date must use YYYY-MM-DD format.',
                'INVALID_DATE'
            );
        }

        const parsed = new Date(`${value}T00:00:00Z`);

        if (Number.isNaN(parsed.getTime())) {
            throw new ValidationError(
                'Date is invalid.',
                'INVALID_DATE'
            );
        }
    }
}