import * as dis from "discord.js";
import * as ace from "@framework";

export default {
    name: "messageCreate",

    async execute(message: dis.Message, client: ace.BotClient) {
        if (message.author.bot) return;
        if (!message.guild) return;

        console.log(
            `Message Created in '${message.guild.name}' by '${message.author.tag}': "${message.content}"`
        );

        const settings = await ace.getGuildSettings(message.guild.id);

        const prefix = settings.prefix;
        const mentionPrefix = `<@${client.user?.id}>`;

        const usedPrefix = message.content.startsWith(prefix)
            ? prefix
            : message.content.startsWith(mentionPrefix)
                ? mentionPrefix
                : null;

        if (!usedPrefix) return;

        console.log(`prefix detected! '${usedPrefix}'`);

        const allowed = await ace.guildAllowed(message.guild);
        const ctx = await ace.createContext({
            message,
            client,
            args: {}
        });

        if (!allowed) {
            return ctx.danger({
                embed: {
                    title: "Bot Disabled",
                    desc: "This server has disabled the bot.",
                    fields: [
                        {
                            name: "This may not be known-",
                            value: "is Ace in the server?\nIs he an admin?"
                        },
                        {
                            name: "if not-",
                            value: "i dont have permission to run any commands here :c"
                        }
                    ]
                }
            });
        }

        const args = message.content
            .slice(usedPrefix.length)
            .trim()
            .split(/\s+/);

        const commandName = args.shift()?.toLowerCase();

        if (!commandName) {
            return ctx.info({
                embed: {
                    title: `Hello! I'm AceBot`,
                    desc: `do you need help? run\n\`${prefix}help\` or \`/help\``
                }
            });
        }

        console.log('routing command');
        return ace.routeCommand({
            client,
            message,
            commandName,
            args
        });
    }
};
