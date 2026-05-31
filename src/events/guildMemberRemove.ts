/*import * as dis from 'discord.js';
import * as ace from '@framework';
import * as Utils from '@utils';

const settings = ace.getGuildSettings(guildId)

if(!settings.goodbye.enabled)
    return;

guild.channels.cache.get(settings.goodbye.channelId);

build embed from settings

send*/

import * as ace from '@framework';

export default {

    name: "guildMemberRemove",

    async execute(interaction: any, client: any) {

        //just log for now
        console.log('guild member remove');

    }

};
