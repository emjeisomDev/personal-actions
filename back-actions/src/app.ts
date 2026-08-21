import express from 'express';
import cors from 'cors';
import type { Pool } from 'pg';

import {
  databasePool,
  checkDatabaseConnection
} from './config/database.js';

import { environment } from './config/environment.js';

import { StudyAreaRepository } from './repositories/study-area.repository.js';
import { StudyPlanRepository } from './repositories/study-plan.repository.js';
import { StudyAreaWeekRepository } from './repositories/study-area-week.repository.js';
import { StudyRecordRepository } from './repositories/study-record.repository.js';
import { WeeklyAssessmentRepository } from './repositories/weekly-assessment.repository.js';

import { StudyAreaService } from './services/study-area.service.js';
import { StudyPlanService } from './services/study-plan.service.js';
import { StudyAreaWeekService } from './services/study-area-week.service.js';
import { StudyRecordService } from './services/study-record.service.js';
import { WeeklyAssessmentService } from './services/weekly-assessment.service.js';

import { StudyAreaController } from './controllers/study-area.controller.js';
import { StudyPlanController } from './controllers/study-plan.controller.js';
import { StudyAreaWeekController } from './controllers/study-area-week.controller.js';
import { StudyRecordController } from './controllers/study-record.controller.js';
import { WeeklyAssessmentController } from './controllers/weekly-assessment.controller.js';

import { createApiRouter } from './routes/api.routes.js';

import { notFoundHandler } from './middlewares/not-found-handler.js';
import { globalErrorHandler } from './middlewares/error-handler.js';

export interface AppControllers {
  studyAreaController: StudyAreaController;
  studyPlanController: StudyPlanController;
  studyAreaWeekController: StudyAreaWeekController;
  studyRecordController: StudyRecordController;
  weeklyAssessmentController: WeeklyAssessmentController;
}

export function createApp(pool: Pool = databasePool): express.Express {
  const studyAreaRepository = new StudyAreaRepository(pool);
  const studyPlanRepository = new StudyPlanRepository(pool);
  const studyAreaWeekRepository = new StudyAreaWeekRepository(pool);
  const studyRecordRepository = new StudyRecordRepository(pool);
  const weeklyAssessmentRepository = new WeeklyAssessmentRepository(pool);
  const studyAreaService = new StudyAreaService(studyAreaRepository);
  const studyPlanService = new StudyPlanService(studyPlanRepository);

  const studyAreaWeekService =
    new StudyAreaWeekService(
      pool,
      studyAreaWeekRepository,
      studyAreaRepository,
      studyPlanRepository,
      weeklyAssessmentRepository
    );

  const studyRecordService =
    new StudyRecordService(
      pool,
      studyAreaWeekRepository,
      studyRecordRepository,
      weeklyAssessmentRepository
    );

  const weeklyAssessmentService =
    new WeeklyAssessmentService(
      weeklyAssessmentRepository,
      studyAreaWeekRepository
    );

  const studyAreaController =
    new StudyAreaController(
      studyAreaService
    );

  const studyPlanController =
    new StudyPlanController(
      studyPlanService
    );

  const studyAreaWeekController =
    new StudyAreaWeekController(
      studyAreaWeekService
    );

  const studyRecordController =
    new StudyRecordController(
      studyRecordService
    );

  const weeklyAssessmentController =
    new WeeklyAssessmentController(
      weeklyAssessmentService
    );

  const application = express();

  application.use(
    cors({
      origin:
        environment.corsOrigin
    })
  );

  application.use(express.json());

  application.get(
    '/health',
    async (
      _request,
      response
    ) => {
      try {

        await checkDatabaseConnection();
        response
          .status(200)
          .json({
            status: 'ok',
            service: 'back-actions',
            environment: environment.nodeEnv,
            database: 'connected'
          });
          
      } catch (error) {

        console.error('Health check failed.', error);
        response
          .status(503)
          .json({
            status: 'error',
            service: 'back-actions',
            environment: environment.nodeEnv,
            database: 'unavailable'
          });
      }
    }
  );

  const controllers:
    AppControllers = {
    studyAreaController,
    studyPlanController,
    studyAreaWeekController,
    studyRecordController,
    weeklyAssessmentController
  };

  application.use('/api', createApiRouter(controllers));

  /*
   * Todas as rotas são registradas antes
   * dos middlewares finais.
   *
   * A ordem é obrigatória:
   *
   * routes
   *   ↓
   * notFoundHandler
   *   ↓
   * globalErrorHandler
   */
  application.use(notFoundHandler);

  application.use(globalErrorHandler);

  return application;
}

export const app = createApp();