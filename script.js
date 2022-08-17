import State from "./js/model.js";
import Grid from "./js/gridView.js";
import Board from "./js/boardView.js";
import Cell from "./js/cellView.js";
import Statistics from "./js/statisticsView.js";
import Score from "./js/scoreView";
import { getCellCords, setDelayMs } from "./js/helpers.js";
import { LONG_CLICK_MS, PHONE_WIDTH } from "./js/config.js";

// TODO: FLAGS COUNTER
// CHECK FLAG COUNTER AND FIX IT

function mouseClickController(e) {
    e.preventDefault();
    // 1 - LMB, 3 - RMB
    if (e.which === 1) leftKeyClickController.call(this);
    if (e.which === 3) rightKeyClickController.call(this);
    if (State.isGameFinished()) finishedGameController();
}

function touchStartController(e) {
    State.startTouchTimer();
    const timeoutID = setTimeout(() => rightKeyClickController.call(this), LONG_CLICK_MS);
    State.setTimeoutID(timeoutID);
}
function touchEndController(e) {
    if (State.endTouchTimer() < LONG_CLICK_MS) {
        State.resetTimeoutID();
        if (Cell.hasFlag(this)) {
            rightKeyClickController.call(this);

            return;
        }
        leftKeyClickController.call(this);

        return;
    }
}

function leftKeyClickController() {
    if (State.getMovesCounter() === 0) {
        const settings = State.getSettings();
        Board.placeBombs(...settings, this);
        State.updateCellsNumbers(Board.getCellsPlacementObj());

        Statistics.startTimer();
    }

    State.movesCounterAdd();
    const cords = this.classList[1].slice(12);
    const clickedCellValue = State.getCellNumber(cords);

    if (State.cellIsNumber(cords) && !Cell.hasFlag(this) && !State.cordsHaveFlag(cords)) {
        Cell.revealNumber(this, cords, clickedCellValue);
        Board.addCellBorders(Cell.getCellsWithNumbers());

        deleteAllHandlers(this);
        State.saveOpenedCells([cords]);
        return;
    }

    if (clickedCellValue === 0 && !Cell.hasFlag(this) && !State.cordsHaveFlag(cords)) {
        Cell.revealEmptyCell(this, cords, State.getCellsNumbers());
        Board.addCellBorders(Cell.getCellsWithNumbers());
        State.saveOpenedCells(Cell.getCellsRevealed());

        Cell.getFlagsToDelete().forEach(el => {
            State.deleteFlagCords(getCellCords(el));
            Cell.animateFlagDelete(el);
        });

        const allCells = Cell.getCellsRevealed();
        allCells.forEach(cords => {
            const element = document.querySelector(`.game__cell--${cords}`);
            deleteAllHandlers(element);
        });

        Cell.clearCellsRevealed();

        return;
    }

    if (clickedCellValue > 50 && !Cell.hasFlag(this) && !State.cordsHaveFlag(cords)) {
        endGameController(cords);
        return;
    }
}

function middleKeyClickController(e) {
    if (e.which === 2) Board.highlightCellsAround(this);
}

function rightKeyClickController() {
    const cords = this.classList[1].slice(12);

    if (Cell.hasFlag(this) && State.cordsHaveFlag(cords)) {
        Cell.animateFlagDelete(this);
        State.deleteFlagCords(cords);
        Statistics.printFlags(State.increaseFlagCounter());
        return;
    } else {
        if (!State.getFlagsCounter()) return;
        Cell.addFlag(this);
        State.addFlagCords(cords);
        Statistics.printFlags(State.decreaseFlagCounter());
        return;
    }
}

async function endGameController(cords) {
    try {
        Statistics.cleanTimer();

        State.getElementsWithFlags().forEach(el => {
            Cell.animateFlagDelete(el);
        });

        const allCells = State.getAllCellsWithNumbers()
            .concat(State.getBombCells())
            .map(el => document.querySelector(`.game__cell--${el}`));
        const bombCords = State.getBombCells();

        allCells.forEach(cellElement => {
            Cell.deleteClickHandler(cellElement, middleKeyClickController, "mouseup");
            Cell.deleteClickHandler(cellElement, middleKeyClickController, "mousedown");

            deleteAllHandlers(cellElement);

            setTimeout(function () {
                if (window.innerWidth < PHONE_WIDTH) {
                    Cell.addTouchHandler(skipEndAnimation);
                } else {
                    Cell.addClickHandler(skipEndAnimation);
                }
            }, 1000);
        });

        await Cell.blowBombs(bombCords, cords);
        await setDelayMs(1000);

        if (Score.isPopupDisplayed() || State.getMovesCounter() === 0) return;

        Score.toggleOverlayAndPopup();
        Score.addHandlerToBtn(restartGameController);
    } catch (err) {
        console.log(err);
    }
}

function deleteAllHandlers(cellElement) {
    Cell.deleteClickHandler(cellElement, mouseClickController, "mousedown");
    Cell.deleteClickHandler(cellElement, touchStartController, "touchstart");
    Cell.deleteClickHandler(cellElement, touchEndController, "touchend");
}

async function skipEndAnimation() {
    try {
        if (Score.isPopupDisplayed()) return;
        await setDelayMs(1);
        Score.toggleOverlayAndPopup();
        Score.addHandlerToBtn(restartGameController);
    } catch (err) {
        console.log(err);
    }
}
async function finishedGameController() {
    try {
        // STOP STOPER AND SAVE TIME
        Statistics.cleanTimer(false);
        Statistics.getTimerValue();
        // AlL FLAGS HAS TO BE DELETED
        State.getElementsWithFlags().forEach(el => {
            Cell.animateFlagDelete(el);
        });
        // DELETE ALL NUMBERS FROM CELLS
        const allCells = State.getAllCellsWithNumbers();
        allCells.forEach(cords => {
            Cell.animateNumberFadeOut(cords);
        });
        // ADD WATER TO ALL CELLS WITHOUT BOMB
        allCells.forEach(cords => {
            Grid.addWaterTo(cords);
        });
        // COLOR ALL CELLS WITH BOMBS WITH THE SAME GREEN COLOR
        // TODO: THINK ABOUT ADDING SOME FLOWERS TO ALL GREEN CELLS THAT ARE LEFT
        const bombCells = State.getBombCells();
        bombCells.forEach(cords => Grid.addGrassTo(cords));
        const actualTime = Statistics.getTimerValue();
        Score.printActualscore(actualTime);
        if (State.checkForHighScore(actualTime)) {
            State.saveHighScore(actualTime);
            Score.printHighscore(actualTime);
        }

        await setDelayMs(4000);

        Score.toggleOverlayAndPopup();
        Score.addHandlerToBtn(restartGameController);
    } catch (err) {
        console.log(err);
    }
}

function restartGameController() {
    Cell.cancelBombAnimation();

    gameInit(State.getActualDifficulty());
    Score.toggleOverlayAndPopup();
}

function gameDifficultyController(event) {
    const diff = event.target.value;
    gameInit(diff);
}

function gameInit(diff) {
    State.reset();
    Board.reset();
    Cell.reset();
    Statistics.cleanTimer();
    State.setActualDifficulty(diff);

    const settings = State.getSettings();

    Grid.createBoard(...settings, diff);
    State.setCellsNumbers(Grid.getCellsNumbers());
    Statistics.printFlags(State.setFlagCounter(diff));
    if (window.innerWidth < PHONE_WIDTH) {
        Cell.addTouchHandler(touchStartController, touchEndController);
    } else {
        Cell.addClickHandler(mouseClickController, middleKeyClickController);
    }

    Statistics.addClickHandler(gameDifficultyController);
}
State.setClientWidth(window.innerWidth);
Grid.setBackground(window.innerWidth);
State.getScoreFromLocalStorage();

gameInit("med");
