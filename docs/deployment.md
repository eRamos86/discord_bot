# Deployment and recovery

## Secrets and prerequisites

Previously documented Discord bot tokens must be rotated in the Discord Developer Portal. Removing them from current documentation does not revoke them or erase Git/Obsidian history. Update the deployment secret store with rotated values. Do not paste the old values into tickets, logs or commits.

Use Node 22.23.1 in CI/containers, PostgreSQL 16, the committed lockfile and an HTTPS reverse proxy for external callbacks/events. `.env.example` lists all settings. Production Compose requires `POSTGRES_PASSWORD`; use a random URL-safe password because it is interpolated into the database URL. Never run `docker compose config` into public logs when real secrets are loaded. `.env` is ignored by Git and excluded from the image build context.

The bot works without ecosystem URLs. With integrations enabled, register the Nova OAuth client/callback and project grants, provision the token encryption key and deploy the corresponding Nova and MunchPoints API changes first. An encryption-key change invalidates existing stored bot sessions unless an explicit re-encryption procedure is supplied; users can relink. Back up the key separately from encrypted database backups.

## Database migrations

`npm run db:migrate` applies the journaled SQL migrations with an advisory lock. `0000` is the initial guild-settings table. `0001` extends settings and adds moderation/history, tickets, guild wallets/ledger/inventory, levels, jobs, notification events/routes, Nova sessions/state, role mappings, channel locks, polls/votes, AFK/stickies and bot state. Data is guild-scoped; Nova identity/session state is deliberately account-scoped. Legacy global economy records are retained without silently minting copies into every guild.

Back up PostgreSQL before every schema change. Test restore to a separate database. Normal installations with migration history run the migration command directly. If a legacy deployment created only the original five-column `guild_settings` table using `db:push` and has no journal, inspect the schema and use the explicit adoption option:

```sh
npm run db:migrate -- --baseline-legacy
```

This checks the exact original column names/types and primary key, refuses an existing journal or schema drift, records the first migration and then applies subsequent migrations. Do not manually mark later migrations applied to get past an error. Other drift requires a reviewed reconciliation migration. `db:push`/schema generation are no longer deployment mechanisms. Migration files already applied to a deployed environment must never be edited.

## Build and release

GitHub Actions runs formatting, lint, type checking, isolated tests, build, command-registration preview and production dependency audit. On a successful main-branch run it publishes `ghcr.io/eramos86/discord_bot:<commit SHA>`. It does not automatically change the running host. There is no SSH command that resets the live checkout or copies plaintext tokens into an image.

Select an immutable `BOT_IMAGE` SHA in the deployment environment, authenticate the host to GHCR if private, then:

```sh
docker compose pull
docker compose up -d postgres
docker compose run --rm migrate
docker compose up -d --no-build discord_bot
docker compose ps
curl --fail http://127.0.0.1:3000/health
```

For a local build, `docker compose build` before the migration/start steps. The production image runs as an unprivileged user with a read-only root filesystem, dropped capabilities and bounded shutdown grace. PostgreSQL is not published to the host. Health is bound to localhost through port 3000. Expose only the required OAuth/event routes through TLS; keep operational health endpoints internal where possible. Configure reverse-proxy request limits and avoid logging callback query strings.

Run one gateway instance per token. Watchtower must not blindly replace the bot before migrations; this release uses an explicit migration/release procedure. To enable music, provide a read-only mount at the configured library directory and operator-owned Opus tracks.

## Command synchronization

```sh
npm run deploy:preview
# Development guild first: DEV_GUILD=<guild>, GLOBAL_DEPLOY=false
npm run deploy
# Refresh one command without replacing the rest:
npm run deploy -- --command help
# Remove an obsolete registered command in the selected scope:
npm run deploy -- --remove obsolete-name
```

Set `CLIENT_ID` to the application that owns the token. Full synchronization uses Discord's bulk replacement endpoint and removes obsolete commands in that scope. `GLOBAL_DEPLOY=true` selects global commands; otherwise a valid `DEV_GUILD` is required. Global propagation is controlled by Discord. Never synchronize the wrong application or scope. The owner command wraps the same synchronization service.

## Health, logs and rollback

`GET /live` reports a living process. `/health` and `/healthz` return HTTP 200 only when the gateway is ready and PostgreSQL responds, otherwise 503. Supervisor restart policies recover fatal failures. Structured errors contain correlation IDs, safe error codes and code-location frames; token values, response bodies and raw SQL errors are omitted. Inspect failed jobs and pending moderation cases before retrying externally visible operations.

For an application rollback, stop the current bot, select the previous immutable image, confirm it is compatible with the expanded schema and restart it. No automatic down migration is provided. If rollback requires restoring the pre-migration schema, stop all writers, restore the verified database backup into a separate database, validate it and switch the connection. Restoring a backup loses later writes; reconcile Discord effects and service writes independently. Never run destructive schema rollback against the only database copy.

Shutdown stops polling and drains active jobs, then closes gateway and database resources. Jobs survive restarts, but external message delivery is at-least-once under crash uncertainty. Use stable publisher event IDs and check Discord before manually replaying failed delivery.
