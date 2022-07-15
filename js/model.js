class State {
    difficulty = {
        // columns, rows, bombs
        easy: [10, 8, 10],
        med: [18, 14, 40],
        hard: [24, 20, 99],
    };
    #cellsNumbers;
    #movesCounter = 0;

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
