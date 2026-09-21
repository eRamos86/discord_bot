import { logDelete } from '@features/logging/logDelete.js';
import * as dis from 'discord.js';

export default {
    name: 'messageDelete',
    async execute(message: dis.Message<boolean> | dis.PartialMessage) {
        await logDelete(message);
    },
};
