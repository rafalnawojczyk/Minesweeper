import { CELL_WIDTH, CELL_HEIGHT } from "./config.js";

class Grid {
    #gameStyle = document.querySelector(".game").style;
    #cellsNumbers = {};

    createBoard(columns, rows, bombs, difficulty) {
        this.#gameStyle.gridTemplateColumns = `repeat( ${columns} , 1fr)`;
        this.#gameStyle.gridTemplateRows = `repeat( ${rows} , 1fr)`;
        this.#gameStyle.width = `${CELL_WIDTH[difficulty] * columns}vh`;
        this.#gameStyle.height = `${CELL_HEIGHT[difficulty] * rows}vh`;
        this.#gameStyle.marginTop = `${(100 - parseInt(this.#gameStyle.height)) / 2}vh`;

        const markup = this.#generateCells(rows, columns);

        this.#printToGameBoard(markup);

        this.#generateCrossPattern(columns);
    }

    getCellsNumbers() {
        return this.#cellsNumbers;
    }

    #generateCells(rows, columns) {
        let newDiv = "";

        for (let i = 0; i < rows; i++) {
            for (let y = 0; y < columns; y++) {
                newDiv += `<div class="game__cell game__cell--${i}x${y}"> </div>`;
                this.#cellsNumbers[i + "x" + y] = 0;
            }
        }

        return newDiv;
    }

    #printToGameBoard(element) {
        document.querySelector(".game").innerHTML = element;
    }

    #generateCrossPattern(columns) {
        let counter = 0;
        let rowNumber = columns - 1;

        document.querySelectorAll(".game__cell").forEach(el => {
            counter % 2
                ? el.classList.add("game__cell--even")
                : el.classList.add("game__cell--odd");
            if (counter === rowNumber) {
                if (rowNumber === columns - 1) {
                    rowNumber = columns;
                    counter = 1;
                } else if (rowNumber === columns) {
                    rowNumber = columns - 1;
                    counter = 0;
                }
            } else {
                counter++;
            }
        });
    }
}

export default new Grid();
