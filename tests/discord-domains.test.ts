import test from 'node:test';
import assert from 'node:assert/strict';
import { PermissionsBitField, PermissionFlagsBits, type GuildMember, type Guild } from 'discord.js';
import { assertHierarchy } from '../src/features/moderation/service.js';
import { logEvent } from '../src/features/logging/service.js';
import { guildSettingsProvider } from '../src/database/guilds/settings.provider.js';
import { createDefaultGuildSettings } from '../src/database/guilds/defaults.js';
import { onboardingEmbed, parseMemberTemplate } from '../src/features/welc-bye/service.js';
import { validateGuildReferences } from '../src/features/config/settings.service.js';
import { pool } from '../src/database/client.js';
import { after } from 'node:test';
after(() => pool.end());
const gid = '12345678901234567';
function member(id: string, position: number) {
    return {
        id,
        roles: {
            highest: {
                position,
                comparePositionTo: (other: { position: number }) => position - other.position,
            },
        },
    } as unknown as GuildMember;
}
test('moderation respects actor and bot hierarchies including owner exceptions', () => {
    const actor = member('actor', 5),
        target = member('target', 4),
        bot = member('bot', 6);
    assert.doesNotThrow(() => assertHierarchy(actor, target, bot, 'owner'));
    assert.throws(() => assertHierarchy(actor, member('target', 5), bot, 'owner'));
    assert.throws(() => assertHierarchy(actor, target, member('bot', 3), 'owner'));
    assert.throws(() => assertHierarchy(actor, member('owner', 1), bot, 'owner'));
    assert.throws(() => assertHierarchy(actor, actor, bot, 'owner'));
    assert.doesNotThrow(() => assertHierarchy(member('owner', 1), target, bot, 'owner'));
});
test('logging routes within its guild, honors category toggles and bounds payloads', async () => {
    const s = createDefaultGuildSettings(gid);
    const original = guildSettingsProvider.get;
    guildSettingsProvider.get = async () => structuredClone(s);
    const destinations: string[] = [],
        sent: unknown[] = [];
    const guild = {
        id: gid,
        channels: {
            fetch: async (id: string) => {
                destinations.push(id);
                return { isTextBased: () => true, send: async (payload: unknown) => sent.push(payload) };
            },
        },
    } as unknown as Guild;
    try {
        await logEvent(guild, 'moderation', 'hidden', 'hidden');
        assert.equal(sent.length, 0);
        s.logging.enabled = true;
        s.logging.events.moderation = true;
        s.logging.channelId = '22345678901234567';
        s.logging.channels.moderation = '32345678901234567';
        await logEvent(guild, 'moderation', 'x'.repeat(1000), 'y'.repeat(5000));
        assert.deepEqual(destinations, ['32345678901234567']);
        const payload = sent[0] as {
            embeds: { toJSON(): { title: string; description: string } }[];
            allowedMentions: { parse: string[] };
        };
        assert.equal(payload.embeds[0]!.toJSON().description.length, 3500);
        assert.equal(payload.embeds[0]!.toJSON().title.length, 256);
        assert.deepEqual(payload.allowedMentions.parse, []);
        await logEvent(guild, 'messages', 'private', 'private');
        assert.equal(sent.length, 1);
    } finally {
        guildSettingsProvider.get = original;
    }
});
test('onboarding uses exact placeholders and preserves unknown text with bounded embeds', () => {
    const m = {
        id: 'user',
        guild: { name: 'Server', memberCount: 42 },
        user: { username: 'Alex', displayAvatarURL: () => 'https://example.com/avatar.png' },
    } as unknown as GuildMember;
    assert.equal(
        parseMemberTemplate('{username} {guild} {memberCount} {unknown}', m),
        'Alex Server 42 {unknown}',
    );
    const s = createDefaultGuildSettings(gid).welcome;
    s.title = '{username}';
    s.message = '{user} joined {server}';
    assert.equal(onboardingEmbed(m, s).toJSON().description, '<@user> joined Server');
});
test('configuration refuses automatic privileged roles and roles above the actor', async () => {
    const s = createDefaultGuildSettings(gid);
    s.roles.selfRoleIds = ['22345678901234567'];
    const role = {
        id: s.roles.selfRoleIds[0],
        managed: false,
        position: 4,
        permissions: new PermissionsBitField(),
    };
    const guild = {
        id: gid,
        ownerId: 'owner',
        roles: { fetch: async () => role },
        members: { fetchMe: async () => member('bot', 8), fetch: async () => member('actor', 3) },
    } as unknown as Guild;
    await assert.rejects(validateGuildReferences(guild, s, 'actor'), /below your highest/);
    role.permissions.add(PermissionFlagsBits.Administrator);
    await assert.rejects(validateGuildReferences(guild, s), /cannot carry/);
    s.roles.selfRoleIds = [];
    s.tickets.staffRoleIds = [gid];
    role.id = gid;
    await assert.rejects(validateGuildReferences(guild, s), /other than everyone/);
});

test('presence validates configuration, skips disabled entries and suppresses duplicate updates', async () => {
    const { parsePresences, startPresence } = await import('../src/features/presence.js');
    assert.throws(() => parsePresences('[{"text":"x","type":99}]'));
    assert.throws(() => parsePresences('[{"text":"x","type":1,"url":"https://evil.example"}]'));
    const previous = process.env.PRESENCES_JSON;
    process.env.PRESENCES_JSON = '[{"text":"off","type":3,"enabled":false},{"text":"/help","type":3}]';
    const values: unknown[] = [];
    const client = {
        isReady: () => true,
        user: { setPresence: (value: unknown) => values.push(value) },
    } as unknown as import('discord.js').Client;
    try {
        const stop = startPresence(client);
        stop();
        assert.equal(values.length, 1);
        assert.equal((values[0] as { activities: { name: string }[] }).activities[0]?.name, '/help');
    } finally {
        if (previous === undefined) delete process.env.PRESENCES_JSON;
        else process.env.PRESENCES_JSON = previous;
    }
});
