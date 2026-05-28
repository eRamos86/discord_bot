import path from "path";
import type * as Types from "../../types/index.js";

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
    location: Types.MediaLocation,
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