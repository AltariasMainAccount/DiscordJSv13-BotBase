module.exports = {
    name: 'ping',
    description: 'Replies with a simple reply.',
    async execute(interaction) {
        await interaction.reply('Pong!');
    }
}