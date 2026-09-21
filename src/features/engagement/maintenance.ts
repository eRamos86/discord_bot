import { Scheduler, enqueue } from '../../framework/jobs/scheduler.js';
import { pool } from '../../database/client.js';
export async function registerMaintenance(scheduler: Scheduler) {
    scheduler.register('cleanup', async () => {
        await pool.query(
            "DELETE FROM jobs WHERE (status IN ('completed','cancelled') AND created_at<now()-interval '7 days') OR (status='failed' AND created_at<now()-interval '30 days')",
        );
        await pool.query(
            "UPDATE jobs SET payload='{}' WHERE status='failed' AND created_at<now()-interval '7 days'",
        );
        await pool.query('DELETE FROM oauth_states WHERE expires_at<now()');
        await pool.query('DELETE FROM nova_sessions WHERE expires_at<now()');
        await pool.query("DELETE FROM notification_events WHERE created_at<now()-interval '30 days'");
        await pool.query("DELETE FROM afk_status WHERE created_at<now()-interval '30 days'");
        const next = new Date(Date.now() + 86400000);
        await enqueue('cleanup', {}, next, { id: `cleanup:${next.toISOString().slice(0, 10)}` });
    });
    await enqueue('cleanup', {}, new Date(), { id: `cleanup:${new Date().toISOString().slice(0, 10)}` });
}
