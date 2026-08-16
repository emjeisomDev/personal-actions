import type { Pool, PoolClient, QueryResult, QueryResultRow} from 'pg';

export type DatabaseExecutor = | Pool | PoolClient;

export type DatabaseQueryResult<T extends QueryResultRow> = QueryResult<T>;