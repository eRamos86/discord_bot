import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Use relative path in production (Docker/dist), tsconfig paths in development
const isProd = process.env.NODE_ENV === 'production';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In production (Docker), use relative path to built utils/command.js
// In development, use relative path to src/utils/command.ts
const utilsPath = isProd
  ? path.join(__dirname, 'utils', 'command.js')
  : path.join(__dirname, 'utils', 'command.ts');

const { deploy } = await import(utilsPath);

const result = await deploy();

if (!result.success) {

    console.log("❌ Deployment failed\n");

    for (const error of result.errors) console.log(`- ${error}`);

    process.exit(1);

}

console.log(`✅ Deployed ${result.deployed.length} commands (${result.duration}ms)`);

if (result.skipped.length) {

    console.log('\nSkipped:');

    for (const skipped of result.skipped) {
        console.log(`- ${skipped}`);
    }

}