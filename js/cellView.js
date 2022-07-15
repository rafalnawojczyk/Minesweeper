import { makeConfetti } from "./helpers.js";

class Cell {
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
            element.style.top = `${this.#generateRandomValue(600, 900)}%`;
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
