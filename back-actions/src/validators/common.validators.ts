import type { Request } from 'express';

import type { ValidationIssue } from './validation-middleware.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidUuid(value: unknown): value is string {
    return (typeof value === 'string' && UUID_PATTERN.test(value));
}

export function isValidDateString(value: unknown): value is string {
    if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
        return false;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

export function validateUuidParam(request: Request, parameterName: string): ValidationIssue[] {
    const value = request.params[parameterName];

    if (!isValidUuid(value)) {
        return [{
            field: `params.${parameterName}`,
            message: `${parameterName} must be a valid UUID.`
        }];
    }

    return [];
}

export function validateDateParam(request: Request, parameterName: string): ValidationIssue[] {
    const value = request.params[parameterName];

    if (!isValidDateString(value)) {
        return [{
            field: `params.${parameterName}`,
            message: `${parameterName} must be a valid date in YYYY-MM-DD format.`
        }];
    }

    return [];
}

export function validateRequiredString(value: unknown, field: string): ValidationIssue[] {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return [{
            field,
            message: `${field} is required and must be a non-empty string.`
        }];
    }
    return [];
}

export function validatePositiveInteger(value: unknown, field: string): ValidationIssue[] {
    if (!Number.isInteger(value) || Number(value) <= 0) {
        return [{
            field,
            message: `${field} must be a positive integer.`
        }];
    }
    return [];
}

export function validatePositiveNumber(value: unknown, field: string): ValidationIssue[] {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        return [{
            field,
            message: `${field} must be a finite number greater than zero.`
        }];
    }
    return [];
}

export function validateBodyIsObject(request: Request): ValidationIssue[] {
    if (request.body === null || typeof request.body !== 'object' || Array.isArray(request.body)) {
        return [{
            field: 'body',
            message: 'Request body must be a JSON object.'
        }];
    }
    return [];
}