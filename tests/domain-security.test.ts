import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createDefaultGuildSettings, mergeDefaults } from '../src/database/guilds/defaults.js';
import { validateSettings } from '../src/database/guilds/validation.js';
import { changeSetting } from '../src/features/config/settings.service.js';
import { MemoryGuildSettingsProvider } from '../src/database/guilds/providers/MemoryGuildSettingsProvider.js';
import { AutomodEngine } from '../src/features/automod/engine.js';
import { ServiceClient } from '../src/services/http.js';
import { NovaClient, encryptToken, decryptToken } from '../src/services/nova.js';
import { AtlasClient } from '../src/services/platform.js';
import { verifySignature, parseEvent } from '../src/features/notifications/intake.js';
import { authorizeLocal, Cooldowns } from '../src/framework/guards/authorize.js';
import { validateArguments } from '../src/framework/commands/validateArgs.js';
import { PermissionFlagsBits, PermissionsBitField, Collection } from 'discord.js';
import type { CommandContext } from '../src/framework/context/context.types.js';
import { publicError } from '../src/framework/runtime/errors.js';
const guild = '12345678901234567';
test('defaults are safe and older settings gain missing domains', () => {
    const s = createDefaultGuildSettings(guild);
    validateSettings(s);
    for (const name of [
        'welcome',
        'goodbye',
        'logging',
        'automod',
        'security',
        'tickets',
        'roles',
        'leveling',
        'economy',
    ] as const)
        assert.equal(s[name].enabled, false);
    assert.equal(mergeDefaults(s, { guildId: guild, welcome: { enabled: true } }).welcome.roleIds.length, 0);
});
test('settings reject invalid ranges, paths and prototypes', () => {
    const s = createDefaultGuildSettings(guild);
    assert.throws(() => changeSetting(s, '__proto__', 'set', '{}'));
    assert.throws(() => changeSetting(s, 'automod', '__proto__.polluted', 'true'));
    assert.throws(() => validateSettings(changeSetting(s, 'automod', 'maxMessages', '1')));
    assert.throws(() => changeSetting(s, 'logging', 'enabled', 'yes'));
    assert.equal(changeSetting(s, 'prefix', 'set', '!').prefix, '!');
    assert.equal(s.prefix, '---');
});
test('settings adapters isolate tenants and reject stale writes', async () => {
    const provider = new MemoryGuildSettingsProvider();
    const a = await provider.get(guild);
    const stale = await provider.get(guild);
    a.prefix = '!';
    await provider.update(a);
    assert.equal((await provider.get('22345678901234567')).prefix, '---');
    await assert.rejects(provider.update(stale));
    a.prefix = 'changed';
    assert.equal((await provider.get(guild)).prefix, '!');
});
test('automod isolates guilds, expires samples and enforces thresholds', () => {
    const s = createDefaultGuildSettings(guild).automod;
    s.enabled = true;
    s.filters.spam = true;
    s.maxDuplicates = 3;
    const engine = new AutomodEngine();
    const sample = { guildId: guild, userId: 'u', content: 'hello', mentions: 0, now: 1000 };
    for (let i = 0; i < 3; i++) assert.equal(engine.inspect(sample, s), null);
    assert.equal(engine.inspect(sample, s), 'repeated message');
    assert.equal(engine.inspect({ ...sample, guildId: 'b' }, s), null);
    assert.equal(engine.inspect({ ...sample, now: 20000 }, s), null);
    s.filters.links = true;
    s.allowedDomains = ['example.com'];
    assert.equal(engine.inspect({ ...sample, content: 'https://example.com/a' }, s), null);
    assert.equal(engine.inspect({ ...sample, content: 'https://example.com.evil/a' }, s), 'link filter');
});
test('prefix arguments reject missing, nonfinite, fractional integers and invalid choices', () => {
    const command = {
        name: 'test',
        args: { amount: { type: 'integer' as const, required: true, minValue: 1, maxValue: 10 } },
        execute: async () => {},
    };
    for (const amount of [undefined, NaN, Infinity, 1.5, 0, 11])
        assert.throws(() => validateArguments(command, { amount }));
    validateArguments(command, { amount: 5 });
});
test('authorization requires specific Discord permissions even for bot owners', () => {
    const ctx = {
        user: { id: '123' },
        guild: { id: guild, ownerId: 'owner', members: { me: null } },
        member: {
            permissions: new PermissionsBitField(PermissionFlagsBits.ManageMessages),
            roles: { cache: new Collection() },
        },
        interaction: {},
    } as unknown as CommandContext;
    const command = {
        name: 'ban',
        access: { discord: [PermissionFlagsBits.BanMembers] },
        execute: async () => {},
    };
    assert.throws(() => authorizeLocal(ctx, command, createDefaultGuildSettings(guild)));
    ctx.member!.permissions.add(PermissionFlagsBits.BanMembers);
    authorizeLocal(ctx, command, createDefaultGuildSettings(guild));
    const settings = createDefaultGuildSettings(guild);
    settings.permissions.ban = { userIds: [], roleIds: [], deniedUserIds: ['123'], deniedRoleIds: [] };
    assert.throws(() => authorizeLocal(ctx, command, settings));
    assert.throws(() =>
        authorizeLocal(
            { ...ctx, interaction: undefined },
            { ...command, access: { private: true } },
            settings,
        ),
    );
});
test('cooldowns separate users and expire', () => {
    const c = new Cooldowns();
    c.check('g:u:a', 2, 1000);
    assert.throws(() => c.check('g:u:a', 2, 1001));
    c.check('g:v:a', 2, 1001);
    c.check('g:u:a', 2, 3000);
});
test('service clients retry reads only and never leak response secrets', async () => {
    let calls = 0;
    const fake: typeof fetch = async () => {
        calls++;
        return new Response('secret-token', { status: 503 });
    };
    const c = new ServiceClient('Test', 'https://service.example', fake);
    await assert.rejects(
        c.request('/data'),
        (e) => e instanceof Error && !e.message.includes('secret-token'),
    );
    assert.equal(calls, 2);
    calls = 0;
    await assert.rejects(c.request('/data', { method: 'POST', body: {} }));
    assert.equal(calls, 1);
    assert.throws(() => c.url('//evil.example'));
    assert.throws(() => c.url('/\\evil.example'));
    assert.equal(c.url('/data').origin, 'https://service.example');
});
test('service response bounds and malformed JSON fail closed', async () => {
    const big = new ServiceClient(
        'Test',
        'https://example.com',
        async () => new Response('x'.repeat(1000001)),
    );
    await assert.rejects(big.request('/'));
    const malformed = new ServiceClient('Test', 'https://example.com', async () => new Response('<html>'));
    await assert.rejects(malformed.request('/'));
    assert.equal(
        publicError(new Error('Authorization: Bearer secret')),
        'The operation could not be completed.',
    );
});
test('Nova uses live grants and verifies identity without role caching', async () => {
    let authorized = true,
        calls = 0;
    const nova = new NovaClient('Nova', 'https://nova.example', async () => {
        calls++;
        return Response.json(
            authorized
                ? { access: true, role: 'user', user: { id: 'nova-u' } }
                : { access: false, role: null, user: null },
        );
    });
    await nova.verify('token', 'apex', 'nova-u');
    await assert.rejects(nova.verify('token', 'apex', 'other'));
    authorized = false;
    await assert.rejects(nova.verify('token', 'apex', 'nova-u'));
    assert.equal(calls, 3);
});
test('Atlas forwards only the requesting user token and filters returned authorized metadata', async () => {
    let authorization = '';
    const atlas = new AtlasClient('Atlas', 'https://atlas.example', async (_input, init) => {
        authorization = new Headers(init?.headers).get('authorization') ?? '';
        return Response.json({
            docs: [
                { title: 'Nova auth', path: 'Platform/Nova.md' },
                { title: 'Other', path: 'Other.md' },
            ],
        });
    });
    const result = await atlas.search('user-token', 'nova');
    assert.equal(result.total, 1);
    assert.equal(authorization, 'Bearer user-token');
    assert.throws(() => atlas.open('user-token', '../secret'));
});
test('session encryption detects tampering and wrong keys', () => {
    const key = '11'.repeat(32);
    const encrypted = encryptToken('private-token', key);
    assert.equal(decryptToken(encrypted, key), 'private-token');
    assert.ok(!encrypted.includes('private-token'));
    assert.throws(() => decryptToken(encrypted, '22'.repeat(32)));
    assert.throws(() => encryptToken('token', 'short'));
});
test('webhook verifies exact bytes, timestamp, source, and fixed destinations', () => {
    const key = 'k'.repeat(32),
        raw = Buffer.from('{"id":"one"}'),
        timestamp = '1800000000';
    const signature = 'sha256=' + createHmac('sha256', key).update(`${timestamp}.`).update(raw).digest('hex');
    verifySignature(raw, 'apex', timestamp, signature, { apex: key }, 1800000000000);
    assert.throws(() =>
        verifySignature(Buffer.from('tampered'), 'apex', timestamp, signature, { apex: key }, 1800000000000),
    );
    assert.throws(() => verifySignature(raw, 'flux', timestamp, signature, { apex: key }, 1800000000000));
    assert.throws(() => verifySignature(raw, 'apex', timestamp, signature, { apex: key }, 1800000400000));
    assert.throws(() =>
        parseEvent(
            {
                source: 'apex',
                id: '1',
                type: 'fuel.logged',
                title: 'Fuel',
                message: 'done',
                channelId: 'attacker',
            },
            'apex',
        ),
    );
});

test('recipient envelopes accept only a canonical Nova selector and no Discord destination', () => {
    const event = parseEvent(
        {
            version: 1,
            id: 'event.1',
            source: 'apex',
            type: 'maintenance.due',
            title: 'Due',
            message: 'Soon',
            recipient: { novaUserId: 'nova-user' },
        },
        'apex',
    );
    assert.equal(event.recipientNovaId, 'nova-user');
    assert.throws(() =>
        parseEvent(
            {
                version: 1,
                id: 'event.2',
                source: 'apex',
                type: 'maintenance.due',
                title: 'Due',
                message: 'Soon',
                recipient: { novaUserId: 'nova-user', discordId: 'forbidden' },
            },
            'apex',
        ),
    );
});

test('settings reject malformed permission and shop JSON before saving', () => {
    const s = createDefaultGuildSettings(guild);
    assert.throws(() => validateSettings(changeSetting(s, 'permissions', 'set', '{"ban":{"userIds":[]}}')));
    assert.throws(() => validateSettings(changeSetting(s, 'economy', 'shop', '[null]')));
    assert.throws(() => validateSettings(changeSetting(s, 'leveling', 'levelRoles', '{"-1":"bad"}')));
});
