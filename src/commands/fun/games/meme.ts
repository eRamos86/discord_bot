import { randomInt } from 'node:crypto';
import type { Command } from '../../../types/command.types.js';
const memes = [
    ['It works on my machine', 'Then we will ship your machine.'],
    ['One more quick fix', 'Three hours later…'],
    ['The bot passed every test', 'The users invented a new input.'],
    ['I will remember this command', 'Runs /help again.'],
];
export default {
    responseVisibility: 'public',
    name: 'meme',
    desc: 'A random developer text meme',
    prefix: { enabled: true },
    async execute(ctx) {
        const meme = memes[randomInt(memes.length)]!;
        return ctx.reply({ embeds: [{ title: meme[0], description: meme[1], color: 0x5865f2 }] });
    },
} satisfies Command;
