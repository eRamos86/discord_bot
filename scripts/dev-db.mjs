// Starts the isolated development PostgreSQL (mirrors production defaults, port 5433)
// and blocks until it accepts connections. Used by `npm run dev` (and `db:reset`).
import { spawn } from 'node:child_process';

const COMPOSE = ['compose', '-f', 'docker-compose.dev.yml'];

function run(args) {
    return new Promise((resolve, reject) => {
        const child = spawn('docker', args, { stdio: 'inherit' });
        child.on('error', reject);
        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`docker ${args.join(' ')} exited with code ${code}`));
            }
        });
    });
}

function isDbReady() {
    return new Promise((resolve) => {
        const child = spawn(
            'docker',
            [...COMPOSE, 'exec', '-T', 'postgres', 'pg_isready', '-U', 'discord_bot', '-d', 'discord_bot'],
            { stdio: 'ignore' },
        );
        child.on('exit', (code) => resolve(code === 0));
    });
}

try {
    console.log('Starting development PostgreSQL (localhost:5433, mirrors production defaults)...');
    await run([...COMPOSE, 'up', '-d', 'postgres']);
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
        if (await isDbReady()) {
            console.log('Development PostgreSQL is ready.');
            process.exit(0);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.error('Development PostgreSQL did not become ready within 60 seconds.');
    process.exit(1);
} catch (error) {
    console.error(`Failed to start development PostgreSQL: ${error.message}`);
    console.error('Is Docker running? Start Docker Desktop and try again.');
    process.exit(1);
}
