import { Router } from 'express';
import type { StudyAreaController } from '../controllers/study-area.controller.js';
import { createValidationMiddleware } from '../validators/validation-middleware.js';
import {
    validateCreateStudyArea,
    validateStudyAreaId,
    validateUpdateStudyArea
} from '../validators/study-area.validators.js';

import type { StudyAreaIdParams } from '../http/route-params.js';

export function createStudyAreaRouter(controller: StudyAreaController): Router {
    const router = Router();

    router.get('/', controller.getAll);

    router.get<StudyAreaIdParams>
        ('/:id',
            createValidationMiddleware<StudyAreaIdParams>(validateStudyAreaId),
            controller.getById);

    router.post
        ('/',
            createValidationMiddleware(validateCreateStudyArea),
            controller.create);

    router.put<StudyAreaIdParams>
        ('/:id',
            createValidationMiddleware<StudyAreaIdParams>(validateUpdateStudyArea),
            controller.update);

    router.delete<StudyAreaIdParams>
        ('/:id',
            createValidationMiddleware<StudyAreaIdParams>(validateStudyAreaId),
            controller.delete);

    return router;
}