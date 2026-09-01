/**
 * Client ready event handler.
 *
 * Fired once when the Discord client successfully logs in
 * and is fully initialized.
 *
 * This event is used as the final startup checkpoint for the bot,
 * confirming that:
 * - The WebSocket connection is established
 * - The bot user is available
 * - All cached data (if any) is ready to be used
 *
 * Typically used for:
 * - startup logs
 * - initialization confirmation
 * - post-login diagnostics
 */
import { presences } from '../config/presences.js';

/**
 * Executes when the client becomes ready.
 *
 * @param client Discord.js client instance (logged-in and initialized)
 */
export default {
    name: "clientReady",
    once: true,

    execute(client: any) {
        console.log(
            `\nLooks like Client is ready!\n` +
            `Logged in as ${client.user.tag}\n`
        );

        let currentIndex = 0;
        setInterval(() => {
            const presence = presences[currentIndex];
            client.user.setPresence({
                activities: [{ name: presence.text, type: presence.type }],
                status: 'online',
            });
            currentIndex = (currentIndex + 1) % presences.length;
        }, 30000); // 30 seconds
    }
};