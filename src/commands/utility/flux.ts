import * as dis from 'discord.js';
import * as ace from '@framework';

const command: ace.Command = {

    prefix: {
        enabled: true
    },

    aliases: [],
    requiredLevel: ace.PermissionLevel.PUBLIC,

    help: {
        usage: "`/flux quick-expense` **`<amount>`** **`<category>`**",
        example: `
            \`/flux quick-expense\` **\`amount:\`** 15.50 **\`category:\`** Food
        `.trim()
    },

    data: new dis.SlashCommandBuilder()
    .setName('flux')
    .setDescription('Flux commands')
    .addSubcommand(sub =>
        sub
        .setName('quick-expense')
        .setDescription('Log a quick expense')
        .addNumberOption(o =>
            o
            .setName('amount')
            .setDescription('Expense amount')
            .setRequired(true)
        )
        .addStringOption(o =>
            o
            .setName('category')
            .setDescription('Expense category')
            .setRequired(true)
        )
    ),

    async execute(ctx) {
        
        let subcommand = '';
        if (ctx.interaction && ctx.interaction.isChatInputCommand()) {
            subcommand = ctx.interaction.options.getSubcommand(false) || '';
        } else {
            // Fallback for prefix commands
            subcommand = ctx.args.raw?.[0] || '';
        }

        if (subcommand === 'quick-expense') {
            const amount = ctx.getNumber("amount");
            const category = ctx.getString("category");

            if (amount === null || !category) {
                return ctx.error({
                    embed: {
                        title: 'Error',
                        desc: 'Amount and category are required.'
                    }
                });
            }

            try {
                await ctx.defer();

                const url = process.env.FLUX_API_URL || 'http://127.0.0.1:4000/webhooks/discord';
                const secret = process.env.FLUX_WEBHOOK_SECRET || '';

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-flux-secret': secret
                    },
                    body: JSON.stringify({
                        type: 'quick-expense',
                        amount,
                        category,
                        userId: ctx.user.id,
                        username: ctx.user.username
                    })
                });

                if (!response.ok) {
                    throw new Error(`API returned ${response.status} ${response.statusText}`);
                }

                return ctx.success({
                    embed: {
                        title: 'Expense Logged',
                        desc: `Successfully logged expense of \`$${amount}\` in category \`${category}\`.`
                    }
                });

            } catch (err: any) {
                console.error(err);
                return ctx.error({
                    embed: {
                        title: 'Failed to Log Expense',
                        desc: err.message || 'An unknown error occurred.'
                    }
                });
            }
        } else {
            return ctx.error({
                embed: {
                    title: 'Unknown Subcommand',
                    desc: 'The provided subcommand is not recognized.'
                }
            });
        }
    }
};

export default command;
