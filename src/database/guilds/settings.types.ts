export type LogCategory =
    | 'messages'
    | 'edits'
    | 'deletions'
    | 'joins'
    | 'leaves'
    | 'bans'
    | 'roles'
    | 'voice'
    | 'moderation'
    | 'automod'
    | 'commands'
    | 'configuration'
    | 'tickets'
    | 'security';
export type OnboardingSettings = {
    enabled: boolean;
    channelId: string | null;
    title: string | null;
    message: string | null;
    color: string;
    image: string | null;
    footer: string | null;
    dm: boolean;
    thumbnail: boolean;
    roleIds: string[];
};
export interface GuildSettings {
    guildId: string;
    revision: number;
    prefix: string;
    welcome: OnboardingSettings;
    goodbye: OnboardingSettings;
    logging: {
        enabled: boolean;
        channelId: string | null;
        events: Record<LogCategory, boolean>;
        channels: Partial<Record<LogCategory, string>>;
    };
    automod: {
        enabled: boolean;
        filters: {
            profanity: boolean;
            links: boolean;
            invites: boolean;
            spam: boolean;
            caps: boolean;
            mentions: boolean;
            unicode: boolean;
        };
        words: string[];
        allowedDomains: string[];
        exemptRoleIds: string[];
        exemptChannelIds: string[];
        action: 'delete' | 'warn' | 'timeout';
        windowSeconds: number;
        maxMessages: number;
        maxDuplicates: number;
        maxMentions: number;
        capsPercent: number;
        timeoutSeconds: number;
    };
    security: { enabled: boolean; joinWindowSeconds: number; maxJoins: number; action: 'alert' | 'lockdown' };
    tickets: {
        enabled: boolean;
        categoryId: string | null;
        archiveCategoryId: string | null;
        staffRoleIds: string[];
        transcriptChannelId: string | null;
        types: string[];
    };
    roles: {
        enabled: boolean;
        verificationRoleId: string | null;
        selfRoleIds: string[];
        requiredRoleId: string | null;
        minimumAccountDays: number;
    };
    leveling: {
        enabled: boolean;
        cooldownSeconds: number;
        xpPerMessage: number;
        levelRoles: Record<string, string>;
    };
    economy: {
        enabled: boolean;
        dailyAmount: number;
        workAmount: number;
        currency: string;
        shop: { id: string; name: string; price: number }[];
    };
    permissions: Record<
        string,
        { userIds: string[]; roleIds: string[]; deniedUserIds: string[]; deniedRoleIds: string[] }
    >;
    disabledCommands: string[];
}
export interface GuildSettingsProvider {
    get(guildId: string): Promise<GuildSettings>;
    update(settings: GuildSettings): Promise<void>;
    delete?(guildId: string): Promise<void>;
}
