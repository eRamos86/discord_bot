import { GuildSettings, getGuildSettings, updateGuildSettings } from '@db';
import type { CommandContext } from '@framework';
import * as set from './setConfigValue.js';

export function renderConfig(ctx: CommandContext, settings: GuildSettings) {
    return ctx.reply({
        embeds: [
            {
                title: 'Server Configuration',
                color: 0x2b2d31,
                fields: [
                    {
                        name: 'Prefix',
                        value: `\`${settings.prefix}\``,
                    },

                    {
                        name: 'Welcome',
                        value: settings.welcome.enabled
                            ? ['Enabled: ✅', `Channel: ${settings.welcome.channelId ?? 'Not Set'}`].join(
                                  '\n',
                              )
                            : 'Enabled: ❌',
                        inline: true,
                    },

                    {
                        name: 'Goodbye',
                        value: settings.goodbye.enabled
                            ? ['Enabled: ✅', `Channel: ${settings.goodbye.channelId ?? 'Not Set'}`].join(
                                  '\n',
                              )
                            : 'Enabled: ❌',
                        inline: true,
                    },

                    {
                        name: 'Logging',
                        value: settings.logging.enabled
                            ? [
                                  'Enabled: ✅',
                                  `Channel: ${settings.logging.channelId ?? 'Not Set'}`,
                                  `Messages: ${settings.logging.events.messages ? '✅' : '❌'}`,
                                  `Edits: ${settings.logging.events.edits ? '✅' : '❌'}`,
                                  `Deletions: ${settings.logging.events.deletions ? '✅' : '❌'}`,
                              ].join('\n')
                            : 'Enabled: ❌',
                    },
                ],
            },
        ],
    });
}

export async function handleConfigCommand(ctx: CommandContext) {
    if (!ctx.guild) return;
    const rawArgs = ctx.args.raw ?? [];
    const args =
        rawArgs.length > 0
            ? rawArgs
            : ['section', 'key', 'value']
                  .map((name) => ctx.getString(name))
                  .filter((value): value is string => value !== null);

    const settings = await getGuildSettings(ctx.guild.id);

    // /config (no args)
    if (args.length === 0) {
        return renderConfig(ctx, settings);
    }

    const [section, key, ...rest] = args;
    const value = rest.join(' ');
    let updated = false;

    // /config welcome enabled true
    switch (section) {
        case 'prefix':
            if (key !== 'set' || !value || value.length > 10 || /\s/.test(value)) break;
            settings.prefix = value;
            updated = true;
            break;

        case 'welcome':
            updated = set.applyWelcome(settings, key ?? '', value);
            break;

        case 'goodbye':
            updated = set.applyGoodbye(settings, key ?? '', value);
            break;

        case 'logging':
            updated = set.applyLogging(settings, key ?? '', value);
            break;

        default:
            return ctx.error({ embed: { desc: `Unknown config section: ${section}` } });
    }

    if (!updated) {
        return ctx.error({ embed: { desc: `Invalid setting or value for \`${section}.${key}\`.` } });
    }

    await updateGuildSettings(settings);

    return ctx.success({
        content: `Updated \`${section}.${key}\``,
    });
}
