import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { Collection } from "discord.js";

export async function loadCommands() {

    const commands = new Collection();

    const commandsPath = path.join(process.cwd(), "src", "commands");

    const folders = fs.readdirSync(commandsPath);

    for (const folder of folders) {

        const folderPath = path.join(commandsPath, folder);

        if (!fs.statSync(folderPath).isDirectory()) continue;

        const files = fs.readdirSync(folderPath)
            .filter(file => file.endsWith(".ts") || file.endsWith(".js"));

        for (const file of files) {

            const filePath = path.join(folderPath, file);

            const cmd = await import(pathToFileURL(filePath).href);

            const command = cmd.default;
            command.category = folder;

            if (!command?.data?.name) {
                console.warn(`Invalid command file: ${filePath}`);
                continue;
            }

            commands.set(command.data.name, command);
        }
    }

    return commands;
}