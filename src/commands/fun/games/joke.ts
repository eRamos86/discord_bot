import * as ace from '@framework';

const jokes = [
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'There are 10 kinds of people: those who understand binary and those who do not.',
    'A SQL query walks into a bar, approaches two tables, and asks: “Can I join you?”',
    'Why was the function sad? It did not get called.',
];

const command: ace.Command = {
    responseVisibility: 'public',
    name: 'joke',
    desc: 'Tell a joke',
    prefix: { enabled: true },
    requiredLevel: ace.PermissionLevel.PUBLIC,
    help: {
        usage: '/joke',
        example: '/joke',
    },
    async execute(ctx) {
        const joke = jokes[Math.floor(Math.random() * jokes.length)] ?? jokes[0];
        return ctx.success({
            embed: {
                title: 'Joke',
                desc: joke,
            },
        });
    },
};

export default command;
