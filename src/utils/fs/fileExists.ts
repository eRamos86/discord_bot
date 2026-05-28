import fs from "fs";
import { getFilePath } from "./getFilePath.js";
import type * as Types from "../../types/index.js";

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
    location: Types.MediaLocation,
    file: string
) {
    return fs.existsSync(getFilePath(location, file));
}