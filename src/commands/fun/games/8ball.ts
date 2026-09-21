import * as ace from '@framework';

const answers = [
    'It is certain.',
    'It is decidedly so.',
    'Without a doubt.',
    'Yes - definitely.',
    'You may rely on it.',
    'As I see it, yes.',
    'Most likely.',
    'Outlook good.',
    'Yes.',
    'Signs point to yes.',
    'Reply hazy, try again.',
    'Ask again later.',
    'Better not tell you now.',
    'Cannot predict now.',
    'Concentrate and ask again.',
    "Don't count on it.",
    'My reply is no.',
    'My sources say no.',
    'Outlook not so good.',
    'Very doubtful.',
];

const command: ace.Command = {
    responseVisibility: 'public',
    name: '8ball',
    desc: 'Ask the magic 8ball a question',
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    args: {
        question: {
            type: 'string',
            required: true,
            description: 'The question you want to ask',
        },
    },
    help: {
        usage: '`/8ball <question>`',
        example: '`/8ball Will I win?`',
    },
    async execute(ctx) {
        const question = ctx.args('question');
        if (!question) {
            return ctx.error({
                embed: {
                    title: 'Missing Question',
                    desc: 'You must provide a question to ask the magic 8ball.',
                },
            });
        }

        const answer = answers[Math.floor(Math.random() * answers.length)];
        return ctx.success({
            embed: {
                title: 'Magic 8Ball',
                desc: `**Question:** ${question}\n**Answer:** ${answer}`,
            },
        });
    },
};

export default command;
