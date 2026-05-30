import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';

function isGuildMember(x: any): x is dis.GuildMember {
    return x && typeof x === "object" && "user" in x;
}

const command : ace.Command = {

    prefix: {
        enabled: true
    },

    aliases: ["uinfo"],
    requiredLevel: ace.PermissionLevel.PUBLIC,

    help: {
        usage: "`/userinfo` *`[user]`*",
        example: `
            \`/userinfo\`
            \`/userinfo\` *\`user:\`* @certified.luverboy
        `.trim()
    },

    // COMMAND DATA
    data: new dis.SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get info about a user")
    .addUserOption(option =>
        option
            .setName("user")
            .setDescription("User to inspect")
            .setRequired(false)
    )
        
    ,

    async execute(ctx) {

        // GATHER DATA
        const _user = (await ctx.getUser("user")) ?? ctx.user;
        console.log(_user);
        const user: dis.User = isGuildMember(_user)
        ? _user.user
        : _user;

        // LOGIC

        // BUILD REPLY
        return ctx.info({
            embed: {
                title: `${user.username}'s Info`,
                desc:`
                    **Username:** ${user.tag}
                    **ID:** ${user.id}
                `.trim(),
                footer: "User Information"
            },
            thumbnail: ace.media.targetUser(user),
            footerIcon: ace.media.local('branding')
            
        });

    }

 };

export default command;