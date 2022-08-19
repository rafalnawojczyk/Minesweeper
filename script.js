import State from "./js/model.js";
import Grid from "./js/gridView.js";
import Board from "./js/boardView.js";
import Cell from "./js/cellView.js";
import Statistics from "./js/statisticsView.js";
import Score from "./js/scoreView";
import { getCellCords, setDelayMs } from "./js/helpers.js";
import { LONG_CLICK_MS } from "./js/config.js";

// TODO:
// optimize confeti on phones. Think about adding smaller amount of confetti everywhere when its on phone, changing all things to reduce performance problems

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

            if (State.isGameFinished()) finishedGameController();

            return;
        }

        leftKeyClickController.call(this);

        if (State.isGameFinished()) finishedGameController();

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
    const allCells = State.getAllCells();

    if (State.cellIsNumber(cords) && !Cell.hasFlag(this) && !State.cordsHaveFlag(cords)) {
        Cell.revealNumber(this, cords, clickedCellValue);
        Board.addCellBorders(allCells, Cell.getCellsWithNumbers());
        deleteAllHandlers(this);
        State.saveOpenedCells([cords]);
        return;
    }

    if (clickedCellValue === 0 && !Cell.hasFlag(this) && !State.cordsHaveFlag(cords)) {
        Cell.revealEmptyCell(this, cords, State.getCellsNumbers(), allCells);
        Board.addCellBorders(allCells, Cell.getCellsWithNumbers());

        State.saveOpenedCells(Cell.getCellsRevealed());

        Cell.getFlagsToDelete().forEach(el => {
            State.deleteFlagCords(getCellCords(el));
            Statistics.printFlags(State.increaseFlagCounter());
            Cell.animateFlagDelete(el);
        });

        const cellsRevealed = Cell.getCellsRevealed();
        cellsRevealed.forEach(cords => {
            const element = allCells[cords];
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
    if (e.which === 2) Board.highlightCellsAround(this, State.getAllCells());
}

async function rightKeyClickController() {
    try {
        const cords = this.classList[1].slice(12);
        if (State.flagCordsAreQueued(cords)) return;

        State.addFlagCordsToQueue(cords);

        if (Cell.hasFlag(this) && State.cordsHaveFlag(cords)) {
            Statistics.printFlags(State.increaseFlagCounter());
            await Cell.animateFlagDelete(this);
            State.deleteFlagCords(cords);
            State.deleteCordsFromQueue(cords);
            return;
        } else {
            if (!State.getFlagsCounter()) return;
            Statistics.printFlags(State.decreaseFlagCounter());
            State.addFlagCords(cords);
            Cell.addFlag(this);
            State.deleteCordsFromQueue(cords);
            return;
        }
    } catch (err) {
        console.log(err);
    }
}

async function endGameController(cords) {
    try {
        Statistics.cleanTimer();
        State.getElementsWithFlags().forEach(el => {
            Cell.animateFlagDelete(el);
        });

        const allCells = State.getAllCells();

        const bombCords = State.getAllCellsWithBombs();

        // Add skip animation handler to all cells
        setTimeout(function () {
            if (State.deviceIsPhone()) {
                Cell.addAllTouchHandler(allCells, skipEndAnimation);
            } else {
                Cell.addAllClickHandler(allCells, skipEndAnimation);
            }
        }, 1000);

        for (let key in allCells) {
            const cellElement = allCells[key];
            if (cellElement.classList.contains("clicked")) continue;

            Cell.deleteClickHandler(cellElement, middleKeyClickController, "mouseup");
            Cell.deleteClickHandler(cellElement, middleKeyClickController, "mousedown");

            deleteAllHandlers(cellElement);
        }

        await Cell.blowBombs(allCells, bombCords, cords);

        if (Score.isPopupDisplayed() || State.getMovesCounter() <= 1) return;

        skipEndAnimation();
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
        const allCells = State.getAllCells();
        // STOP STOPER AND SAVE TIME
        Statistics.cleanTimer(false);
        const actualTime = Statistics.getTimerValue();
        // AlL FLAGS HAS TO BE DELETED
        State.getElementsWithFlags().forEach(el => {
            Cell.animateFlagDelete(el);
        });
        // DELETE ALL NUMBERS FROM CELLS
        const numberCells = State.getAllCellsWithNumbers();

        numberCells.forEach(cords => {
            Cell.animateNumberFadeOut(cords, allCells);
            Grid.addWaterTo(cords, allCells);
        });

        // COLOR ALL CELLS WITH BOMBS WITH THE SAME GREEN COLOR
        // TODO: THINK ABOUT ADDING SOME FLOWERS TO ALL GREEN CELLS THAT ARE LEFT

        const bombCells = State.getAllCellsWithBombs();

        bombCells.forEach(cords => Grid.addGrassTo(cords, allCells));

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
    Score.printHighscore(State.getHighscore());

    const settings = State.getSettings();

    const allCells = Grid.createBoard(...settings, diff);
    State.setCellsNumbers(Grid.getCellsNumbers());
    State.setAllCells(allCells);
    Statistics.printFlags(State.setFlagCounter(diff));
    if (State.deviceIsPhone()) {
        Cell.addAllTouchHandler(allCells, touchStartController, touchEndController);
    } else {
        Cell.addAllClickHandler(allCells, mouseClickController, middleKeyClickController);
    }
    Statistics.addClickHandler(gameDifficultyController);
}

State.setClientWidth(window.innerWidth);
Grid.setBackground(window.innerWidth);
State.getScoreFromLocalStorage();

gameInit("med");
