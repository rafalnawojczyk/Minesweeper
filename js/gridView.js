import { CELL_WIDTH, CELL_HEIGHT, PHONE_WIDTH } from "./config.js";
import { setDelayMs } from "./helpers.js";

class Grid {
    #gameStyle = document.querySelector(".game").style;
    #game = document.querySelector(".game");
    #headerStyle = document.querySelector(".header").style;
    #body = document.querySelector("body").style;
    #container = document.querySelector(".container").style;

    #allCells = {};
    #cellsNumbers;

    createBoard(columns, rows, _, difficulty) {
        this.#clearAllCells();
        this.#game.innerHTML = "";
        let cellWidth = CELL_WIDTH[difficulty];
        let cellHeight = CELL_HEIGHT[difficulty];

        if (window.innerWidth < PHONE_WIDTH) {
            // cell dimensions in rems
            cellWidth = cellHeight = Number(this.#calculateCellDimensions(columns, rows));

            // container should be fixed to top of the screen
            this.#container.cssText += `position: fixed; top: 0; left: 0; transform: translate(0,0); height: 100vh;`;

            this.#gameStyle.cssText += `position: absolute; left: 50%; top: ${this.#calcMobileTopMargin(
                rows,
                cellWidth
            )}rem; transform: translateX(-50%)`;

            this.#headerStyle.width = `100%`;
        } else {
            this.#headerStyle.maxWidth = `${cellWidth * columns}rem`;
        }

        this.#cellsNumbers = {};

        this.#gameStyle.cssText += `grid-template-columns: repeat( ${columns} , 1fr); grid-template-rows: repeat( ${rows} , 1fr); width: ${
            cellWidth * columns
        }rem; height: ${cellHeight * rows}rem`;

        const markup = this.#generateCells(rows, columns, cellWidth);

        this.#printToGameBoard(markup);

        this.#generateCrossPattern(columns);

        return this.#allCells;
    }

    #clearAllCells() {
        for (const key in this.#allCells) {
            delete this.#allCells[key];
        }
    }

    setBackground(width) {
        this.#body.backgroundColor = width < PHONE_WIDTH ? "#578a34" : "#faf8ef";
    }

    #calcMobileTopMargin(rows, cellWidth) {
        const headerHeight = document.querySelector(".header").getBoundingClientRect().height;

        const marginTop =
            (window.innerHeight / 10 - (rows * cellWidth - (headerHeight / 10).toFixed(2))) / 2;

        return marginTop.toFixed(2);
    }

    addWaterTo(cords, allCells) {
        const element = allCells[cords];

        if (element.classList.contains("game__cell--odd")) {
            element.style.cssText += "background-color: #84c4f7; transition: all 3s;";
        } else if (element.classList.contains("game__cell--even")) {
            element.style.cssText += "background-color: #8fcaf9; transition: all 3s;";
        }
    }

    async addGrassTo(cords, allCells) {
        const element = allCells[cords];

        element.style.cssText +=
            "border: none; box-shadow: none; transition: all 1.5s; background-color: #9db66a;";

        await setDelayMs(1500);
        element.style.backgroundColor = "#62ad50";
    }

    getCellsNumbers() {
        return this.#cellsNumbers;
    }

    #calculateCellDimensions(columns, rows) {
        const height = ((window.innerHeight * 0.85) / rows / 10).toFixed(2);
        const width = ((window.innerWidth * 0.85) / columns / 10).toFixed(2);

        return height > width ? width : height;
    }

    #generateCells(rows, columns, cellWidth) {
        for (let i = 0; i < rows; i++) {
            for (let y = 0; y < columns; y++) {
                const element = document.createElement("div");
                const cords = i + "x" + y;
                element.classList.add("game__cell", `game__cell--${cords}`);
                element.style.fontSize = `${cellWidth * 0.7}rem`;
                this.#cellsNumbers[cords] = 0;
                this.#allCells[cords] = element;
            }
        }

        return this.#allCells;
    }

    #printToGameBoard(arrayOfDivs) {
        for (let key in arrayOfDivs) {
            this.#game.appendChild(arrayOfDivs[key]);
        }
    }

    #generateCrossPattern(columns) {
        let counter = 0;
        let rowNumber = columns - 1;

        for (let key in this.#allCells) {
            const el = this.#allCells[key];

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
        }
    }
}

export default new Grid();
