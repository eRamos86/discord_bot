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
        * [ ] `/help command:<command>`

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




- ADD CACHING FOR HELP COMMAND

- create command router system


--add redeploy or deploy or reload command


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
