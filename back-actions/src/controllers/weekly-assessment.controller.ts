import type { NextFunction, Request, Response } from 'express';
import { WeeklyAssessmentService } from '../services/weekly-assessment.service.js';
import type { WeeklyAssessmentStudyAreaWeekParams } from '../http/route-params.js';

export class WeeklyAssessmentController {
    public constructor(private readonly service: WeeklyAssessmentService) { }

    public getByStudyAreaWeek = async (
        request: Request<WeeklyAssessmentStudyAreaWeekParams>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const assessment = await this.service.findByStudyAreaWeekId(request.params.studyAreaWeekId);
            response.status(200).json(assessment);
        } catch (error) {
            next(error);
        }
    };
}