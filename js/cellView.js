import { makeConfetti, generateTextColor, generateAdjacentCordsArray } from "./helpers.js";

class Cell {
    #cellsWithNumbers = [];
    #cellsQueue = [];
    #cellsRevealed = [];
    #flagsToDelete = [];

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
        element.style.setProperty("--color-text", generateTextColor(cellsNumbers[xyCord]));
        element.dataset.number = cellsNumbers[xyCord];
        // dataset
        this.#cellsRevealed.push(xyCord);
        makeConfetti(element, "small");
    }

    revealEmptyCell(that, cords, state) {
        that.classList.add("clicked");
        const [x, y] = cords.split("x");
        this.#cellsQueue.push(cords);

        while (this.#cellsQueue.length > 0) {
            this.#revealAdjacentCells(state);
        }
    }

    #revealAdjacentCells(cellsNumbers) {
        const [x, y] = this.#cellsQueue[0].split("x").map(z => +z);
        const outerCordsIndex = [0, 2, 6, 8];
        const cordsArr = generateAdjacentCordsArray(x, y);
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

    revealNumber(that, cords, clickedCell) {
        document.querySelector(`.game__cell--${cords}`).textContent = clickedCell;
        that.classList.add("clicked");

        that.style.setProperty("--color-text", generateTextColor(clickedCell));

        this.#cellsWithNumbers.push(cords);

        makeConfetti(that);
    }

    getCellsWithNumbers() {
        return this.#cellsWithNumbers;
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

    addClickHandler(handler, mouseup) {
        document.querySelectorAll(".game__cell").forEach(el => {
            el.addEventListener("mousedown", handler);
            el.addEventListener("mousedown", mouseup);
        });

        document
            .querySelectorAll(".game__cell")
            .forEach(el => el.addEventListener("mouseup", mouseup));
    }
    async animateFlagDelete(that) {
        try {
            const element = that.querySelector(".game__cell--flag")?.cloneNode(true);
            if (!that.querySelector(".game__cell--flag")) return;
            that.querySelector(".game__cell--flag").style.display = "none";

            // set beggining values and show cloned element
            element.classList.remove(".game__cell--flag");
            element.style.zIndex = "10000";
            element.style.fontSize = "1.7rem";
            element.style.position = "absolute";
            element.style.transition = "all 0.3s";
            element.style.transform = "scale(1) rotate(0deg) translate(-50%, -50%)";
            element.style.animation = "";
            element.style.top = "50%";
            element.style.left = "50%";
            element.style.opacity = "1";

            that.appendChild(element);

            await this.#setDelayMs(1);

            // set middle values and await
            let leftValue = this.#generateRandomValue(50, 150);
            const leftDirection = this.#generateRandomValue(0, 1) ? "-" : "";
            let rotateValue = this.#generateRandomValue(5, 90);

            element.style.transform = `scale(1) rotate(${leftDirection}${rotateValue}deg)`;
            element.style.top = `-${this.#generateRandomValue(100, 300)}%`;
            element.style.left = `${leftDirection}${leftValue}%`;

            await this.#setDelayMs(300);

            // set ending values and await
            element.style.transition = "all .5s";
            element.style.transform = `scale(0) rotate(${leftDirection}${rotateValue * 1.2}deg)`;
            element.style.top = `${this.#generateRandomValue(400, 600)}%`;
            element.style.left = `${leftDirection}${leftValue * 1.2}%`;

            await this.#setDelayMs(500);
            // clear div

            that.innerHTML = "";
            if (+that.dataset.number) that.textContent = that.dataset.number;
        } catch (err) {
            console.log(err);
        }
    }

    hasFlag(that) {
        return that.textContent.length > 1;
    }

    addFlag(that) {
        const element = document.createElement("div");

        element.innerHTML = "&#128681;";
        element.classList.add("game__cell--flag");
        that.appendChild(element);
        setTimeout(() => {
            element.style.top = "50%";
            element.style.opacity = "1";
        }, 10);
    }

    #generateRandomValue(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    async #setDelayMs(ms) {
        try {
            await new Promise(resolve => setTimeout(resolve, ms));
        } catch (err) {
            throw err;
        }
    }
}

export default new Cell();
