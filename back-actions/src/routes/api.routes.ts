import { Router } from 'express';

import type { StudyAreaController } from '../controllers/study-area.controller.js';
import type { StudyPlanController } from '../controllers/study-plan.controller.js';
import type { StudyAreaWeekController } from '../controllers/study-area-week.controller.js';
import type { StudyRecordController } from '../controllers/study-record.controller.js';
import type { WeeklyAssessmentController } from '../controllers/weekly-assessment.controller.js';

import { createStudyAreaRouter} from './study-area.routes.js';
import { createStudyPlanRouter } from './study-plan.routes.js';
import { createStudyAreaWeekRouter } from './study-area-week.routes.js';
import { createStudyRecordRouter } from './study-record.routes.js';
import { createWeeklyAssessmentRouter } from './weekly-assessment.routes.js';

export interface ApiRouteControllers {
    studyAreaController: StudyAreaController;
    studyPlanController: StudyPlanController;
    studyAreaWeekController: StudyAreaWeekController;
    studyRecordController: StudyRecordController;
    weeklyAssessmentController: WeeklyAssessmentController;
}

export function createApiRouter(controllers: ApiRouteControllers): Router {
    const router = Router();

    router.use('/study-areas', createStudyAreaRouter(controllers.studyAreaController));
    router.use('/study-plans', createStudyPlanRouter(controllers.studyPlanController));
    router.use('/study-area-weeks', createStudyAreaWeekRouter(controllers.studyAreaWeekController));
    router.use('/', createStudyRecordRouter(controllers.studyRecordController));
    router.use('/', createWeeklyAssessmentRouter(controllers.weeklyAssessmentController));

    return router;
}