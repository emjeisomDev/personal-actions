import { Router } from 'express';
import type { StudyPlanController } from '../controllers/study-plan.controller.js';
import { createValidationMiddleware } from '../validators/validation-middleware.js';
import { validateCreateStudyPlan, validateStudyPlanId } from '../validators/study-plan.validators.js';
import type { StudyPlanIdParams } from '../http/route-params.js';

export function createStudyPlanRouter(controller: StudyPlanController): Router {
    const router = Router();

    router.get('/', controller.getAll);
    router.get('/active', controller.getActive);
    router.get<StudyPlanIdParams>('/:id', createValidationMiddleware<StudyPlanIdParams>(validateStudyPlanId), controller.getById);
    router.post('/', createValidationMiddleware(validateCreateStudyPlan), controller.create);

    return router;
}