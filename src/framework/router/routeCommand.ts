import * as ace from '@framework';
import * as dis from 'discord.js';
import { publicError, reportError } from '../runtime/errors.js';

type RouteCommandInput = {
    client: ace.BotClient;
    interaction?: dis.ChatInputCommandInteraction;
    message?: dis.Message;
    commandName?: string;
    args?: string[];
};

/**
 * Routes slash commands
 * into the command pipeline.
 */
export async function routeCommand(input: RouteCommandInput) {
    const { client, interaction, message } = input;

    if (interaction && !interaction.deferred && !interaction.replied) {
        const command = client.commands.get(interaction.commandName);
        await interaction.deferReply({
            flags: command?.responseVisibility === 'public' && !command.access?.private ? undefined : 64,
        });
    }
    const isMessage = !!message;

    // normalize ctx source
    const ctxSource = interaction ?? message;
    if (!ctxSource) return;

    const ctx = await ace.createContext({
        message: message ?? undefined,
        interaction: interaction ?? undefined,
        client,
        args: {},
    });

    // resolve command name
    let commandName: string | undefined;

    if (input.commandName) {
        commandName = input.commandName;
    } else if (interaction) {
        commandName = interaction.commandName;
    } else if (input.args?.length) {
        commandName = String(input.args[0]).toLowerCase();
    }

    if (!commandName) {
        if (isMessage) {
            return ctx.info({
                embed: {
                    title: `Hello! I'm AceBot`,
                    desc: `do you need help? run\n\`${ace.botConfig.prefix}help\` or \`/help\``,
                },
            });
        }

        return;
    }

    // find command
    const command =
        client.commands.get(commandName) ||
        [...client.commands.values()].find(
            (cmd) => cmd.aliases?.includes(commandName) || cmd.prefix?.aliases?.includes(commandName),
        );

    if (!command)
        return ctx.warn({
            embed: {
                title: `Command not found`,
                desc: `command \`${commandName}\` not found.`,
            },
        });

    // PREFIX GATE (only for messages)
    if (isMessage && command.prefix?.enabled === false) {
        return ctx.warn({
            embed: {
                title: 'This command can not be used with a prefix.',
                desc: 'try using it as a slash command',
            },
        });
    }

    // execute
    try {
        return await ace.handleCommand(
            interaction ?? undefined,
            command,
            client,
            {
                raw: input.args ?? [],
                commandName,
            },
            message,
        );
    } catch (error) {
        return ctx.reply({ content: publicError(error, reportError(error, 'route')), flags: 64 });
    }
}
