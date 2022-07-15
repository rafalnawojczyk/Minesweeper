import { TEXT_COLORS, FIRST_BORDER, BORDER_INITIAL, BORDER_CHANGED } from "./config.js";
import { makeConfetti } from "./helpers.js";

class Board {
    #bombsPlacements = {};
    #cellsPlacements = {};
    #cellsQueue = [];
    #cellsRevealed = [];
    #lastHighlighted;
    #cellsWithNumbers = [];
    #cellsWithBorders = {};
    #flagsToDelete = [];

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

    getCellsPlacementObj() {
        return this.#cellsPlacements;
    }

    revealEmptyCell(that, cords, state) {
        that.classList.add("clicked");
        const [x, y] = cords.split("x");
        this.#cellsQueue.push(cords);

        while (this.#cellsQueue.length > 0) {
            this.#revealAdjacentCells(state);
        }

        this.#addCellBorders();
    }

    // export reveal number to cellView.
    // it should store cellsWithNumbers in property, and make a method to get it from vellView.
    // then controller should trigger addCellBorders and pass the cellsWithNumbers variable
    revealNumber(that, cords, clickedCell) {
        document.querySelector(`.game__cell--${cords}`).textContent = clickedCell;
        that.classList.add("clicked");

        that.style.setProperty("--color-text", this.#generateTextColor(clickedCell));

        this.#cellsWithNumbers.push(cords);
        this.#addCellBorders();

        makeConfetti(that);
    }

    deleteClickHandler(that, handler, multi = false) {
        if (multi) {
            this.#cellsRevealed.forEach(xyCords => {
                document
                    .querySelector(`.game__cell--${xyCords}`)
                    .removeEventListener("mousedown", handler);
            });

            this.#cellsRevealed.length = 0;
            return;
        }

        that.removeEventListener("mousedown", handler);
        return;
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

    #addCellBorders(cellsWithNumbers) {
        this.#cleanAllBorders();

        //print new borders
        this.#cellsWithNumbers.forEach(cords => {
            const [x, y] = cords.split("x");
            const sideCordsArr = this.#generateAdjacentCordsArray(x, y, true);

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
        let cellsArr = this.#generateAdjacentCordsArray(x, y);

        if (
            this?.#lastHighlighted?.classList.contains("overlay") ||
            this?.#lastHighlighted?.textContent.length === 1
        ) {
            [x, y] = this.#lastHighlighted.classList[1].slice(12).split("x");
            cellsArr = this.#generateAdjacentCordsArray(x, y);

            cellsArr.forEach(cords => {
                document.querySelector(`.game__cell--${cords}`)?.classList.remove("overlay");
            });
            this.#lastHighlighted = undefined;
            return;
        }

        if (that.classList.contains("clicked") && !this.#cellIsNumber(that)) return;

        cellsArr.forEach(cords => {
            const element = document.querySelector(`.game__cell--${cords}`);

            if (!element?.classList.contains("clicked") || element === that) {
                element?.classList.add("overlay");
            }
            this.#lastHighlighted = that;
        });
    }

    addClickHandler(handler, mouseup) {
        document.querySelectorAll(".game__cell").forEach(el => {
            el.addEventListener("mousedown", handler);
            el.addEventListener("mousedown", mouseup);
        });

        document
            .querySelectorAll(".game__cell")
            .forEach(el => el.addEventListener("mouseup", mouseup));
    }

    #generateTextColor(value) {
        return TEXT_COLORS[value];
    }

    #protectCellsAroundClick(that) {
        const [x, y] = that.classList[1]
            .slice(12)
            .split("x")
            .map(z => +z);

        const cordsArr = this.#generateAdjacentCordsArray(x, y);

        cordsArr.forEach(cords => {
            this.#bombsPlacements[cords] = true;
        });
    }

    #generateAdjacentCordsArray(x, y, onlySides = false) {
        x = +x;
        y = +y;

        if (onlySides) {
            return [
                x - 1 + "x" + y, // 2
                x + "x" + (y - 1), // 4
                x + "x" + (y + 1), // 6
                x + 1 + "x" + y, // 8
            ];
        }

        return [
            x - 1 + "x" + (y - 1), // 1
            x - 1 + "x" + y, // 2
            x - 1 + "x" + (y + 1), // 3
            x + "x" + (y - 1), // 4
            x + "x" + y, // 5
            x + "x" + (y + 1), // 6
            x + 1 + "x" + (y - 1), // 7
            x + 1 + "x" + y, // 8
            x + 1 + "x" + (y + 1), // 9
        ];
    }

    #enqueueCords(cords) {
        if (!this.#cellsRevealed.includes(cords) && !this.#cellsQueue.includes(cords)) {
            this.#cellsQueue.push(cords);
        }
    }

    getFlagsToDelete() {
        const flags = [...this.#flagsToDelete];
        this.#flagsToDelete.length = 0;
        return flags;
    }
    #addFlagToDelete(element) {
        if (this.hasFlag(element) && !this.#flagsToDelete.includes(element))
            this.#flagsToDelete.push(element);
    }

    #markClicked(xyCord, cellsNumbers) {
        const element = document.querySelector(`.game__cell--${xyCord}`);

        this.#addFlagToDelete(element);

        element.classList.add("clicked");
        element.textContent = cellsNumbers[xyCord];
        this.#cellsWithNumbers.push(xyCord);
        element.style.setProperty("--color-text", this.#generateTextColor(cellsNumbers[xyCord]));
        element.dataset.number = cellsNumbers[xyCord];
        // dataset
        this.#cellsRevealed.push(xyCord);
    }

    #revealAdjacentCells(cellsNumbers) {
        const [x, y] = this.#cellsQueue[0].split("x").map(z => +z);
        const outerCordsIndex = [0, 2, 6, 8];
        const cordsArr = this.#generateAdjacentCordsArray(x, y);
        cordsArr.forEach((xyCords, i) => {
            if (outerCordsIndex.includes(i)) {
                if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
                    this.#markClicked(xyCords, cellsNumbers);
                }
            }
            if (!outerCordsIndex.includes(i)) {
                if (cellsNumbers[xyCords] === 0) {
                    const element = document.querySelector(`.game__cell--${xyCords}`);
                    element.classList.add("clicked");
                    this.#enqueueCords(xyCords);
                    this.#addFlagToDelete(element);
                } else if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
                    this.#markClicked(xyCords, cellsNumbers);
                }
            }
        });

        this.#cellsRevealed.push(this.#cellsQueue[0]);
        this.#cellsQueue.splice(0, 1);
    }

    hasFlag(that) {
        return that.textContent.length > 1;
    }

    #calcCellsAround(x, y) {
        const cordsArr = this.#generateAdjacentCordsArray(x, y);

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
