import { setDelayMs } from "./helpers";

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
            const overlay = this.#overlay;
            const popup = this.#popupWindow;

            if (!this.#popupDisplayed) {
                this.#popupDisplayed = true;

                overlay.style.visibility = "visible";
                overlay.style.opacity = "1";
                popup.style.pointerEvents = "auto";
                popup.style.visibility = "visible";
                popup.style.opacity = "1";
                return;
            }

            this.#popupDisplayed = false;
            overlay.style.visibility = "hidden";
            overlay.style.opacity = "0";
            popup.style.pointerEvents = "none";
            popup.style.visibility = "hidden";
            popup.style.opacity = "0";

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
