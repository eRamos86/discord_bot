import 'dotenv/config';
import { pool } from './database/client.js';
import { deploy } from './utils/command.js';
const args = process.argv.slice(2);
const result = await deploy({
    dryRun: args.includes('--dry-run'),
    commandName: args.includes('--command') ? args[args.indexOf('--command') + 1] : undefined,
    remove: args.includes('--remove') ? args[args.indexOf('--remove') + 1] : undefined,
});
console.log(JSON.stringify(result, null, 2));
await pool.end();
if (!result.success) process.exitCode = 1;
