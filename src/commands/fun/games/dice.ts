import * as ace from '@framework';

const command: ace.Command = {
    responseVisibility: 'public',
    name: 'dice',
    desc: 'Roll a die',
    args: {
        sides: {
            type: 'integer',
            description: 'Number of sides on the die',
            minValue: 2,
            maxValue: 100,
        },
    },
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: '/dice [sides]',
        example: '/dice 20',
    },
    async execute(ctx) {
        const sides = ctx.getNumber('sides') ?? 6;
        const result = Math.floor(Math.random() * sides) + 1;
        return ctx.success({
            embed: {
                title: 'Dice',
                desc: `You rolled **${result}** on a d${sides}.`,
            },
        });
    },
};

export default command;
