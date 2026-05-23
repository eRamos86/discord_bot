import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

const commands: any[] = [];
const commandsPath = path.join(__dirname, "commands");

/**
 * Recursively collects all .ts / .js command files
 */
function getCommandFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...getCommandFiles(fullPath));
        } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) {
            files.push(fullPath);
        }
    }

    return files;
}

const commandFiles = getCommandFiles(commandsPath);

for (const filePath of commandFiles) {
    const imported = await import(pathToFileURL(filePath).href);

    const command = imported.default;

    // safety check (prevents broken files crashing deploy)
    if (!command?.data) {
        console.warn(`⚠️ Skipping invalid command file: ${filePath}`);
        continue;
    }

    commands.push(command.data.toJSON());
}

try {
    await rest.put(
        Routes.applicationGuildCommands(
            process.env.CLIENT_ID!,
            process.env.DEV_GUILD!
        ),
        { body: commands }
    );

    console.log("✅ Dev guild commands deployed");
} catch (err) {
    console.error("❌ Failed to deploy commands:", err);
}