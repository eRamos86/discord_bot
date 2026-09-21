import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { pool } from '../src/database/client.js';
import { balance, reward, transfer, buy, inventory } from '../src/features/engagement/economy.js';
import { PostgresGuildSettingsProvider } from '../src/database/guilds/providers/PostgresGuildSettingsProvider.js';
import { enqueue, Scheduler } from '../src/framework/jobs/scheduler.js';
import { acceptEvent } from '../src/features/notifications/intake.js';
import { setNotificationPreference } from '../src/features/notifications/preferences.js';
import { caseHistory, editCase } from '../src/features/moderation/service.js';
const pg = new PGlite();
const originalQuery = pool.query,
    originalConnect = pool.connect;
async function query(sql: string | { text: string; rowMode?: string }, values?: unknown[]) {
    const result = await pg.query(typeof sql === 'string' ? sql : sql.text, values);
    return {
        rows:
            typeof sql !== 'string' && sql.rowMode === 'array'
                ? result.rows.map((row) => Object.values(row as Record<string, unknown>))
                : result.rows,
        rowCount: result.rows.length || result.affectedRows,
        fields: result.fields,
    };
}
before(async () => {
    await pg.exec(readFileSync('drizzle/0000_simple_tana_nile.sql', 'utf8'));
    await pg.exec(readFileSync('drizzle/0001_production_domains.sql', 'utf8'));
    await pg.exec(readFileSync('drizzle/0002_user_notification_preferences.sql', 'utf8'));
    pool.query = query as unknown as typeof pool.query;
    pool.connect = (async () => ({ query, release() {} })) as unknown as typeof pool.connect;
});
after(async () => {
    pool.query = originalQuery;
    pool.connect = originalConnect;
    await pg.close();
    await pool.end();
});
const guild = '12345678901234567',
    other = '22345678901234567';
test('PostgreSQL provider persists nested configuration and detects conflicts', async () => {
    const provider = new PostgresGuildSettingsProvider();
    const s = await provider.get(guild);
    const stale = await provider.get(guild);
    s.prefix = '!';
    s.tickets.enabled = true;
    await provider.update(s);
    assert.equal((await provider.get(guild)).tickets.enabled, true);
    assert.equal((await provider.get(other)).prefix, '---');
    await assert.rejects(provider.update(stale));
});
test('economy transactions enforce cooldown, conservation, inventory and tenant boundaries', async () => {
    await reward(guild, 'alice', 'daily', 100, 'daily-1');
    await assert.rejects(reward(guild, 'alice', 'daily', 100, 'daily-2'));
    await transfer(guild, 'alice', 'bob', 40, 'transfer-1');
    assert.equal(await balance(guild, 'alice'), 60);
    assert.equal(await balance(guild, 'bob'), 40);
    assert.equal(await balance(other, 'bob'), 0);
    await assert.rejects(transfer(guild, 'alice', 'bob', 100, 'transfer-2'));
    assert.equal(await balance(guild, 'alice'), 60);
    await buy(guild, 'bob', { id: 'item', price: 10 }, 'buy-1');
    assert.equal(await balance(guild, 'bob'), 30);
    assert.equal((await inventory(guild, 'bob'))[0]?.quantity, 1);
    assert.deepEqual(await inventory(other, 'bob'), []);
    await assert.rejects(transfer(guild, 'alice', 'bob', 5, 'transfer-1'));
    assert.equal(await balance(guild, 'alice'), 60);
});
test('scheduler persists, retries failed handlers, and completes without rerunning', async () => {
    let count = 0;
    const scheduler = new Scheduler();
    scheduler.register('test', async () => {
        count++;
        if (count === 1) throw new Error('failure');
    });
    const id = await enqueue('test', { value: 'data' }, new Date(0), { id: 'job-1', guildId: guild });
    await scheduler.tick();
    let row = (await pg.query<{ status: string }>('SELECT status FROM jobs WHERE id=$1', [id])).rows[0];
    assert.equal(row?.status, 'pending');
    await pg.query('UPDATE jobs SET run_at=$2 WHERE id=$1', [id, new Date(0)]);
    await scheduler.tick();
    await scheduler.tick();
    assert.equal(count, 2);
    row = (await pg.query<{ status: string }>('SELECT status FROM jobs WHERE id=$1', [id])).rows[0];
    assert.equal(row?.status, 'completed');
    const data = (await pg.query<{ payload: unknown }>('SELECT payload FROM jobs WHERE id=$1', [id])).rows[0];
    assert.deepEqual(data?.payload, {});
});
test('event intake atomically deduplicates jobs and rejects payload reuse', async () => {
    await pg.query(
        "INSERT INTO notification_routes(id,source,event_type,guild_id,channel_id,enabled) VALUES('r','apex','fuel.logged',$1,'channel',true)",
        [guild],
    );
    const event = { source: 'apex', id: 'event1', type: 'fuel.logged', title: 'Fuel', message: 'Created' };
    const raw = Buffer.from(JSON.stringify(event));
    assert.equal((await acceptEvent(event, raw)).deliveries, 1);
    assert.equal((await acceptEvent(event, raw)).duplicate, true);
    await assert.rejects(acceptEvent(event, Buffer.from('different')));
    const jobs = (
        await pg.query<{ count: number }>(
            "SELECT count(*)::integer AS count FROM jobs WHERE kind='notification'",
        )
    ).rows[0];
    assert.equal(jobs?.count, 1);
});
test('recipient events resolve only an active Nova link and honor layered opt-outs', async () => {
    await pg.query(
        "INSERT INTO nova_sessions(discord_id,nova_id,encrypted_token,expires_at) VALUES('discord-user','nova-user','encrypted',now()+interval '1 hour')",
    );
    const event = {
        recipientNovaId: 'nova-user',
        source: 'apex',
        id: 'maintenance-1',
        type: 'maintenance.due',
        title: 'Due',
        message: 'Oil change',
    };
    assert.equal((await acceptEvent(event, Buffer.from(JSON.stringify(event)))).deliveries, 1);
    assert.equal(
        (
            await pg.query<{ count: number }>(
                "SELECT count(*)::integer AS count FROM jobs WHERE kind='user_notification' AND user_id='discord-user'",
            )
        ).rows[0]?.count,
        1,
    );
    await setNotificationPreference('nova-user', 'apex', 'maintenance.due', false);
    const disabled = { ...event, id: 'maintenance-2' };
    assert.equal((await acceptEvent(disabled, Buffer.from(JSON.stringify(disabled)))).deliveries, 0);
    const delivery = (
        await pg.query<{ status: string }>(
            "SELECT status FROM notification_deliveries WHERE source='apex' AND event_id='maintenance-2'",
        )
    ).rows[0];
    assert.equal(delivery?.status, 'suppressed');
});
test('moderation history and case editing enforce guild isolation', async () => {
    const {
        rows: [c],
    } = await pg.query<{ id: string }>(
        "INSERT INTO moderation_cases(guild_id,action,target_id,moderator_id,reason,status) VALUES($1,'warn','target','moderator','old','completed') RETURNING id",
        [guild],
    );
    assert.equal((await caseHistory(other, 'target')).length, 0);
    await assert.rejects(editCase(other, String(c!.id), 'moderator', 'stolen'));
    await editCase(guild, String(c!.id), 'moderator', 'corrected');
    assert.equal((await caseHistory(guild, 'target'))[0]?.reason, 'corrected');
});

test('expired final worker leases are marked failed instead of stranded forever', async () => {
    await pg.query(
        "INSERT INTO jobs(id,kind,payload,run_at,status,attempts,max_attempts,lease_until) VALUES('exhausted','test','{}',now(),'running',5,5,now()-interval '1 minute')",
    );
    const scheduler = new Scheduler();
    scheduler.register('notification', async () => {});
    await scheduler.tick();
    const {
        rows: [row],
    } = await pg.query<{ status: string }>("SELECT status FROM jobs WHERE id='exhausted'");
    assert.equal(row?.status, 'failed');
});
test('startup check loads commands, event modules and persistent state without gateway credentials', async () => {
    const token = process.env.DISCORD_TOKEN;
    const database = process.env.DATABASE_URL;
    const args = process.argv;
    const end = pool.end;
    const exitCode = process.exitCode;
    pool.end = async () => {};
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DATABASE_URL = 'postgres://isolated/test';
    process.argv = [...args, '--check'];
    try {
        await import('../src/index.js');
        assert.notEqual(process.exitCode, 1);
    } finally {
        process.env.DISCORD_TOKEN = token;
        process.env.DATABASE_URL = database;
        process.argv = args;
        pool.end = end;
        process.exitCode = exitCode;
    }
});

test('moderation audit is durable before effects and failed effects stay failed', async () => {
    const { auditedAction } = await import('../src/features/moderation/service.js');
    const { guildSettingsProvider } = await import('../src/database/guilds/settings.provider.js');
    const { createDefaultGuildSettings } = await import('../src/database/guilds/defaults.js');
    const original = guildSettingsProvider.get;
    guildSettingsProvider.get = async (id) => createDefaultGuildSettings(id);
    try {
        const g = { id: guild } as import('discord.js').Guild;
        let called = false;
        await assert.rejects(
            auditedAction(g, 'actor', 'target', 'kick', 'test', async () => {
                const rows = (
                    await pg.query<{ status: string }>(
                        "SELECT status FROM moderation_cases WHERE guild_id=$1 AND action='kick'",
                        [guild],
                    )
                ).rows;
                assert.equal(rows[0]?.status, 'pending');
                called = true;
                throw new Error('Discord rejected action');
            }),
        );
        assert.equal(called, true);
        assert.equal(
            (
                await pg.query<{ status: string }>(
                    "SELECT status FROM moderation_cases WHERE guild_id=$1 AND action='kick'",
                    [guild],
                )
            ).rows[0]?.status,
            'failed',
        );
    } finally {
        guildSettingsProvider.get = original;
    }
});

test('ticket creation preserves private overwrites, reuses an open ticket and isolates guilds', async () => {
    const { createTicket } = await import('../src/features/tickets/index.js');
    const { guildSettingsProvider } = await import('../src/database/guilds/settings.provider.js');
    const { createDefaultGuildSettings } = await import('../src/database/guilds/defaults.js');
    const { PermissionFlagsBits } = await import('discord.js');
    const original = guildSettingsProvider.get;
    guildSettingsProvider.get = async (id) => {
        const s = createDefaultGuildSettings(id);
        s.tickets.enabled = true;
        return s;
    };
    let creations = 0;
    const channels = new Map<string, unknown>();
    function fakeGuild(id: string) {
        return {
            id,
            channels: {
                fetch: async (channelId: string) => channels.get(channelId),
                create: async (options: { permissionOverwrites: { id: string; deny?: bigint[] }[] }) => {
                    assert.deepEqual(options.permissionOverwrites.find((o) => o.id === id)?.deny, [
                        PermissionFlagsBits.ViewChannel,
                    ]);
                    const channel = {
                        id: `ticket-channel-${++creations}`,
                        send: async () => undefined,
                        delete: async () => undefined,
                    };
                    channels.set(channel.id, channel);
                    return channel;
                },
            },
        } as unknown as import('discord.js').Guild;
    }
    try {
        const user = { id: '42345678901234567' } as import('discord.js').User;
        const first = await createTicket(fakeGuild(guild), user, 'bot', 'Support');
        const duplicate = await createTicket(fakeGuild(guild), user, 'bot', 'Other');
        assert.equal(first.created, true);
        assert.equal(duplicate.created, false);
        assert.equal(first.channel.id, duplicate.channel.id);
        const isolated = await createTicket(fakeGuild(other), user, 'bot', 'Other server');
        assert.notEqual(first.channel.id, isolated.channel.id);
        assert.equal(creations, 2);
    } finally {
        guildSettingsProvider.get = original;
    }
});

test('Nova OAuth consumes state once, binds Discord ownership and encrypts stored sessions', async () => {
    const { NovaClient, decryptToken } = await import('../src/services/nova.js');
    const keys = ['TOKEN_ENCRYPTION_KEY', 'NOVA_REDIRECT_URI', 'NOVA_CLIENT_ID'] as const;
    const previous = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    process.env.TOKEN_ENCRYPTION_KEY = 'ab'.repeat(32);
    process.env.NOVA_REDIRECT_URI = 'https://bot.example/oauth/nova/callback';
    process.env.NOVA_CLIENT_ID = 'discord-bot';
    let accountId = '52345678901234567';
    class FakeNova extends NovaClient {
        override async request(path: string): Promise<unknown> {
            if (path === '/auth/token') return { access_token: 'test-token-only', expires_in: 3600 };
            if (path === '/auth/me')
                return { id: 'nova-user', accounts: [{ providerId: 'discord', accountId }] };
            if (path === '/auth/verify') return { access: true, role: 'user', user: { id: 'nova-user' } };
            throw new Error('Unexpected path');
        }
    }
    try {
        const nova = new FakeNova('Nova', 'https://nova.example');
        const link = new URL(await nova.startLink(accountId));
        const state = link.searchParams.get('state')!;
        await nova.finishLink(state, 'code');
        await assert.rejects(nova.finishLink(state, 'code'), /already used/);
        const session = (
            await pg.query<{ encrypted_token: string }>(
                'SELECT encrypted_token FROM nova_sessions WHERE discord_id=$1',
                [accountId],
            )
        ).rows[0]!;
        assert.notEqual(session.encrypted_token, 'test-token-only');
        assert.equal(
            decryptToken(session.encrypted_token, process.env.TOKEN_ENCRYPTION_KEY),
            'test-token-only',
        );
        assert.equal((await nova.authorize(accountId, { project: 'apex' })).id, 'nova-user');
        const attack = new URL(await nova.startLink('62345678901234567'));
        accountId = 'another-discord-account';
        await assert.rejects(
            nova.finishLink(attack.searchParams.get('state')!, 'code'),
            /Nova account settings/,
        );
        assert.equal(
            (await pg.query('SELECT * FROM nova_sessions WHERE discord_id=$1', ['62345678901234567'])).rows
                .length,
            0,
        );
    } finally {
        for (const key of keys) {
            if (previous[key] === undefined) delete process.env[key];
            else process.env[key] = previous[key];
        }
    }
});

test('legacy baseline validates initial schema and refuses existing migration history', async () => {
    const { baselineLegacy } = await import('../src/database/baseline.js');
    const legacy = new PGlite();
    const connection = {
        query: async (sql: string, values?: unknown[]) => {
            const r = await legacy.query(sql, values);
            return { ...r, rowCount: r.rows.length || r.affectedRows };
        },
    } as unknown as Pick<import('pg').PoolClient, 'query'>;
    try {
        await legacy.exec(readFileSync('drizzle/0000_simple_tana_nile.sql', 'utf8'));
        await baselineLegacy(connection, { hash: 'test-hash', folderMillis: 1 });
        assert.equal((await legacy.query('SELECT * FROM drizzle.__drizzle_migrations')).rows.length, 1);
        await assert.rejects(
            baselineLegacy(connection, { hash: 'test-hash', folderMillis: 1 }),
            /already exists/,
        );
    } finally {
        await legacy.close();
    }
});
