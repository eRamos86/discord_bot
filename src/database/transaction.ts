import type { PoolClient } from 'pg';
import { pool } from './client.js';
export async function transaction<T>(work: (connection: PoolClient) => Promise<T>): Promise<T> {
    const connection = await pool.connect();
    try {
        await connection.query('BEGIN');
        const value = await work(connection);
        await connection.query('COMMIT');
        return value;
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    } finally {
        connection.release();
    }
}
