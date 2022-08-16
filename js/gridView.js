import { CELL_WIDTH, CELL_HEIGHT, CELL_FONT_SIZE } from "./config.js";
import { setDelayMs } from "./helpers.js";

class Grid {
    #gameStyle = document.querySelector(".game").style;
    #headerStyle = document.querySelector(".header").style;
    #cellsNumbers;

    createBoard(columns, rows, _, difficulty) {
        this.#cellsNumbers = {};
        this.#gameStyle.gridTemplateColumns = `repeat( ${columns} , 1fr)`;
        this.#gameStyle.gridTemplateRows = `repeat( ${rows} , 1fr)`;
        // this.#gameStyle.width = `${CELL_WIDTH[difficulty] * columns}vh`;
        // this.#gameStyle.height = `${CELL_HEIGHT[difficulty] * rows}vh`;
        // this.#headerStyle.width = `${CELL_WIDTH[difficulty] * columns}vh`;
        // TODO: TEMPORARY
        this.#gameStyle.width = `${CELL_WIDTH[difficulty] * columns}rem`;
        this.#gameStyle.height = `${CELL_HEIGHT[difficulty] * rows}rem`;

        this.#headerStyle.maxWidth = `${CELL_WIDTH[difficulty] * columns}rem`;

        const markup = this.#generateCells(rows, columns);

        this.#printToGameBoard(markup);

        const gameCells = document.querySelectorAll(".game__cell");
        gameCells.forEach(el => (el.fontSize = `${CELL_FONT_SIZE[difficulty]}rem`));
        this.#generateCrossPattern(columns);
    }

    addWaterTo(cords) {
        const element = document.querySelector(`.game__cell--${cords}`);
        element.style.transition = "all 3s";
        if (element.classList.contains("game__cell--odd")) {
            element.style.backgroundColor = "#84c4f7";
        }

        if (element.classList.contains("game__cell--even")) {
            element.style.backgroundColor = "#8fcaf9";
        }
    }

    async addGrassTo(cords) {
        const element = document.querySelector(`.game__cell--${cords}`);
        element.style.border = "none";
        element.style.boxShadow = "none";
        element.style.transition = "all 1.5s";
        element.style.backgroundColor = "#9db66a";
        await setDelayMs(1500);
        element.style.backgroundColor = "#62ad50";
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
