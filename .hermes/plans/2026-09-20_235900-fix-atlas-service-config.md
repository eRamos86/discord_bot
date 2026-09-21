# Fix Atlas Service Configuration

## Goal
Configure all missing service URLs in the Discord bot's environment files (production and local dev) so that `/wiki`, `/atlas`, and other platform commands work correctly.

## Current Context / Assumptions
- **Production bot** runs on `poopmachine` at `~/platform/discord_bot/` with `.env` missing ALL service URLs
- **Local dev bot** runs on MacBook at `~/Documents/GitHub/discord_bot/` with `.env` missing ALL service URLs
- All ecosystem services are deployed on poopmachine with known production URLs
- Services use Nova for auth; bot needs `TOKEN_ENCRYPTION_KEY` for Nova OAuth token encryption
- Bot uses `NOVA_CLIENT_ID=discord-bot` and requires a registered `NOVA_REDIRECT_URI`

## Architecture / Approach
1. **Production**: SSH to poopmachine, edit `~/platform/discord_bot/.env` to add all service URLs and required Nova OAuth vars, then restart the bot container
2. **Local Dev**: Edit `~/Documents/GitHub/discord_bot/.env` to add local service URLs (or production URLs via tunnel), then restart local bot
3. **Verify**: Test `/wiki search test` and `/atlas search test` in Discord

## Step-by-Step Tasks

### Task 1: Generate TOKEN_ENCRYPTION_KEY
```bash
# Run locally to generate a 64-char hex key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Expected output**: 64-character hex string (save this for both environments)

### Task 2: Configure Production .env on poopmachine
**File**: `~/platform/discord_bot/.env` (on poopmachine)

**Action**: Append these lines to the existing `.env`:
```bash
ATLAS_API_URL=https://atlas.eramos.us
NOVA_API_URL=https://login.eramos.us
NOVA_CLIENT_ID=discord-bot
NOVA_REDIRECT_URI=https://discord.eramos.us/oauth/nova/callback
TOKEN_ENCRYPTION_KEY=<KEY_FROM_TASK_1>
FLUX_API_URL=https://finance.eramos.us
APEX_API_URL=https://apex.eramos.us
MUNCHPOINTS_API_URL=https://mp.eramos.us
NEXUS_API_URL=https://nexus.eramos.us
ADMIN_API_URL=https://admin.eramos.us
EVENT_SIGNING_KEYS={"atlas":"<32+char_secret>","flux":"<32+char_secret>","apex":"<32+char_secret>"}
```

**Verification**:
```bash
ssh poop "cat ~/platform/discord_bot/.env | grep -E 'ATLAS|NOVA|FLUX|APEX|MUNCH|NEXUS|ADMIN|TOKEN_ENCRYPTION|EVENT_SIGNING'"
```
Should show all 11 new variables.

### Task 3: Restart Production Bot
```bash
ssh poop "cd ~/platform/discord_bot && docker compose up -d --no-build discord_bot"
```
**Expected output**: Container recreated, health check passes on port 3000

### Task 4: Verify Production Health
```bash
ssh poop "curl -sf http://127.0.0.1:3000/health && echo 'OK'"
```
**Expected output**: `OK` (HTTP 200)

### Task 5: Configure Local Dev .env
**File**: `~/Documents/GitHub/discord_bot/.env` (on MacBook)

**Action**: Append these lines (use local URLs for dev, or production URLs if services not running locally):
```bash
ATLAS_API_URL=http://localhost:4005
NOVA_API_URL=http://localhost:1117
NOVA_CLIENT_ID=discord-bot
NOVA_REDIRECT_URI=http://localhost:3000/oauth/nova/callback
TOKEN_ENCRYPTION_KEY=<KEY_FROM_TASK_1>
FLUX_API_URL=http://localhost:4000
APEX_API_URL=http://localhost:3004
MUNCHPOINTS_API_URL=http://localhost:420
NEXUS_API_URL=http://localhost:3000
ADMIN_API_URL=http://localhost:1118
EVENT_SIGNING_KEYS={"atlas":"dev_secret_atlas_32chars_min","flux":"dev_secret_flux_32chars_min","apex":"dev_secret_apex_32chars_min"}
```

**Note**: For Nova OAuth to work locally, either:
- Run all services locally (`npm run dev` in each), OR
- Use production Nova URL with a tunnel (ngrok/cloudflared) for the callback

### Task 6: Restart Local Bot
```bash
cd ~/Documents/GitHub/discord_bot && npm run dev
```
**Expected output**: Bot starts, connects to Discord, registers commands

### Task 7: Test Commands in Discord
1. In Discord, run `/wiki search test`
2. In Discord, run `/atlas search test`
3. Verify both return search results (not "Atlas service not configured")

## Tests / Validation
| Test | Command | Expected Result |
|------|---------|-----------------|
| Production health | `curl http://127.0.0.1:3000/health` | HTTP 200 |
| Production /wiki | `/wiki search test` in Discord | Search results embed |
| Production /atlas | `/atlas search test` in Discord | Search results embed |
| Local health | `curl http://localhost:3000/health` | HTTP 200 |
| Local /wiki | `/wiki search test` in Discord | Search results embed |

## Risks, Tradeoffs, Open Questions

1. **NOVA_REDIRECT_URI**: Must be registered in Nova's Discord OAuth client config. Current production value `https://discord.eramos.us/oauth/nova/callback` assumes a reverse proxy route exists. Verify in Nova admin.

2. **TOKEN_ENCRYPTION_KEY**: Must be identical across bot restarts. Changing it invalidates all stored Nova sessions (users must relink). Back it up securely.

3. **EVENT_SIGNING_KEYS**: Secrets must match what each service sends. Generate 32+ char random strings and configure in each service's env.

4. **Local vs Production URLs**: Using production URLs locally works but creates cross-environment traffic. Prefer local services for true isolation.

5. **Apex/MunchPoints/Nexus/Admin URLs**: Production subdomains (`apex.eramos.us`, `mp.eramos.us`, `nexus.eramos.us`) need DNS/Caddy config verified. If not routed, use direct container IPs or add routes.

6. **Nova Client ID**: `discord-bot` must exist in Nova as an OAuth client with the correct redirect URI registered.

## Files Modified
- `~/platform/discord_bot/.env` (poopmachine) — production
- `~/Documents/GitHub/discord_bot/.env` (local) — development