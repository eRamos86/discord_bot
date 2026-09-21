import { pool } from '../../database/client.js';
export class RuntimeState {
    maintenance = false;
    async load() {
        const {
            rows: [row],
        } = await pool.query<{ value: unknown }>("SELECT value FROM bot_state WHERE key='maintenance'");
        this.maintenance = row?.value === true;
    }
    async setMaintenance(value: boolean) {
        await pool.query(
            "INSERT INTO bot_state(key,value) VALUES('maintenance',$1) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            [JSON.stringify(value)],
        );
        this.maintenance = value;
    }
}
export const runtime = new RuntimeState();
