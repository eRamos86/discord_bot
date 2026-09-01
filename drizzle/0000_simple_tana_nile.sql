CREATE TABLE "guild_settings" (
	"guild_id" text PRIMARY KEY NOT NULL,
	"prefix" text DEFAULT '---',
	"welcome" jsonb DEFAULT '{"enabled":false,"channelId":null,"title":"Welcome!","message":"{user} joined the server.","color":"#00FF00","image":null,"footer":null}'::jsonb,
	"goodbye" jsonb DEFAULT '{"enabled":false,"channelId":null,"title":"Goodbye!","message":"{user} left the server.","color":"#FF0000","image":null,"footer":null}'::jsonb,
	"logging" jsonb DEFAULT '{"enabled":false,"channelId":null,"events":{"messages":false,"edits":true,"deletions":true}}'::jsonb
);
