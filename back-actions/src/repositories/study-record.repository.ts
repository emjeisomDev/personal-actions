import type { StudyRecord } from '../models/study-record.model.js';
import type { DatabaseExecutor } from './database-executor.js';

interface StudyRecordRow {
    id: string;
    date: string;
    minutes: number;
    created_at: Date;
    study_area_week_id: string;
}

function mapStudyRecord(row: StudyRecordRow): StudyRecord {
    return {
        id: row.id,
        date: row.date,
        minutes: row.minutes,
        createdAt: row.created_at,
        studyAreaWeekId: row.study_area_week_id
    };
}

export class StudyRecordRepository {
    public constructor(private readonly database: DatabaseExecutor) { }

    public async findById(id: string): Promise<StudyRecord | null> {
        const result = await this.database.query<StudyRecordRow>(
        `
            SELECT
                id,
                date,
                minutes,
                created_at,
                study_area_week_id
            FROM study_record
            WHERE id = $1
        `,
            [id]
        );
        const row = result.rows[0];
        return row ? mapStudyRecord(row) : null;
    }

    public async findByStudyAreaWeekId(studyAreaWeekId: string): Promise<StudyRecord[]> {
        const result = await this.database.query<StudyRecordRow>(
        `
        SELECT
            id,
            date,
            minutes,
            created_at,
            study_area_week_id
        FROM study_record
        WHERE study_area_week_id = $1
        ORDER BY date ASC, created_at ASC, id ASC
        `,
            [studyAreaWeekId]
        );
        return result.rows.map(mapStudyRecord);
    }

    public async findLatestByStudyAreaWeekId(studyAreaWeekId: string): Promise<StudyRecord | null> {
        const result = await this.database.query<StudyRecordRow>(
        `
            SELECT
                id,
                date,
                minutes,
                created_at,
                study_area_week_id
            FROM study_record
            WHERE study_area_week_id = $1
            ORDER BY created_at DESC, id DESC
            LIMIT 1
        `,
            [studyAreaWeekId]
        );
        const row = result.rows[0];
        return row ? mapStudyRecord(row) : null;
    }

    public async create(studyRecord: Pick<StudyRecord, 'date' | 'minutes' | 'studyAreaWeekId' >): Promise<StudyRecord> {
        const result = await this.database.query<StudyRecordRow>(
        `
            INSERT INTO study_record (
                date,
                minutes,
                study_area_week_id
            )
            VALUES ($1, $2, $3)
            RETURNING
                id,
                date,
                minutes,
                created_at,
                study_area_week_id
        `,
            [
                studyRecord.date,
                studyRecord.minutes,
                studyRecord.studyAreaWeekId
            ]
        );
        return mapStudyRecord(result.rows[0]);
    }

    public async deleteById(id: string): Promise<boolean> {
        const result = await this.database.query(
            `DELETE FROM study_record WHERE id = $1`,
            [id]
        );
        return result.rowCount === 1;
    }

    public async deleteLatestByStudyAreaWeekId(studyAreaWeekId: string): Promise<StudyRecord | null> {
        const result = await this.database.query<StudyRecordRow>(
        `
            DELETE FROM study_record
            WHERE id = (
                SELECT id
                FROM study_record
                WHERE study_area_week_id = $1
                ORDER BY created_at DESC, id DESC
                LIMIT 1
            )
            RETURNING
                id,
                date,
                minutes,
                created_at,
                study_area_week_id
        `,
            [studyAreaWeekId]
        );
        const row = result.rows[0];
        return row ? mapStudyRecord(row) : null;
    }
}