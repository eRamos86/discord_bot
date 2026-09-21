import { writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import { PermissionsBitField } from 'discord.js';
import { getCommandFiles } from '../src/utils/command.js';
import { pool } from '../src/database/client.js';
import type { Command } from '../src/types/command.types.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const entries = [];
for (const file of getCommandFiles(`${root}src/commands`)) {
    const command = (await import(pathToFileURL(file).href)).default as Command;
    const name = command.name ?? command.data?.name ?? '';
    const options = (args: Command['args']) =>
        Object.entries(args ?? {})
            .map(([n, a]) => (a.required ? `<${n}>` : `[${n}]`))
            .join(' ');
    const usage = command.subcommands
        ? Object.entries(command.subcommands).map(([n, v]) => `/${name} ${n} ${options(v.args)}`.trim())
        : [`/${name} ${options(command.args)}`.trim()];
    const permissions = command.access?.discord?.length
        ? new PermissionsBitField(command.access.discord).toArray().join(', ')
        : 'Everyone';
    entries.push({
        name,
        description: command.desc ?? '',
        source: relative(root, file),
        usage,
        prefix: command.prefix?.enabled !== false && !command.access?.private,
        aliases: [...(command.aliases ?? []), ...(command.prefix?.aliases ?? [])],
        access: [
            permissions,
            command.access?.ownerOnly ? 'Bot owner' : '',
            command.access?.nova
                ? `Live Nova: ${command.access.nova.project}${command.access.nova.roles ? ` (${command.access.nova.roles.join(', ')})` : ''}`
                : '',
            command.access?.private ? 'Private slash only' : '',
        ]
            .filter(Boolean)
            .join('; '),
    });
}
entries.sort((a, b) => a.name.localeCompare(b.name));
let output =
    '# Command catalog\n\nGenerated from command metadata with `npm run docs:commands`. Required arguments use `<name>`; optional arguments use `[name]`. Prefix commands use the guild prefix (default `---`) and the same argument order. Discord flags, guild policy, hierarchy and live Nova checks still apply at execution. Slash responses default to private; published panels, polls and entertainment explicitly opt into public responses.\n\n';
for (const e of entries)
    output += `## ${e.name}\n\n${e.description}\n\n\`\`\`text\n${e.usage.join('\n')}\n\`\`\`\n\nAccess: ${e.access}. Prefix: ${e.prefix ? 'supported' : 'disabled'}.${e.aliases.length ? ` Aliases: ${e.aliases.join(', ')}.` : ''}\n\nSource: [${e.source}](../${e.source}).\n\n`;
await writeFile(`${root}docs/commands.md`, output);
await writeFile(`${root}docs/commands.json`, JSON.stringify(entries, null, 2) + '\n');
console.log(`Documented ${entries.length} commands.`);
await pool.end();
