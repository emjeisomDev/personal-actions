import { vi } from 'vitest';
import type { QueryResult, QueryResultRow } from 'pg';
import { DatabaseExecutor } from '../../../repositories/database-executor.js';

export interface DatabaseExecutorMock {
    database: DatabaseExecutor;
    query: ReturnType<typeof vi.fn>;
}

export function createDatabaseExecutorMock(): DatabaseExecutorMock {
    const query = vi.fn();

    const database = {
        query
    } as unknown as DatabaseExecutor;

    return {
        database,
        query
    };
}

export function createQueryResult<
    T extends QueryResultRow
>(
    rows: T[],
    rowCount = rows.length
): QueryResult<T> {
    return {
        rows,
        rowCount,
        command: 'SELECT',
        oid: 0,
        fields: []
    };
}