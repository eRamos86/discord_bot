import { Client } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    'Guilds',
    'GuildMembers',
    'GuildMessages',
    'MessageContent'
  ]
});

// Simple health check - just check if client is ready
client.once('ready', () => {
  console.log('Health check: Bot is ready');
  process.exit(0);
});

client.on('error', (error) => {
  console.error('Health check: Discord client error:', error);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('Health check: Timeout waiting for ready event');
  process.exit(1);
}, 10000);

client.login(process.env.DISCORD_TOKEN!);