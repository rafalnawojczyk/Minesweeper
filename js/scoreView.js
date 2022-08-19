import { PHONE_WIDTH } from "./config";

class Score {
    #highscoreLabel = document.querySelector(".highscore__label");
    #actualScoreLabel = document.querySelector(".actual-score__label");
    #overlay = document.querySelector(".overlay");
    #playAgainBtn = document.querySelector(".summary__btn");
    #popupWindow = document.querySelector(".summary");
    #popupDisplayed = false;

    addHandlerToBtn(handler) {
        this.#playAgainBtn.addEventListener("click", handler);
    }

    isPopupDisplayed() {
        return this.#popupDisplayed;
    }

    async toggleOverlayAndPopup() {
        try {
            const summaryWidth = window.innerWidth < PHONE_WIDTH ? "--summary-width: 90vw;" : "";

            const overlay = this.#overlay;
            const popup = this.#popupWindow;

            if (!this.#popupDisplayed) {
                this.#popupDisplayed = true;

                overlay.style.cssText = `visibility: visible; opacity: 1;`;
                popup.style.cssText = `${summaryWidth} pointer-events: auto; visibility: visible; opacity: 1;`;

                return;
            }

            this.#popupDisplayed = false;

            overlay.style.cssText = `visibility: hidden; opacity: 0;`;
            popup.style.cssText = `${summaryWidth}pointer-events: none; visibility: hidden; opacity: 0;`;

            return;
        } catch (err) {
            console.log(err);
        }
    }

    printActualscore(score) {
        const actualScore = (score + "").padStart(3, "0");
        this.#actualScoreLabel.textContent = actualScore;
    }

    printHighscore(score) {
        const highScore = (score + "").padStart(3, "0");
        this.#highscoreLabel.textContent = highScore;
    }
}

export default new Score();
