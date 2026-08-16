import type { Request, Response } from 'express';
import { sendControllerError } from './errors/controller-error-response.js';
import { StudyAreaService } from '../services/study-area.service.js';

export class StudyAreaController {
    public constructor(private readonly service: StudyAreaService) { }

    public getAll = async (_request: Request, response: Response): Promise<void> => {
        try {
            const studyAreas =
                await this.service.findAll();

            response
                .status(200)
                .json(studyAreas);
        } catch (error) {
            sendControllerError(
                response,
                error
            );
        }
    };

    public getById = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        try {
            const studyArea = await this.service.findById(request.params.id);

            response
                .status(200)
                .json(studyArea);
        } catch (error) {
            sendControllerError(
                response,
                error
            );
        }
    };

    public create = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        try {
            const studyArea =
                await this.service.create({
                    name: request.body.name,
                    weeklyGoalMinutes:
                        request.body.weeklyGoalMinutes
                });

            response
                .status(201)
                .json(studyArea);
        } catch (error) {
            sendControllerError(
                response,
                error
            );
        }
    };

    public update = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        try {
            const studyArea =
                await this.service.update(
                    request.params.id,
                    {
                        name:
                            request.body.name,
                        weeklyGoalMinutes:
                            request.body
                                .weeklyGoalMinutes
                    }
                );

            response
                .status(200)
                .json(studyArea);
        } catch (error) {
            sendControllerError(
                response,
                error
            );
        }
    };

    public delete = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        try {
            await this.service.delete(request.params.id);

            response
                .status(204)
                .send();
        } catch (error) {
            sendControllerError(
                response,
                error
            );
        }
    };
}