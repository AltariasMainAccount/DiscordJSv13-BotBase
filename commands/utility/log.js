const { MessageEmbed, MessageAttachment } = require('discord.js');
const moment = require('moment');
const path = require('path');
var fs = require('fs');

async function fetchMore(interaction, channel_id, limit = 250) {
    if (limit <= 100) { return await interaction.guild.channels.cache.get(channel_id).messages.fetch({ limit: limit }); }
  
    let messageData = []
    let tempFetch = []
    let lastId = null;
    let options = {};
    let remaining = limit;
  
    while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;
      
        if (lastId) { options.before = lastId; }
        let messages = await interaction.guild.channels.cache.get(channel_id).messages.fetch(options);
  
        if (!messages.last()) {break;}
  
        // Concat and Delete
        
        tempFetch.push(Array.from(messages));

        lastId = messages.last().id;
    }
    
    let prevElement;
    tempFetch.forEach(element => {
        if (!prevElement) { prevElement = element }
        else { prevElement = prevElement.concat(element) }
    });
    messageData = prevElement;
    messageData.reverse();
    return messageData;
}

module.exports = {
    name: 'log',
    description: 'Delivers a log file of the selected amount of messages within the channel the command was used in',
    async execute (interaction) {
        await interaction.reply("Please wait.")
        
        const amount = interaction.options.getInteger('amount')
        const msg = await interaction.fetchReply();
        
        const currentChannel = await interaction.channelId;
        const fetchResult = await fetchMore(interaction, currentChannel, amount);
        const fetchedMessageArray = []

        fetchedMessageArray.push(`Utility Bot - Log of Channel ${interaction.channelId} in Guild ${interaction.guildId}`, `Date of Log - ${moment().format()} | Amount of messages logged (requested): ${amount}`, ` `, `-- LOG STARTED --`, ` `)

        for (const [k, v] of fetchResult) {
            let regex = /<@!?[0-9]+>/gmi
            let author = v.author.username;
            let botBool = v.author.bot;
            let temp = v.content;

            let message = temp.replaceAll(regex, "<MENTION>")
            let fixedMessage = message.replaceAll("\n", "<n>")

            let timestamp = new Date(v.createdTimestamp);
            
            if (botBool) { fetchedMessageArray.push(`<${moment.unix(timestamp).format()}> [BOT] ${author}: ${fixedMessage}`) }
            else { fetchedMessageArray.push(`<${moment.unix(timestamp).format()}> ${author}: ${fixedMessage}`) }  
        }
        
        fetchedMessageArray.push(` `, `-- LOG ENDED --`, ` `)

        var file = fs.createWriteStream("./logs/log_temp.txt");
        file.on('error', function(err) { console.log(err) });
        fetchedMessageArray.forEach(element => { file.write(element + '\n'); });
        file.end();

        console.log(interaction.member.user.username + "#" + interaction.member.user.discriminator + " requested a log of a channel.")
        await interaction.member?.send({ files: [{
            attachment: path.resolve(".\\logs\\log_temp.txt"),
            name: 'logfile.txt'
        }] }).then(async () => {
            await interaction.editReply("File sent to user.")
        }).catch(error => {
            console.log(error)
        })
    }
}