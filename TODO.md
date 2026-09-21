# Discord Bot delivery status

This roadmap reflects implemented behavior, not legacy command-name aspirations. See `docs/commands.md` for the generated catalog and `docs/verification.md` for evidence and remaining live checks.

## Completed

- [x] Unified command metadata, context, prefix/slash normalization, guards, component routes and command synchronization/removal.
- [x] Typed guild configuration, interactive menus/forms, revision conflicts, short-lived caching and role/reference validation.
- [x] Reviewed SQL migrations and legacy initial-schema adoption; guild isolation for persisted domains.
- [x] Structured moderation cases/history, warnings/notes, reports, message management and lock recovery.
- [x] Configurable automod, mass-join protection and per-category logging.
- [x] Onboarding templates/DM/autoroles and preview command.
- [x] Ticket types/panels, private creation, staff controls, participants, archive/reopen and transcripts.
- [x] Verification/self-role panels, manual roles and optional live Nova role mapping/sync.
- [x] Guild leveling/economy/shop/inventory, polls, AFK, sticky messages and persistent reminders/timers.
- [x] Dynamic help, entertainment, safe local Opus music, presence rotation and owner diagnostics/maintenance.
- [x] Nova OAuth flow, encrypted sessions, live grants and secure legacy Discord resolution in Nova.
- [x] MunchPoints delegated read endpoint in its owning service; Flux, Apex, Atlas, Nexus and Admin clients/commands.
- [x] Read-only natural-language tool dispatch and permission-aware service status.
- [x] Signed event intake, channel/self-DM routing, idempotency records, durable jobs/retries and cleanup.
- [x] Reproducible build scripts, CI/audit, immutable image publication, health checks and graceful shutdown.
- [x] Security/domain/router/PostgreSQL tests and synchronized documentation/runbooks.

## Consolidated or deliberately retired

- `mute` uses Discord timeout; `timer` aliases persistent reminders. Overlapping features use subcommands.
- Arbitrary eval, unsafe runtime reload, destructive nuke/channel cloning and blind Watchtower upgrades are retired.
- Pets, third-party cat/dog/media novelty APIs and prohibited/fragile music scraping are not retained. Lightweight fun and local licensed/operator-owned audio cover the entertainment scope.
- Nova remains the grant authority; Discord role mirroring is optional and manually refreshed, never a substitute for live authorization.
- MunchPoints administration/redemption remains in its interactive service until a delegated write contract exists. No business rules are copied into this bot.
- LLM execution is not enabled; deterministic read-only tools provide an extensible gateway without per-message model costs.

## Operator actions before production use

- [ ] Rotate Discord tokens formerly documented in plaintext and update the deployment secret store.
- [ ] Provision live PostgreSQL/secrets, restore-test a backup and apply migrations to staging.
- [ ] Deploy the Nova security change and MunchPoints delegated API; configure exact OAuth callback/project grants.
- [ ] Configure service origins, encryption/signing keys, ingress TLS and notification destinations; wire intended service publishers to the event contract.
- [ ] Run the live Discord acceptance checklist in `docs/verification.md`, including command synchronization, voice and restart checks.
- [ ] Build/run the container on a host with Docker available, then release a verified immutable image.

These external deployment checks were not replaced with claims based on type checking or mocked Discord tests.
