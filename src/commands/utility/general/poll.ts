import { PermissionFlagsBits } from 'discord.js';
import { randomUUID } from 'node:crypto';
import { pool } from '../../../database/client.js';
import { pollButtons, pollResults } from '../../../features/engagement/polls.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    responseVisibility: 'public',
    name: 'poll',
    desc: 'Create, vote in, and close persistent polls',
    prefix: { enabled: true },
    subcommands: {
        create: {
            args: {
                question: { type: 'string', required: true, maxLength: 200 },
                choices: {
                    type: 'string',
                    required: true,
                    maxLength: 400,
                    description: '2–5 choices separated by |',
                },
            },
        },
        results: { args: { id: { type: 'string', required: true } } },
        close: { args: { id: { type: 'string', required: true } } },
    },
    async execute(ctx) {
        requireValue(ctx.guild && ctx.channel.raw, 'Use this in a server.');
        const action = ctx.getString('subcommand');
        if (action === 'create') {
            const choices = ctx
                .getString('choices')!
                .split('|')
                .map((v) => v.trim());
            requireValue(
                choices.length >= 2 &&
                    choices.length <= 5 &&
                    choices.every((v) => v.length > 0 && v.length <= 80) &&
                    new Set(choices).size === choices.length,
                'Use 2–5 distinct choices of 1–80 characters.',
            );
            const id = randomUUID();
            await pool.query(
                'INSERT INTO polls(id,guild_id,channel_id,author_id,question,choices) VALUES($1,$2,$3,$4,$5,$6)',
                [
                    id,
                    ctx.guild.id,
                    ctx.channel.raw.id,
                    ctx.user.id,
                    ctx.getString('question'),
                    JSON.stringify(choices),
                ],
            );
            const payload = {
                content: `${ctx.getString('question')}\nPoll ID: ${id}`,
                components: pollButtons(id, choices),
            };
            if (ctx.interaction) {
                await ctx.reply(payload);
                const message = await ctx.interaction.fetchReply();
                await pool.query('UPDATE polls SET message_id=$3 WHERE guild_id=$1 AND id=$2', [
                    ctx.guild.id,
                    id,
                    message.id,
                ]);
            } else {
                const message = await ctx.message!.reply(payload);
                await pool.query('UPDATE polls SET message_id=$3 WHERE guild_id=$1 AND id=$2', [
                    ctx.guild.id,
                    id,
                    message.id,
                ]);
            }
            return;
        }
        const id = ctx.getString('id')!;
        if (action === 'close') {
            const moderator = ctx.member?.permissions.has(PermissionFlagsBits.ManageMessages) ?? false;
            const result = await pool.query(
                'UPDATE polls SET closed=true WHERE id=$1 AND guild_id=$2 AND (author_id=$3 OR $4) RETURNING id',
                [id, ctx.guild.id, ctx.user.id, moderator],
            );
            requireValue(result.rowCount, 'Only the poll author or a moderator can close this poll.');
        }
        return ctx.reply(await pollResults(id, ctx.guild.id));
    },
} satisfies Command;
