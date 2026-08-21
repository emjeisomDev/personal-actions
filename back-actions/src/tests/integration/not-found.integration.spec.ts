import dotenv from 'dotenv';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import type { Server } from 'node:http';

dotenv.config({
    path: '.env.test'
});

process.env['NODE_ENV'] = 'test';

interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
    };
}

describe(
    'Global not-found middleware integration',
    () => {
        let application: Express;
        let server: Server;
        let baseUrl: string;

        async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<{
            status: number;
            contentType: string | null;
            body: T | null;
        }> {
            const response = await fetch(`${baseUrl}${path}`,
                {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
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

        beforeAll(
            async () => {
                const appModule =
                    await import(
                        '../../app.js'
                    );

                application =
                    appModule.app;

                await new Promise<void>(
                    (
                        resolve,
                        reject
                    ) => {
                        server =
                            application.listen(
                                0,
                                '127.0.0.1',
                                () => {
                                    resolve();
                                }
                            );

                        server.on(
                            'error',
                            reject
                        );
                    }
                );

                const address =
                    server.address();

                if (
                    address === null ||
                    typeof address ===
                    'string'
                ) {
                    throw new Error(
                        'Could not determine HTTP test server address.'
                    );
                }

                baseUrl =
                    `http://127.0.0.1:${address.port}`;
            }
        );

        afterAll(
            async () => {
                await new Promise<void>(
                    (
                        resolve,
                        reject
                    ) => {
                        server.close(
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
        );

        it(
            'deve responder 404 JSON para uma rota inexistente dentro da API',
            async () => {
                const response =
                    await request<ApiErrorResponse>(
                        '/api/route-that-does-not-exist'
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
            'deve responder 404 JSON para uma rota inexistente fora da API',
            async () => {
                const response =
                    await request<ApiErrorResponse>(
                        '/route-that-does-not-exist'
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
            'deve responder 404 JSON para método HTTP não registrado',
            async () => {
                const response =
                    await request<ApiErrorResponse>(
                        '/api/study-plans',
                        {
                            method:
                                'DELETE'
                        }
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
            'deve responder 404 JSON para endpoint inexistente de WeeklyAssessment',
            async () => {
                const response =
                    await request<ApiErrorResponse>(
                        '/api/weekly-assessments'
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
            'não deve substituir uma rota válida pelo not-found handler',
            async () => {
                const response =
                    await request<{
                        status: string;
                        service: string;
                        environment: string;
                        database: string;
                    }>(
                        '/health'
                    );

                expect(
                    response.status
                ).toBe(200);

                expect(
                    response.body
                ).toMatchObject({
                    status:
                        'ok',
                    service:
                        'back-actions',
                    environment:
                        'test',
                    database:
                        'connected'
                });
            }
        );
    }
);