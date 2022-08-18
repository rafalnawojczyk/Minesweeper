import { CELL_WIDTH, CELL_HEIGHT, PHONE_WIDTH } from "./config.js";
import { setDelayMs } from "./helpers.js";

class Grid {
    #gameStyle = document.querySelector(".game").style;
    #headerStyle = document.querySelector(".header").style;
    #body = document.querySelector("body").style;
    #container = document.querySelector(".container").style;
    #summary = document.querySelector(".summary").style;
    #allCells = {};
    #cellsNumbers;

    createBoard(columns, rows, _, difficulty) {
        let cellWidth = CELL_WIDTH[difficulty];
        let cellHeight = CELL_HEIGHT[difficulty];

        if (window.innerWidth < PHONE_WIDTH) {
            // cell dimensions in rems
            cellWidth = cellHeight = Number(this.#calculateCellDimensions(columns, rows));

            // container should be fixed to top of the screen
            // ********************* PERFORMANCE TEST *********************

            this.#container.cssText += `position: fixed; top: 0; left: 0; transform: translate(0,0); height: 100vh;`;
            // this.#container.position = "fixed";
            // this.#container.top = "0";
            // this.#container.left = "0";
            // this.#container.transform = "translate(0, 0)";
            // this.#container.height = "100vh";

            this.#summary.width = "85vw";

            // ********************* PERFORMANCE TEST *********************
            this.#gameStyle.cssText += `position: absolute; left: 50%; top: ${this.#calcMobileTopMargin(
                rows,
                cellWidth
            )}rem; transform: translateX(-50%)`;
            // this.#gameStyle.position = "absolute";
            // this.#gameStyle.left = "50%";
            // this.#gameStyle.top = `${this.#calcMobileTopMargin(rows, cellWidth)}rem`;
            // this.#gameStyle.transform = "translateX(-50%)";

            this.#headerStyle.width = `100%`;
        } else {
            this.#headerStyle.maxWidth = `${cellWidth * columns}rem`;
        }

        this.#cellsNumbers = {};
        // ********************* PERFORMANCE TEST *********************
        this.#gameStyle.cssText += `grid-template-columns: repeat( ${columns} , 1fr); grid-template-rows: repeat( ${rows} , 1fr); width: ${
            cellWidth * columns
        }rem; height: ${cellHeight * rows}rem`;

        // this.#gameStyle.gridTemplateColumns = `repeat( ${columns} , 1fr)`;
        // this.#gameStyle.gridTemplateRows = `repeat( ${rows} , 1fr)`;

        // this.#gameStyle.width = `${cellWidth * columns}rem`;
        // this.#gameStyle.height = `${cellHeight * rows}rem`;

        const markup = this.#generateCells(rows, columns, cellWidth);

        this.#printToGameBoard(markup);

        // const gameCells = document.querySelectorAll(".game__cell");
        // gameCells.forEach(el => (el.style.fontSize = `${cellWidth - 0.8}rem`));
        this.#generateCrossPattern(columns);
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
        // ********************* PERFORMANCE TEST *********************

        element.style.cssText +=
            "border: none; box-shadow: none; transition: all 1.5s; background-color: #9db66a;";
        // element.style.border = "none";
        // element.style.boxShadow = "none";
        // element.style.transition = "all 1.5s";
        // element.style.backgroundColor = "#9db66a";
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
        let newDiv = "";

        for (let i = 0; i < rows; i++) {
            for (let y = 0; y < columns; y++) {
                // new way:
                const element = document.createElement("div");
                const cords = i + "x" + y;
                element.classList.add("game_cell");
                element.classList.add(`game__cell--${cords}`);

                // old way
                newDiv += `<div class="game__cell game__cell--${i}x${y}" style"font-size:${
                    cellWidth - 0.8
                }rem;"> </div>`;
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
