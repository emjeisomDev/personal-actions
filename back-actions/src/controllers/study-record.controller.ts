import type { Request, Response } from 'express';
import { sendControllerError } from './errors/controller-error-response.js';
import { StudyRecordService } from '../services/study-record.service.js';

interface StudyRecordIdParams {
    id: string;
}

interface StudyRecordStudyAreaWeekParams {
    studyAreaWeekId: string;
}

export class StudyRecordController {

    public constructor(private readonly service: StudyRecordService) { }

    public getById = async (request: Request<StudyRecordIdParams>, response: Response): Promise<void> => {
        try {
            const studyRecord = await this.service.findById(request.params.id);
            response.status(200).json(studyRecord);
        } catch (error) {
            sendControllerError(response, error);
        }
    };

    public getByStudyAreaWeek = async (request: Request<StudyRecordStudyAreaWeekParams>, response: Response): Promise<void> => {
        try {
            const studyRecords = await this.service.findByStudyAreaWeekId(request.params.studyAreaWeekId);
            response.status(200).json(studyRecords);
        } catch (error) {
            sendControllerError(response, error);
        }
    };

    public create = async (request: Request<StudyRecordStudyAreaWeekParams>, response: Response): Promise<void> => {
        try {
            const studyRecord = await this.service.create({
                date: request.body.date,
                minutes: request.body.minutes,
                studyAreaWeekId: request.params.studyAreaWeekId
            });
            response.status(201).json(studyRecord);
        } catch (error) {
            sendControllerError(response, error);
        }
    };

    public removeLatest = async (request: Request<StudyRecordStudyAreaWeekParams>, response: Response): Promise<void> => {
        try {
            const studyRecord = await this.service.removeLatest(request.params.studyAreaWeekId);
            response.status(200).json(studyRecord);
        } catch (error) {
            sendControllerError(response, error);
        }
    };
}