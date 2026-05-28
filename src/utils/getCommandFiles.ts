import fs from "fs";
import path from "path";

/**
 * Recursively collects all command file paths.
 *
 * Supports both:
 * - .ts (development)
 * - .js (production)
 */
export function getCommandFiles(dir: string): string[] {

    const results: string[] = [];

    function walk(current: string) {

        const entries = fs.readdirSync(current, {
            withFileTypes: true
        });

        for (const entry of entries) {

            const fullPath = path.join(current, entry.name);

            if (entry.isDirectory()) {
                walk(fullPath);
                continue;
            }

            if (
                entry.name.endsWith(".ts") ||
                entry.name.endsWith(".js")
            ) {
                results.push(fullPath);
            }

        }

    }

    walk(dir);

    return results;

}