import type { WeeklyAssessment } from '../models/weekly-assessment.model.js';

import { StudyAreaWeekRepository } from '../repositories/study-area-week.repository.js';
import { WeeklyAssessmentRepository } from '../repositories/weekly-assessment.repository.js';

import { EntityNotFoundError } from './errors/entity-not-found.error.js';

export class WeeklyAssessmentService {
    
    public constructor(
        private readonly repository: WeeklyAssessmentRepository,
        private readonly studyAreaWeekRepository: StudyAreaWeekRepository
    ) { }

    public async findByStudyAreaWeekId(studyAreaWeekId: string): Promise<WeeklyAssessment> {
        const studyAreaWeek = await this.studyAreaWeekRepository.findById(studyAreaWeekId);

        if (!studyAreaWeek) {
            throw new EntityNotFoundError(
                'StudyAreaWeek',
                studyAreaWeekId
            );
        }

        const assessment = await this.repository.findByStudyAreaWeekId(studyAreaWeekId);
        if (!assessment) {
            throw new EntityNotFoundError('WeeklyAssessment', studyAreaWeekId);
        }

        return assessment;
    }
}