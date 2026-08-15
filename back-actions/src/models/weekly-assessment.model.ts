export interface WeeklyAssessment {
  id: string;
  studyAreaWeekId: string;
  weekGoal: number;
  minutesStudied: number;
  goalAchieved: boolean;
}