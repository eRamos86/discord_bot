// Exercise the compiled entrypoint and SQL schema without a Discord gateway or external database.
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
process.env.DISCORD_TOKEN = 'offline-runtime-check';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.EVENT_SIGNING_KEYS = '{}';
process.argv.push('--check');
const pg = new PGlite();
const { pool } = await import('../dist/database/client.js');
const originalEnd = pool.end.bind(pool);
async function query(sql, values) {
    const result = await pg.query(typeof sql === 'string' ? sql : sql.text, values);
    return {
        rows:
            typeof sql !== 'string' && sql.rowMode === 'array' ? result.rows.map(Object.values) : result.rows,
        rowCount: result.rows.length || result.affectedRows,
        fields: result.fields,
    };
}
try {
    const journal = JSON.parse(
        await readFile(new URL('../drizzle/meta/_journal.json', import.meta.url), 'utf8'),
    );
    for (const entry of journal.entries)
        await pg.exec(await readFile(new URL(`../drizzle/${entry.tag}.sql`, import.meta.url), 'utf8'));
    pool.query = query;
    pool.connect = async () => ({ query, release() {} });
    pool.end = async () => {};
    await import('../dist/index.js');
    if (process.exitCode) throw new Error('Compiled startup check failed');
    console.log('Compiled runtime smoke check passed.');
} finally {
    await originalEnd();
    await pg.close();
}
