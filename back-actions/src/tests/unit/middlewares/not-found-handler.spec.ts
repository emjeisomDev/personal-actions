import {
    describe,
    expect,
    it,
    vi
} from 'vitest';

import type {
    Request,
    Response
} from 'express';

import {
    notFoundHandler
} from '../../../middlewares/not-found-handler.js';

describe(
    'notFoundHandler',
    () => {
        it(
            'deve responder 404 com ROUTE_NOT_FOUND',
            () => {
                const status =
                    vi.fn();

                const json =
                    vi.fn();

                status.mockReturnValue({
                    json
                });

                const response =
                    {
                        status
                    } as unknown as Response;

                const request =
                    {
                        method:
                            'GET',
                        originalUrl:
                            '/api/does-not-exist'
                    } as Request;

                notFoundHandler(
                    request,
                    response,
                    vi.fn()
                );

                expect(
                    status
                ).toHaveBeenCalledWith(
                    404
                );

                expect(
                    json
                ).toHaveBeenCalledWith({
                    error: {
                        code:
                            'ROUTE_NOT_FOUND',
                        message:
                            'The requested route was not found.'
                    }
                });
            }
        );
    }
);