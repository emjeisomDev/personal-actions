import type { Request, Response } from 'express';
import { sendControllerError } from './errors/controller-error-response.js';
import { StudyAreaWeekService } from '../services/study-area-week.service.js';

interface StudyAreaWeekIdParams {
    id: string;
}

interface StudyAreaWeekAreaAndWeekParams {
    studyAreaId: string;
    weekStartDate: string;
}

interface StudyAreaWeekDateParams {
    weekStartDate: string;
}

export class StudyAreaWeekController {
    public constructor(private readonly service: StudyAreaWeekService) { }

    public getById = async (request: Request<StudyAreaWeekIdParams>, response: Response): Promise<void> => {
        try {
            const studyAreaWeek = await this.service.findById(request.params.id);
            response.status(200).json(studyAreaWeek);
        } catch (error) {
            sendControllerError(response, error);
        }
    };

    public getByAreaAndWeek = async (request: Request<StudyAreaWeekAreaAndWeekParams>, response: Response): Promise<void> => {
        try {
            const studyAreaWeek = await this.service.findByAreaAndWeek(
                request.params.studyAreaId,
                request.params.weekStartDate
            );

            if (!studyAreaWeek) {
                response.status(404).json({
                    error: {
                        code: 'STUDY_AREA_WEEK_NOT_FOUND',
                        message: 'Study area week was not found.'
                    }
                });

                return;
            }
            response.status(200).json(studyAreaWeek);
        } catch (error) {
            sendControllerError(response, error);
        }
    };

    public getByWeekStartDate = async (request: Request<StudyAreaWeekDateParams>, response: Response): Promise<void> => {
        try {
            const studyAreaWeeks = await this.service.findByWeekStartDate(request.params.weekStartDate);
            response.status(200).json(studyAreaWeeks);
        } catch (error) {
            sendControllerError(response, error);
        }
    };

    public create = async (request: Request, response: Response): Promise<void> => {
        try {
            const result = await this.service.create({
                studyAreaId: request.body.studyAreaId,
                studyPlanId: request.body.studyPlanId,
                weekStartDate: request.body.weekStartDate
            });

            response.status(201).json(result);
        } catch (error) {
            sendControllerError(response, error);
        }
    };
}