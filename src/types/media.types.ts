import { User } from 'discord.js';

/**
 * Supported user asset types.
 */
export type UserAsset =
| 'avatar'
| 'banner';

/**
 * Support guild asset types.
 */
export type GuildAsset =
| 'icon'
| 'banner'
| 'splash'
| 'discoverySplash';

/**
 * Media placement target.
 * 
 * Used for local asset fallback directories.
 */
export type MediaLocation =
|'thumbnail'
| 'image'
| 'footer'
| 'author';

/**
 * Current user media.
 */
export type UserMediaConfig = {
    type: 'user';
    asset?: UserAsset;
};

/**
 * Explicit target user media.
 */
export type TargetUserMediaConfig = {
    type: 'targetUser';
    user: User;
    asset?: UserAsset
};

/**
 * Current guild media.
 */
export type GuildMediaConfig = {
    type: 'guild';
    asset?: GuildAsset;
};

/**
 * Bot user media.
 */
export type BotMediaConfig = {
    type: 'bot';
    asset?: UserAsset;
};

/**
 * Local filesystem media.
 */
export type LocalMediaConfig = {
    type: 'local';
    file: string;
};

/**
 * Union of all supported media configs.
 */
export type MediaConfig =
| UserMediaConfig
| TargetUserMediaConfig
| GuildMediaConfig
| BotMediaConfig
| LocalMediaConfig;

/**
 * Fully resolved media output.
 */
export type ResolvedMedia = {
    url: string;
    attachment?: any;
};