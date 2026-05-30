import {
    SlashCommandBuilder,
    User, GuildMember
} from "discord.js";

import { PermissionLevel } from "../../../framework/guards/guards.js";
import { Command } from '../../../types/command.types.js';
/*
import { media } from "../../../utils/media.js";
*/
import * as Utils from '../../../utils/index.js';
import { Colors } from "../../../config/theme.js";

function isGuildMember(x: any): x is GuildMember {
    return x && typeof x === "object" && "user" in x;
}

const command : Command = {

    prefix: {
        enabled: true
    },

    aliases: ["uinfo"],
    requiredLevel: PermissionLevel.PUBLIC,

    help: {
        usage: "`/userinfo` *`[user]`*",
        example: `
            \`/userinfo\`
            \`/userinfo\` *\`user:\`* @certified.luverboy
        `.trim()
    },

    // COMMAND DATA
    data: new SlashCommandBuilder()
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
        const user: User = isGuildMember(_user)
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
            thumbnail: Utils.media.targetUser(user),
            footerIcon: Utils.media.local('branding')
            
        });

    }

 };

export default command;