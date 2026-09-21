#!/usr/bin/env bash
# ==============================================================================
# poopmachine-setup.sh
# Production configuration runbook for Discord Bot on poopmachine (100.119.115.13)
# ==============================================================================
set -euo pipefail

cat << "EOF"
================================================================================
 Discord Bot — poopmachine Platform Configuration Runbook
================================================================================

1. CLOUDFLARE TUNNEL CONFIGURATION (~/.cloudflared/config.yml)
--------------------------------------------------------------------------------
Add the following ingress entry under 'ingress:' before the 404 catch-all rule:

  - hostname: discord.eramos.us
    service: http://127.0.0.1:3005

Full ingress example on poopmachine:
  ingress:
    - hostname: mp.eramos.us
      service: http://127.0.0.1:420
    - hostname: eramos.us
      service: http://127.0.0.1:3000
    - hostname: atlas.eramos.us
      service: http://127.0.0.1:4006
    - hostname: apex.eramos.us
      service: http://127.0.0.1:3004
    - hostname: flux.eramos.us
      service: http://127.0.0.1:4009
    - hostname: finance.eramos.us
      service: http://127.0.0.1:4009
    - hostname: login.eramos.us
      service: http://127.0.0.1:1117
    - hostname: admin.eramos.us
      service: http://127.0.0.1:1118
    - hostname: discord.eramos.us
      service: http://127.0.0.1:3005
    - service: http_status:404

Validate and restart cloudflared:
  cloudflared tunnel ingress validate
  sudo systemctl restart cloudflared

--------------------------------------------------------------------------------
2. NOVA PROJECT REGISTRATION (OAuth Client for discord-bot)
--------------------------------------------------------------------------------
Register 'discord-bot' in Nova database so the OAuth flow allows the callback:

Run this SQL against the Nova PostgreSQL database:

INSERT INTO projects (
    slug,
    name,
    description,
    redirect_uris,
    allowed_origins,
    auto_grant_on_register,
    default_role_id
) VALUES (
    'discord-bot',
    'Discord Bot',
    'Ecosystem Discord Bot Gateway',
    ARRAY['https://discord.eramos.us/oauth/nova/callback'],
    ARRAY['https://discord.eramos.us'],
    true,
    'user'
)
ON CONFLICT (slug) DO UPDATE SET
    redirect_uris = ARRAY['https://discord.eramos.us/oauth/nova/callback'],
    allowed_origins = ARRAY['https://discord.eramos.us'];

--------------------------------------------------------------------------------
3. DISCORD BOT DOCKER COMPOSE CONFIGURATION
--------------------------------------------------------------------------------
In the discord-bot deployment directory on poopmachine:

Ensure .env contains:
  ATLAS_API_URL=https://atlas.eramos.us
  NOVA_API_URL=https://login.eramos.us
  NOVA_CLIENT_ID=discord-bot
  NOVA_REDIRECT_URI=https://discord.eramos.us/oauth/nova/callback
  TOKEN_ENCRYPTION_KEY=e29ab762bc31db64f26a6fba182f11d5339d9e31e49265079c7a6b19e91305b7
  FLUX_API_URL=https://finance.eramos.us
  APEX_API_URL=https://apex.eramos.us
  MUNCHPOINTS_API_URL=https://mp.eramos.us
  NEXUS_API_URL=https://eramos.us
  ADMIN_API_URL=https://admin.eramos.us

Deploy via docker compose (with host port 3005:3000):
  docker compose down
  docker compose up -d --build

Test live healthcheck:
  curl -fsS http://127.0.0.1:3005/health
  curl -fsS https://discord.eramos.us/health

================================================================================
EOF
