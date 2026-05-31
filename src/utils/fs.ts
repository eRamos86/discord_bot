import fs from "fs";
import type { MediaLocation } from '@framework/embed/index.js';
import path from "path";

/**
 * Checks whether a media file exists on disk.
 *
 * This is used as a safety guard before attempting to load
 * or attach local assets to Discord embeds.
 *
 * @param location Logical media category (e.g. "thumbnails", "images", "footer")
 * @param file Filename of the asset
 * @returns true if file exists, false otherwise
 */
export function fileExists(
    location: MediaLocation,
    file: string
) {
    return fs.existsSync(getFilePath(location, file));
}

/**
 * Builds an absolute filesystem path for a media asset.
 *
 * This standardizes where media files are stored in the project:
 * /src/images/<location>/<file>
 *
 * Used by the media system to resolve local assets for:
 * - thumbnails
 * - embed images
 * - footer icons
 *
 * @param location Logical media category (e.g. "thumbnails", "images", "footer")
 * @param file Filename of the asset
 * @returns Absolute path to the requested file on disk
 */
export function getFilePath(
    location: MediaLocation,
    file: string
) {
    return path.join(
        process.cwd(),
        "src",
        "images",
        location,
        file
    );
}

export function walk(current: string): string[] {
    
    const results: string[] = [];

    if (fs.existsSync(current)) {

        fs.readdirSync(current).forEach(file => {

            const fullPath = path.join(current, file);

            if (fs.lstatSync(fullPath).isDirectory()) {
                results.push(...walk(fullPath));
            } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
                results.push(fullPath);
            }

        });

    }

    return results;

}

/*
export function walk(current: string) {

    console.log('walk fnction______');
    ///console.log(current);

        const results: string[] = [];

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
                console.log(fullPath);
            }

        }

        console.log(results);

        return results

    }
        */