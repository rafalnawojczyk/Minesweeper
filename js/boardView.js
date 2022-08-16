import { FIRST_BORDER, BORDER_INITIAL, BORDER_CHANGED } from "./config.js";
import { generateAdjacentCordsArray } from "./helpers.js";

class Board {
    #bombsPlacements = {};
    #cellsPlacements = {};
    #lastHighlighted;
    #cellsWithBorders = {};

    placeBombs(columns, rows, bombs, that) {
        this.#protectCellsAroundClick(that);

        while (bombs > 0) {
            const xCord = Math.floor(Math.random() * rows);
            const yCord = Math.floor(Math.random() * columns);
            const cords = xCord + "x" + yCord;

            if (!this.#bombsPlacements.hasOwnProperty(cords)) {
                this.#bombsPlacements[cords] = true;
                this.#cellsPlacements[cords] = 99;
                this.#calcCellsAround(xCord, yCord);
                bombs--;
            }
        }
    }

    reset() {
        this.#bombsPlacements = {};
        this.#cellsPlacements = {};
        this.#lastHighlighted = undefined;
        this.#cellsWithBorders = {};
    }
    getCellsPlacementObj() {
        return this.#cellsPlacements;
    }

    #cleanAllBorders() {
        for (let cords in this.#cellsWithBorders) {
            const elem = document.querySelector(`.game__cell--${cords}`);
            if (elem) {
                elem.style.boxShadow = "none";
            }
        }

        for (const prop of Object.getOwnPropertyNames(this.#cellsWithBorders)) {
            delete this.#cellsWithBorders[prop];
        }
    }

    #cellIsNumber(cell) {
        return cell.textContent < 50 && cell.textContent > 0;
    }

    addCellBorders(cellsWithNumbers) {
        this.#cleanAllBorders();

        //print new borders
        cellsWithNumbers.forEach(cords => {
            const [x, y] = cords.split("x");
            const sideCordsArr = generateAdjacentCordsArray(x, y, true);

            // firstly add all sides that needs border to the array
            sideCordsArr.forEach((cords, index) => {
                const cell = document.querySelector(`.game__cell--${cords}`);
                if (cell && !cell.classList.contains("clicked") && !this.#cellIsNumber(cell)) {
                    const borderSide = this.#getProperBorderSide(index);

                    if (!this.#cellsWithBorders.hasOwnProperty(cords)) {
                        this.#cellsWithBorders[cords] = []; // cords: [borderSide, borderSide]
                    }
                    if (!this.#cellsWithBorders[cords].includes(borderSide))
                        this.#cellsWithBorders[cords].push(borderSide);
                }
            });
        });

        for (let cords in this.#cellsWithBorders) {
            const sides = ["left", "right", "bottom", "top"];
            const element = document.querySelector(`.game__cell--${cords}`);
            let borderValue = [FIRST_BORDER];
            this.#cellsWithBorders[cords].forEach(side => {
                borderValue.push(BORDER_CHANGED[side]);
            });

            sides.forEach(side => {
                if (!this.#cellsWithBorders[cords].includes(side))
                    borderValue.push(BORDER_INITIAL[side]);
            });

            const value = borderValue.join(",") + ";";

            element.style.cssText = `box-shadow: ${value}`;
        }
    }

    #getProperBorderSide(index) {
        let property = "";
        switch (index) {
            case 0:
                property = "bottom";
                break;

            case 1:
                property = "right";
                break;

            case 2:
                property = "left";
                break;

            case 3:
                property = "top";
                break;
        }
        return property;
    }

    highlightCellsAround(that) {
        let [x, y] = that.classList[1].slice(12).split("x");
        let cellsArr = generateAdjacentCordsArray(x, y);

        if (
            this.#lastHighlighted?.classList.contains("cell__overlay") ||
            this.#lastHighlighted?.textContent.length === 1
        ) {
            [x, y] = this.#lastHighlighted.classList[1].slice(12).split("x");
            cellsArr = generateAdjacentCordsArray(x, y);

            cellsArr.forEach(cords => {
                document.querySelector(`.game__cell--${cords}`)?.classList.remove("cell__overlay");
            });
            this.#lastHighlighted = undefined;
            return;
        }

        if (that.classList.contains("clicked") && !this.#cellIsNumber(that)) return;

        cellsArr.forEach(cords => {
            const element = document.querySelector(`.game__cell--${cords}`);

            if (!element?.classList.contains("clicked") || element === that) {
                element?.classList.add("cell__overlay");
            }
            this.#lastHighlighted = that;
        });
    }

    #protectCellsAroundClick(that) {
        const [x, y] = that.classList[1]
            .slice(12)
            .split("x")
            .map(z => +z);

        const cordsArr = generateAdjacentCordsArray(x, y);

        cordsArr.forEach(cords => {
            this.#bombsPlacements[cords] = true;
        });
    }

    #calcCellsAround(x, y) {
        const cordsArr = generateAdjacentCordsArray(x, y);

        cordsArr.forEach((cords, index) => {
            if (index !== 4) this.#increaseBombCounter(cords);
        });
    }

    #increaseBombCounter(cords) {
        if (this.#cellsPlacements.hasOwnProperty(cords)) {
            this.#cellsPlacements[cords] += 1;
            return;
        }

        this.#cellsPlacements[cords] = 1;
        return;
    }
}

export default new Board();
