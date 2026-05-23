import { PermissionsBitField } from "discord.js";
import { OWNER_IDS } from "../config/owners.js";

export function getPermissionLevel(interaction: any): number {

    const userId = interaction.user.id;
    const member = interaction.member;

    if (OWNER_IDS.includes(userId)) return 3;

    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {return 2;}

    if (
        member.permissions.has(PermissionsBitField.Flags.KickMembers) &&
        member.permissions.has(PermissionsBitField.Flags.ManageMessages)
    ) {return 1;}

    return 0;

}