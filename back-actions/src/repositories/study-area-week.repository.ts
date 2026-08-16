import type { StudyAreaWeek } from '../models/study-area-week.model.js';
import type { DatabaseExecutor } from './database-executor.js';

interface StudyAreaWeekRow {
    id: string;
    week_start_date: string;
    study_area_id: string;
    study_plan_id: string;
}

function mapStudyAreaWeek(row: StudyAreaWeekRow): StudyAreaWeek {
    return {
        id: row.id,
        weekStartDate: row.week_start_date,
        studyAreaId: row.study_area_id,
        studyPlanId: row.study_plan_id
    };
}

export class StudyAreaWeekRepository {
    public constructor(
        private readonly database: DatabaseExecutor
    ) { }

    public async findById(id: string): Promise<StudyAreaWeek | null> {
        const result = await this.database.query<StudyAreaWeekRow>(
        `
            SELECT
                id,
                week_start_date,
                study_area_id,
                study_plan_id
            FROM study_area_week
            WHERE id = $1
        `,
            [id]
        );
        const row = result.rows[0];
        return row ? mapStudyAreaWeek(row) : null;
    }

    public async findByAreaAndWeek(studyAreaId: string, weekStartDate: string): Promise<StudyAreaWeek | null> {
        const result = await this.database.query<StudyAreaWeekRow>(
        `
            SELECT
                id,
                week_start_date,
                study_area_id,
                study_plan_id
            FROM study_area_week
            WHERE study_area_id = $1
            AND week_start_date = $2
        `,
            [
                studyAreaId,
                weekStartDate
            ]
        );
        const row = result.rows[0];
        return row ? mapStudyAreaWeek(row) : null;
    }

    public async findByWeekStartDate(weekStartDate: string): Promise<StudyAreaWeek[]> {
        const result = await this.database.query<StudyAreaWeekRow>(
        `
            SELECT
                id,
                week_start_date,
                study_area_id,
                study_plan_id
            FROM study_area_week
            WHERE week_start_date = $1
            ORDER BY study_area_id ASC, id ASC
        `,
            [weekStartDate]
        );

        return result.rows.map(mapStudyAreaWeek);
    }

    public async create(studyAreaWeek: Omit<StudyAreaWeek, 'id'>): Promise<StudyAreaWeek> {
        const result = await this.database.query<StudyAreaWeekRow>(
        `
        INSERT INTO study_area_week (
            week_start_date, 
            study_area_id, 
            study_plan_id
            )
        VALUES ($1, $2, $3)
        RETURNING
            id,
            week_start_date,
            study_area_id,
            study_plan_id
        `,
            [
                studyAreaWeek.weekStartDate,
                studyAreaWeek.studyAreaId,
                studyAreaWeek.studyPlanId
            ]
        );
        return mapStudyAreaWeek(result.rows[0]);
    }


}