# Verification record

Local validation on 2026-09-13 used Node 22.23.1. No production Discord gateway, command scope or service records were changed by these checks.

## Automated evidence

- `npm run check`: formatting, ESLint, TypeScript, 41 tests and clean production build and compiled runtime smoke check pass.
- `npm run deploy:preview`: validates 73 command registrations. The compiled deployment entrypoint also performs a dry run successfully.
- Framework tests cover metadata, command removal/replacement, prefix alias/argument routing, callable context argument-name collisions, private deferred replies, registry delimiter matching, module-discovery filtering of numbered filesystem copies, local guards, policy deny/allow behavior and cooldowns.
- Domain tests cover typed settings/ranges/revisions, actor/bot role hierarchy, guild logging destinations, template rendering, safe role settings, automod and bounded presence configuration.
- Isolated PostgreSQL tests use PGlite's PostgreSQL engine, execute both SQL migrations and verify configuration persistence/conflicts, guild wallet conservation/cooldowns/inventory, scheduler lease/retry/cleanup behavior, event deduplication, case isolation/history, ticket private overwrites/open-ticket reuse and failed-action audit persistence.
- OAuth tests exercise state generation/one-use consumption, canonical Discord binding, rejection of forwarded-account takeover, encrypted session storage and subsequent authorization. Client tests cover live grant checks, Atlas requesting-token isolation, timeouts/retries, bounded responses and unsafe URL rejection.
- Startup runs against the isolated database and loads the actual command catalog, feature/event modules and runtime state in `--check` mode. It deliberately skips Discord login. `npm run check:runtime` repeats this against the compiled entrypoint and current migration journal.
- Nova and MunchPoints TypeScript checks pass, including the new delegated MunchPoints route. These checks do not replace deploying and exercising those services.
- Production dependency audit reports zero known vulnerabilities at this run. Registry results can change after this date.
- Production Compose configuration validates. Official base-image tags resolve. The local Docker daemon is unavailable, so the image was not built or run here.

PGlite tests exercise PostgreSQL SQL semantics without production credentials. They do not simulate competing gateway processes, network partitions, Discord API behavior or all operational PostgreSQL settings.

## Live acceptance checklist

Use a development application/guild and a staging database before a production rollout.

1. Rotate exposed tokens, configure intents/role hierarchy, migrate a restored database, start the bot, and confirm `/health` transitions from 503 to 200 after gateway readiness.
2. Preview and synchronize a development guild, execute `/help` and prefix help, verify subcommands/autocomplete, then remove a disposable obsolete registration. Review global scope before global synchronization.
3. Save configuration through menus/forms and raw setters, restart, confirm persistence, test stale form rejection and a second guild's isolation.
4. Preview onboarding and trigger controlled member join/leave, DM/autorole, log category routing and missing-permission behavior.
5. Use disposable members/channels to test moderation success/failure, warning history/revocation, hierarchy rejection, purge, lock/unlock restoration and emergency lockdown partial failures.
6. Exercise automod with conservative thresholds and exemptions; ensure normal users are not punished by initial defaults.
7. Create a ticket through each configured type, verify staff/creator/unrelated-user access, participant add/remove, claim, transcript, close/archive and reopen. Verify duplicate creation reuses the open ticket.
8. Test verification/self-role eligibility, manual roles and Nova role sync after grant revocation. Remember role mirroring is manually refreshed.
9. Test XP, economy transfers/shop, poll votes/close, AFK/stickies, reminder delivery and cancellation. Restart with a pending reminder and inspect failed jobs with DMs disabled.
10. Link a real Nova account, exercise each authorized integration, revoke a grant and verify immediate denial; use an unauthorized identity for private Atlas documents. Simulate one service outage and confirm local moderation remains available.
11. Create a staging Apex fuel entry and verify the service-owned Flux event separately. Check ambiguous write behavior without blindly resubmitting.
12. Send signed notification events to staging, replay identical bytes, alter the payload with the same ID, disable a route before delivery, test owner DM membership and inspect failed delivery diagnostics.
13. Mount an approved Opus file and verify voice connect/play/queue/pause/skip/volume/idle disconnect on the deployment network.
14. Build/run the release container, check readiness, exercise SIGTERM with pending work, test PostgreSQL backup restore and rehearse rollback to the prior compatible image.

Complete these live checks with the deployment operator's credentials and record the image SHA, database migration state and outcomes. Do not describe the system as live-production-verified solely because the local suite passes.
