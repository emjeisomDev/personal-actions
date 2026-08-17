import type { Request } from 'express';
import type { ValidationIssue } from './validation-middleware.js';
import {
    isValidDateString,
    validateBodyIsObject,
    validatePositiveInteger,
    validateUuidParam
} from './common.validators.js';

export function validateStudyRecordId(request: Request): ValidationIssue[] {
    return validateUuidParam(request, 'id');
}

export function validateStudyRecordStudyAreaWeekId(request: Request): ValidationIssue[] {
    return validateUuidParam(request, 'studyAreaWeekId');
}

export function validateCreateStudyRecord(request: Request): ValidationIssue[] {
    const issues: ValidationIssue[] = [
        ...validateUuidParam(
            request,
            'studyAreaWeekId'
        ),
        ...validateBodyIsObject(request),
        ...validatePositiveInteger(
            request.body?.minutes,
            'minutes'
        )
    ];

    if (!isValidDateString(request.body?.date)) {
        issues.push({
            field: 'date',
            message: 'date must be a valid date in YYYY-MM-DD format.'
        });
    }
    return issues;
}