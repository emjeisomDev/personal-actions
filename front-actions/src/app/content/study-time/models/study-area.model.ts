import { StudyRecord } from './study-record.model';

export interface StudyArea {
  id: string;
  name: string;
  weeklyGoalMinutes: number;
  studyRecords: StudyRecord[];
}