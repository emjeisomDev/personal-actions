// GET /api/study-area-weeks/:studyAreaWeekId/assessment

import { Router } from 'express';

import type { WeeklyAssessmentController } from '../controllers/weekly-assessment.controller.js';

export function createWeeklyAssessmentRouter(controller: WeeklyAssessmentController): Router {
    const router = Router();

    router.get('/study-area-weeks/:studyAreaWeekId/assessment',  controller.getByStudyAreaWeek);

    return router;
}