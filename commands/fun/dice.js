const { MessageEmbed } = require('discord.js');

module.exports = {
    name:'dice',
    description: 'Bet some money and roll a dice against the bot.',
	args: false,
	usage: `!dice <amount>`,
    execute(message, args) {
        const user = message.author;
		let amount = args[0] ? parseInt(args[0]) : null;
        if (amount) {
            let userDice = Math.floor(Math.random() * 6) + 1;
            let botDice = Math.floor(Math.random() * 6) + 1;
            const embed = new MessageEmbed();
            const diceStats = `**${user.username} : ${userDice}** \n **Bot Helper : ${botDice} **`
            message.channel.send('Rolling dice...');
            if (userDice > botDice) {
                embed.setTitle(`${user.username} won the dice roll!`);
                embed.addField(`${user.username} got ${(amount * 2)}`,'\u200B');
            }
            else if (userDice < botDice) {
                embed.setTitle('Bot Helper won the dice roll!');
                embed.addField(`${user.username} just lost ${amount}!`,'\u200B');
            }
            else {
                message.channel.send(`Its a draw!`);
            }
            embed.setDescription(`${diceStats}`);
            embed.setColor('#9f33ff').setTimestamp();
            return message.channel.send(embed);
        }
        return message.channel.send(`You can only roll the dice if you bet some money.\n${this.usage}`)
    }
}