import * as ace from '@framework';
import * as dis from 'discord.js';

function isGuildMember(x: unknown): x is dis.GuildMember {
    return x !== null && typeof x === 'object' && 'user' in x;
}

const command: ace.Command = {
    name: 'userinfo',
    desc: 'Get info about a user',
    args: {
        user: {
            type: 'user',
            description: 'User to inspect',
        },
    },

    prefix: {
        enabled: true,
    },

    aliases: ['uinfo'],
    requiredLevel: ace.PermissionLevel.PUBLIC,

    help: {
        usage: '`/userinfo` *`[user]`*',
        example: `
            \`/userinfo\`
            \`/userinfo\` *\`user:\`* @certified.luverboy
        `.trim(),
    },

    async execute(ctx) {
        // GATHER DATA
        const _user = (await ctx.getUser('user')) ?? ctx.user;
        console.log(_user);
        const user: dis.User = isGuildMember(_user) ? _user.user : _user;

        // LOGIC

        // BUILD REPLY
        return ctx.info({
            embed: {
                title: `${user.username}'s Info`,
                desc: `
                    **Username:** ${user.tag}
                    **ID:** ${user.id}
                `.trim(),
                footer: 'User Information',
            },
            thumbnail: ace.media.targetUser(user),
            footerIcon: ace.media.local('branding'),
        });
    },
};

export default command;
