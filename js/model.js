class State {
    difficulty = {
        // columns, rows, bombs
        easy: [10, 8, 10],
        med: [18, 14, 40],
        hard: [24, 20, 99],
    };

    phoneDifficulty = {
        // columns, rows, bombs
        easy: [10, 8, 10],
        med: [14, 18, 40], // PHONE MED
        hard: [15, 28, 89], // PHONE HARD
    };

    #cellsNumbers;
    #movesCounter = 0;
    #flagCounter;
    #actualDifficulty = "med";
    #unopenedCellsCounter;
    #unopenedCells = [];
    #flagCords = [];
    #bombCells = [];
    #highScore = {
        easy: 0,
        med: 0,
        hard: 0,
    };

    getScoreFromLocalStorage() {
        const data = localStorage.getItem("highscore");
        if (!data) return;
        this.#highScore = JSON.parse(data);
    }

    #saveToLocalStorage() {
        localStorage.setItem("highscores", this.#highScore);
    }

    checkForHighScore(score) {
        if (this.#highScore[this.#actualDifficulty] === 0) return true;

        return score < this.#highScore[this.#actualDifficulty];
    }

    saveHighScore(score) {
        this.#highScore[this.#actualDifficulty] = score;
        this.#saveToLocalStorage();
    }

    getAllCellsWithBombs() {
        for (let key in this.#cellsNumbers) {
            if (this.#cellsNumbers[key] > 50) this.#bombCells.push(key);
        }
        return this.#bombCells;
    }

    getAllCellsWithNumbers() {
        const cellsWithNumbers = [];
        for (let key in this.#cellsNumbers) {
            if (this.#cellsNumbers[key] >= 0 && this.#cellsNumbers[key] <= 9)
                cellsWithNumbers.push(key);

            if (this.#cellsNumbers[key] > 50) this.#bombCells.push(key);
        }
        return cellsWithNumbers;
    }

    getBombCells() {
        return this.#bombCells;
    }

    cordsHaveFlag(cords) {
        return this.#flagCords.includes(cords);
    }

    getElementsWithFlags() {
        const elementsWithFlag = this.#flagCords.map(cords => {
            if (!this.cordsHaveFlag(cords)) return;
            return document.querySelector(`.game__cell--${cords}`);
        });

        return elementsWithFlag;
    }

    getFlagsCounter() {
        return this.#flagCounter;
    }

    deleteFlagCords(cords) {
        const index = this.#flagCords.indexOf(cords);
        if (index > -1) {
            this.#flagCords.splice(index, 1);
        }
    }

    addFlagCords(cords) {
        this.#flagCords.push(cords);
    }

    setFlagCounter(diff) {
        this.#flagCounter = this.difficulty[diff][2];
        return this.#flagCounter;
    }

    isGameFinished() {
        return this.#unopenedCellsCounter - this.#unopenedCells.length === 0;
    }

    saveOpenedCells(cords) {
        cords.forEach(el => {
            if (this.#unopenedCells.includes(el)) return;
            this.#unopenedCells.push(el);
        });
    }

    setActualDifficulty(diff) {
        this.#actualDifficulty = diff;
        this.#setUnopenedCellsCounter(diff);
    }

    #setUnopenedCellsCounter(diff) {
        const value =
            this.difficulty[diff][0] * this.difficulty[diff][1] - this.difficulty[diff][2];
        this.#unopenedCellsCounter = value;
    }

    reset() {
        this.#movesCounter = 0;
        this.#cellsNumbers = undefined;
        this.#flagCounter = undefined;
        this.#unopenedCells.length = 0;
        this.#flagCords.length = 0;
        this.#bombCells.length = 0;
    }

    getActualDifficulty() {
        return this.#actualDifficulty;
    }

    increaseFlagCounter() {
        this.#flagCounter++;
        return this.#flagCounter;
    }

    decreaseFlagCounter() {
        this.#flagCounter--;
        return this.#flagCounter;
    }

    cellIsNumber(cords) {
        return this.#cellsNumbers[cords] < 50 && this.#cellsNumbers[cords] > 0;
    }

    getCellNumber(cords) {
        return this.#cellsNumbers[cords];
    }

    movesCounterAdd() {
        this.#movesCounter++;
    }

    getMovesCounter() {
        return this.#movesCounter;
    }

    setCellsNumbers(obj) {
        this.#cellsNumbers = obj;
    }

    getCellsNumbers(obj) {
        return this.#cellsNumbers;
    }

    updateCellsNumbers(obj) {
        for (const key in this.#cellsNumbers) {
            if (obj.hasOwnProperty([key])) {
                this.#cellsNumbers[key] = obj[key];
            }
        }
    }
}

export default new State();
