module.exports = {
    name: 'battle',
    description: 'Start a rock paper scissors battle with an other user.',
    args: true,
    usage: `!battle <user>`,
    execute(message, args) {
        if (!message.mentions.users.size) {
            return message.reply('you need to tag a user in order to battle them!');
        }
        const otherUser = message.mentions.users.first();
        if (otherUser.bot) {
            return message.reply(`You can't battle ${otherUser}`);
        }

        message.channel.send(`**A Battle Of Rock Paper Scissors Has Begun**`);

        const filter = (reaction, user) => {
            return ['✊', '✋', '✌'].includes(reaction.emoji.name) && user.id === message.author.id || user.id === otherUser.id;
        };

        let authorChoice = null;
        let otherUserChoice = null;

        const authorMsg = message.author.send('Choose your hand!').then((msg) => {
            console.log(msg)
            msg.react('✊');
            msg.react('✋');
            msg.react('✌');

            msg.awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] })
                .then(async collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '✊') {
                        await message.channel.send(`${message.author} has chosen.`);
                        authorChoice = '✊';
                    }
                    else if (reaction.emoji.name === '✋') {
                        await message.channel.send(`${message.author} has chosen.`);
                        authorChoice = '✋';
                    }
                    else {
                        await message.channel.send(`${message.author} has chosen.`);
                        authorChoice = '✌';
                    }
                })
                .catch(collected => {
                    message.reply(`you didn't choose an option.`);
                });
        })
            .catch(e => {
                console.log(e)
            })


        const opponentMsg = otherUser.send('Choose your hand!').then((msg) => {
            msg.react('✊');
            msg.react('✋');
            msg.react('✌');

            msg.awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] })
                .then(async collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '✊') {
                        await message.channel.send(`${otherUser} has chosen.`);
                        otherUserChoice = '✊';
                    }
                    else if (reaction.emoji.name === '✋') {
                        await message.channel.send(`${otherUser} has chosen.`);
                        otherUserChoice = '✋';
                    }
                    else {
                        await message.channel.send(`${otherUser} has chosen.`);
                        otherUserChoice = '✌';
                    }
                })
                .catch(collected => {
                    message.channel.send(`${otherUser} you didn't choose an option.`)
                });

        })
            .catch(e => {
                console.log(e)
            })

            async function checkWinnner(){
                switch (authorChoice) {
                    case '✊':
                        if (otherUserChoice == '✊') {
                            await message.channel.send(`It's a draw!\n${message.author} have picked ${authorChoice} and ${otherUser} have picked ${otherUserChoice}`);
                        }
                        else if (otherUserChoice == '✋') {
                            await message.channel.send(`${otherUser} Wins!\n${message.author} have picked ${authorChoice} and ${otherUser} have picked ${otherUserChoice}`);
                        }
                        else if (otherUserChoice == '✌') {
                            await message.channel.send(`${message.author} Wins!\n${message.author} have picked ${authorChoice} and ${otherUser} have picked ${otherUserChoice}`);
                        }
                        break;
                    case '✋':
                        if (otherUserChoice == '✋') {
                            await message.channel.send(`It's a draw!\n${message.author} have picked ${authorChoice} and ${otherUser} have picked ${otherUserChoice}`);
                        }
                        else if (otherUserChoice == '✌') {
                            await message.channel.send(`${otherUser} Wins!\n${message.author} have picked ${authorChoice} and ${otherUser} have picked ${otherUserChoice}`);
                        }
                        else if (otherUserChoice == '✊') {
                            await message.channel.send(`${message.author} Wins!\n${message.author} have picked ${authorChoice} and ${otherUser} have picked ${otherUserChoice}`);
                        }
                        break;
                    case '✌':
                        if (otherUserChoice == '✌') {
                            await message.channel.send(`It's a draw!\n${message.author} had picked ${authorChoice} and ${otherUser} have picked ${otherUserChoice}`);
                        }
                        else if (otherUserChoice == '✊') {
                            await message.channel.send(`${otherUser} Wins!\n${message.author} had picked ${authorChoice} and ${otherUser} have picked ${otherUserChoice}`);
                        }
                        else if (otherUserChoice == '✋') {
                            await message.channel.send(`${message.author} Wins!\n${message.author} had picked ${authorChoice} and ${otherUser} have picked ${otherUserChoice}`);
                        }
                        break;
                    default:
                        if (otherUserChoice === null && authorChoice === null) {
                            await message.channel.send(`No one wins!\nNo one picked an option.`);
                        }
                        else if(otherUserChoice === null){
                            await message.channel.send(`${message.author} gets an automatic win\n${otherUser} did not choose an option.`);
                        }
                        else{
                            await message.channel.send(`${otherUser} gets an automatic win\n${message.author} did not choose an option.`);
                        }
                        break;
                }
            }
            const timeBattle = () =>{
                setTimeout(() =>{
                    checkWinnner();
                }, 10000)
            }
            
            timeBattle();

        



    },
};