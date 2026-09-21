import { PermissionFlagsBits } from 'discord.js';
import { pool } from '../../../database/client.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
export default {
    name: 'rolemap',
    desc: 'Configure optional Nova-to-Discord role mappings',
    access: { discord: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ManageGuild] },
    subcommands: {
        add: {
            args: {
                project: { type: 'string', required: true, maxLength: 60 },
                grant: { type: 'string', required: true, maxLength: 60 },
                role: { type: 'role', required: true },
            },
        },
        remove: { args: { role: { type: 'role', required: true } } },
        list: {},
    },
    async execute(ctx) {
        requireValue(ctx.guild, 'Use this in a server.');
        const action = ctx.getString('subcommand');
        const role = await ctx.getRole('role');
        if (action === 'add') {
            requireValue(role, 'Choose a role.');
            const bot = await ctx.guild.members.fetchMe();
            const actor = await ctx.guild.members.fetch(ctx.user.id);
            requireValue(
                actor.id === ctx.guild.ownerId || actor.roles.highest.comparePositionTo(role) > 0,
                'Role must be below your highest role.',
            );
            requireValue(
                !role.managed && role.id !== ctx.guild.id && bot.roles.highest.comparePositionTo(role) > 0,
                'Role must be below the bot.',
            );
            await pool.query(
                'INSERT INTO role_mappings(guild_id,project,nova_role,discord_role_id) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',
                [ctx.guild.id, ctx.getString('project'), ctx.getString('grant'), role.id],
            );
            return ctx.reply(
                'Mapping saved. Use /rolesync to apply live grants. Automatic privileged roles are refused.',
            );
        }
        if (action === 'remove') {
            requireValue(role, 'Choose a role.');
            await pool.query('DELETE FROM role_mappings WHERE guild_id=$1 AND discord_role_id=$2', [
                ctx.guild.id,
                role.id,
            ]);
            return ctx.reply('Mapping removed. Review members with previously assigned roles.');
        }
        const { rows } = await pool.query<{ project: string; nova_role: string; discord_role_id: string }>(
            'SELECT * FROM role_mappings WHERE guild_id=$1 LIMIT 25',
            [ctx.guild.id],
        );
        return ctx.reply(
            rows.map((r) => `${r.project}.${r.nova_role} → <@&${r.discord_role_id}>`).join('\n') ||
                'No mappings.',
        );
    },
} satisfies Command;
