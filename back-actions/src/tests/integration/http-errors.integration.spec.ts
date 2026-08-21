import dotenv from 'dotenv';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express, { type Express } from 'express';
import type { Server } from 'node:http';
import { globalErrorHandler } from '../../middlewares/error-handler.js';
import { notFoundHandler } from '../../middlewares/not-found-handler.js';
import { BusinessRuleError } from '../../services/errors/business-rule.error.js';

interface ApiError {
    error: {
        code: string;
        message: string;
        entity?: string;
        id?: string;
        issues?: Array<{
            field: string;
            message: string;
        }>;
    };
}

interface HttpResponse<T = unknown> {
    status: number;
    contentType: string | null;
    body: T | null;
}

dotenv.config({
    path: '.env.test'
});

process.env['NODE_ENV'] = 'test';

describe(
    'HTTP global error handling integration',
    () => {
        let application: Express;
        let server: Server;
        let baseUrl: string;

        async function startServer(
            applicationToStart: Express
        ): Promise<Server> {
            const runningServer =
                await new Promise<Server>(
                    (
                        resolve,
                        reject
                    ) => {
                        const candidate =
                            applicationToStart.listen(
                                0,
                                '127.0.0.1',
                                () => {
                                    resolve(
                                        candidate
                                    );
                                }
                            );

                        candidate.on(
                            'error',
                            reject
                        );
                    }
                );

            const address =
                runningServer.address();

            if (
                address === null ||
                typeof address === 'string'
            ) {
                runningServer.close();

                throw new Error(
                    'Could not determine HTTP test server address.'
                );
            }

            baseUrl =
                `http://127.0.0.1:${address.port}`;

            return runningServer;
        }

        async function stopServer(
            runningServer: Server
        ): Promise<void> {
            await new Promise<void>(
                (
                    resolve,
                    reject
                ) => {
                    runningServer.close(
                        (error) => {
                            if (error) {
                                reject(
                                    error
                                );
                                return;
                            }

                            resolve();
                        }
                    );
                }
            );
        }

        async function request<T = unknown>(
            path: string,
            options: RequestInit = {}
        ): Promise<HttpResponse<T>> {
            const response =
                await fetch(
                    `${baseUrl}${path}`,
                    {
                        ...options,
                        headers: {
                            'Content-Type':
                                'application/json',
                            ...(options.headers ?? {})
                        }
                    }
                );

            const contentType =
                response.headers.get(
                    'content-type'
                );

            const body =
                contentType?.includes(
                    'application/json'
                )
                    ? await response.json() as T
                    : null;

            return {
                status:
                    response.status,
                contentType,
                body
            };
        }

        function createErrorTestApplication(
            route: string,
            method: 'GET' | 'POST',
            handler: () => void
        ): Express {
            const testApplication =
                express();

            testApplication.use(
                express.json()
            );

            if (method === 'GET') {
                testApplication.get(
                    route,
                    handler
                );
            } else {
                testApplication.post(
                    route,
                    handler
                );
            }

            testApplication.use(
                notFoundHandler
            );

            testApplication.use(
                globalErrorHandler
            );

            return testApplication;
        }

        beforeAll(
            async () => {
                const appModule =
                    await import(
                        '../../app.js'
                    );

                application =
                    appModule.app;

                server =
                    await startServer(
                        application
                    );
            }
        );

        afterAll(
            async () => {
                await stopServer(
                    server
                );
            }
        );

        it(
            'deve transformar JSON inválido em HTTP 400 INVALID_JSON',
            async () => {
                const response =
                    await fetch(
                        `${baseUrl}/api/study-areas`,
                        {
                            method:
                                'POST',
                            headers: {
                                'Content-Type':
                                    'application/json'
                            },
                            body:
                                '{"name":'
                        }
                    );

                const contentType =
                    response.headers.get(
                        'content-type'
                    );

                const body =
                    await response.json() as ApiError;

                expect(
                    response.status
                ).toBe(400);

                expect(
                    contentType
                ).toContain(
                    'application/json'
                );

                expect(
                    body
                ).toEqual({
                    error: {
                        code:
                            'INVALID_JSON',
                        message:
                            'Request body contains invalid JSON.'
                    }
                });
            }
        );

        it(
            'deve transformar falha de validação em HTTP 422 VALIDATION_ERROR',
            async () => {
                const response =
                    await request<ApiError>(
                        '/api/study-areas',
                        {
                            method:
                                'POST',
                            body:
                                JSON.stringify({
                                    name:
                                        '',
                                    weeklyGoalMinutes:
                                        0
                                })
                        }
                    );

                expect(
                    response.status
                ).toBe(422);

                expect(
                    response.contentType
                ).toContain(
                    'application/json'
                );

                expect(
                    response.body?.error.code
                ).toBe(
                    'VALIDATION_ERROR'
                );

                expect(
                    response.body?.error.message
                ).toBe(
                    'Request validation failed.'
                );

                expect(
                    response.body?.error.issues
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            field:
                                'name'
                        }),
                        expect.objectContaining({
                            field:
                                'weeklyGoalMinutes'
                        })
                    ])
                );
            }
        );

        it(
            'deve transformar entidade inexistente em HTTP 404 ENTITY_NOT_FOUND',
            async () => {
                const missingId =
                    '550e8400-e29b-41d4-a716-446655440000';

                const response =
                    await request<ApiError>(
                        `/api/study-areas/${missingId}`
                    );

                expect(
                    response.status
                ).toBe(404);

                expect(
                    response.contentType
                ).toContain(
                    'application/json'
                );

                expect(
                    response.body
                ).toEqual({
                    error: {
                        code:
                            'ENTITY_NOT_FOUND',
                        message:
                            `StudyArea with id "${missingId}" was not found.`,
                        entity:
                            'StudyArea',
                        id:
                            missingId
                    }
                });
            }
        );

        it(
            'deve transformar rota inexistente em HTTP 404 ROUTE_NOT_FOUND',
            async () => {
                const response =
                    await request<ApiError>(
                        '/api/this-route-does-not-exist'
                    );

                expect(
                    response.status
                ).toBe(404);

                expect(
                    response.contentType
                ).toContain(
                    'application/json'
                );

                expect(
                    response.body
                ).toEqual({
                    error: {
                        code:
                            'ROUTE_NOT_FOUND',
                        message:
                            'The requested route was not found.'
                    }
                });
            }
        );

        it(
            'deve transformar regra de negócio em HTTP 409',
            async () => {
                const testApplication =
                    createErrorTestApplication(
                        '/api/test-business-rule',
                        'POST',
                        () => {
                            throw new BusinessRuleError(
                                'Test business rule violation.',
                                'TEST_BUSINESS_RULE'
                            );
                        }
                    );

                const testServer =
                    await startServer(
                        testApplication
                    );

                try {
                    const response =
                        await request<ApiError>(
                            '/api/test-business-rule',
                            {
                                method:
                                    'POST',
                                body:
                                    JSON.stringify({})
                            }
                        );

                    expect(
                        response.status
                    ).toBe(409);

                    expect(
                        response.contentType
                    ).toContain(
                        'application/json'
                    );

                    expect(
                        response.body
                    ).toEqual({
                        error: {
                            code:
                                'TEST_BUSINESS_RULE',
                            message:
                                'Test business rule violation.'
                        }
                    });
                } finally {
                    await stopServer(
                        testServer
                    );

                    server =
                        await startServer(
                            application
                        );
                }
            }
        );

        it(
            'deve responder 500 INTERNAL_SERVER_ERROR sem expor detalhes internos',
            async () => {
                const consoleErrorSpy =
                    vi.spyOn(
                        console,
                        'error'
                    ).mockImplementation(
                        () => undefined
                    );

                const testApplication =
                    createErrorTestApplication(
                        '/api/test-internal-error',
                        'GET',
                        () => {
                            throw new Error(
                                'Database password leaked internally'
                            );
                        }
                    );

                const testServer =
                    await startServer(
                        testApplication
                    );

                try {
                    const response =
                        await request<ApiError>(
                            '/api/test-internal-error'
                        );

                    expect(
                        response.status
                    ).toBe(500);

                    expect(
                        response.contentType
                    ).toContain(
                        'application/json'
                    );

                    expect(
                        response.body
                    ).toEqual({
                        error: {
                            code:
                                'INTERNAL_SERVER_ERROR',
                            message:
                                'An unexpected error occurred.'
                        }
                    });

                    expect(
                        JSON.stringify(
                            response.body
                        )
                    ).not.toContain(
                        'Database password leaked internally'
                    );

                    expect(
                        consoleErrorSpy
                    ).toHaveBeenCalledTimes(
                        1
                    );

                    expect(
                        consoleErrorSpy
                    ).toHaveBeenCalledWith(
                        'Unhandled application error.',
                        expect.objectContaining({
                            method:
                                'GET',
                            path:
                                '/api/test-internal-error'
                        })
                    );
                } finally {
                    await stopServer(
                        testServer
                    );

                    server =
                        await startServer(
                            application
                        );

                    consoleErrorSpy.mockRestore();
                }
            }
        );
    }
);