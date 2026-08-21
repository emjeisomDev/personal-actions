import type { NextFunction, Request, Response } from 'express';
import { StudyAreaWeekService } from '../services/study-area-week.service.js';
import type { StudyAreaWeekIdParams, StudyAreaWeekAreaAndWeekParams, StudyAreaWeekDateParams } from '../http/route-params.js';
import { EntityNotFoundError } from '../services/errors/entity-not-found.error.js';

export class StudyAreaWeekController {
    public constructor(private readonly service: StudyAreaWeekService) { }

    public getById = async (
        request: Request<StudyAreaWeekIdParams>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const studyAreaWeek = await this.service.findById(request.params.id);
            response.status(200).json(studyAreaWeek);
        } catch (error) {
            next(error);
        }
    };

    public getByAreaAndWeek = async (
        request: Request<StudyAreaWeekAreaAndWeekParams>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const studyAreaWeek = await this.service.findByAreaAndWeek(request.params.studyAreaId, request.params.weekStartDate);

            if (!studyAreaWeek) {
                throw new EntityNotFoundError(
                    'StudyAreaWeek',
                    `${request.params.studyAreaId}:${request.params.weekStartDate}`
                );
            }
            response.status(200).json(studyAreaWeek);
        } catch (error) {
            next(error);
        }
    };

    public getByWeekStartDate = async (
        request: Request<StudyAreaWeekDateParams>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const studyAreaWeeks = await this.service.findByWeekStartDate(request.params.weekStartDate);
            response.status(200).json(studyAreaWeeks);
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
            const result = await this.service.create({
                studyAreaId: request.body.studyAreaId,
                studyPlanId: request.body.studyPlanId,
                weekStartDate: request.body.weekStartDate
            });
            response.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };
}