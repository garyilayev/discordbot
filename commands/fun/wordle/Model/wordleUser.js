module.exports = class WordleUser { 
    constructor(id, rowIndex = 0, inGame = false, guesses = [],  secretWord = '', board = [["⬛","⬛","⬛","⬛","⬛"],["⬛","⬛","⬛","⬛","⬛"],["⬛","⬛","⬛","⬛","⬛"],["⬛","⬛","⬛","⬛","⬛"],["⬛","⬛","⬛","⬛","⬛"], ["⬛","⬛","⬛","⬛","⬛"]]){
        this.id = id;
        this.rowIndex = rowIndex;
        this.inGame = inGame;
        this.guesses = guesses;
        this.secretWord = secretWord;
        this.board = board;
    }

    // setBoard(board) {
    //     this.board = board;
    // }

    getId() {
        return this.id;
    }

    getRowIndex() {
        return this.rowIndex;
    }

    getGuesses() {
        return this.guesses;
    }

    getBoard() {
        return this.board;
    }

    getSecret() {
        return this.secretWord;
    }
}

