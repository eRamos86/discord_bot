import { guildAllowed } from "../framework/guards/guards.js";
import { handleCommand } from "../framework/commands/commandHandler.js";
import { botConfig } from "../config/botConfig.js";

export default {
    name: "messageCreate",

    async execute(message: any, client: any) {

        console.log("hello from messageCreate.ts");

        // ignore bots
        if (message.author.bot) return;

        // guild lock
        if (!message.guild) return;

        const allowed = await guildAllowed(message.guild);
        if (!allowed) return;

        const prefix = botConfig.prefix;

        // allow mention prefix too
        const mentionPrefix = `<@${client.user.id}>`;

        const usedPrefix =
            message.content.startsWith(prefix)
                ? prefix
                : message.content.startsWith(mentionPrefix)
                    ? mentionPrefix
                    : null;

        if (!usedPrefix) return;

        // remove prefix
        const args = message.content
            .slice(usedPrefix.length)
            .trim()
            .split(/\s+/);

        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        // find command
        const command =
            client.commands.get(commandName) ||
            [...client.commands.values()].find((cmd: any) =>
                cmd.aliases?.includes(commandName)
            );

        if (!command) return;

        // PREFIX GATE
        if (command.prefix?.enabled === false) {
            return message.reply("This command cannot be used with prefix.");
        }

        try {
            console.log("MESSAGE CREATE FIRED:", message.content);
            return await handleCommand(
                undefined,       // interaction
                command,
                client,
                {
                    raw: args,
                    commandName
                },
                message      // <-- IMPORTANT
            );
        } catch (err) {
            console.error(err);
        }
    }
};