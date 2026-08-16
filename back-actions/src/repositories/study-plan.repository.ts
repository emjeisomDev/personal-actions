import type { StudyPlan, StudyPlanStatus } from '../models/study-plan.model.js';
import type { DatabaseExecutor } from './database-executor.js';

interface StudyPlanRow {
    id: string;
    name: string;
    coefficient: string;
    status: StudyPlanStatus;
}

function mapStudyPlan(row: StudyPlanRow): StudyPlan {
    return {
        id: row.id,
        name: row.name,
        coefficient: Number(row.coefficient),
        status: row.status
    };
}

export class StudyPlanRepository {
    public constructor(private readonly database: DatabaseExecutor) { }

    public async findAll(): Promise<StudyPlan[]> {
        const result = await this.database.query<StudyPlanRow>(
        `
            SELECT
                id,
                name,
                coefficient,
                status
            FROM study_plan
            ORDER BY name ASC, id ASC
        `
        );
        return result.rows.map(mapStudyPlan);
    }

    public async findById(id: string): Promise<StudyPlan | null> {
        const result = await this.database.query<StudyPlanRow>(
        `
            SELECT
                id,
                name,
                coefficient,
                status
            FROM study_plan
            WHERE id = $1
        `,
            [id]
        );
        const row = result.rows[0];
        return row ? mapStudyPlan(row) : null;
    }

    public async findActive(): Promise<StudyPlan[]> {
        const result = await this.database.query<StudyPlanRow>(
        `
            SELECT
                id,
                name,
                coefficient,
                status
            FROM study_plan
            WHERE status = 'active'
            ORDER BY name ASC, id ASC
        `
        );
        return result.rows.map(mapStudyPlan);
    }

    public async create(studyPlan: Omit<StudyPlan, 'id'>): Promise<StudyPlan> {
        const result = await this.database.query<StudyPlanRow>(
        `
            INSERT INTO study_plan (name, coefficient, status)
            VALUES ($1, $2, $3)
            RETURNING
                id,
                name,
                coefficient,
                status
        `,
            [
                studyPlan.name,
                studyPlan.coefficient,
                studyPlan.status
            ]
        );
        return mapStudyPlan(result.rows[0]);
    }
}