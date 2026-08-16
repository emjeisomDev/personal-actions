import type { StudyPlan, StudyPlanStatus } from '../models/study-plan.model.js';
import { StudyPlanRepository } from '../repositories/study-plan.repository.js';
import { EntityNotFoundError } from './errors/entity-not-found.error.js';
import { ValidationError } from './errors/validation.error.js';

export interface CreateStudyPlanInput {
    name: string;
    coefficient: number;
    status: StudyPlanStatus;
}

export class StudyPlanService {
    public constructor(private readonly repository: StudyPlanRepository)
    { }

    public async create(input: CreateStudyPlanInput): Promise<StudyPlan> {
        const name = input.name.trim();

        if (name.length === 0) {
            throw new ValidationError(
                'Study plan name is required.',
                'STUDY_PLAN_NAME_REQUIRED'
            );
        }

        if (!Number.isFinite(input.coefficient) || input.coefficient <= 0) {
            throw new ValidationError(
                'Coefficient must be greater than zero.',
                'INVALID_COEFFICIENT'
            );
        }

        if (
            input.status !== 'active' && input.status !== 'inactive') {
            throw new ValidationError(
                'Study plan status must be active or inactive.',
                'INVALID_STUDY_PLAN_STATUS'
            );
        }

        return this.repository.create({
            name,
            coefficient: input.coefficient,
            status: input.status
        });
    }

    public async findAll(): Promise<StudyPlan[]> {
        return this.repository.findAll();
    }

    public async findActive(): Promise<StudyPlan[]> {
        return this.repository.findActive();
    }

    public async findById(id: string): Promise<StudyPlan> {
        const studyPlan = await this.repository.findById(id);

        if (!studyPlan) {
            throw new EntityNotFoundError(
                'StudyPlan',
                id
            );
        }

        return studyPlan;
    }

    public async findSelectableById(id: string): Promise<StudyPlan> {
        const studyPlan = await this.findById(id);

        if (studyPlan.status !== 'active') {
            throw new ValidationError(
                'Inactive study plans cannot be selected for a new week.',
                'INACTIVE_STUDY_PLAN'
            );
        }

        return studyPlan;
    }
}