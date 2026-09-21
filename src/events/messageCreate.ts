import { logMessage } from '@features/logging/logMessage.js';
import * as ace from '@framework';
import * as dis from 'discord.js';
import { moderateMessage } from '../features/automod/service.js';
import { awardXp } from '../features/engagement/levels.js';
import { handleEngagementMessage } from '../features/engagement/utilities.js';

export default {
    name: 'messageCreate',

    async execute(message: dis.Message, client: ace.BotClient) {
        if (message.author.bot) return;
        if (!message.guild) return;

        if (await moderateMessage(message)) return;
        await logMessage(message);
        await awardXp(message);
        await handleEngagementMessage(message);

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
            args: {},
        });

        if (!allowed) return;

        const args = message.content.slice(usedPrefix.length).trim().split(/\s+/);

        const commandName = args.shift()?.toLowerCase();

        if (!commandName) {
            return ctx.info({
                embed: {
                    title: `Hello! I'm AceBot`,
                    desc: `do you need help? run\n\`${prefix}help\` or \`/help\``,
                },
            });
        }

        console.log('routing command');
        return ace.routeCommand({
            client,
            message,
            commandName,
            args,
        });
    },
};
