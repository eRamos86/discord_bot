import type { PoolClient } from 'pg';
import { requireValue } from '../framework/runtime/errors.js';
/** Explicit operator-only adoption of the exact initial schema created by old db:push installs. */
export async function baselineLegacy(
    connection: Pick<PoolClient, 'query'>,
    first: { hash: string; folderMillis: number },
) {
    const { rows } = await connection.query<{ column_name: string; data_type: string }>(
        "SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='guild_settings' ORDER BY column_name",
    );
    const expected: Record<string, string> = {
        guild_id: 'text',
        prefix: 'text',
        welcome: 'jsonb',
        goodbye: 'jsonb',
        logging: 'jsonb',
    };
    requireValue(
        rows.length === 5 && rows.every((r) => expected[r.column_name] === r.data_type),
        'Legacy baseline requires the exact initial five-column guild_settings schema. Review schema drift before migrating.',
    );
    const key = await connection.query(
        "SELECT 1 FROM pg_constraint WHERE conrelid='public.guild_settings'::regclass AND contype='p' AND pg_get_constraintdef(oid)='PRIMARY KEY (guild_id)'",
    );
    requireValue(key.rowCount, 'Legacy guild_settings must have a guild_id primary key.');
    await connection.query('BEGIN');
    try {
        await connection.query('CREATE SCHEMA IF NOT EXISTS drizzle');
        await connection.query(
            'CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)',
        );
        const existing = await connection.query('SELECT id FROM drizzle.__drizzle_migrations LIMIT 1');
        requireValue(!existing.rowCount, 'Migration history already exists. Run normal migration.');
        await connection.query('INSERT INTO drizzle.__drizzle_migrations(hash,created_at) VALUES($1,$2)', [
            first.hash,
            first.folderMillis,
        ]);
        await connection.query('COMMIT');
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
}
