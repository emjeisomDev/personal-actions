import type { Request, Response } from 'express';
import { sendControllerError } from './errors/controller-error-response.js';
import { WeeklyAssessmentService } from '../services/weekly-assessment.service.js';

interface WeeklyAssessmentStudyAreaWeekParams {
    studyAreaWeekId: string;
}

export class WeeklyAssessmentController {
    public constructor(private readonly service: WeeklyAssessmentService) 
    { }

    public getByStudyAreaWeek = async (request: Request<WeeklyAssessmentStudyAreaWeekParams>, response: Response): Promise<void> => {
        try {
            const assessment = await this.service.findByStudyAreaWeekId(request.params.studyAreaWeekId);
            response.status(200).json(assessment);
        } catch (error) {
            sendControllerError(response, error);
        }
    };
}