import type { StudyArea } from '../models/study-area.model.js';
import { StudyAreaRepository } from '../repositories/study-area.repository.js';
import { EntityNotFoundError } from './errors/entity-not-found.error.js';
import { ValidationError } from './errors/validation.error.js';

export interface CreateStudyAreaInput {
    name: string;
    weeklyGoalMinutes: number;
}

export interface UpdateStudyAreaInput {
    name: string;
    weeklyGoalMinutes: number;
}

export class StudyAreaService {
    
    public constructor(private readonly repository: StudyAreaRepository) { }

    public async create(input: CreateStudyAreaInput): Promise<StudyArea> {
        const name =input.name.trim();

        this.validateName(name);
        this.validateWeeklyGoal(input.weeklyGoalMinutes);

        return this.repository.create({
            name,
            weeklyGoalMinutes: input.weeklyGoalMinutes
        });
    }

    public async findAll(): Promise<StudyArea[]> {
        return this.repository.findAll();
    }

    public async findById(id: string): Promise<StudyArea> {
        const studyArea = await this.repository.findById(id);

        if (!studyArea) {
            throw new EntityNotFoundError('StudyArea', id);
        }

        return studyArea;
    }

    public async update(id: string, input: UpdateStudyAreaInput): Promise<StudyArea> {
        const name = input.name.trim();

        this.validateName(name);
        this.validateWeeklyGoal(input.weeklyGoalMinutes);

        const updated = await this.repository.update(
            id,
            {
                name,
                weeklyGoalMinutes: input.weeklyGoalMinutes
            }
        );

        if (!updated) {
            throw new EntityNotFoundError('StudyArea', id);
        }

        return updated;
    }

    public async delete(id: string): Promise<void> {
        const deleted = await this.repository.delete(id);

        if (!deleted) {
            throw new EntityNotFoundError('StudyArea', id);
        }
    }

    private validateName(name: string): void {
        if (name.length === 0) {
            throw new ValidationError(
                'Study area name is required.',
                'STUDY_AREA_NAME_REQUIRED'
            );
        }
    }

    private validateWeeklyGoal(weeklyGoalMinutes: number): void {
        if (!Number.isInteger(weeklyGoalMinutes) || weeklyGoalMinutes <= 0) {
            throw new ValidationError(
                'weeklyGoalMinutes must be a positive integer.',
                'INVALID_WEEKLY_GOAL_MINUTES'
            );
        }
    }
}