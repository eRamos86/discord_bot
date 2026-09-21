-- Recipient-targeted service notifications remain bot-owned: publishers submit a
-- canonical Nova subject, never a Discord destination.
ALTER TABLE notification_events ADD COLUMN IF NOT EXISTS recipient_nova_id text;

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    nova_id text NOT NULL,
    source text NOT NULL,
    event_type text NOT NULL,
    enabled boolean NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (nova_id, source, event_type),
    CHECK (length(source) BETWEEN 1 AND 80),
    CHECK (length(event_type) BETWEEN 1 AND 80)
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
    source text NOT NULL,
    event_id text NOT NULL,
    nova_id text NOT NULL,
    discord_id text NOT NULL,
    status text NOT NULL CHECK (status IN ('queued','delivered','suppressed','unlinked','failed')),
    detail text,
    created_at timestamptz NOT NULL DEFAULT now(),
    delivered_at timestamptz,
    PRIMARY KEY (source, event_id, discord_id)
);

CREATE INDEX IF NOT EXISTS notification_deliveries_nova_created
    ON notification_deliveries(nova_id, created_at DESC);
