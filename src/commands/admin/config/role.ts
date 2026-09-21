import { PermissionFlagsBits } from 'discord.js';
import { assertHierarchy, auditedAction } from '../../../features/moderation/service.js';
import { requireValue } from '../../../framework/runtime/errors.js';
import type { Command } from '../../../types/command.types.js';
const args = {
    user: { type: 'user' as const, required: true },
    role: { type: 'role' as const, required: true },
};
export default {
    name: 'role',
    desc: 'Assign or remove a server role with hierarchy checks',
    access: { discord: [PermissionFlagsBits.ManageRoles], bot: [PermissionFlagsBits.ManageRoles] },
    subcommands: { add: { args }, remove: { args } },
    async execute(ctx) {
        requireValue(ctx.guild && ctx.member, 'Use this in a server.');
        const member = await ctx.getMember('user');
        const role = await ctx.getRole('role');
        requireValue(
            member && role && !role.managed && role.id !== ctx.guild.id,
            'Choose a member and an unmanaged role.',
        );
        const bot = await ctx.guild.members.fetchMe();
        assertHierarchy(ctx.member, member, bot, ctx.guild.ownerId);
        requireValue(
            bot.roles.highest.comparePositionTo(role) > 0 &&
                (ctx.user.id === ctx.guild.ownerId || ctx.member.roles.highest.comparePositionTo(role) > 0),
            'The role must be below both your highest role and the bot.',
        );
        const add = ctx.getString('subcommand') === 'add';
        const id = await auditedAction(
            ctx.guild,
            ctx.user.id,
            member.id,
            add ? 'role:add' : 'role:remove',
            `Role ${role.id}`,
            () => (add ? member.roles.add(role) : member.roles.remove(role)),
        );
        return ctx.reply(`Role updated. Case #${id}.`);
    },
} satisfies Command;
