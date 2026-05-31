# Discord Bot TODO

---

# Admin
Core server control and enforcement tools

- **Moderation**
ban / kick / timeout / warn / purge

    - Ban
        * [ ] `/ban`
        * [ ] `/unban`
        * [ ] `/softban`

    - Kick
        * [ ] `/kick`

    - Purge
        * [ ] `/purge`
        * [ ] `/nuke`
        * [ ] `/cleanup`

    - Warnings
        * [ ] `/warn`
        * [ ] `/warnings`
        * [ ] `/clearwarnings`

    - Message Moderation
        * [ ] `/slowmode`

        * [ ] `/lock`
        * [ ] `/unlock`

        * [ ] `/mute`
        * [ ] `/unmute`

        * [ ] `/timeout`
        * [ ] `/untimeout`

    - Other
        * [ ] `/nickname`
        * [ ] `/embed`
        * [ ] `/announce`

        * [ ] `/modlogs`
        * [ ] `/case`
        * [ ] `/reason`
        * [ ] `/history`
        * [ ] `/notes`
        * [ ] `/report`


- **Automod**
filters, spam detection, triggers, auto actions

    - Basics
        * [ ] `/automod setup`
        * [ ] `/automod enable`
        * [ ] `/automod disable`

    - Filters
        * [ ] `/filter words`
        * [ ] `/filter links`
        * [ ] `/filter invites`
        * [ ] `/filter spam`
        * [ ] `/filter caps`
        * [ ] `/filter mentions`
        * [ ] `/filter zalgo`

    - Actions / Rules
        * [ ] `/automod action`
        * [ ] `/automod whitelist`
        * [ ] `/automod blacklist`
        * [ ] `/automod exempt`


- **Roles**
role assignment, reaction roles, role utilities

    - Reaction Roles
        * [ ] `/reactionrole create`
        * [ ] `/reactionrole remove`
        * [ ] `/reactionrole edit`
        * [ ] `/reactionrole panel`

    - Role Assignment
        * [ ] `/role add`
        * [ ] `/role remove`


- **Config**
server configuration, settings, prefixes, setup

    * [ ] `/config`
    * [ ] `/settings`
    * [ ] `/prefix`
    * [ ] `/language`
    * [ ] `/permissions`

    * [ ] `/setchannel logs`
    * [ ] `/setchannel welcome`
    * [ ] `/setchannel announcements`

    - Logging
        * [ ] `/log channel`
        * [ ] `/log joins`
        * [ ] `/log leaves`
        * [ ] `/log deletes`
        * [ ] `/log edits`
        * [ ] `/log bans`
        * [ ] `/log mutes`
        * [ ] `/log roles`
        * [ ] `/log nicknames`
        * [ ] `/log voice`
        * [ ] `/log automod`

    - Welcome
        * [ ] `/welcome setup`
        * [ ] `/welcome channel`
        * [ ] `/welcome message`
        * [ ] `/welcome dm`
        * [ ] `/welcome test`
        * [ ] `/autorole`

    - Leave
        * [ ] `/goodbye setup`
        * [ ] `/goodbye message`

    - Verification
        * [ ] `/verify setup`
        * [ ] `/verify role`
        * [ ] `/verify channel`
        * [ ] `/verify message`

    - Security
        * [ ] `/antiraid`
        * [ ] `/antinuke`
        * [ ] `/altcheck`
        * [ ] `/lockdown`
        * [ ] `/unlockdown`

---

# Support
User assistance systems (non-moderation help systems)

- **Help**
`/help`, command lookup, docs navigation

    - Help
        * [X] ~~`/help` — main help menu~~ [2026-05-23]
        * [X] ~~`/help <category: cat>` — category menu~~ [2026-05-23]
        * [X] ~~`/help <category: cat> <subcategory: subcat>` — subcategory menu~~ [2026-05-23]
        * [X] ~~`/help <command: cmd>` — command view~~ [2026-05-23]
        * [ ] `/search`

    - Other
        * [ ] `/about`
        * [ ] `/changelog`
        * [ ] `/invite`


- **Tickets**
ticket creation, management, transcripts, closing

    - Tickets
        * [ ] `/ticket create`
        * [ ] `/ticket close`
        * [ ] `/ticket add`
        * [ ] `/ticket remove`
        * [ ] `/ticket rename`
        * [ ] `/ticket transcript`
        * [ ] `/ticket panel`

    - Other
        * [ ] `/support`

---

# Utility
General-purpose tools (non-governance, non-entertainment)

- **General**
ping, info, userinfo, avatar, serverinfo

    - User Info
        * [X] ~~`/userinfo`~~ [2026-05-23]
        * [ ] `/avatar`
        * [ ] `/banner`
        * [ ] `/roles`

    - Server Info
        * [ ] `/uptime`
        * [ ] `/serverinfo`
        * [ ] `/membercount`

    - Other
        * [X] ~~`/ping`~~ [2026-05-23]


- **Systems**
persistent progression / engagement systems

    - Leveling
        * [ ] `/rank`
        * [ ] `/leaderboard`
        * [ ] `/level config`
        * [ ] `/level rewards`

    - Economy
        * [ ] `/balance`
        * [ ] `/daily`
        * [ ] `/give`
        * [ ] `/shop`
        * [ ] `/inventory`

    - Engagement
        * [ ] `/poll`
        * [ ] `/vote`
        * [ ] `/remind`
        * [ ] `/timer`


- **Misc**
small random tools, converters, lightweight helpers

    * [ ] `/botstats`
    * [ ] `/afk`
    * [ ] `/sticky`
    * [ ] `/snipe`
    * [ ] `/editsnipe`
    * [ ] `/translate`

---

# Fun
Entertainment / non-functional interaction

- **Games**
minigames, RNG, trivia

    * [ ] `/8ball`
    * [ ] `/coinflip`
    * [ ] `/dice`


- **Music**
playback controls, queue, filters

    * [ ] `/play`
    * [ ] `/pause`
    * [ ] `/resume`
    * [ ] `/skip`
    * [ ] `/queue`
    * [ ] `/stop`
    * [ ] `/volume`


- **Entertainment**
jokes, memes, reactions, novelty commands

    * [ ] `/meme`
    * [ ] `/joke`
    * [ ] `/cat`
    * [ ] `/dog`
    * [ ] `/say`

---

# Owner
special category — permission layer (top-level)

- **Core**
bot control and global overrides

    * [ ] `/eval`
    * [ ] `/reload`
        * [ ] `/reload commands`
        * [ ] `/reload events`
    * [ ] `/shutdown`
    * [ ] `/restart`
    * [ ] `/maintenance mode`
    * [ ] `/blacklist`
    * [ ] `/whitelist`
    * [ ] `/sync`


- **Debug**
inspection, diagnostics, internal state tools

    * [ ] `/debug`
    * [ ] `/cache`
    * [ ] `/latency`
    * [ ] `/errors`
    * [ ] `/logs view`
    * [ ] `/guild inspect`
    * [ ] `/user inspect`
    * [ ] `/permissions check`


- **Maintenance**
testing and system upkeep tools

    * [ ] `/test command`
    * [ ] `/test event`
    * [ ] `/mock join`
    * [ ] `/mock leave`
    * [ ] `/reset data`
    * [ ] `/rebuild cache`



---




# Order



- alright i wanna make it so the bot is configurable to each server its in. maybe server owners wanna change the prefix, certain features will have configurations (like welcome and goodbye messages), toggle features (like the leveling system or economy or pets, those cant be configed by server its all hardcoded but the role names and colors for the levels can be changed)



- i also wanna add a rich presence thing with a config where i can change, add, and remove presences that the bot loops.



- i wanna start working on the welcome messages and goodbye messages, which can be configged per server (defaults to toggle off). config the channel, message, title, image, color, footer, etc.



- then i wanna start working on message logging, a feature that can be toggled per server (defaults to off) and when enabled config the channel.

feature will log all messages and edits and deletions

oh wait maybe its a good idea to config what gets logged in the channel.. maybe users dont want every message logged but wanna log deletions and edits!


#
1. GuildSettings model [done!]
2. getGuildSettings() [done!]
3. Per-server prefix [done!]
4. /config command
5. Welcome messages
6. Goodbye messages
7. Logging system
8. Presence rotation
9. Level role configuration
10. Economy config
11. Pets config

#



- make sure CommandContext has everythigng i'd need fr later commands. i never have to defferentiate between interaction vs message.
- ADD CACHING FOR HELP COMMAND

- add modal abstraction features [current]


- /serverinfo [current]

- /purge
- /ban
- /kick
- /timeout
- /warn
- /lock
- /unlock
- /slowmode
- logging system
- welcome system
- automod
- tickets
- reaction roles
- config system
- owner/dev commands

#
snapshot of a reload reply from my old python bot:
#
Reloaded Cogs: 8ball, addrole, am_i, avatar, balance, ban, bonk, cap, clap, claps, createrole, cum, emclaps, f, feedback, fuck, giveaway, givecookie, gm, gofuckyourself, hello, historyteacher, hug, ischirpygay, kick, kiss, load, meme, mention, motivate, mute, nick, on_command_error, on_guild_join, on_guild_remove, on_member_join, on_message, on_message_delete, on_message_edit, on_raw_reaction_add, on_raw_reaction_remove, on_ready, pets, ping, poll, prefix, purge, rate, reactionroles, reload, rules, say, serverinfo, slap, stab, takerole, test, tictactoe, timer, topic, twitch, unban, unload, unmute, uvu, uwufy, uwufy2, uwufy3, wall, warn, warnings, whatshouldido, whois, whospogger, wouldyourather! (75)
Failed Cogs: help... :c (1)


Reloaded Functions: start, status! (2)
Failed Functions: economy... :c (1)

All variables were reloaded!
No classes could be reloaded
