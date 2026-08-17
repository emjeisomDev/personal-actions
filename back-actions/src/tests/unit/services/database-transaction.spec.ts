import { describe, expect, it, vi } from 'vitest';
import type { Pool, PoolClient } from 'pg';
import { withTransaction } from '../../../services/database-transaction.js';

function createTransactionMocks(): {
    pool: Pool;
    client: PoolClient;
} {
    const client = {
        query: vi.fn(),
        release: vi.fn()
    } as unknown as PoolClient;

    const connect = vi.fn<() => Promise<PoolClient>>();

    const pool = {
        connect
    } as unknown as Pool;

    connect.mockResolvedValue(client);

    return {
        pool,
        client
    };
}

describe('withTransaction', () => {
    it('deve executar BEGIN, operação e COMMIT', async () => {
        const {
            pool,
            client
        } = createTransactionMocks();

        const operation = vi.fn().mockResolvedValue('result');

        const result = await withTransaction(
            pool,
            operation
        );

        expect(result).toBe('result');

        expect(client.query).toHaveBeenNthCalledWith(
            1,
            'BEGIN'
        );

        expect(operation).toHaveBeenCalledWith(
            client
        );

        expect(client.query).toHaveBeenNthCalledWith(
            2,
            'COMMIT'
        );

        expect(client.query).not.toHaveBeenCalledWith(
            'ROLLBACK'
        );

        expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('deve executar ROLLBACK quando a operação falhar', async () => {
        const {
            pool,
            client
        } = createTransactionMocks();

        const error = new Error(
            'operation failed'
        );

        const operation = vi.fn().mockRejectedValue(
            error
        );

        await expect(
            withTransaction(
                pool,
                operation
            )
        ).rejects.toBe(error);

        expect(client.query).toHaveBeenNthCalledWith(
            1,
            'BEGIN'
        );

        expect(operation).toHaveBeenCalledWith(
            client
        );

        expect(client.query).toHaveBeenNthCalledWith(
            2,
            'ROLLBACK'
        );

        expect(client.query).not.toHaveBeenCalledWith(
            'COMMIT'
        );

        expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('deve liberar o client quando BEGIN falhar', async () => {
        const {
            pool,
            client
        } = createTransactionMocks();

        const error = new Error(
            'begin failed'
        );

        vi.mocked(
            client.query
        ).mockRejectedValueOnce(error);

        await expect(
            withTransaction(
                pool,
                vi.fn()
            )
        ).rejects.toBe(error);

        expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('deve liberar o client quando COMMIT falhar', async () => {
        const {
            pool,
            client
        } = createTransactionMocks();

        const commitError = new Error(
            'commit failed'
        );

        vi.mocked(client.query)
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(commitError);

        const operation = vi.fn().mockResolvedValue(
            'result'
        );

        await expect(
            withTransaction(
                pool,
                operation
            )
        ).rejects.toBe(commitError);

        expect(client.release).toHaveBeenCalledTimes(1);
    });
});