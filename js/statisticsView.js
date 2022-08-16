class Statistics {
    #timer = document.querySelector(".statistics__timer-counter");
    #flags = document.querySelector(".statistics__flags-counter");
    #select = document.querySelector("#difficulty");
    #timerValue = 0;
    #interval;

    startTimer() {
        this.#interval = setInterval(this.#manageTimer.bind(this), 1000);
    }

    addClickHandler(handler) {
        this.#select.addEventListener("change", handler);
    }

    #manageTimer() {
        this.#increaseTimer();
        this.#printTimer(this.#timerValue);
    }

    #increaseTimer() {
        this.#timerValue++;
    }

    #printTimer(time) {
        const timeValue = (time + "").padStart(3, "0");
        this.#timer.textContent = timeValue;
    }

    printFlags(amount) {
        this.#flags.textContent = amount;
    }

    cleanTimer(clean = true) {
        clearInterval(this.#interval);
        if (clean) {
            this.#timerValue = 0;
            this.#printTimer(this.#timerValue);
        }
    }

    getTimerValue() {
        return this.#timerValue;
    }
}

export default new Statistics();
