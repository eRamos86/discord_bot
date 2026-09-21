# Discord Bot

A modular Discord administration bot and an optional, Nova-authorized gateway into the platform. Ordinary Discord servers need only Discord and PostgreSQL. Ecosystem outages do not disable local administration.

The existing command/context/router architecture is retained. Commands delegate to feature services; bot data stays in PostgreSQL, while Nova, MunchPoints, Flux, Apex, Atlas, Nexus and Admin retain ownership of their data.

## Get running

Use Node.js 22.12 or newer (CI/container: 22.23.1) and PostgreSQL 16.

```sh
npm ci
cp .env.example .env
# Set DISCORD_TOKEN, CLIENT_ID, owner IDs and DATABASE_URL in your secret store/.env.
npm run dev
npm run check
npm run deploy:preview
npm run build
npm run start:check
# In a development Discord guild, set DEV_GUILD and GLOBAL_DEPLOY=false:
npm run deploy
npm start
```

`npm run dev` starts the development PostgreSQL container, applies pending migrations, then runs the bot under nodemon. The database lives and dies with the session: stopping the bot with Ctrl+C (or the bot exiting) tears the container down automatically, while persistent data stays in the `postgres_dev_data` volume for the next run. The development database mirrors production defaults (user/database `discord_bot`) on port 5433 with disposable development credentials from `.env.example`. `npm run db:up`/`db:down` start and stop just the database independently, and `npm run db:reset` recreates a clean database volume and re-migrates it. Production requires a different random password. Enable Server Members and Message Content privileged intents in the Discord Developer Portal. Invite with `bot` and `applications.commands` scopes. Grant only the permissions needed by enabled features, and place the bot role above roles/members it will manage.

`start:check` verifies persistence, migrations and runtime module loading without connecting to Discord. It does not prove gateway connectivity or Discord permissions. `deploy:preview` validates registrations without changing Discord. A normal full deployment replaces the selected application's command scope, removing obsolete entries; use a development guild first.

## Implemented capabilities

- Moderation with persistent cases, reason history, warnings, notes, reports, bans/kicks/timeouts, purge, channel locks, slowmode and explicit emergency lockdown.
- Opt-in automod filters and mass-join protection; per-category logging and configurable onboarding with previews.
- Private tickets with types, staff roles, participant controls, claim, rename, close/reopen and bounded transcripts.
- Verification and self-role panels, manual role tools, optional live Nova role synchronization.
- Guild-scoped XP, level roles, economy/ledger/shop/inventory, polls, reminders/timers, AFK and sticky messages.
- Metadata-driven help, prefix/slash routing, private service commands, configurable presence, safe owner diagnostics and maintenance controls.
- Local Opus music playback/queue controls and lightweight entertainment.
- Nova OAuth account linking, encrypted short-lived sessions, live project grants; dedicated service clients and a deterministic read-only `/ask` tool router.
- Signed, deduplicated ecosystem events delivered by a durable job worker to configured channels or opted-in owner DMs.

## Documentation

- [Command catalog](docs/commands.md) — generated from actual metadata.
- [Architecture and extension guide](docs/architecture.md).
- [Configuration and feature behavior](docs/configuration.md).
- [Service integration contracts](docs/integrations.md).
- [Deployment, migration and rollback](docs/deployment.md).
- [Security and reliability limits](docs/security.md).
- [Verification record and live checklist](docs/verification.md).
- [Completed roadmap and operator actions](TODO.md).

The matching `Platform/Discord Bot/` Obsidian pages are synchronized with this implementation. Run `npm run docs:commands` after changing metadata. Never place tokens, passwords, signing keys or service responses in either documentation repository.
