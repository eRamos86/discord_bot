export default {
    name: "clientReady",
    once: true,

    execute(client: any) {
        console.log(`Logged in as ${client.user.tag}`);
    }
};