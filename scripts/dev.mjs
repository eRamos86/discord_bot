// Runs the local development session: starts the isolated development PostgreSQL
// (mirrors production defaults, port 5433), applies pending migrations, runs the
// bot under nodemon, and tears the database container down when the session ends
// (Ctrl+C, SIGTERM, or the bot exiting on its own).
//
// Teardown runs detached (own session) so a group signal or hard kill of the
// session cannot interrupt the `docker compose down` before it finishes.
import { spawn } from 'node:child_process';

const COMPOSE = ['compose', '-f', 'docker-compose.dev.yml'];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const children = new Set();

function spawnChild(args, { stdio = 'inherit' } = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(args[0], args.slice(1), { stdio });
        children.add(child);
        child.on('error', (error) => {
            children.delete(child);
            reject(error);
        });
        child.on('exit', (code) => {
            children.delete(child);
            resolve(code ?? 1);
        });
    });
}

// Runs a command in its own process session so it is immune to signals sent to
// this session's process group. Used for teardown.
function spawnDetached(args) {
    const child = spawn(args[0], args.slice(1), { stdio: 'inherit', detached: true });
    child.unref();
    const done = new Promise((resolve) => {
        child.on('error', () => resolve(1));
        child.on('exit', (code) => resolve(code ?? 0));
    });
    return { child, done };
}

async function requireDocker() {
    const code = await spawnChild(['docker', 'info'], { stdio: 'ignore' });
    if (code !== 0) {
        throw new Error(
            'Docker is not running. Start Docker Desktop (or the Docker daemon), then run npm run dev again.'
        );
    }
}

async function startDb() {
    console.log('Starting development PostgreSQL (localhost:5433, mirrors production defaults)...');
    await requireDocker();
    const up = await spawnChild(['docker', ...COMPOSE, 'up', '-d', 'postgres']);
    if (up !== 0) throw new Error('docker compose failed to start the development PostgreSQL container.');
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
        const ready = await spawnChild(
            [
                'docker',
                ...COMPOSE,
                'exec',
                '-T',
                'postgres',
                'pg_isready',
                '-U',
                'discord_bot',
                '-d',
                'discord_bot',
            ],
            { stdio: 'ignore' },
        );
        if (ready === 0) {
            console.log('Development PostgreSQL is ready.');
            dbStarted = true;
            return;
        }
        await sleep(1000);
    }
    throw new Error('Development PostgreSQL did not become ready within 60 seconds.');
}

async function stopDb() {
    console.log('Stopping development PostgreSQL...');
    const { child, done } = spawnDetached(['docker', ...COMPOSE, 'down']);
    const timer = setTimeout(() => child.kill('SIGKILL'), 15_000);
    try {
        await done;
    } finally {
        clearTimeout(timer);
    }
    console.log('Development PostgreSQL stopped.');
}

let teardownStarted = false;
let dbStarted = false;
async function teardown() {
    if (teardownStarted) return;
    teardownStarted = true;
    try {
        await stopDb();
    } catch (error) {
        console.error(`Failed to stop development PostgreSQL: ${error.message}`);
    }
}

let exiting = false;
function exitProcess(code) {
    if (exiting) return;
    exiting = true;
    process.exitCode = code;
    process.exit();
}

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
        if (signal === 'SIGINT') process.stdout.write('\n');
        for (const child of children) {
            try {
                child.kill(signal);
            } catch {
                // Child already exited.
            }
        }
        void teardown().then(() => exitProcess(signal === 'SIGINT' ? 130 : 143));
    });
}

try {
    await startDb();

    const migrated = await spawnChild([process.execPath, '--import', 'tsx', 'src/database/migrate.ts']);
    if (migrated !== 0) throw new Error(`Database migration failed (exit code ${migrated}).`);

    console.log('Starting bot (nodemon) — Ctrl+C stops the bot and the development database.');
    const bot = await spawnChild(['npm', 'run', 'dev:bot']);

    await teardown();
    exitProcess(bot);
} catch (error) {
    console.error(`Failed to start development session: ${error.message}`);
    if (dbStarted) await teardown();
    exitProcess(1);
}
