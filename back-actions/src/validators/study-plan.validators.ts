import type { Request } from 'express';
import type { ValidationIssue } from './validation-middleware.js';
import { validateBodyIsObject, validatePositiveNumber, validateRequiredString, validateUuidParam } from './common.validators.js';

const STUDY_PLAN_STATUSES = ['active', 'inactive'] as const;

export function validateStudyPlanId(request: Request): ValidationIssue[] {
    return validateUuidParam(request, 'id');
}

export function validateCreateStudyPlan(request: Request): ValidationIssue[] {
    const issues: ValidationIssue[] = [
        ...validateBodyIsObject(request),
        ...validateRequiredString(
            request.body?.name,
            'name'
        ),
        ...validatePositiveNumber(
            request.body?.coefficient,
            'coefficient'
        )
    ];

    const status = request.body?.status;

    if (typeof status !== 'string' || !STUDY_PLAN_STATUSES.includes(status as typeof STUDY_PLAN_STATUSES[number])) {
        issues.push({
            field: 'status',
            message: 'status must be either active or inactive.'
        });
    }
    return issues;
}