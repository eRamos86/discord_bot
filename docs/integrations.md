# Ecosystem contracts

All API origins are explicitly configured by the operator. API clients enforce timeouts, response bounds, no cross-origin redirects and generic user-facing errors. Reads retry once; writes never automatically retry because a timeout may occur after the service committed. No bot code accesses another service's database.

## Nova

Set `NOVA_API_URL`, `NOVA_CLIENT_ID=discord-bot`, the exact registered HTTPS `NOVA_REDIRECT_URI` ending `/oauth/nova/callback`, and a 32-byte hex `TOKEN_ENCRYPTION_KEY`. `/account link` creates a ten-minute one-use state and returns an ephemeral authorization URL. The callback exchanges the code at `/auth/token`, reads `/auth/me`, and requires that Nova's authenticated OAuth-managed Discord account matches the initiating Discord user. The flow cannot link an arbitrary forwarded account by trusting a Discord ID from a request body.

Sessions store only an AES-256-GCM-encrypted bearer token, Nova ID and expiry. The bot does not retain refresh tokens; users relink after session expiry. Every platform command calls `/auth/verify` with its project and verifies that the returned user matches the stored identity. Project-role restrictions are checked live. `/account unlink` removes the bot session; it does not unlink the canonical OAuth account in Nova.

The accessible Nova repository now rejects legacy unauthenticated `/auth/discord/link` and `/auth/discord/unlink` with HTTP 410. Discord resolution requires a valid bearer token and matching ownership from `/auth/me`. Deploy this Nova change together with the bot. Nova remains the only identity/grant authority.

## Service interfaces

| Service     | Bot interface and actual endpoints                                        | Authorization / ownership                                                                                                               |
| ----------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| MunchPoints | `/mp balance`, rewards, history → new GET `/api/bot?action=...`           | Bearer verified live by Nova for `munchpoints`; resolves the canonical Nova ID to local user ID, filters visibility and own history     |
| Flux        | accounts, recent, budgets, subscriptions, summary; quick expense          | `flux`; `/api/accounts`, `/api/transactions`, `/api/budgets`, `/api/subscriptions`, `/api/dashboard`; dashboard display reads `metrics` |
| Apex        | garage/vehicle, fuel, odometer, maintenance, builds; vehicle autocomplete | `apex`; `/api/vehicles`, `/api/vehicles/:id`, `/api/fuel`, `/api/maintenance`, `/api/builds`                                            |
| Atlas       | private `/wiki search` with pages and `/wiki open`                        | `atlas`; `/api/docs` and `/api/docs/*path`; service filters documents using the requesting bearer token                                 |
| Nexus       | published Now information                                                 | public `/api/now`; no private personal records or invented write APIs                                                                   |
| Admin       | app registry and authorized platform status                               | `admin` plus allowed role; `/api/apps`; the downstream service is the final authority                                                   |

The MunchPoints route lives in that service repository at `src/app/api/bot/route.ts` and must be deployed there. It uses the service's own DB/business visibility rules. The bot offers no points administration or redemption write because the existing service requires cookie-based interactive flows for those operations. Do not emulate them with direct cross-service database changes or an admin master token.

Apex owns fuel-to-Flux events. The bot creates one fuel record in Apex and explicitly reports that Flux delivery is not confirmed by that response. Do not create a duplicate Flux transaction from the bot. Flux quick-expense chooses an eligible user-owned account, with an optional explicit ID. A failed/ambiguous write should be checked in the owning application before retrying.

Atlas results are slash-only and ephemeral, including search metadata. No grant/response cache or channel broadcast is used. The bot never substitutes an admin token. Large document output is truncated for Discord; use the Atlas application for the full document. Search operates on the user's authorized catalog, with ten results per page.

`/ask` dispatches a small set of deterministic read-only intents (MunchPoints balance, garage, recent Flux transactions, Atlas search) through a tool registry that performs the same live authorization. Unrecognized requests explain the supported tools. No LLM runs on arbitrary messages and no inferred write is executed. Adding a provider later requires a separate explicit model adapter and write-confirmation design.

Platform status checks configured HTTP health endpoints with latency and interprets declared health when available. Reachability is distinguished from a service's declared health; versions/deployments are not invented. Configure per-service `*_HEALTH_PATH` overrides when needed.

## Signed inbound events

Configure `EVENT_SIGNING_KEYS` as a JSON object mapping source IDs to random secrets of at least 32 characters. Configure a route with owner-only `/notifications add` (server channel) or `/notifications add-dm` (the requesting owner's own DM). DM delivery also requires that member to remain in the configured guild. Disable routes with `/notifications remove`; workers recheck the route before sending.

POST `/events` with `Content-Type: application/json`, `x-event-source`, `x-event-timestamp` (Unix seconds), and `x-event-signature` containing `sha256=` plus HMAC-SHA256 hex of the exact UTF-8 timestamp, a dot, and the raw request body. The timestamp tolerance is five minutes and body limit is 16 KB.

```json
{
    "id": "fuel-123",
    "source": "apex",
    "type": "maintenance.due",
    "title": "Maintenance due",
    "message": "Check your vehicle in Apex."
}
```

Only `id`, `source`, `type`, `title`, `message` are accepted. The signed source must match the body. Destinations are never accepted from event payloads. `(source,id)` is deduplicated transactionally with jobs; reuse with different bytes is rejected. Retention is thirty days, so publishers must not reuse IDs after expiry. Matching routes are limited to 100 per event. Use one stable serialized body on publisher retries.

The event receiver is ready for service adoption; existing service publishers have not all been rewired to send these events. Deploy sender-side hooks in the owning service with its configured source secret. Start with non-sensitive summaries and deep links: a channel route can be read by everyone with access to that channel. The HTTP listener must sit behind an HTTPS reverse proxy for OAuth and internet event intake.
