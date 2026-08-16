import type { WeeklyAssessment } from '../models/weekly-assessment.model.js';
import type { DatabaseExecutor } from './database-executor.js';

interface WeeklyAssessmentRow {
    id: string;
    study_area_week_id: string;
    week_goal: number;
    minutes_studied: number;
    goal_achieved: boolean;
}

function mapWeeklyAssessment(row: WeeklyAssessmentRow): WeeklyAssessment {
    return {
        id: row.id,
        studyAreaWeekId: row.study_area_week_id,
        weekGoal: row.week_goal,
        minutesStudied: row.minutes_studied,
        goalAchieved: row.goal_achieved
    };
}

export class WeeklyAssessmentRepository {
    public constructor(private readonly database: DatabaseExecutor) { }

    public async findById(id: string): Promise<WeeklyAssessment | null> {
        const result = await this.database.query<WeeklyAssessmentRow>(
        `
            SELECT
                id,
                study_area_week_id,
                week_goal,
                minutes_studied,
                goal_achieved
            FROM weekly_assessment
            WHERE id = $1
        `,
            [id]
        );
        const row = result.rows[0];
        return row ? mapWeeklyAssessment(row) : null;
    }

    public async findByStudyAreaWeekId(studyAreaWeekId: string): Promise<WeeklyAssessment | null> {
        const result = await this.database.query<WeeklyAssessmentRow>(
        `
            SELECT
                id,
                study_area_week_id,
                week_goal,
                minutes_studied,
                goal_achieved
            FROM weekly_assessment
            WHERE study_area_week_id = $1
        `,
            [studyAreaWeekId]
        );
        const row = result.rows[0];
        return row ? mapWeeklyAssessment(row) : null;
    }

    public async create(assessment: Omit<WeeklyAssessment, 'id'>): Promise<WeeklyAssessment> {
        const result = await this.database.query<WeeklyAssessmentRow>(
        `
            INSERT INTO weekly_assessment (
                study_area_week_id,
                week_goal,
                minutes_studied,
                goal_achieved
            )
            VALUES ($1, $2, $3, $4) RETURNING
                id,
                study_area_week_id,
                week_goal,
                minutes_studied,
                goal_achieved
        `,
            [
                assessment.studyAreaWeekId,
                assessment.weekGoal,
                assessment.minutesStudied,
                assessment.goalAchieved
            ]
        );
        return mapWeeklyAssessment(result.rows[0]);
    }

    public async update(id: string, assessment: Omit<WeeklyAssessment, 'id'>): Promise<WeeklyAssessment | null> {
        const result = await this.database.query<WeeklyAssessmentRow>(
        `
            UPDATE weekly_assessment SET
                study_area_week_id = $1,
                week_goal = $2,
                minutes_studied = $3,
                goal_achieved = $4
            WHERE id = $5
            RETURNING
                id,
                study_area_week_id,
                week_goal,
                minutes_studied,
                goal_achieved
        `,
            [
                assessment.studyAreaWeekId,
                assessment.weekGoal,
                assessment.minutesStudied,
                assessment.goalAchieved,
                id
            ]
        );
        const row = result.rows[0];
        return row ? mapWeeklyAssessment(row) : null;
    }


    
}