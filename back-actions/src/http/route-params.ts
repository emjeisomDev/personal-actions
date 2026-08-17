import type { ParamsDictionary } from 'express-serve-static-core';

export interface StudyAreaIdParams extends ParamsDictionary {
    id: string;
}

export interface StudyPlanIdParams extends ParamsDictionary {
    id: string;
}

export interface StudyAreaWeekIdParams extends ParamsDictionary {
    id: string;
}

export interface StudyAreaWeekAreaAndWeekParams extends ParamsDictionary {
    studyAreaId: string;
    weekStartDate: string;
}

export interface StudyAreaWeekDateParams extends ParamsDictionary {
    weekStartDate: string;
}

export interface StudyRecordIdParams extends ParamsDictionary {
    id: string;
}

export interface StudyRecordStudyAreaWeekParams extends ParamsDictionary {
    studyAreaWeekId: string;
}

export interface WeeklyAssessmentStudyAreaWeekParams extends ParamsDictionary {
    studyAreaWeekId: string;
}