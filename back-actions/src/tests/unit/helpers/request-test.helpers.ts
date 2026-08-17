import { vi } from 'vitest';
import type { Request, Response } from 'express';

export interface MockResponse {
    response: Response;
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
}

export function createMockResponse(): MockResponse {
    const response = {} as Response;
    const status = vi.fn().mockReturnValue(response);
    const json = vi.fn().mockReturnValue(response);
    const send = vi.fn().mockReturnValue(response);

    response.status = status;
    response.json = json;
    response.send = send;

    return { response, status, json, send };
}

export function createMockRequest<
    TParams = Record<string, string>,
    TBody = Record<string, unknown>
>(
    params: TParams = {} as TParams,
    body: TBody = {} as TBody
): Request<TParams, unknown, TBody> {
    return {
        params,
        body
    } as Request<
        TParams,
        unknown,
        TBody
    >;
}