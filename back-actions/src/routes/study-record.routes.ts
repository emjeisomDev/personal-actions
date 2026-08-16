// GET    /api/study-records/:id
// GET    /api/study-area-weeks/:studyAreaWeekId/study-records
// POST   /api/study-area-weeks/:studyAreaWeekId/study-records
// DELETE /api/study-area-weeks/:studyAreaWeekId/study-records/last

import { Router } from 'express';

import type { StudyRecordController } from '../controllers/study-record.controller.js';

export function createStudyRecordRouter(controller: StudyRecordController): Router {
    const router = Router();

    router.get('/study-records/:id', controller.getById);
    router.get('/study-area-weeks/:studyAreaWeekId/study-records', controller.getByStudyAreaWeek);
    router.post('/study-area-weeks/:studyAreaWeekId/study-records', controller.create);
    router.delete('/study-area-weeks/:studyAreaWeekId/study-records/last', controller.removeLatest);

    return router;
}