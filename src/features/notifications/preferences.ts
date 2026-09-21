import { pool } from '../../database/client.js';

export const notificationCatalog = {
    nova: ['account_linked'],
    apex: ['maintenance.due'],
} as const;

export type NotificationPreference = {
    source: string;
    eventType: string;
    enabled: boolean;
};

function validPart(value: string) {
    return value === '*' || /^[a-z][a-z0-9_.-]{0,79}$/.test(value);
}

export async function setNotificationPreference(
    novaId: string,
    source: string,
    eventType: string,
    enabled: boolean,
) {
    if (!novaId || !validPart(source) || !validPart(eventType)) throw new Error('Invalid notification preference.');
    await pool.query(
        `INSERT INTO user_notification_preferences(nova_id,source,event_type,enabled)
         VALUES($1,$2,$3,$4)
         ON CONFLICT(nova_id,source,event_type) DO UPDATE SET enabled=excluded.enabled,updated_at=now()`,
        [novaId, source, eventType, enabled],
    );
}

/** Defaults to enabled after a verified Nova link. More-specific settings win. */
export async function notificationsEnabled(novaId: string, source: string, eventType: string) {
    const { rows } = await pool.query<NotificationPreference>(
        `SELECT source,event_type AS "eventType",enabled
         FROM user_notification_preferences
         WHERE nova_id=$1
           AND (source='*' OR source=$2)
           AND (event_type='*' OR event_type=$3)`,
        [novaId, source, eventType],
    );
    const exact = rows.find((row) => row.source === source && row.eventType === eventType);
    const service = rows.find((row) => row.source === source && row.eventType === '*');
    const global = rows.find((row) => row.source === '*' && row.eventType === '*');
    return exact?.enabled ?? service?.enabled ?? global?.enabled ?? true;
}

export async function listNotificationPreferences(novaId: string) {
    return (
        await pool.query<NotificationPreference>(
            `SELECT source,event_type AS "eventType",enabled
             FROM user_notification_preferences WHERE nova_id=$1 ORDER BY source,event_type`,
            [novaId],
        )
    ).rows;
}
