import {
    GuildSettings,
    getGuildSettings,
    updateGuildSettings
} from '@db';
import * as set from './setConfigValue.js';

export function renderConfig(ctx: any, settings: GuildSettings) {
    return ctx.reply({
        embeds: [
            {
                title: "Server Configuration",
                color: 0x2b2d31,
                fields: [
                    {
                        name: "Prefix",
                        value: `\`${settings.prefix}\``
                    },

                    {
                        name: "Welcome",
                        value: settings.welcome.enabled
                            ? [
                                "Enabled: ✅",
                                `Channel: ${settings.welcome.channelId ?? "Not Set"}`
                            ].join("\n")
                            : "Enabled: ❌",
                        inline: true,
                    },

                    {
                        name: "Goodbye",
                        value: settings.goodbye.enabled
                            ? [
                                "Enabled: ✅",
                                `Channel: ${settings.goodbye.channelId ?? "Not Set"}`
                            ].join("\n")
                            : "Enabled: ❌",
                        inline: true,
                    },

                    {
                        name: "Logging",
                        value: settings.logging.enabled
                            ? [
                                "Enabled: ✅",
                                `Channel: ${settings.logging.channelId ?? "Not Set"}`,
                                `Messages: ${settings.logging.events.messages ? "✅" : "❌"}`,
                                `Edits: ${settings.logging.events.edits ? "✅" : "❌"}`,
                                `Deletions: ${settings.logging.events.deletions ? "✅" : "❌"}`
                            ].join("\n")
                            : "Enabled: ❌"
                    }
                ]
            }
        ]
    });
}


export async function handleConfigCommand(ctx: any) {
    const args = ctx.args?.raw ?? [];

    const settings = await getGuildSettings(ctx.guild.id);

    // /config (no args)
    if (args.length === 0) {
        return renderConfig(ctx, settings);
    }

    const [section, key, ...rest] = args;
    const value = rest.join(" ");

    // /config welcome enabled true
    switch (section) {

        case "prefix":
            settings.prefix = value;
            break;

        case "welcome":
            set.applyWelcome(settings, key, value);
            break;

        /*
            case "goodbye":
            set.applyGoodbye(settings, key, value);
            break;

        case "logging":
            set.applyLogging(settings, key, value);
            break;
        */

        default:
            return ctx.error(`Unknown config section: ${section}`);
    }

    await updateGuildSettings(settings);

    return ctx.success({
        content: `Updated \`${section}.${key}\``
    });
}
