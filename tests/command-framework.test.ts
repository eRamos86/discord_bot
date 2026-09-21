import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

import { materializeCommand } from '../src/framework/commands/commandSchema.js';
import type { Command } from '../src/types/command.types.js';
import { getCommandFiles } from '../src/utils/command.js';
import { resolveHelpTarget } from '../src/features/help/help.service.js';

const commandsRoot = path.join(process.cwd(), 'src', 'commands');

test('every command uses the declarative command structure', async () => {
    const files = getCommandFiles(commandsRoot);
    assert.ok(files.length > 0);
    const names = new Set<string>();

    for (const file of files) {
        const source = readFileSync(file, 'utf8');
        assert.equal(source.includes('SlashCommandBuilder'), false, `${file} still uses SlashCommandBuilder`);

        const module = await import(pathToFileURL(file).href);
        const command = module.default as Command;
        assert.equal(typeof command.name, 'string', `${file} is missing name`);
        assert.equal(typeof command.desc, 'string', `${file} is missing desc`);
        assert.equal(names.has(command.name!), false, `duplicate command name: ${command.name}`);
        names.add(command.name!);

        const json = materializeCommand(command).data.toJSON() as { name?: string; description?: string };
        assert.equal(json.name, command.name);
        assert.equal(json.description, command.desc);
    }
});

test('help resolves both slash and prefix arguments', () => {
    const commands = [
        {
            name: 'ping',
            description: 'Ping',
            category: 'utility',
            subcategory: 'general',
            requiredLevel: 0,
        },
    ];

    const slashTarget = resolveHelpTarget({ raw: [], category: 'utility' }, commands);
    assert.equal(slashTarget.category, 'utility');
    assert.equal(slashTarget.subcategory, undefined);
    assert.equal(slashTarget.command, undefined);
    assert.deepEqual(resolveHelpTarget({ raw: ['ping'] }, commands), { command: 'ping' });
});

test('declarative args preserve option metadata', () => {
    const command = materializeCommand({
        name: 'example',
        desc: 'Example command',
        args: {
            amount: {
                type: 'integer',
                required: true,
                description: 'Amount',
                minValue: 1,
                maxValue: 100,
            },
        },
        async execute() {},
    });

    const json = command.data.toJSON() as { options?: Array<Record<string, unknown>> };
    const option = json.options?.[0];
    assert.equal(option?.type, 4);
    assert.equal(option?.name, 'amount');
    assert.equal(option?.description, 'Amount');
    assert.equal(option?.required, true);
    assert.equal(option?.min_value, 1);
    assert.equal(option?.max_value, 100);
});

test('declarative subcommands materialize nested args', () => {
    const command = materializeCommand({
        name: 'service',
        desc: 'Service commands',
        subcommands: {
            run: {
                description: 'Run a service action',
                args: {
                    target: { type: 'string', required: true, description: 'Target' },
                },
            },
        },
        async execute() {},
    });

    const json = command.data.toJSON() as {
        options?: Array<{ name?: string; options?: Array<{ name?: string }> }>;
    };
    assert.equal(json.options?.[0]?.name, 'run');
    assert.equal(json.options?.[0]?.options?.[0]?.name, 'target');
});
