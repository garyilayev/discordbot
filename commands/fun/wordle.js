const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const { DEFAULT_BOARD, MAX_GUESSES } = require('./wordle/constants');
const WordleUser = require('./wordle/Model/wordleUser');

// TODO: define more structured user data when getting and saving data. 
// i.e.: User -> user.id: { id: user.id, inGame: boolean, rowIndex: Integer, didWin: boolean, secretWord?: String  }
// ? = optional. maybe secret word to everyone or maybe to each a secret word..

// TODO: add a function to ask the user if he wants to continue instea of reseting and continuing straight up.

// TODO: send the game to player's dm instead of server channel; maybe post result in channel with a message? (possible in the future).

// TODO: some later feature not critical but might be nice, add some ui keyboard indidcator. :)

module.exports = {
    name:'wordle',
    description: 'play a game of Wordle',
	args: false,
	usage: `!wordle`,
    execute(message, args) {
        // constants
       

        const words = JSON.parse(fs.readFileSync(`${__dirname}/wordle/words.json`))['words'];
        const players = JSON.parse(fs.readFileSync(`${__dirname}/wordle/wordlePlayers.json`))['players'];

        let didWin = false;

        const { author } = message;

        const userId = author.id;

        let wordleBoard = [];

        let guesses = [];

        let secret;   

        const numbersToColors = {
            0: 'normal',
            1: 'solved',
            2: 'filled'
        }
        // returns a boolean if the player won or not.
        function didPlayerWin(guess) {
            return (guess === secret);
        }

        const filter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && user.id === userId;
        };

        // const colors = {solved: ':yellow_square:', filled: ':green_square:', normal: ':brown_square:'};
        const colors = {solved: ':yellow_square:', filled: ':green_square:', normal: ':black_large_square:'};

        // returns true or false based on if the letter is in the word but at a wrong place.
        function isLetterSolved(letter) {
            return secret.includes(letter);
        }
        
        // returns true or false based on if the letter is in the word and at the right place.
        function isLetterFilled(letter, letterIndex) {
            for (let i = 0; i < secret.length; i++) {
                if (secret[i] === letter && i == letterIndex) return true;
            }
            return false;
        }
        // generates a random secret word from the word list.
        function generateSecretWord(wordsList) {
            return wordsList[Math.floor(Math.random() * (wordsList.length - 1))];
        }

        // updates the board after a guess has been taken.
        function updateBoard(guess, rowNumber, updateType) {

            const playerIndex = getUserIndex(userId);
            const player = players[playerIndex];
            const { rowIndex } = player;
            
            if (player.secretWord === '') {
                secret = generateSecretWord(words);
                player.secretWord = secret;
            }
            let guessRow = [];

            const guessLetters = Array.from(guess);
            guessLetters.forEach((letter, index) => {

                guessRow[index] = colors[numbersToColors[0]];

                if (isLetterSolved(letter)) {
                    guessRow[index] = colors[numbersToColors[1]];
                }
                
                if(isLetterFilled(letter, index)) {
                    guessRow[index] = colors[numbersToColors[2]]; 
                }
            });
            wordleBoard[rowNumber] = guessRow;

            const rowAdder = rowIndex <= (MAX_GUESSES - 1) ? 1 : 0;
            
            // update the players board in data.
            updatePlayerData(player, playerIndex, rowAdder, true, guess, player.secretWord, updateType);

        }

        // initialize the players board.
        function initBoard() {
            guesses.forEach( (guess, index) => {
                updateBoard(guess, index, 'INIT');
            });
        }

        function registerPlayer(message) {
            // write the users id to the players list.
            const player = new WordleUser(message.author.id);
            const newPlayers = JSON.stringify({"players": [...players, player]});
            fs.writeFileSync(`${__dirname}/wordle/wordlePlayers.json`, newPlayers);

            const description = `A 5 letter word is chosen, You must guess the word.\nAfter each guess a the board will update, Depending on the colors of the board this will give you an indication if your guess is correct or close.\nFor example if a box is ${colors.solved} then the letter is correct but at a wrong place.\nIf a box is ${colors.filled} then the letter is correct and at the right place.\nIf a box is ${colors.normal} then the letter is not in the secret word.\nTo start guessing type !wordle <guess>.\nGood luck!`;
            const embed = new MessageEmbed()    
            .setTitle('A game of wordle is about to begin.')
            .setColor('#d7d7d7')
            .addField('Your board:', player.board)
            .setDescription(description)
            .setTimestamp();
    
            message.channel.send(embed);
        }

        function doesContinueGame() { // if you want to send this in dms instead of in the server channel
                                    // switch message.channel and msg.channel to author.
            message.channel.send('Do you want to play another round?\nChoose a reaction to keep playing.')
            .then((msg) => {
                msg.react('✅');
                msg.react('❌');
                msg.awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] })
                .then( async collected => {
                    const reaction = collected.first();
                    switch(reaction.emoji.name) {
                        case '❌':
                            removePlayer(userId);
                            await msg.channel.send('If you want to play again, Start the game with ```!wordle```');
                            break;
                        case '✅':
                            await msg.channel.send('Generating a new word...\nTry to guess again ```!wordle <guess>```');
                            break;
                        default:
                            await msg.channel.send('You didnt choose any option..\nIf you want to play again, Start the game with ```!wordle```');
                            break;
                    }
                    return;
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }

        // reset the game and player stats and sends a message based on if they won or lost.
        function resetGame (player, didWin, playerIndex) {
            const rowAdder = (player.getRowIndex() * -1);
            const { board, rowIndex} = player;
            const embed = new MessageEmbed()
                .addField('Your board:', board)
                .setTimestamp();
            if (didWin) {
                const description = `Good job! you've guessed the correct word!\n the correct word was **${secret.toUpperCase()}**`;
                embed.setTitle('You have guessed the word!')
                .addField('Your guesses:' , `**${(rowIndex+1)}/${MAX_GUESSES}**`)
                .setColor('#2ECC71')
                .setDescription(description)

                return message.channel.send(embed).then(() => {
                    updatePlayerData(player, playerIndex, rowAdder, false, '', secret, 'RESET');
                });
            }
            const description = `So close! unfortunately you did not guess the correct word!\n the correct word was **${secret.toUpperCase()}**`;
            embed.setTitle('You have not guessed the word correctly!')
            .setColor('#ff0000')
            .setDescription(description)
                            
            return message.channel.send(embed).then(() => {
                updatePlayerData(player, playerIndex, rowAdder, false, '', secret, 'RESET');
            });
        }
        
        // returns true or false if the player exists in the players list.
        function doesPlayerExists(playerId) {
            let exists = false;
            players.forEach(player => {   
                const { id } = player;                                                                                                   
                if (id === playerId) exists = true;
            });
            return exists;
        }

        // updates the players inGame state and rowIndex.
        function updatePlayerData(player, playerIndex, rowIndex = 1, inGame = true, guess = '', secret ,updateType = 'GUESS') {
            player.inGame = inGame;
            player.secretWord = secret;

            switch(updateType) {
                case 'GUESS':
                    if (guess.length > 0) {
                        const newGuesses = [...guesses];
                        newGuesses.push(guess);
                        player.guesses = newGuesses;
                        player.rowIndex += rowIndex;
                        player.board = wordleBoard;
                        break;
                    }
                case 'RESET':
                    player.guesses = [];
                    player.board = DEFAULT_BOARD;
                    player.rowIndex += rowIndex;
                    player.secretWord = '';
                    break;
                default:
                    player.board = wordleBoard;
                    break;
            }
            
            const newPlayer = player;
            players[playerIndex] = newPlayer;
            
            const newPlayers = JSON.stringify({"players": players});
            fs.writeFileSync(`${__dirname}/wordle/wordlePlayers.json`, newPlayers);
            if ( updateType === 'RESET' ) {
                doesContinueGame();
            }
        }

        // returns the users index from the users list.
        function getUserIndex(playerId) {
            let playerIndex = 0;
            players.forEach((player, index) => {   
                const { id } = player;                                                                                                   
                if (id === playerId) playerIndex = index;
            });
            return playerIndex;
        }

        /**  removes the player from the players data list.
        @param {String} playerId 
            **/
    
        function removePlayer(playerId) {
            if (doesPlayerExists(playerId)) {
                const playerIndex = getUserIndex(playerId);
                players.splice(playerIndex, 1);
                const newPlayers = JSON.stringify({"players": [...players]});
                fs.writeFileSync(`${__dirname}/wordle/wordlePlayers.json`, newPlayers);
            }
        }

        // plays a round of wordle.
        function playRound(playerId, message) {
            const playerIndex = getUserIndex(playerId);
            const data = players[playerIndex];
            const player = new WordleUser(data.id, parseInt(data.rowIndex), true, data.guesses, data.secretWord);
            wordleBoard = player.getBoard();
            guesses = player.getGuesses();
            secret = player.getSecret();
            initBoard(player, playerIndex);

            let guess = args[0] ? args[0].toLowerCase() : '';

            if (guess.length != 5) {
                return message.channel.send("Your word is not valid or you haven't provided any guess.\nGuess a word with 5 letters only!");
            }

            didWin = didPlayerWin(guess, data.secretWord);

            
            if (didWin || (player.rowIndex + 1) === MAX_GUESSES) {
                updateBoard(guess, player.rowIndex, 'GUESS');
                return resetGame(player, didWin, playerIndex);
            }

            else {
                updateBoard(guess, player.rowIndex, 'GUESS');
            }

            const embed = new MessageEmbed()    
            .setTitle('wordle.')
            .setColor('#d7d7d7')
            // guesses.forEach((guess, index) => {
            //     (index+1) == 1 ? embed.addField(`Guess History:\n${(index+1)}.${guess.toUpperCase()}`,'\u200b', true) : embed.addField(`${(index+1)}.${guess.toUpperCase()}`, '\u200b');
            // })
            embed.addField('Your board:', player.board)
            .setDescription(`You took a guess!\nYour guess is: **${guess.length > 0 ? guess.toUpperCase() : ''}**`)
            .setTimestamp();
    
            return message.channel.send(embed);
        }

        // check if we start the game or not.
        if (doesPlayerExists(userId)) {
           playRound(userId, message);
        }

        else {
            // if player does not exist register him into db.
            registerPlayer(message);
        }
    
	},
};