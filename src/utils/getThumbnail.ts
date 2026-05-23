// utils/getThumbnail.ts

import path from "path";
import fs from "fs";

export function getThumbnail(client: any, interaction: any) {

    const localPath = path.join(
        process.cwd(),
        "src",
        "images",
        "thumbnail.png"
    );

    if (fs.existsSync(localPath)) {

        return "attachment://thumbnail.png";

    }

    return (
        client.user?.displayAvatarURL()
        || interaction.user.displayAvatarURL()
    );
}