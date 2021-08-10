// Invite Link - https://discord.com/api/oauth2/authorize?client_id=872362638313676810&permissions=240988449984&scope=bot%20applications.commands

// Imports
const Discord = require("discord.js");
require("dotenv").config();
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Bot prepare
const Bot = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
Bot.commands = new Discord.Collection();


// Advanced Command Handler
const registerFolders = [ // Register the names of the folders that you want to check
    "utility" 
]

for (const folder of registerFolders) {
    const path = `./commands/${folder}/`;
    let commandFiles = fs.readdirSync(path).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path + file);
        Bot.commands.set(command.name, command);
    }
}

// Code
Bot.once("ready", () => {
    console.log("Bot is now running.")
    Bot.user.setPresence({ activities: [{ name: 'a few dozen users', type: "WATCHING" }], status: 'idle' })
})

Bot.on('messageCreate', async message => {
	if (!Bot.application.owner) await Bot.application.fetch();

	if (message.content.toLowerCase() === '!deploy' && message.author.id === Bot.application.owner.id) {
		const data = [
            {
			    name: 'ping',
			    description: 'Replies with Pong!',
                options: []
		    },
            {
                name: 'log',
                description: 'Delivers a log file of the selected amount of messages within the channel the command was used in',
                options: [
                    {
                        name: 'amount',
                        type: 'INTEGER',
                        description: 'The amount of messages to log.',
                        required: true,
                    },
                ]
            }
        ];

		await Bot.guilds.cache.get(message.guild.id).commands.set(data);
	}
});

Bot.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	if (!Bot.commands.has(interaction.commandName)) return;

	try {
		await Bot.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

Bot.login(process.env.BOT_TOKEN);