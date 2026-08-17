import type { Request } from 'express';
import type { ValidationIssue } from './validation-middleware.js';
import {
    isValidDateString,
    isValidUuid,
    validateBodyIsObject,
    validateDateParam,
    validateUuidParam
} from './common.validators.js';

export function validateStudyAreaWeekId(request: Request): ValidationIssue[] {
    return validateUuidParam(request, 'id');
}

export function validateStudyAreaWeekByAreaAndWeek(request: Request): ValidationIssue[] {
    return [
        ...validateUuidParam(
            request,
            'studyAreaId'
        ),
        ...validateDateParam(
            request,
            'weekStartDate'
        )
    ];
}

export function validateStudyAreaWeekByWeek(request: Request): ValidationIssue[] {
    return validateDateParam(request, 'weekStartDate');
}

export function validateCreateStudyAreaWeek(request: Request): ValidationIssue[] {
    const issues: ValidationIssue[] = [...validateBodyIsObject(request)];

    const {studyAreaId, studyPlanId, weekStartDate} = request.body ?? {};

    if (!isValidUuid(studyAreaId)) {
        issues.push({
            field: 'studyAreaId',
            message: 'studyAreaId must be a valid UUID.'
        });
    }

    if (!isValidUuid(studyPlanId)) {
        issues.push({
            field: 'studyPlanId',
            message: 'studyPlanId must be a valid UUID.'
        });
    }

    if (!isValidDateString(weekStartDate)) {
        issues.push({
            field: 'weekStartDate',
            message: 'weekStartDate must be a valid date in YYYY-MM-DD format.'
        });
    }
    return issues;
}