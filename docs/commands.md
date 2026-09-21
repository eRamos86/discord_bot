# Command catalog

Generated from command metadata with `npm run docs:commands`. Required arguments use `<name>`; optional arguments use `[name]`. Prefix commands use the guild prefix (default `---`) and the same argument order. Discord flags, guild policy, hierarchy and live Nova checks still apply at execution. Slash responses default to private; published panels, polls and entertainment explicitly opt into public responses.

## 8ball

Ask the magic 8ball a question

```text
/8ball <question>
```

Access: Everyone. Prefix: supported.

Source: [src/commands/fun/games/8ball.ts](../src/commands/fun/games/8ball.ts).

## account

Link or unlink your Nova identity

```text
/account link
/account unlink
/account status
```

Access: Everyone; Private slash only. Prefix: disabled.

Source: [src/commands/utility/general/account.ts](../src/commands/utility/general/account.ts).

## add

Add support ticket

```text
/add <user>
```

Access: Everyone. Prefix: supported.

Source: [src/commands/support/tickets/add.ts](../src/commands/support/tickets/add.ts).

## afk

Set a server AFK status until your next message

```text
/afk [reason]
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/general/afk.ts](../src/commands/utility/general/afk.ts).

## apex

Private vehicle, fuel and maintenance commands

```text
/apex garage
/apex vehicle <vehicle>
/apex maintenance <vehicle>
/apex builds <vehicle>
/apex odometer <vehicle> <miles>
/apex fuel <vehicle> <odometer> <gallons> <cost>
```

Access: Everyone; Live Nova: apex; Private slash only. Prefix: disabled.

Source: [src/commands/utility/apex.ts](../src/commands/utility/apex.ts).

## ask

Use the private, deterministic platform gateway

```text
/ask <question>
```

Access: Everyone; Private slash only. Prefix: disabled.

Source: [src/commands/utility/ask.ts](../src/commands/utility/ask.ts).

## automod

Enable or disable configured automod filters

```text
/automod <action>
```

Access: ManageGuild. Prefix: supported.

Source: [src/commands/admin/automod/automod.ts](../src/commands/admin/automod/automod.ts).

## balance

Server economy: balance

```text
/balance [user]
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/economy/balance.ts](../src/commands/utility/economy/balance.ts).

## ban

Ban a member with an audit case

```text
/ban <user> [reason]
```

Access: BanMembers. Prefix: supported.

Source: [src/commands/admin/moderation/ban.ts](../src/commands/admin/moderation/ban.ts).

## case

Edit a case reason or revoke a case

```text
/case <id> <action> <reason>
```

Access: ManageMessages. Prefix: supported.

Source: [src/commands/admin/moderation/case.ts](../src/commands/admin/moderation/case.ts).

## cleanup

Remove recent bot messages from this channel

```text
/cleanup [amount]
```

Access: ManageMessages. Prefix: supported.

Source: [src/commands/admin/moderation/cleanup.ts](../src/commands/admin/moderation/cleanup.ts).

## clearwarnings

Revoke active warnings while retaining their audit history

```text
/clearwarnings <user> <reason>
```

Access: ManageMessages. Prefix: supported.

Source: [src/commands/admin/moderation/clearwarnings.ts](../src/commands/admin/moderation/clearwarnings.ts).

## close

Close support ticket

```text
/close
```

Access: Everyone. Prefix: supported.

Source: [src/commands/support/tickets/close.ts](../src/commands/support/tickets/close.ts).

## coinflip

Flip a coin

```text
/coinflip
```

Access: Everyone. Prefix: supported.

Source: [src/commands/fun/games/coinflip.ts](../src/commands/fun/games/coinflip.ts).

## config

Configure server features using menus and forms

```text
/config [section] [key] [value]
```

Access: ManageGuild. Prefix: supported.

Source: [src/commands/admin/config/config.ts](../src/commands/admin/config/config.ts).

## daily

Server economy: daily

```text
/daily
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/economy/daily.ts](../src/commands/utility/economy/daily.ts).

## deploy

Synchronize or remove Discord application commands

```text
/deploy [command] [remove] [preview]
```

Access: Everyone; Bot owner; Private slash only. Prefix: disabled.

Source: [src/commands/owner/core/deploy.ts](../src/commands/owner/core/deploy.ts).

## diagnostics

Inspect bot health and control maintenance mode

```text
/diagnostics [maintenance]
```

Access: Everyone; Bot owner; Private slash only. Prefix: disabled.

Source: [src/commands/owner/core/diagnostics.ts](../src/commands/owner/core/diagnostics.ts).

## dice

Roll a die

```text
/dice [sides]
```

Access: Everyone. Prefix: supported.

Source: [src/commands/fun/games/dice.ts](../src/commands/fun/games/dice.ts).

## filter

Toggle an automod filter

```text
/filter <filter> <enabled>
```

Access: ManageGuild. Prefix: supported.

Source: [src/commands/admin/automod/filter.ts](../src/commands/admin/automod/filter.ts).

## flux

Private financial commands through Flux

```text
/flux quick-expense <amount> <description> [account]
/flux accounts
/flux recent
/flux budgets
/flux subscriptions
/flux summary
```

Access: Everyone; Live Nova: flux; Private slash only. Prefix: disabled.

Source: [src/commands/utility/flux.ts](../src/commands/utility/flux.ts).

## give

Server economy: give

```text
/give <user> <amount>
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/economy/give.ts](../src/commands/utility/economy/give.ts).

## help

Search commands, categories and usage

```text
/help [query]
```

Access: Everyone. Prefix: supported.

Source: [src/commands/support/help/help.ts](../src/commands/support/help/help.ts).

## history

View recent history for a member

```text
/history <user>
```

Access: ManageMessages. Prefix: supported.

Source: [src/commands/admin/moderation/history.ts](../src/commands/admin/moderation/history.ts).

## inventory

Server economy: inventory

```text
/inventory
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/economy/inventory.ts](../src/commands/utility/economy/inventory.ts).

## joke

Tell a joke

```text
/joke
```

Access: Everyone. Prefix: supported.

Source: [src/commands/fun/games/joke.ts](../src/commands/fun/games/joke.ts).

## kick

Kick a member with an audit case

```text
/kick <user> [reason]
```

Access: KickMembers. Prefix: supported.

Source: [src/commands/admin/moderation/kick.ts](../src/commands/admin/moderation/kick.ts).

## lock

Lock the current channel

```text
/lock
```

Access: ManageChannels. Prefix: supported.

Source: [src/commands/admin/moderation/lock.ts](../src/commands/admin/moderation/lock.ts).

## lockdown

Lock server text channels or restore saved locks

```text
/lockdown <action> <confirm>
```

Access: Administrator. Prefix: supported.

Source: [src/commands/admin/moderation/lockdown.ts](../src/commands/admin/moderation/lockdown.ts).

## meme

A random developer text meme

```text
/meme
```

Access: Everyone. Prefix: supported.

Source: [src/commands/fun/games/meme.ts](../src/commands/fun/games/meme.ts).

## mp

Private MunchPoints balance, rewards and history

```text
/mp balance
/mp rewards
/mp history
```

Access: Everyone; Live Nova: munchpoints; Private slash only. Prefix: disabled.

Source: [src/commands/utility/munchpoints.ts](../src/commands/utility/munchpoints.ts).

## mute

Mute a member with an audit case

```text
/mute <user> [seconds] [reason]
```

Access: ModerateMembers. Prefix: supported.

Source: [src/commands/admin/moderation/mute.ts](../src/commands/admin/moderation/mute.ts).

## nexus

Read the published Nexus Now entry

```text
/nexus
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/nexus.ts](../src/commands/utility/nexus.ts).

## nickname

Nickname a member with an audit case

```text
/nickname <user> [nickname] [reason]
```

Access: ManageNicknames. Prefix: supported.

Source: [src/commands/admin/moderation/nickname.ts](../src/commands/admin/moderation/nickname.ts).

## note

Note a member with an audit case

```text
/note <user> [reason]
```

Access: ManageMessages. Prefix: supported.

Source: [src/commands/admin/moderation/note.ts](../src/commands/admin/moderation/note.ts).

## notifications

Manage authenticated event routing for this server

```text
/notifications add <source> <type> <channel>
/notifications add-dm <source> <type>
/notifications list
/notifications remove <id>
```

Access: Everyone; Bot owner; Private slash only. Prefix: disabled.

Source: [src/commands/owner/core/notifications.ts](../src/commands/owner/core/notifications.ts).

## nowplaying

Music: nowplaying

```text
/nowplaying
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/music/nowplaying.ts](../src/commands/utility/music/nowplaying.ts).

## onboarding

Preview the configured welcome or goodbye message

```text
/onboarding <kind>
```

Access: ManageGuild. Prefix: supported.

Source: [src/commands/admin/config/onboarding.ts](../src/commands/admin/config/onboarding.ts).

## panel

Publish a support ticket panel

```text
/panel
```

Access: ManageChannels. Prefix: supported.

Source: [src/commands/support/tickets/panel.ts](../src/commands/support/tickets/panel.ts).

## pause

Music: pause

```text
/pause
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/music/pause.ts](../src/commands/utility/music/pause.ts).

## ping

Replies with pong. Used to test Bot connectivity.

```text
/ping
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/general/ping.ts](../src/commands/utility/general/ping.ts).

## platform-admin

Inspect registered platform applications

```text
/platform-admin
```

Access: Everyone; Live Nova: admin (admin, superadmin); Private slash only. Prefix: disabled.

Source: [src/commands/utility/platform-admin.ts](../src/commands/utility/platform-admin.ts).

## play

Music: play

```text
/play <track>
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/music/play.ts](../src/commands/utility/music/play.ts).

## poll

Create, vote in, and close persistent polls

```text
/poll create <question> <choices>
/poll results <id>
/poll close <id>
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/general/poll.ts](../src/commands/utility/general/poll.ts).

## purge

Delete up to 100 recent messages

```text
/purge <amount>
```

Access: ManageMessages. Prefix: supported.

Source: [src/commands/admin/moderation/purge.ts](../src/commands/admin/moderation/purge.ts).

## queue

Music: queue

```text
/queue
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/music/queue.ts](../src/commands/utility/music/queue.ts).

## rank

View your server level or leaderboard

```text
/rank [leaderboard]
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/general/rank.ts](../src/commands/utility/general/rank.ts).

## reminder

Create, list, or cancel persistent DM reminders

```text
/reminder add <minutes> <text>
/reminder list
/reminder cancel <id>
```

Access: Everyone. Prefix: supported. Aliases: timer.

Source: [src/commands/utility/general/reminder.ts](../src/commands/utility/general/reminder.ts).

## report

Privately report a member to configured moderators

```text
/report <user> <reason>
```

Access: Everyone; Private slash only. Prefix: disabled.

Source: [src/commands/support/tickets/report.ts](../src/commands/support/tickets/report.ts).

## resume

Music: resume

```text
/resume
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/music/resume.ts](../src/commands/utility/music/resume.ts).

## role

Assign or remove a server role with hierarchy checks

```text
/role add <user> <role>
/role remove <user> <role>
```

Access: ManageRoles. Prefix: supported.

Source: [src/commands/admin/config/role.ts](../src/commands/admin/config/role.ts).

## rolemap

Configure optional Nova-to-Discord role mappings

```text
/rolemap add <project> <grant> <role>
/rolemap remove <role>
/rolemap list
```

Access: ManageGuild, ManageRoles. Prefix: supported.

Source: [src/commands/admin/config/rolemap.ts](../src/commands/admin/config/rolemap.ts).

## rolepanel

Publish verification or self-role controls

```text
/rolepanel <type>
```

Access: ManageRoles. Prefix: supported.

Source: [src/commands/admin/config/rolepanel.ts](../src/commands/admin/config/rolepanel.ts).

## rolesync

Reconcile your mapped roles against live Nova grants

```text
/rolesync
```

Access: Everyone; Private slash only. Prefix: disabled.

Source: [src/commands/utility/general/rolesync.ts](../src/commands/utility/general/rolesync.ts).

## serverinfo

Show information about this server

```text
/serverinfo
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/general/serverinfo.ts](../src/commands/utility/general/serverinfo.ts).

## shop

Server economy: shop

```text
/shop [item]
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/economy/shop.ts](../src/commands/utility/economy/shop.ts).

## skip

Music: skip

```text
/skip
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/music/skip.ts](../src/commands/utility/music/skip.ts).

## slowmode

Set slowmode in a channel

```text
/slowmode <seconds>
```

Access: ManageChannels. Prefix: supported.

Source: [src/commands/admin/moderation/slowmode.ts](../src/commands/admin/moderation/slowmode.ts).

## softban

Softban a member with an audit case

```text
/softban <user> [reason]
```

Access: BanMembers. Prefix: supported.

Source: [src/commands/admin/moderation/softban.ts](../src/commands/admin/moderation/softban.ts).

## status

Query configured platform health endpoints

```text
/status
```

Access: Everyone; Live Nova: admin (admin, superadmin); Private slash only. Prefix: disabled.

Source: [src/commands/utility/status.ts](../src/commands/utility/status.ts).

## sticky

Set or remove a throttled sticky message in this channel

```text
/sticky [text]
```

Access: ManageMessages. Prefix: supported.

Source: [src/commands/admin/config/sticky.ts](../src/commands/admin/config/sticky.ts).

## stop

Music: stop

```text
/stop
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/music/stop.ts](../src/commands/utility/music/stop.ts).

## ticket

Create and manage support tickets

```text
/ticket create [subject]
/ticket close
/ticket reopen
/ticket claim
/ticket transcript
/ticket rename <name>
/ticket add <user>
/ticket remove <user>
```

Access: Everyone. Prefix: supported.

Source: [src/commands/support/tickets/ticket.ts](../src/commands/support/tickets/ticket.ts).

## timeout

Timeout a member with an audit case

```text
/timeout <user> [seconds] [reason]
```

Access: ModerateMembers. Prefix: supported.

Source: [src/commands/admin/moderation/timeout.ts](../src/commands/admin/moderation/timeout.ts).

## unban

Unban a member with an audit case

```text
/unban <user> [reason]
```

Access: BanMembers. Prefix: supported.

Source: [src/commands/admin/moderation/unban.ts](../src/commands/admin/moderation/unban.ts).

## unlock

Unlock the current channel

```text
/unlock
```

Access: ManageChannels. Prefix: supported.

Source: [src/commands/admin/moderation/unlock.ts](../src/commands/admin/moderation/unlock.ts).

## unmute

Unmute a member with an audit case

```text
/unmute <user> [reason]
```

Access: ModerateMembers. Prefix: supported.

Source: [src/commands/admin/moderation/unmute.ts](../src/commands/admin/moderation/unmute.ts).

## userinfo

Get info about a user

```text
/userinfo [user]
```

Access: Everyone. Prefix: supported. Aliases: uinfo.

Source: [src/commands/utility/general/userinfo.ts](../src/commands/utility/general/userinfo.ts).

## volume

Music: volume

```text
/volume <percent>
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/music/volume.ts](../src/commands/utility/music/volume.ts).

## warn

Warn a member with an audit case

```text
/warn <user> [reason]
```

Access: ManageMessages. Prefix: supported.

Source: [src/commands/admin/moderation/warn.ts](../src/commands/admin/moderation/warn.ts).

## warnings

View recent warnings for a member

```text
/warnings <user>
```

Access: ManageMessages. Prefix: supported.

Source: [src/commands/admin/moderation/warnings.ts](../src/commands/admin/moderation/warnings.ts).

## wiki

Search authorized Atlas documents privately

```text
/wiki search <query> [page]
/wiki open <path>
```

Access: Everyone; Live Nova: atlas; Private slash only. Prefix: disabled.

Source: [src/commands/utility/wiki.ts](../src/commands/utility/wiki.ts).

## work

Server economy: work

```text
/work
```

Access: Everyone. Prefix: supported.

Source: [src/commands/utility/economy/work.ts](../src/commands/utility/economy/work.ts).
