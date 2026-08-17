import type { Request } from 'express';

export function createRequest(
    params: Record<string, string> = {},
    body: unknown = {}
): Request {
    return {
        params,
        body
    } as Request;
}