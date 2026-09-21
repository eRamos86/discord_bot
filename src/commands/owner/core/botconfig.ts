import { botConfig } from '../../../config/botConfig.js';
import { createEmbed } from '../../../framework/embed/embed.js';
import type { Command } from '../../../types/command.types.js';

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

export default {
    name: 'botconfig',
    desc: 'Manage dynamic bot configuration, theme colors, and platform service branding',
    access: { ownerOnly: true, private: true },
    prefix: { enabled: false },
    subcommands: {
        view: {
            description: 'View current bot configuration, theme colors, and service branding',
            args: {
                section: {
                    type: 'string',
                    choices: [
                        { name: 'All', value: 'all' },
                        { name: 'Theme', value: 'theme' },
                        { name: 'Services', value: 'services' },
                        { name: 'General', value: 'general' },
                    ],
                },
            },
        },
        'set-color': {
            description: 'Set a hex color for a theme role or service',
            args: {
                target: {
                    type: 'string',
                    required: true,
                    description: 'Service name (e.g. flux, nova) or theme role (e.g. primary, success)',
                },
                hex: {
                    type: 'string',
                    required: true,
                    description: 'Hex color code (e.g. #00c721)',
                },
            },
        },
        'set-service': {
            description: 'Configure or add a platform service branding profile',
            args: {
                name: {
                    type: 'string',
                    required: true,
                    description: 'Service identifier (e.g. flux, nova, custom_service)',
                },
                color: {
                    type: 'string',
                    required: true,
                    description: 'Hex color code (e.g. #00c721)',
                },
                emoji: {
                    type: 'string',
                    description: 'Service emoji (e.g. 💰)',
                },
                label: {
                    type: 'string',
                    description: 'Display label (e.g. Flux)',
                },
            },
        },
        'set-prefix': {
            description: 'Set global default command prefix',
            args: {
                prefix: {
                    type: 'string',
                    required: true,
                    minLength: 1,
                    maxLength: 10,
                    description: 'New prefix',
                },
            },
        },
        reset: {
            description: 'Reset configuration back to default values',
            args: {
                section: {
                    type: 'string',
                    choices: [
                        { name: 'All', value: 'all' },
                        { name: 'Theme', value: 'theme' },
                        { name: 'Services', value: 'services' },
                    ],
                },
            },
        },
    },
    async execute(ctx) {
        const action = ctx.getString('subcommand') ?? 'view';

        if (action === 'view') {
            const section = ctx.getString('section') ?? 'all';
            const embed = createEmbed({
                title: '⚙️ Dynamic Bot Configuration',
                desc: 'Persistent bot configuration stored in PostgreSQL.',
            });

            if (section === 'all' || section === 'general') {
                embed.addFields({
                    name: '🌐 General Settings',
                    value: [
                        `**Global Prefix:** \`${botConfig.prefix}\``,
                        `**Uptime:** ${Math.floor(process.uptime())}s`,
                    ].join('\n'),
                });
            }

            if (section === 'all' || section === 'theme') {
                const theme = botConfig.getTheme();
                const themeLines = Object.entries(theme).map(
                    ([key, val]) => `• **${key}:** \`${val}\``,
                );
                embed.addFields({
                    name: '🎨 Theme Colors',
                    value: themeLines.join('\n') || 'None configured.',
                });
            }

            if (section === 'all' || section === 'services') {
                const services = botConfig.getServices();
                const serviceLines = Object.entries(services).map(
                    ([key, s]) => `${s.emoji} **${s.label}** (\`${key}\`): \`${s.color}\``,
                );
                embed.addFields({
                    name: '🚀 Platform Service Branding',
                    value: serviceLines.join('\n') || 'None configured.',
                });
            }

            return ctx.reply({ embeds: [embed] });
        }

        if (action === 'set-color') {
            const target = ctx.getString('target')!.toLowerCase();
            const hex = ctx.getString('hex')!;

            if (!HEX_REGEX.test(hex)) {
                return ctx.reply('❌ Invalid hex format. Must be formatted like `#RRGGBB` (e.g. `#00c721`).');
            }

            const theme = botConfig.getTheme();
            const services = botConfig.getServices();

            if (target in theme) {
                const oldColor = theme[target];
                await botConfig.setThemeColor(target, hex);
                return ctx.reply(`✅ Updated theme color **${target}** from \`${oldColor}\` to \`${hex}\`.`);
            }

            if (target in services) {
                const oldColor = services[target]!.color;
                await botConfig.setServiceColor(target, hex);
                return ctx.reply(
                    `✅ Updated service **${services[target]!.label}** color from \`${oldColor}\` to \`${hex}\`.`,
                );
            }

            // If target is unknown, default to adding it as a service
            await botConfig.setServiceColor(target, hex);
            return ctx.reply(`✅ Created/updated service color **${target}** to \`${hex}\`.`);
        }

        if (action === 'set-service') {
            const name = ctx.getString('name')!.toLowerCase();
            const color = ctx.getString('color')!;
            const emoji = ctx.getString('emoji') ?? undefined;
            const label = ctx.getString('label') ?? undefined;

            if (!HEX_REGEX.test(color)) {
                return ctx.reply('❌ Invalid hex format. Must be formatted like `#RRGGBB`.');
            }

            await botConfig.setService(name, { color, emoji, label });
            const s = botConfig.getService(name);
            return ctx.reply(
                `✅ Configured service **${s.label}** (${s.emoji}) with color \`${s.color}\`.`,
            );
        }

        if (action === 'set-prefix') {
            const prefix = ctx.getString('prefix')!;
            await botConfig.setPrefix(prefix);
            return ctx.reply(`✅ Updated global default command prefix to \`${prefix}\`.`);
        }

        if (action === 'reset') {
            const section = (ctx.getString('section') ?? 'all') as 'all' | 'theme' | 'services';
            await botConfig.reset(section);
            return ctx.reply(`✅ Reset **${section}** configuration back to baseline code defaults.`);
        }

        return ctx.reply('Unknown action.');
    },
} satisfies Command;
