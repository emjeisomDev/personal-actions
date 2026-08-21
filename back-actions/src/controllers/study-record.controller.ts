import type { NextFunction, Request, Response } from 'express';
import { StudyRecordService } from '../services/study-record.service.js';
import type { StudyRecordIdParams, StudyRecordStudyAreaWeekParams } from '../http/route-params.js';

export class StudyRecordController {
    public constructor(private readonly service: StudyRecordService) { }

    public getById = async (
        request: Request<StudyRecordIdParams>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const studyRecord = await this.service.findById(request.params.id);
            response.status(200).json(studyRecord);
        } catch (error) {
            next(error);
        }
    };

    public getByStudyAreaWeek = async (
        request: Request<StudyRecordStudyAreaWeekParams>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const studyRecords = await this.service.findByStudyAreaWeekId(request.params.studyAreaWeekId);
            response.status(200).json(studyRecords);
        } catch (error) {
            next(error);
        }
    };

    public create = async (
        request: Request<StudyRecordStudyAreaWeekParams>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const studyRecord = await this.service.create({
                date: request.body.date,
                minutes: request.body.minutes,
                studyAreaWeekId: request.params.studyAreaWeekId
            });
            response.status(201).json(studyRecord);
        } catch (error) {
            next(error);
        }
    };

    public removeLatest = async (
        request: Request<StudyRecordStudyAreaWeekParams>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const studyRecord = await this.service.removeLatest(request.params.studyAreaWeekId);
            response.status(200).json(studyRecord);
        } catch (error) {
            next(error);
        }
    };
}