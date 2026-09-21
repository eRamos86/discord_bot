import { pool } from '../../database/client.js';
import { transaction } from '../../database/transaction.js';
import { requireValue } from '../../framework/runtime/errors.js';
export async function balance(guildId: string, userId: string) {
    const {
        rows: [row],
    } = await pool.query<{ balance: string }>(
        'SELECT balance FROM guild_wallets WHERE guild_id=$1 AND user_id=$2',
        [guildId, userId],
    );
    return Number(row?.balance ?? 0);
}
export async function reward(
    guildId: string,
    userId: string,
    kind: 'daily' | 'work',
    amount: number,
    reference: string,
) {
    return transaction(async (c) => {
        await c.query('INSERT INTO guild_wallets(guild_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [
            guildId,
            userId,
        ]);
        const column = kind === 'daily' ? 'daily_at' : 'work_at';
        const hours = kind === 'daily' ? 24 : 1;
        const result = await c.query(
            `UPDATE guild_wallets SET balance=balance+$3,${column}=now() WHERE guild_id=$1 AND user_id=$2 AND (${column} IS NULL OR ${column} <= now()-$4*interval '1 hour') RETURNING balance`,
            [guildId, userId, amount, hours],
        );
        requireValue(result.rowCount, `${kind} is available once every ${hours} hour(s).`);
        await c.query(
            'INSERT INTO economy_ledger(guild_id,user_id,amount,reason,reference) VALUES($1,$2,$3,$4,$5)',
            [guildId, userId, amount, kind, reference],
        );
        return amount;
    });
}
export async function transfer(guildId: string, from: string, to: string, amount: number, reference: string) {
    requireValue(
        from !== to && Number.isSafeInteger(amount) && amount > 0 && amount <= 1000000,
        'Choose another user and a positive whole amount up to 1,000,000.',
    );
    await transaction(async (c) => {
        // Stable lock order prevents opposing transfers from deadlocking.
        for (const user of [from, to].sort())
            await c.query(
                'INSERT INTO guild_wallets(guild_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
                [guildId, user],
            );
        await c.query(
            'SELECT user_id FROM guild_wallets WHERE guild_id=$1 AND user_id=ANY($2::text[]) ORDER BY user_id FOR UPDATE',
            [guildId, [from, to]],
        );
        const debit = await c.query(
            'UPDATE guild_wallets SET balance=balance-$3 WHERE guild_id=$1 AND user_id=$2 AND balance >= $3 RETURNING balance',
            [guildId, from, amount],
        );
        requireValue(debit.rowCount, 'Insufficient balance.');
        await c.query('UPDATE guild_wallets SET balance=balance+$3 WHERE guild_id=$1 AND user_id=$2', [
            guildId,
            to,
            amount,
        ]);
        for (const [user, delta, suffix] of [
            [from, -amount, 'debit'],
            [to, amount, 'credit'],
        ] as const)
            await c.query(
                'INSERT INTO economy_ledger(guild_id,user_id,amount,reason,reference) VALUES($1,$2,$3,$4,$5)',
                [guildId, user, delta, 'transfer', `${reference}:${suffix}`],
            );
    });
}
export async function buy(
    guildId: string,
    userId: string,
    item: { id: string; price: number },
    reference: string,
) {
    await transaction(async (c) => {
        const debit = await c.query(
            'UPDATE guild_wallets SET balance=balance-$3 WHERE guild_id=$1 AND user_id=$2 AND balance >= $3 RETURNING balance',
            [guildId, userId, item.price],
        );
        requireValue(debit.rowCount, 'Insufficient balance.');
        await c.query(
            'INSERT INTO inventory(guild_id,user_id,item_id,quantity) VALUES($1,$2,$3,1) ON CONFLICT(guild_id,user_id,item_id) DO UPDATE SET quantity=inventory.quantity+1',
            [guildId, userId, item.id],
        );
        await c.query(
            'INSERT INTO economy_ledger(guild_id,user_id,amount,reason,reference) VALUES($1,$2,$3,$4,$5)',
            [guildId, userId, -item.price, `shop:${item.id}`, reference],
        );
    });
}
export async function inventory(guildId: string, userId: string) {
    return (
        await pool.query<{ item_id: string; quantity: number }>(
            'SELECT item_id,quantity FROM inventory WHERE guild_id=$1 AND user_id=$2 ORDER BY item_id LIMIT 25',
            [guildId, userId],
        )
    ).rows;
}
