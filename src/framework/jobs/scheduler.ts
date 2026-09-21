import { randomUUID } from 'node:crypto';
import { pool } from '../../database/client.js';
import { reportError } from '../runtime/errors.js';
export interface Job {
    id: string;
    kind: string;
    guild_id: string | null;
    user_id: string | null;
    payload: Record<string, unknown>;
    attempts: number;
    lease_token: string;
    max_attempts: number;
}
export type JobHandler = (job: Job) => Promise<void>;
export function retryDelay(attempt: number) {
    return Math.min(3600, 2 ** Math.min(attempt, 10) * 5);
}
export class Scheduler {
    private readonly handlers = new Map<string, JobHandler>();
    private timer: ReturnType<typeof setTimeout> | undefined;
    private active: Promise<void> | undefined;
    private stopped = true;
    register(kind: string, handler: JobHandler) {
        if (this.handlers.has(kind)) throw new Error(`Duplicate job handler: ${kind}`);
        this.handlers.set(kind, handler);
    }
    start() {
        if (!this.stopped) return;
        this.stopped = false;
        this.schedule();
    }
    private schedule() {
        if (this.stopped) return;
        this.timer = setTimeout(() => {
            this.active = this.tick()
                .catch((e) => {
                    reportError(e, 'scheduler');
                })
                .finally(() => this.schedule());
        }, 1000);
        this.timer.unref();
    }
    async stop() {
        this.stopped = true;
        if (this.timer) clearTimeout(this.timer);
        await this.active;
    }
    async tick() {
        await pool.query(
            "UPDATE jobs SET status='failed',last_error='Worker lease expired on final attempt' WHERE status='running' AND lease_until<now() AND attempts>=max_attempts",
        );
        const lease = randomUUID();
        const {
            rows: [job],
        } = await pool.query<Job>(
            `UPDATE jobs SET status='running',attempts=attempts+1,lease_until=now()+interval '90 seconds',lease_token=$1
            WHERE id=(SELECT id FROM jobs WHERE ((status='pending' AND run_at<=now()) OR (status='running' AND lease_until<now())) AND attempts<max_attempts ORDER BY run_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`,
            [lease],
        );
        if (!job) return;
        const renew = setInterval(() => {
            void pool
                .query(
                    "UPDATE jobs SET lease_until=now()+interval '90 seconds' WHERE id=$1 AND lease_token=$2 AND status='running'",
                    [job.id, lease],
                )
                .catch((e) => reportError(e, 'lease_renewal'));
        }, 30000);
        renew.unref();
        try {
            const handler = this.handlers.get(job.kind);
            if (!handler) throw new Error('Unknown job kind');
            await handler(job);
            await pool.query(
                "UPDATE jobs SET status='completed',completed_at=now(),lease_until=NULL,payload='{}' WHERE id=$1 AND lease_token=$2",
                [job.id, lease],
            );
        } catch (error) {
            const id = reportError(error, `job:${job.kind}`);
            await pool.query(
                "UPDATE jobs SET status=CASE WHEN attempts>=max_attempts THEN 'failed' ELSE 'pending' END,run_at=now()+$3*interval '1 second',lease_until=NULL,last_error=$4 WHERE id=$1 AND lease_token=$2",
                [job.id, lease, retryDelay(job.attempts), id],
            );
        } finally {
            clearInterval(renew);
        }
    }
}
export async function enqueue(
    kind: string,
    payload: Record<string, unknown>,
    runAt: Date,
    options: { id?: string; guildId?: string; userId?: string } = {},
) {
    const id = options.id ?? randomUUID();
    await pool.query(
        'INSERT INTO jobs(id,kind,guild_id,user_id,payload,run_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING',
        [id, kind, options.guildId ?? null, options.userId ?? null, payload, runAt],
    );
    return id;
}
