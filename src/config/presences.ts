import { ActivityType, PresenceData } from 'discord.js';

export const presences: { type: ActivityType, text: string }[] = [
    {
        type: ActivityType.Playing,
        text: 'a game',
    },
    {
        type: ActivityType.Watching,
        text: 'rick and morty',
    },
];
