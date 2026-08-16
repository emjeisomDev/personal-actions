// GET  /api/study-area-weeks/:id
// GET  /api/study-area-weeks/area/:studyAreaId/week/:weekStartDate
// GET  /api/study-area-weeks/week/:weekStartDate
// POST /api/study-area-weeks

import { Router } from 'express';

import type { StudyAreaWeekController } from '../controllers/study-area-week.controller.js';

export function createStudyAreaWeekRouter(controller: StudyAreaWeekController): Router {
    const router = Router();

    router.get('/area/:studyAreaId/week/:weekStartDate', controller.getByAreaAndWeek );
    router.get('/week/:weekStartDate', controller.getByWeekStartDate);
    router.get('/:id', controller.getById);
    router.post('/', controller.create);

    return router;
}