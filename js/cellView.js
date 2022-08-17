import { CONFETTI_COLORS } from "./config.js";
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

    animateNumberFadeOut(cords) {
        const element = document.querySelector(`.game__cell--${cords}`);
        element.style.transition = "all 0.3s";
        element.style.color = "transparent";
        setTimeout(this.#deleteNumber.bind(this, element), 300);
    }

    cancelBombAnimation() {
        this.#bombAnimation = false;
    }

    async blowBombs(allCords, cords) {
        try {
            this.#bombAnimation = true;
            const bombCords = allCords;
            let firstCords = cords;

            while (bombCords.length > 0 && this.#bombAnimation) {
                const index = firstCords
                    ? bombCords.indexOf(firstCords)
                    : this.#generateRandomValue(0, bombCords.length);
                const delay = this.#generateRandomValue(100, 600);
                const random = this.#generateRandomValue(1, CONFETTI_COLORS.length);
                const colors = CONFETTI_COLORS[random];
                const coords = firstCords ? firstCords : bombCords[index];
                const element = document.querySelector(`.game__cell--${coords}`);

                makeConfetti(element, "big", colors, 0.4);
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

    addClickHandler(handler, mouseup) {
        document.querySelectorAll(".game__cell").forEach(el => {
            el.addEventListener("mousedown", handler);
            el.addEventListener("mousedown", mouseup);
        });

        document
            .querySelectorAll(".game__cell")
            .forEach(el => el.addEventListener("mouseup", mouseup));
    }

    addTouchHandler(handlerStart, handlerEnd) {
        document.querySelectorAll(".game__cell").forEach(el => {
            el.addEventListener("touchstart", handlerStart);
            el.addEventListener("touchend", handlerEnd);
        });
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

            await setDelayMs(1);

            // set middle values and await
            let leftValue = this.#generateRandomValue(50, 150);
            const leftDirection = this.#generateRandomValue(0, 1) ? "-" : "";
            let rotateValue = this.#generateRandomValue(5, 90);

            element.style.transform = `scale(1) rotate(${leftDirection}${rotateValue}deg)`;
            element.style.top = `-${this.#generateRandomValue(100, 300)}%`;
            element.style.left = `${leftDirection}${leftValue}%`;

            await setDelayMs(300);

            // set ending values and await
            element.style.transition = "all .5s";
            element.style.transform = `scale(0) rotate(${leftDirection}${rotateValue * 1.2}deg)`;
            element.style.top = `${this.#generateRandomValue(400, 600)}%`;
            element.style.left = `${leftDirection}${leftValue * 1.2}%`;

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
            element.style.top = "50%";
            element.style.opacity = "1";
        }, 10);
    }

    #generateRandomValue(from, to) {
        return Math.floor(Math.random() * (to - from) + from);
    }
}

export default new Cell();
