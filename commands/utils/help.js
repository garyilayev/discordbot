const fs = require('fs');
const { MessageEmbed } = require('discord.js');
// const { Message } = require('discord.js');

module.exports = {
    name:'help',
    description: 'A general help command that shows ',
	args: false,
	usage: `!help <command>`,
    execute(message, args) {
		let commandName = args[0];
        if (!commandName){
            const embed = new MessageEmbed()    
            .setTitle('A command list of all the available commands:')
            .setColor('#d7d7d7')    
            .setDescription('For more info about a command type `!help <command>`')
            .setTimestamp();
            const path = __dirname.substr(0, (__dirname.length-6));
            const commandFolders = fs.readdirSync(`${path}`);
            for (const folder of commandFolders) {
                const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const command = require(`${path}/${folder}/${file}`);
                    embed.addField(`${command.name}`, `${command.description}`);
                }
            }
			return message.channel.send(embed);
		}
        // console.log(commandName);
        commandName = commandName.toLowerCase();
		const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (command) {
            const embed = new MessageEmbed()
            .setTitle(`${command.name.toUpperCase()}`)
            .setDescription(`${command.description}\n${command.usage}`)
            .setColor('#7289da')
            .setTimestamp();
            return message.channel.send(embed);
        }
        return message.channel.send(`${commandName} is not a valid command.\nPlease use ``${this.usage}```);
	},
};