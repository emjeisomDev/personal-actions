import type { NextFunction, Request, Response } from 'express';
import { StudyPlanService } from '../services/study-plan.service.js';
import type { StudyPlanIdParams } from '../http/route-params.js';

export class StudyPlanController {
    public constructor(private readonly service: StudyPlanService) { }

    public getAll = async (
        _request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const studyPlans = await this.service.findAll();
            response.status(200).json(studyPlans);
        } catch (error) {
            next(error);
        }
    };

    public getActive = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const studyPlans = await this.service.findActive();
            response.status(200).json(studyPlans);
        } catch (error) {
            next(error);
        }
    };

    public getById = async (
        request: Request<StudyPlanIdParams>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const studyPlan = await this.service.findById(request.params.id);
            response.status(200).json(studyPlan);
        } catch (error) {
            next(error);
        }
    };

    public create = async (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const studyPlan = await this.service.create({
                name: request.body.name,
                coefficient: request.body.coefficient,
                status: request.body.status
            });

            response.status(201).json(studyPlan);
        } catch (error) {
            next(error);
        }
    };
}