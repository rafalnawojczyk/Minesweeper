import State from "./js/model.js";
import Grid from "./js/gridView.js";
import Board from "./js/boardView.js";
import Cell from "./js/cellView.js";
import Statistics from "./js/statisticsView.js";
import Score from "./js/scoreView";
import { getCellCords, setDelayMs } from "./js/helpers.js";

// TODO: FLAGS COUNTER
// CHECK FLAG COUNTER AND FIX IT

// TODO:
// Think about adding some rules to the gridView when its building the cells and game layout. It has to take into account screen width of device, and according to that it should change the layout from eg. 8x10 to 6x12, so all of the tiles will be nice and big. Now in smaller screens this isnt really readable

// TODO:
// make animation that will be shaking entire game container on move.

function mouseClickController(e) {
    e.preventDefault();
    if (e.which === 1) leftKeyClickController.call(this);
    if (e.which === 3) rightKeyClickController.call(this);
    if (State.isGameFinished()) finishedGameController();
}

function leftKeyClickController() {
    if (State.getMovesCounter() === 0) {
        Board.placeBombs(...State.difficulty[State.getActualDifficulty()], this);
        State.updateCellsNumbers(Board.getCellsPlacementObj());

        Statistics.startTimer();
    }

    State.movesCounterAdd();
    const cords = this.classList[1].slice(12);
    const clickedCellValue = State.getCellNumber(cords);

    if (State.cellIsNumber(cords) && !Cell.hasFlag(this) && !State.cordsHaveFlag(cords)) {
        Cell.revealNumber(this, cords, clickedCellValue);
        Board.addCellBorders(Cell.getCellsWithNumbers());
        Cell.deleteClickHandler(this, mouseClickController);
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

        Cell.deleteClickHandler(this, mouseClickController, true);
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
            Cell.deleteClickHandler(cellElement, mouseClickController);
            Cell.deleteClickHandler(cellElement, middleKeyClickController);
            setTimeout(function () {
                Cell.addClickHandler(cellElement, skipEndAnimation);
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

// TODO:
// gameInit should sent three values,  difficulty, client width, client height
//

function gameInit(diff) {
    const clientX = window.innerWidth;

    State.reset();
    Board.reset();
    Cell.reset();
    Statistics.cleanTimer();
    State.setActualDifficulty(diff);

    // TODO: take settings based on screen size

    const settings = clientX < 600 ? State.phoneDifficulty[diff] : State.difficulty[diff];

    // const settings = State.difficulty[diff];

    Grid.createBoard(...settings, diff);
    State.setCellsNumbers(Grid.getCellsNumbers());
    Statistics.printFlags(State.setFlagCounter(diff));
    Cell.addClickHandler(mouseClickController, middleKeyClickController);
    Statistics.addClickHandler(gameDifficultyController);
}

gameInit("med");
State.getScoreFromLocalStorage();
