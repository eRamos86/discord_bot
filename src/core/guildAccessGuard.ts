import { OWNER_IDS } from "../config/owners.js";
import { PermissionsBitField } from "discord.js";

export async function guildAllowed(guild: any): Promise<boolean> {

    // make sure members are available
    await guild.members.fetch().catch(() => {});

    const ownersInGuild = OWNER_IDS
        .map(id => guild.members.cache.get(id))
        .filter(Boolean);

    // must have at least one owner present
    if (ownersInGuild.length === 0) {
        return false;
    }

    // at least one owner must have ADMIN
    const hasAdminOwner = ownersInGuild.some((member: any) =>
        member.permissions?.has(PermissionsBitField.Flags.Administrator)
    );

    return hasAdminOwner;
}