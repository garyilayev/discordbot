module.exports = {
	name: 'info',
	description: 'Display info about yourself or another user by tagging them.',
	args: false,
	usage: `!info <user>`,
	execute(message) {
		const mentions = message.mentions.users.size;
		if (!mentions){
			return message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
		}
		const user = message.mentions.users.first(); 
		return message.channel.send(`Your username: ${user.username}\nYour ID: ${user.id}`);
	},
};