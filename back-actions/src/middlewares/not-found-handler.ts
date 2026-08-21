import type { RequestHandler } from 'express';

export const notFoundHandler: RequestHandler =
    (request, response): void => {
        response.status(404).json({
            error: {
                code: 'ROUTE_NOT_FOUND',
                message: 'The requested route was not found.'
            }
        });
    };