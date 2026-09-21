# Security and operational boundaries

- Discord permissions, target/role hierarchy, guild command policies, bot ownership and Nova project grants are separate checks. A bot-owner ID never substitutes for service identity or Discord permissions.
- Every guild-owned SQL operation includes guild identity. Moderation cases, settings, wallets, inventory, polls, roles, tickets and jobs cannot be selected across guilds by supplying an ID alone.
- Automatic roles refuse managed/everyone/privileged roles and validate bot hierarchy. Configuration changes involving role assignment also require the actor's Manage Roles permission and hierarchy. Ticket staff cannot be everyone.
- Nova is verified live per platform operation. OAuth state is random, hashed, one-use and short-lived. Linking binds Nova's authenticated Discord account to the initiator. Stored bearer tokens use authenticated encryption; refresh tokens are not persisted.
- All private service output is slash-only and ephemeral. Atlas uses the requesting identity's token for both catalog and document reads. Private response bodies and authorization headers never enter routine logs.
- API origins are operator controlled, redirects are refused and response bodies bounded. User-provided document/vehicle IDs cannot select another host. Writes are not automatically retried; ambiguous failures instruct the user to check the service.
- Event authentication covers exact bytes and timestamp, uses per-source secrets and constant-time comparison, and rejects payload destinations. Only configured routes can deliver; disabled routes are rechecked by workers.
- Arbitrary eval, shell execution, remote media scraping and destructive channel cloning are not commands. Music is constrained to a realpath-checked, allowlisted local library.
- Discord mentions default off. Message log excerpts and transcripts are bounded; transcripts omit downloaded attachments. Logging is opt-in, with no permanent full-message archive in PostgreSQL.
- Startup validates persistence before login. The image is nonroot; secrets remain outside images/source. Dependency audit is part of CI. Reviewed migrations replace schema pushes.

Security limits are explicit: Discord administrators inherently see private ticket channels; raid counters can misclassify legitimate bursts; role-specific channel overwrites can bypass everyone-only lockdown; role mirrors remain stale until the next `/rolesync`; a crash between an external side effect and database acknowledgement cannot be made exactly-once solely with a local transaction. Signed event channels must be chosen to match the sensitivity of the sender's content. Do not publish private financial or identity payloads to a broad guild channel.

The HTTP process has bounded request bodies, timeouts and coarse per-address limits. Put it behind a production reverse proxy. It does not trust forwarded IP headers; behind one proxy those coarse limits aggregate at that proxy address. Add appropriate authenticated-source and ingress controls there.

Token rotation is required for credentials formerly present in Obsidian deployment documentation. Clean maintained documentation does not remove historical exposure. Existing Nova unauthenticated Discord link endpoints are disabled by the associated service change; deploy that change before relying on canonical account links.
