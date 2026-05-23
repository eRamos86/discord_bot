import { getPermissionLevel } from "./permissionResolver.js";

export function canRun(interaction: any, command: any): boolean {

    const userLevel = getPermissionLevel(interaction);
    const required = command.requiredLevel ?? 0;

    return userLevel>= required;

}