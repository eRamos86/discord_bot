ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 0;
ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS automod jsonb;
ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS security jsonb;
ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS ticket_settings jsonb;
ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS roles jsonb;
ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS leveling jsonb;
ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS economy jsonb;
ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS permissions jsonb;
ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS disabled_commands jsonb;
CREATE TABLE IF NOT EXISTS user_economy (user_id text PRIMARY KEY, balance text DEFAULT '0');
CREATE TABLE IF NOT EXISTS tickets (ticket_id text PRIMARY KEY, guild_id text NOT NULL, channel_id text NOT NULL, author_id text NOT NULL, status text DEFAULT 'open');
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT 'Support';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS claimed_by text;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closed_at timestamptz;
CREATE INDEX IF NOT EXISTS tickets_guild_channel ON tickets(guild_id,channel_id);
CREATE TABLE moderation_cases (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, guild_id text NOT NULL, action text NOT NULL,
    target_id text NOT NULL, moderator_id text NOT NULL, reason text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(), duration_seconds integer, expires_at timestamptz,
    message_id text, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','revoked'))
);
CREATE INDEX cases_guild_target ON moderation_cases(guild_id,target_id,id DESC);
CREATE TABLE case_history (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, guild_id text NOT NULL, case_id bigint NOT NULL REFERENCES moderation_cases(id),
    actor_id text NOT NULL, action text NOT NULL, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE guild_wallets (
    guild_id text NOT NULL, user_id text NOT NULL, balance bigint NOT NULL DEFAULT 0 CHECK(balance >= 0 AND balance <= 9007199254740991),
    daily_at timestamptz, work_at timestamptz, PRIMARY KEY(guild_id,user_id)
);
CREATE TABLE economy_ledger (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, guild_id text NOT NULL, user_id text NOT NULL, amount bigint NOT NULL,
    reason text NOT NULL, reference text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ledger_guild_user ON economy_ledger(guild_id,user_id,id DESC);
CREATE TABLE inventory (
    guild_id text NOT NULL,user_id text NOT NULL,item_id text NOT NULL,quantity integer NOT NULL CHECK(quantity > 0), PRIMARY KEY(guild_id,user_id,item_id)
);
CREATE TABLE member_levels (guild_id text NOT NULL,user_id text NOT NULL,xp bigint NOT NULL DEFAULT 0 CHECK(xp >= 0),last_awarded_at timestamptz,PRIMARY KEY(guild_id,user_id));
CREATE TABLE jobs (
    id text PRIMARY KEY, kind text NOT NULL, guild_id text, user_id text, payload jsonb NOT NULL, run_at timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','running','completed','failed','cancelled')),
    attempts integer NOT NULL DEFAULT 0, max_attempts integer NOT NULL DEFAULT 5,
    lease_until timestamptz, lease_token text, last_error text, created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz
);
CREATE INDEX jobs_due ON jobs(run_at) WHERE status IN ('pending','running');
CREATE TABLE notification_events (source text NOT NULL,id text NOT NULL,type text NOT NULL,body_hash text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(source,id));
CREATE TABLE notification_routes (
    id text PRIMARY KEY,source text NOT NULL,event_type text NOT NULL,guild_id text NOT NULL,channel_id text,user_id text,
    enabled boolean NOT NULL DEFAULT false,CHECK ((channel_id IS NULL) <> (user_id IS NULL)),UNIQUE(source,event_type,guild_id,channel_id),UNIQUE(source,event_type,guild_id,user_id)
);
CREATE TABLE nova_sessions (discord_id text PRIMARY KEY, nova_id text NOT NULL, encrypted_token text NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE oauth_states (state_hash text PRIMARY KEY, discord_id text NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE role_mappings (guild_id text NOT NULL,project text NOT NULL,nova_role text NOT NULL,discord_role_id text NOT NULL,PRIMARY KEY(guild_id,project,nova_role,discord_role_id));
CREATE TABLE channel_locks (guild_id text NOT NULL,channel_id text NOT NULL,previous_send boolean,PRIMARY KEY(guild_id,channel_id));
CREATE TABLE polls (id text PRIMARY KEY,guild_id text NOT NULL,channel_id text NOT NULL,message_id text,author_id text NOT NULL,question text NOT NULL,choices jsonb NOT NULL,closed boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE poll_votes (poll_id text NOT NULL REFERENCES polls(id),guild_id text NOT NULL,user_id text NOT NULL,choice integer NOT NULL,PRIMARY KEY(poll_id,user_id));
CREATE TABLE afk_status (guild_id text NOT NULL,user_id text NOT NULL,reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(guild_id,user_id));
CREATE TABLE sticky_messages (guild_id text NOT NULL,channel_id text NOT NULL,content text NOT NULL,message_id text,last_sent_at timestamptz,PRIMARY KEY(guild_id,channel_id));
CREATE TABLE bot_state (key text PRIMARY KEY,value jsonb NOT NULL);
