const fs = require('fs');
const { Discord, Client, Collection} = require('discord.js');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
const prefix = '!';

const client = new Client;
client.commands = new Collection();
client.events = new Collection();

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}


client.once('ready', () => {
	console.log('Ready!');
});


client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

	if (command.usage) {
		reply += `\nThe proper usage would be: \`${command.usage}\``;
	}

	return message.channel.send(reply);
    }

    try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(`${process.env.TOKEN}`);