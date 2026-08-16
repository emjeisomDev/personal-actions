import type { Pool } from 'pg';

import type { StudyAreaWeek } from '../models/study-area-week.model.js';
import type { WeeklyAssessment } from '../models/weekly-assessment.model.js';

import { StudyAreaRepository } from '../repositories/study-area.repository.js';
import { StudyAreaWeekRepository } from '../repositories/study-area-week.repository.js';
import { StudyPlanRepository } from '../repositories/study-plan.repository.js';
import { WeeklyAssessmentRepository } from '../repositories/weekly-assessment.repository.js';

import { BusinessRuleError } from './errors/business-rule.error.js';
import { EntityNotFoundError } from './errors/entity-not-found.error.js';
import { ValidationError } from './errors/validation.error.js';

import {
    getCurrentWeekStartDate,
    isBusinessMonday
} from './time/business-calendar.js';

import { withTransaction } from './database-transaction.js';

export const MINIMUM_WEEKLY_GOAL_MINUTES = 1500;

export interface CreateStudyAreaWeekInput {
    studyAreaId: string;
    studyPlanId: string;
    weekStartDate: string;
}

export interface StudyAreaWeekWithAssessment {
    studyAreaWeek: StudyAreaWeek;
    assessment: WeeklyAssessment;
}

export class StudyAreaWeekService {
    public constructor(
        private readonly pool: Pool,
        private readonly repository: StudyAreaWeekRepository,
        private readonly studyAreaRepository: StudyAreaRepository,
        private readonly studyPlanRepository: StudyPlanRepository,
        private readonly assessmentRepository: WeeklyAssessmentRepository,
        private readonly nowProvider: () => Date = () => new Date()
    ) { }

    public async create(
        input: CreateStudyAreaWeekInput
    ): Promise<StudyAreaWeekWithAssessment> {
        this.validateConfigurationMonday();

        this.validateDate(
            input.weekStartDate
        );

        const currentWeekStart =
            getCurrentWeekStartDate(
                this.nowProvider()
            );

        if (
            input.weekStartDate !==
            currentWeekStart
        ) {
            throw new BusinessRuleError(
                'Weekly configuration can only be changed for the current week.',
                'WEEK_CONFIGURATION_MUST_BE_CURRENT'
            );
        }

        return withTransaction(
            this.pool,
            async (client) => {
                const studyAreaRepository =
                    new StudyAreaRepository(
                        client
                    );

                const studyPlanRepository =
                    new StudyPlanRepository(
                        client
                    );

                const studyAreaWeekRepository =
                    new StudyAreaWeekRepository(
                        client
                    );

                const assessmentRepository =
                    new WeeklyAssessmentRepository(
                        client
                    );

                const studyArea =
                    await studyAreaRepository.findById(
                        input.studyAreaId
                    );

                if (!studyArea) {
                    throw new EntityNotFoundError(
                        'StudyArea',
                        input.studyAreaId
                    );
                }

                this.validateWeeklyGoal(
                    studyArea.weeklyGoalMinutes
                );

                const studyPlan =
                    await studyPlanRepository.findById(
                        input.studyPlanId
                    );

                if (!studyPlan) {
                    throw new EntityNotFoundError(
                        'StudyPlan',
                        input.studyPlanId
                    );
                }

                if (
                    studyPlan.status !==
                    'active'
                ) {
                    throw new BusinessRuleError(
                        'Inactive study plans cannot be selected.',
                        'INACTIVE_STUDY_PLAN'
                    );
                }

                this.validateCoefficient(
                    studyPlan.coefficient
                );

                const existing =
                    await studyAreaWeekRepository
                        .findByAreaAndWeek(
                            input.studyAreaId,
                            input.weekStartDate
                        );

                if (existing) {
                    throw new BusinessRuleError(
                        'The study area is already configured for this week.',
                        'STUDY_AREA_ALREADY_CONFIGURED'
                    );
                }

                const effectiveGoal =
                    this.calculateEffectiveGoal(
                        studyArea.weeklyGoalMinutes,
                        studyPlan.coefficient
                    );

                const currentConfigurations =
                    await studyAreaWeekRepository
                        .findByWeekStartDate(
                            input.weekStartDate
                        );

                const existingGoal =
                    await this.calculateTotalEffectiveGoal(
                        currentConfigurations,
                        studyAreaRepository,
                        studyPlanRepository
                    );

                const totalGoal =
                    existingGoal +
                    effectiveGoal;

                if (
                    totalGoal <
                    MINIMUM_WEEKLY_GOAL_MINUTES
                ) {
                    throw new BusinessRuleError(
                        `The effective weekly goal must be at least ${MINIMUM_WEEKLY_GOAL_MINUTES} minutes.`,
                        'MINIMUM_WEEKLY_GOAL_NOT_REACHED'
                    );
                }

                const studyAreaWeek =
                    await studyAreaWeekRepository.create({
                        studyAreaId:
                            input.studyAreaId,
                        studyPlanId:
                            input.studyPlanId,
                        weekStartDate:
                            input.weekStartDate
                    });

                const assessment =
                    await assessmentRepository.create({
                        studyAreaWeekId:
                            studyAreaWeek.id,
                        weekGoal:
                            effectiveGoal,
                        minutesStudied: 0,
                        goalAchieved: false
                    });

                return {
                    studyAreaWeek,
                    assessment
                };
            }
        );
    }

    public async findById(
        id: string
    ): Promise<StudyAreaWeek> {
        const studyAreaWeek =
            await this.repository.findById(
                id
            );

        if (!studyAreaWeek) {
            throw new EntityNotFoundError(
                'StudyAreaWeek',
                id
            );
        }

        return studyAreaWeek;
    }

    public async findByAreaAndWeek(
        studyAreaId: string,
        weekStartDate: string
    ): Promise<StudyAreaWeek | null> {
        this.validateDate(
            weekStartDate
        );

        return this.repository.findByAreaAndWeek(
            studyAreaId,
            weekStartDate
        );
    }

    public async findByWeekStartDate(
        weekStartDate: string
    ): Promise<StudyAreaWeek[]> {
        this.validateDate(
            weekStartDate
        );

        return this.repository.findByWeekStartDate(
            weekStartDate
        );
    }

    private async calculateTotalEffectiveGoal(
        configurations: StudyAreaWeek[],
        studyAreaRepository: StudyAreaRepository,
        studyPlanRepository: StudyPlanRepository
    ): Promise<number> {
        const goals =
            await Promise.all(
                configurations.map(
                    async (configuration) => {
                        const [
                            studyArea,
                            studyPlan
                        ] = await Promise.all([
                            studyAreaRepository.findById(
                                configuration.studyAreaId
                            ),
                            studyPlanRepository.findById(
                                configuration.studyPlanId
                            )
                        ]);

                        if (!studyArea) {
                            throw new EntityNotFoundError(
                                'StudyArea',
                                configuration.studyAreaId
                            );
                        }

                        if (!studyPlan) {
                            throw new EntityNotFoundError(
                                'StudyPlan',
                                configuration.studyPlanId
                            );
                        }

                        this.validateWeeklyGoal(
                            studyArea.weeklyGoalMinutes
                        );

                        this.validateCoefficient(
                            studyPlan.coefficient
                        );

                        return this.calculateEffectiveGoal(
                            studyArea.weeklyGoalMinutes,
                            studyPlan.coefficient
                        );
                    }
                )
            );

        return goals.reduce(
            (
                total,
                goal
            ) => total + goal,
            0
        );
    }

    private calculateEffectiveGoal(
        weeklyGoalMinutes: number,
        coefficient: number
    ): number {
        return (
            weeklyGoalMinutes *
            coefficient
        );
    }

    private validateConfigurationMonday(): void {
        if (
            !isBusinessMonday(
                this.nowProvider()
            )
        ) {
            throw new BusinessRuleError(
                'Weekly configuration can only be changed on Monday.',
                'WEEK_CONFIGURATION_ONLY_ON_MONDAY'
            );
        }
    }

    private validateWeeklyGoal(
        weeklyGoalMinutes: number
    ): void {
        if (
            !Number.isInteger(
                weeklyGoalMinutes
            ) ||
            weeklyGoalMinutes <= 0
        ) {
            throw new ValidationError(
                'StudyArea weekly goal must be a positive integer.',
                'INVALID_WEEKLY_GOAL_MINUTES'
            );
        }
    }

    private validateCoefficient(
        coefficient: number
    ): void {
        if (
            !Number.isFinite(
                coefficient
            ) ||
            coefficient <= 0
        ) {
            throw new ValidationError(
                'Study plan coefficient must be greater than zero.',
                'INVALID_COEFFICIENT'
            );
        }
    }

    private validateDate(
        value: string
    ): void {
        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                value
            )
        ) {
            throw new ValidationError(
                'Date must use YYYY-MM-DD format.',
                'INVALID_DATE'
            );
        }

        const parsed =
            new Date(
                `${value}T00:00:00Z`
            );

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            throw new ValidationError(
                'Date is invalid.',
                'INVALID_DATE'
            );
        }
    }
}