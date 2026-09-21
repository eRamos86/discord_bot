import * as ace from '@framework';

const command: ace.Command = {
    responseVisibility: 'public',
    name: 'coinflip',
    desc: 'Flip a coin',
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: '/coinflip',
        example: '/coinflip',
    },
    async execute(ctx) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        return ctx.success({
            embed: {
                title: 'Coinflip',
                desc: `The coin landed on **${result}**.`,
            },
        });
    },
};

export default command;
