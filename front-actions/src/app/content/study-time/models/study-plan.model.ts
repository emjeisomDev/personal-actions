export interface StudyPlan {
  id: string;
  name: string;
  coefficient: number;
  status: StudyPlanStatus;
}

export type StudyPlanStatus = 'active' | 'inactive';