import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { pool } from '../../database/client.js';
import { transaction } from '../../database/transaction.js';
import { registerButton } from '../../framework/registry/buttonRegistry.js';
import { requireValue } from '../../framework/runtime/errors.js';
export function pollButtons(id: string, choices: string[]) {
    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            choices.map((choice, index) =>
                new ButtonBuilder()
                    .setCustomId(`poll:vote:${id}:${index}`)
                    .setLabel(choice.slice(0, 80))
                    .setStyle(ButtonStyle.Primary),
            ),
        ),
    ];
}
registerButton({
    id: 'poll:vote',
    async execute(i) {
        requireValue(i.guildId, 'Use this in a server.');
        await i.deferReply({ flags: 64 });
        const [, , id, index] = i.customId.split(':');
        const choice = Number(index);
        await transaction(async (c) => {
            const {
                rows: [poll],
            } = await c.query<{ choices: string[]; closed: boolean; message_id: string }>(
                'SELECT choices,closed,message_id FROM polls WHERE id=$1 AND guild_id=$2 FOR UPDATE',
                [id, i.guildId],
            );
            requireValue(
                poll && !poll.closed && poll.message_id === i.message.id,
                'This poll is closed or unavailable.',
            );
            requireValue(
                Number.isInteger(choice) && choice >= 0 && choice < poll.choices.length,
                'Invalid poll choice.',
            );
            await c.query(
                'INSERT INTO poll_votes(poll_id,guild_id,user_id,choice) VALUES($1,$2,$3,$4) ON CONFLICT(poll_id,user_id) DO UPDATE SET choice=excluded.choice',
                [id, i.guildId, i.user.id, choice],
            );
        });
        return i.editReply('Vote recorded. Voting again replaces your previous choice.');
    },
});
export async function pollResults(id: string, guildId: string) {
    const {
        rows: [poll],
    } = await pool.query<{ question: string; choices: string[]; closed: boolean }>(
        'SELECT * FROM polls WHERE id=$1 AND guild_id=$2',
        [id, guildId],
    );
    requireValue(poll, 'No poll found in this server.');
    const { rows } = await pool.query<{ choice: number; count: string }>(
        'SELECT choice,count(*) FROM poll_votes WHERE poll_id=$1 AND guild_id=$2 GROUP BY choice',
        [id, guildId],
    );
    return `${poll.question}\n${poll.choices.map((v, i) => `${v}: ${rows.find((r) => r.choice === i)?.count ?? 0}`).join('\n')}\n${poll.closed ? 'Closed' : 'Open'}`;
}
