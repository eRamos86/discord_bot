import { logEdit } from '@features/logging/logEdit.js';
import * as dis from 'discord.js';

export default {
    name: 'messageUpdate',
    async execute(
        oldMessage: dis.Message<boolean> | dis.PartialMessage,
        newMessage: dis.Message<boolean> | dis.PartialMessage,
    ) {
        await logEdit(oldMessage, newMessage);
    },
};
