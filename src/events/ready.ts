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
export default {
    name: "clientReady",
    once: true,

    /**
     * Executes when the client becomes ready.
     *
     * @param client Discord.js client instance (logged-in and initialized)
     */
    execute(client: any) {
        console.log(
            `\nLooks like Client is ready!\n` +
            `Logged in as ${client.user.tag}\n`
        );
    }
};