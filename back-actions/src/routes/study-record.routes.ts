import { Router } from 'express';
import type { StudyRecordController } from '../controllers/study-record.controller.js';
import { createValidationMiddleware } from '../validators/validation-middleware.js';

import {
    validateCreateStudyRecord,
    validateStudyRecordId,
    validateStudyRecordStudyAreaWeekId
} from '../validators/study-record.validators.js';

import type {
    StudyRecordIdParams,
    StudyRecordStudyAreaWeekParams
} from '../http/route-params.js';

export function createStudyRecordRouter(controller: StudyRecordController): Router {
    const router = Router();

    router.get<StudyRecordIdParams>
        ('/study-records/:id',
            createValidationMiddleware<StudyRecordIdParams>(validateStudyRecordId),
            controller.getById);

    router.get<StudyRecordStudyAreaWeekParams>
        ('/study-area-weeks/:studyAreaWeekId/study-records',
            createValidationMiddleware<StudyRecordStudyAreaWeekParams>(validateStudyRecordStudyAreaWeekId),
            controller.getByStudyAreaWeek);

    router.post<StudyRecordStudyAreaWeekParams>
        ('/study-area-weeks/:studyAreaWeekId/study-records',
            createValidationMiddleware<StudyRecordStudyAreaWeekParams>(validateCreateStudyRecord),
            controller.create);

    router.delete<StudyRecordStudyAreaWeekParams>
        ('/study-area-weeks/:studyAreaWeekId/study-records/last',
            createValidationMiddleware<StudyRecordStudyAreaWeekParams>(validateStudyRecordStudyAreaWeekId),
            controller.removeLatest);

    return router;
}