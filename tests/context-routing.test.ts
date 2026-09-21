import test from 'node:test';
import assert from 'node:assert/strict';
import { Collection, Client } from 'discord.js';
import { createContext } from '../src/framework/context/createContext.js';
import { createReplies } from '../src/framework/context/ctxReplies.js';
import type { BaseContext, CtxState } from '../src/framework/context/context.types.js';
import type { BotClient } from '../src/framework/client/client.js';
import { synchronizeCommands } from '../src/utils/command.js';
import type { CommandRest } from '../src/utils/command.js';
import { getButtonHandler, registerButton } from '../src/framework/registry/buttonRegistry.js';
import { routeCommand } from '../src/framework/router/routeCommand.js';
import { validateEnvironment } from '../src/config/validate.js';
const client = new Client({ intents: [] }) as BotClient;
client.commands = new Collection();
test('context arguments can be named name and length without modifying Function properties', async () => {
    const ctx = await createContext({
        client,
        args: { name: 'new-ticket', length: 10, raw: ['new-ticket'] },
    });
    assert.equal(ctx.getString('name'), 'new-ticket');
    assert.equal(ctx.args('name'), 'new-ticket');
    assert.equal(ctx.getNumber('length'), 10);
    assert.deepEqual(ctx.args.raw, ['new-ticket']);
});
test('defer followed by reply edits original response and keeps followups private', async () => {
    const calls: { method: string; options: unknown }[] = [];
    const interaction = {
        deferred: false,
        replied: false,
        isButton: () => false,
        isStringSelectMenu: () => false,
        async deferReply(options: unknown) {
            this.deferred = true;
            calls.push({ method: 'defer', options });
        },
        async editReply(options: unknown) {
            this.replied = true;
            calls.push({ method: 'edit', options });
        },
        async followUp(options: unknown) {
            calls.push({ method: 'followup', options });
        },
        async reply(options: unknown) {
            this.replied = true;
            calls.push({ method: 'reply', options });
        },
    };
    const replies = createReplies({ interaction, state: { storedReply: null } } as unknown as BaseContext & {
        state: CtxState;
    });
    await replies.defer(64);
    await replies.defer(64);
    await replies.reply('first');
    await replies.followUp('second');
    assert.deepEqual(
        calls.map((c) => c.method),
        ['defer', 'edit', 'followup'],
    );
    assert.equal((calls[2]?.options as { flags: number }).flags, 64);
    assert.deepEqual((calls[2]?.options as { allowedMentions: unknown }).allowedMentions, {
        parse: [],
        repliedUser: false,
    });
});
test('component registry matches exact or delimited prefixes, choosing most specific', () => {
    const general = { id: 'test-route', execute: async () => {} };
    const specific = { id: 'test-route:detail', execute: async () => {} };
    registerButton(general);
    registerButton(specific);
    assert.equal(getButtonHandler('test-route:detail:1'), specific);
    assert.equal(getButtonHandler('test-route-evil'), null);
});
test('prefix alias routes through shared argument validation', async () => {
    let value = '';
    client.commands.set('rename-demo', {
        name: 'rename-demo',
        access: { guildOnly: false },
        prefix: { enabled: true, aliases: ['rename-alias'] },
        args: { name: { type: 'string', required: true } },
        async execute(ctx) {
            value = ctx.getString('name') ?? '';
        },
    });
    const message = {
        guild: null,
        member: null,
        author: { id: 'prefix-user' },
        channel: null,
        createdTimestamp: Date.now(),
        reply: async () => {},
    };
    await routeCommand({
        client,
        message: message as never,
        commandName: 'rename-alias',
        args: ['hello', 'world'],
    });
    assert.equal(value, 'hello world');
});
test('slash synchronization replaces obsolete registrations and supports safe removal', async () => {
    const calls: string[] = [];
    const rest: CommandRest = {
        put: async () => {
            calls.push('replace');
        },
        post: async () => {
            calls.push('upsert');
        },
        get: async () => [{ id: '123', name: 'obsolete' }],
        delete: async (route) => {
            calls.push(`delete:${route}`);
        },
    };
    const catalog = { names: ['ping'], body: [{ name: 'ping' }] };
    await synchronizeCommands(rest, '/commands', catalog, { dryRun: true });
    assert.deepEqual(calls, []);
    await synchronizeCommands(rest, '/commands', catalog);
    await synchronizeCommands(rest, '/commands', catalog, { remove: 'obsolete' });
    assert.deepEqual(calls, ['replace', 'delete:/commands/123']);
    await assert.rejects(synchronizeCommands(rest, '/commands', { names: [], body: [] }));
});
test('startup environment rejects missing persistence and invalid ports', () => {
    assert.throws(() => validateEnvironment({ DISCORD_TOKEN: 'test' }));
    assert.throws(() =>
        validateEnvironment({ DISCORD_TOKEN: 'test', DATABASE_URL: 'postgres://db/bot', HEALTH_PORT: 'NaN' }),
    );
    assert.equal(
        validateEnvironment({ DISCORD_TOKEN: 'test', DATABASE_URL: 'postgres://db/bot' }).port,
        3000,
    );
});

test('module discovery ignores generated declarations and numbered filesystem copies', async () => {
    const { mkdtemp, writeFile, rm } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');
    const { walk } = await import('../src/utils/fs.js');
    const dir = await mkdtemp(join(tmpdir(), 'bot-modules-'));
    try {
        for (const name of ['command.js', 'command 2.js', 'command.d.ts', 'source.ts'])
            await writeFile(join(dir, name), '');
        assert.deepEqual(
            walk(dir)
                .map((p) => p.split('/').at(-1))
                .sort(),
            ['command.js', 'source.ts'],
        );
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
});
