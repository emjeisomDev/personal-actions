import type { Request } from 'express';
import type { ValidationIssue } from './validation-middleware.js';
import {
    validateBodyIsObject,
    validatePositiveInteger,
    validateRequiredString,
    validateUuidParam
} from './common.validators.js';

export function validateStudyAreaId(request: Request): ValidationIssue[] {
    return validateUuidParam(request, 'id');
}

export function validateCreateStudyArea(request: Request): ValidationIssue[] {
    return [
        ...validateBodyIsObject(request),
        ...validateRequiredString(
            request.body?.name,
            'name'
        ),
        ...validatePositiveInteger(
            request.body?.weeklyGoalMinutes,
            'weeklyGoalMinutes'
        )
    ];
}

export function validateUpdateStudyArea(request: Request): ValidationIssue[] {
    return [
        ...validateUuidParam(
            request,
            'id'
        ),
        ...validateBodyIsObject(request),
        ...validateRequiredString(
            request.body?.name,
            'name'
        ),
        ...validatePositiveInteger(
            request.body?.weeklyGoalMinutes,
            'weeklyGoalMinutes'
        )
    ];
}