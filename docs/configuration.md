# Configuration and features

`/config` opens a feature selector, setting selector and edit modal. Every save validates types, limits, guild references and a revision. Manage Server is required. Role-bearing settings additionally require Manage Roles and a role below the actor; automatic/self roles cannot carry administrative/moderation permissions. Raw setters remain available for automation:

```text
/config section:prefix key:set value:!
/config section:welcome key:channelId value:123456789012345678
/config section:welcome key:enabled value:true
/config section:logging key:events.moderation value:true
/config section:roles key:selfRoleIds value:["123456789012345678"]
```

Boolean inputs use `true`/`false`, lists and objects use JSON, blank nullable fields clear a value. Channel/role IDs must belong to the current guild. Configure destinations and permissions before enabling a feature. Features default off. `/config` remains available even if listed among disabled commands.

## Settings sections

| Section           | Controls                                                                         |
| ----------------- | -------------------------------------------------------------------------------- |
| prefix            | 1–10 characters, no whitespace; default `---`                                    |
| welcome / goodbye | enabled, channelId, title, message, color, image, footer, thumbnail, dm, roleIds |
| logging           | enabled, default channelId, events by category, channel overrides                |
| automod           | filters, words, allowedDomains, role/channel exemptions, action and thresholds   |
| security          | enabled, join window/threshold, alert or lockdown                                |
| tickets           | enabled, open/archive categories, staff roles, transcript channel, 1–10 types    |
| roles             | enabled, verification role, self roles, required role, minimum account age       |
| leveling          | enabled, XP rate/cooldown and level-to-role mapping                              |
| economy           | enabled, currency, daily/work rewards, shop items                                |
| permissions       | command-specific user/role allow and deny lists                                  |
| disabledCommands  | command names disabled in this guild                                             |

A command policy has `userIds`, `roleIds`, `deniedUserIds`, `deniedRoleIds`. Denies win; a nonempty allow list narrows access. These policies never grant missing Discord permissions or Nova grants. The guild owner can recover guild policy; bot owners do not bypass Discord role hierarchy.

## Administration

Moderation cases contain guild, actor, target, action, reason, duration/expiry, timestamp and pending/completed/failed/revoked state. `/case` edits reasons or revokes records with persistent history; revocation does not reverse a Discord ban or timeout. Warning removal retains audit history. Discord permission failures remain failed cases. A pending case following a crash requires checking Discord before any manual retry. Softban is two Discord operations and can leave a ban in place if unban fails.

Channel locks preserve the previous everyone-role Send Messages overwrite for unlock. Role-specific allow overwrites may still permit speaking. Emergency lockdown requires Administrator and an exact guild-name confirmation and reports partial failures. It is a containment tool, not perfect anti-nuke protection. Message purge observes Discord's bulk-delete age restriction. Reports require a configured moderation log destination and have a cooldown.

Automod uses bounded per-guild/member counters for spam/repetition, mentions, caps, words, invites, links and excessive combining Unicode. Manage Messages/Administrator members and configured exemptions are excluded. Allowed domains match whole host boundaries. Delete/warn/timeout actions are configurable. Warn creates a normal warning case; an impossible timeout produces a failed case. Repeated action cooldown is 30 seconds. Restarting resets heuristic counters. Security counts member joins and can log an alert or apply configured lockdown; it does not infer that every burst is hostile.

## Onboarding, logging and roles

Templates support `{user}`, `{username}`, `{server}`, `{guild}` and `{memberCount}`. Unknown placeholders remain literal. Embeds are bounded; mentions are disabled. `/onboarding` previews the actual template using the requesting member without sending welcome DMs or assigning roles. Welcome can DM and assign safe roles; goodbye does not assign roles or DM departed members even though it shares the settings shape.

Logging categories: messages, edits, deletions, joins, leaves, bans, roles/nicknames, voice, moderation, automod, commands, configuration, tickets and security. Logging resolves destinations inside the originating guild. Message excerpts are bounded and sent only to configured channels; there is no permanent full-message database archive. Uncached deleted message content may be unavailable. Command logs omit arguments.

`/rolepanel` publishes verification/self-role controls. Verification checks configured account age and prerequisite role; self-role lists support up to 25 roles. Managed, everyone, privileged and too-high roles are refused. `/role` provides audited manual add/remove with actor/bot hierarchy checks. `/rolemap` maps a Nova project role to a safe Discord role and `/rolesync` applies the requesting user's live grants. Synchronization is explicitly user-triggered; an existing Discord role can outlive a grant until the next sync. Never use these mirrored roles as authorization for platform data. Nova outages cause no role changes.

## Tickets and engagement

`/panel` publishes current ticket types; old panels recheck current configuration. One open ticket per guild/member is enforced using a transaction and advisory lock. Ticket channels deny everyone access and grant the creator, bot and configured staff roles. Staff can claim, rename, manage participants, close and reopen; creators can close/export their own ticket. Closing removes member overwrites and optionally archives the channel. Transcripts contain the latest 1,000 available messages, bounded to approximately 2 MB of text, omit downloaded attachments and remain subject to Discord file limits. Administrators retain Discord's inherent channel access.

Economy is local to each guild and distinct from MunchPoints. Integer balances, stable lock order, database transactions and ledger references protect transfers/purchases; daily/work cooldowns are 24 hours/one hour. The legacy global economy table is preserved but not copied into multiple guilds. Shop objects use `{ "id": "tea", "name": "Tea", "price": 10 }`.

XP is cooldown-limited and guild-scoped; level roles use safe-role assignment. Polls persist choices and votes, with one changeable vote per user; creators/moderators can close them. Reminders/timers persist and DM the requester, with up to 20 outstanding jobs. DMs can fail when disabled; failures appear in job diagnostics. AFK clears on the next message. Sticky messages use a 30-second update cooldown per channel.

## Presence, music and owner controls

`PRESENCES_JSON` is an ordered array of `{text,type,enabled,url?}`; `PRESENCE_INTERVAL_SECONDS` is 30–86,400. Up to 20 entries with text up to 128 characters are accepted. Streaming URLs must be supported Twitch/YouTube URLs. Disabled entries are skipped, unchanged updates are suppressed and shutdown stops rotation. Presence belongs to the bot globally, not to one guild.

Music plays only operator-approved Opus `.ogg`/`.webm` files under `MUSIC_LIBRARY_DIR`, selected through `MUSIC_TRACKS_JSON` track IDs. Real paths must remain inside the root, files are bounded to 100 MB and queues to 25 tracks. Mount the library read-only in Docker. There is no YouTube scraping or arbitrary URL playback. Voice connectivity and actual codecs still require a live voice-channel smoke test.

Owner tools provide diagnostics, maintenance, synchronization, inspection and shutdown controls. Arbitrary eval, runtime module replacement and destructive channel cloning are intentionally retired. Restart through the supervisor after deployment.
