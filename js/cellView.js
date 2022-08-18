import { CONFETTI_COLORS, PHONE_WIDTH } from "./config.js";
import {
    makeConfetti,
    generateTextColor,
    generateAdjacentCordsArray,
    setDelayMs,
} from "./helpers.js";

class Cell {
    #cellsWithNumbers = [];
    #cellsQueue = [];
    #cellsRevealed = [];
    #flagsToDelete = [];
    #bombAnimation;

    reset() {
        this.#cellsWithNumbers = [];
        this.#cellsQueue = [];
        this.#cellsRevealed = [];
        this.#flagsToDelete = [];
    }

    animateNumberFadeOut(cords, allCells) {
        const element = allCells[cords];
        element.style.cssText += "transition: all 0.3s; color: transparent;";
        setTimeout(this.#deleteNumber.bind(this, element), 300);
    }

    cancelBombAnimation() {
        this.#bombAnimation = false;
    }

    async blowBombs(allCells, bombCords, cords) {
        try {
            this.#bombAnimation = true;

            let firstCords = cords;

            while (bombCords.length > 0 && this.#bombAnimation) {
                const index = firstCords
                    ? bombCords.indexOf(firstCords)
                    : this.#generateRandomValue(0, bombCords.length);
                const delay = this.#generateRandomValue(100, 600);
                const random = this.#generateRandomValue(1, CONFETTI_COLORS.length);
                const colors = CONFETTI_COLORS[random];
                const coords = firstCords ? firstCords : bombCords[index];
                const element = allCells[coords];

                makeConfetti(element, "small", colors, 0.4);

                element.classList.add("bomb");
                element.style.setProperty("--bomb-color", colors[2]);
                element.style.setProperty("--bomb-bg", colors[1]);

                setTimeout(function () {
                    element.style.setProperty("--bomb-bg", colors[0]);
                }, 800);

                bombCords.splice(index, 1);
                firstCords = false;
                await setDelayMs(delay);
            }

            return true;
        } catch (err) {
            console.log(err);
        }
    }

    #deleteNumber(element) {
        element.textContent = "";
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

    #markClicked(xyCord, cellsNumbers, allCells) {
        const element = allCells[xyCord];

        this.#addFlagToDelete(element);

        element.classList.add("clicked");
        element.textContent = cellsNumbers[xyCord];
        this.#cellsWithNumbers.push(xyCord);
        element.style.setProperty("--color-text", generateTextColor(cellsNumbers[xyCord]));
        element.dataset.number = cellsNumbers[xyCord];

        this.#cellsRevealed.push(xyCord);
        makeConfetti(element);
    }

    revealEmptyCell(that, cords, state, allCells) {
        that.classList.add("clicked");
        this.#cellsQueue.push(cords);

        while (this.#cellsQueue.length > 0) {
            this.#revealAdjacentCells(state, allCells);
        }
    }

    #revealAdjacentCells(cellsNumbers, allCells) {
        const [x, y] = this.#cellsQueue[0].split("x").map(z => +z);
        const outerCordsIndex = [0, 2, 6, 8];
        const cordsArr = generateAdjacentCordsArray(x, y);
        cordsArr.forEach((xyCords, i) => {
            if (outerCordsIndex.includes(i)) {
                if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
                    this.#markClicked(xyCords, cellsNumbers, allCells);
                }
            }
            if (!outerCordsIndex.includes(i)) {
                if (cellsNumbers[xyCords] === 0) {
                    const element = allCells[xyCords];

                    element.classList.add("clicked");
                    this.#enqueueCords(xyCords);
                    this.#addFlagToDelete(element);
                } else if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
                    this.#markClicked(xyCords, cellsNumbers, allCells);
                }
            }
        });

        this.#cellsRevealed.push(this.#cellsQueue[0]);
        this.#cellsQueue.splice(0, 1);
    }

    revealNumber(that, cords, clickedCellValue) {
        that.textContent = clickedCellValue;
        that.classList.add("clicked");
        that.style.setProperty("--color-text", generateTextColor(clickedCellValue));
        this.#cellsWithNumbers.push(cords);
        makeConfetti(that);
    }

    getCellsRevealed() {
        return this.#cellsRevealed;
    }

    clearCellsRevealed() {
        this.#cellsRevealed.length = 0;
    }

    getCellsWithNumbers() {
        return this.#cellsWithNumbers;
    }

    deleteClickHandler(that, handler, handlerEvent) {
        that.removeEventListener(`${handlerEvent}`, handler);
        return;
    }

    addAllClickHandler(allCells, handler, mouseup) {
        for (let key in allCells) {
            const el = allCells[key];
            el.addEventListener("mousedown", handler);
            el.addEventListener("mousedown", mouseup);
            el.addEventListener("mouseup", mouseup);
        }
    }

    addAllTouchHandler(allCells, handlerStart, handlerEnd) {
        for (let key in allCells) {
            const el = allCells[key];
            el.addEventListener("touchstart", handlerStart);
            el.addEventListener("touchend", handlerEnd);
        }
    }

    async animateFlagDelete(that) {
        try {
            const flagElement = that.querySelector(".game__cell--flag");
            if (!flagElement) return;
            const element = flagElement?.cloneNode(true);
            flagElement.style.display = "none";

            // set beggining values and show cloned element

            element.style.cssText += `z-index: 10000; font-size: 1.7rem; position: absolute; transition: all 0.3s; transform: scale(1) rotate(0deg) translate(-50%, -50%); animation: none; top: 50%; left: 50%; opacity: 1;`;
            element.classList.remove(".game__cell--flag");
            that.appendChild(element);

            await setDelayMs(1);

            // set middle values and await
            let leftValue = this.#generateRandomValue(50, 150);
            const leftDirection = this.#generateRandomValue(0, 1) ? "-" : "";
            let rotateValue = this.#generateRandomValue(5, 90);

            element.style.cssText += `transform: scale(1) rotate(${leftDirection}${rotateValue}deg); top: -${this.#generateRandomValue(
                100,
                300
            )}%; left: ${leftDirection}${leftValue}%; `;
            await setDelayMs(300);

            // set ending values and await
            element.style.cssText =
                +`transition: all 0.5s; transform: scale(0) rotate(${leftDirection}${
                    rotateValue * 1.2
                }deg); top: ${this.#generateRandomValue(400, 600)}%; left: ${leftDirection}${
                    leftValue * 1.2
                }%; `;

            await setDelayMs(500);
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
            element.style.cssText += "top: 50%; opacity: 1;";
        }, 10);
    }

    #generateRandomValue(from, to) {
        return Math.floor(Math.random() * (to - from) + from);
    }
}

export default new Cell();
