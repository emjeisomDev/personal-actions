import { Router } from 'express';
import type { WeeklyAssessmentController } from '../controllers/weekly-assessment.controller.js';
import type { WeeklyAssessmentStudyAreaWeekParams } from '../http/route-params.js';

export function createWeeklyAssessmentRouter(controller: WeeklyAssessmentController): Router {
    const router = Router();

    router.get<WeeklyAssessmentStudyAreaWeekParams>
        ('/study-area-weeks/:studyAreaWeekId/assessment',
            controller.getByStudyAreaWeek);

    return router;
}