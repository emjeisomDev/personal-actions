// GET    /api/study-areas
// GET    /api/study-areas/:id
// POST   /api/study-areas
// PUT    /api/study-areas/:id
// DELETE /api/study-areas/:id

import { Router } from 'express';

import type { StudyAreaController } from '../controllers/study-area.controller.js';

export function createStudyAreaRouter(controller: StudyAreaController): Router {
    const router = Router();

    router.get('/', controller.getAll);
    router.get('/:id', controller.getById);
    router.post('/', controller.create);
    router.put('/:id', controller.update);
    router.delete('/:id', controller.delete);

    return router;
}