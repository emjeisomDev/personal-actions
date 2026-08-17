import { Router } from 'express';
import type { StudyAreaWeekController } from '../controllers/study-area-week.controller.js';
import { createValidationMiddleware } from '../validators/validation-middleware.js';
import {
    validateCreateStudyAreaWeek,
    validateStudyAreaWeekByAreaAndWeek,
    validateStudyAreaWeekByWeek,
    validateStudyAreaWeekId
} from '../validators/study-area-week.validators.js';
import type {
    StudyAreaWeekIdParams,
    StudyAreaWeekAreaAndWeekParams,
    StudyAreaWeekDateParams
} from '../http/route-params.js';

export function createStudyAreaWeekRouter(controller: StudyAreaWeekController): Router {
    const router = Router();

    router.get<StudyAreaWeekAreaAndWeekParams>
        ('/area/:studyAreaId/week/:weekStartDate',
            createValidationMiddleware<StudyAreaWeekAreaAndWeekParams>(validateStudyAreaWeekByAreaAndWeek),
            controller.getByAreaAndWeek);

    router.get<StudyAreaWeekDateParams>
        ('/week/:weekStartDate',
            createValidationMiddleware<StudyAreaWeekDateParams>(validateStudyAreaWeekByWeek),
            controller.getByWeekStartDate);

    router.get<StudyAreaWeekIdParams>
        ('/:id',
            createValidationMiddleware<StudyAreaWeekIdParams>(validateStudyAreaWeekId),
            controller.getById);

    router.post('/', createValidationMiddleware(validateCreateStudyAreaWeek), controller.create);

    return router;
}