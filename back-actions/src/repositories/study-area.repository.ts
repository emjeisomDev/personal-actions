import type { StudyArea } from '../models/study-area.model.js';
import type { DatabaseExecutor } from './database-executor.js';

interface StudyAreaRow {
    id: string;
    name: string;
    weekly_goal_minutes: number;
}

function mapStudyArea(row: StudyAreaRow): StudyArea {
    return {
        id: row.id,
        name: row.name,
        weeklyGoalMinutes: row.weekly_goal_minutes
    };
}

export class StudyAreaRepository {

    public constructor(private readonly database: DatabaseExecutor) { }

    public async findAll(): Promise<StudyArea[]> {
        const result = await this.database.query<StudyAreaRow>(
            `
            SELECT
                id,
                name,
                weekly_goal_minutes
            FROM study_area
            ORDER BY name ASC, id ASC
            `
        );
        return result.rows.map(mapStudyArea);
    }

    public async findById(
        id: string
    ): Promise<StudyArea | null> {
        const result = await this.database.query<StudyAreaRow>(
        `
            SELECT
                id,
                name,
                weekly_goal_minutes
            FROM study_area
            WHERE id = $1
        `,
            [id]
        );
        const row = result.rows[0];
        return row ? mapStudyArea(row) : null;
    }

    public async create(studyArea: Omit<StudyArea, 'id'>): Promise<StudyArea> {
        const result = await this.database.query<StudyAreaRow>(
            `
            INSERT INTO study_area (
                name,
                weekly_goal_minutes
            )
            VALUES ($1, $2)
            RETURNING
                id,
                name,
                weekly_goal_minutes
            `,
            [
                studyArea.name,
                studyArea.weeklyGoalMinutes
            ]
        );
        return mapStudyArea(result.rows[0]);
    }

    public async update(id: string, studyArea: Omit<StudyArea, 'id'>): Promise<StudyArea | null> {
        const result = await this.database.query<StudyAreaRow>(
            `
            UPDATE study_area
            SET
                name = $1,
                weekly_goal_minutes = $2
            WHERE id = $3
            RETURNING
                id,
                name,
                weekly_goal_minutes
            `,
            [
                studyArea.name,
                studyArea.weeklyGoalMinutes,
                id
            ]
        );
        const row = result.rows[0];
        return row ? mapStudyArea(row) : null;
    }

    public async delete(id: string): Promise<boolean> {
        const result = await this.database.query(
        `
            DELETE FROM study_area
            WHERE id = $1
        `,
            [id]
        );
        return result.rowCount === 1;
    }
}