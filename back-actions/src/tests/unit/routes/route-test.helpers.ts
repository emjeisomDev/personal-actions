import express, { type RequestHandler, type Router } from 'express';
import { createServer, type Server } from 'node:http';

export interface TestServer {
    server: Server;
    url: string;
    close: () => Promise<void>;
}

export interface HttpResponse {
    status: number;
    body: unknown;
}

export function createJsonHandler(
    status: number,
    body: unknown
): RequestHandler {
    return (_request, response) => {
        response
            .status(status)
            .json(body);
    };
}

export async function startTestServer(
    router: Router
): Promise<TestServer> {
    const app = express();

    app.use(express.json());
    app.use(router);

    const server = createServer(app);

    await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => {
            resolve();
        });
    });

    const address = server.address();

    if (
        address === null ||
        typeof address === 'string'
    ) {
        throw new Error(
            'Unable to determine test server address.'
        );
    }

    return {
        server,
        url: `http://127.0.0.1:${address.port}`,
        close: async (): Promise<void> => {
            await new Promise<void>(
                (resolve, reject) => {
                    server.close((error) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve();
                    });
                }
            );
        }
    };
}

export async function httpRequest(
    url: string,
    method: string,
    body?: unknown
): Promise<HttpResponse> {
    const headers: Record<string, string> = {};

    const requestInit: RequestInit = {
        method,
        headers
    };

    if (body !== undefined) {
        headers['content-type'] =
            'application/json';

        requestInit.body =
            JSON.stringify(body);
    }

    const response = await fetch(
        url,
        requestInit
    );

    const text =
        await response.text();

    let parsedBody: unknown = undefined;

    if (text.length > 0) {
        parsedBody =
            JSON.parse(text);
    }

    return {
        status: response.status,
        body: parsedBody
    };
}