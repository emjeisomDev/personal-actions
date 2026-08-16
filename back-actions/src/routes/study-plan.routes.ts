// GET  /api/study-plans
// GET  /api/study-plans/active
// GET  /api/study-plans/:id
// POST /api/study-plans

import { Router } from 'express';

import type { StudyPlanController } from '../controllers/study-plan.controller.js';

export function createStudyPlanRouter(controller: StudyPlanController): Router {
    const router = Router();

    router.get('/', controller.getAll);
    router.get('/active', controller.getActive);
    router.get('/:id', controller.getById);
    router.post('/', controller.create);

    return router;
}