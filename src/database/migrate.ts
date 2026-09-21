import 'dotenv/config';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { fileURLToPath } from 'node:url';
import { baselineLegacy } from './baseline.js';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { reportError } from '../framework/runtime/errors.js';
import { db, pool } from './client.js';
const connection = await pool.connect();
try {
    await connection.query("SELECT pg_advisory_lock(hashtext('discord_bot_migrations'))");
    const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));
    if (process.argv.includes('--baseline-legacy')) {
        const first = readMigrationFiles({ migrationsFolder })[0];
        if (!first) throw new Error('Initial migration missing');
        await baselineLegacy(connection, first);
    }
    await migrate(db, { migrationsFolder });
    console.log('Database migrations complete.');
} catch (error) {
    reportError(error, 'migration');
    process.exitCode = 1;
} finally {
    await connection.query("SELECT pg_advisory_unlock(hashtext('discord_bot_migrations'))");
    connection.release();
    await pool.end();
}
