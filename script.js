import State from "./js/model.js";
import Grid from "./js/gridView.js";
import Board from "./js/boardView.js";
import Cell from "./js/cellView.js";

//flag entity 	&#128681;
//bomb entity   &#128163;

// TODO: ANIMATION OF ENDING GAME - BOMBS + COLORS + confetti -
// ADD TOP HEADER BADGE WITH A DIFFICULTY CHANGING POSSIBILITY + SCORES AND FLAG COUNTER
// TRY TO FIND BETTER FLAG ENTITY
// ADD METHOD THAT WILL MAYBE INCREASE COUNTER, AND IF COUNTER HITS SPOT, IT  MEANS  THAT THERE IS NO MORE UNCLICKED CELLS, AND GAME IS FINISHED

let settings = State.difficulty["med"];

Grid.createBoard(...settings, "med");
State.setCellsNumbers(Grid.getCellsNumbers());
Cell.addClickHandler(mouseClickController, middleKeyClickController);

function mouseClickController(e) {
    e.preventDefault();
    if (e.which === 1) leftKeyClickController.call(this);
    if (e.which === 3) rightKeyClickController.call(this);
}

function leftKeyClickController() {
    if (State.getMovesCounter() === 0) {
        Board.placeBombs(...settings, this);
        State.updateCellsNumbers(Board.getCellsPlacementObj());
        State.movesCounterAdd();
    }

    const cords = this.classList[1].slice(12);
    const clickedCellValue = State.getCellNumber(cords);

    if (State.cellIsNumber(cords) && !Cell.hasFlag(this)) {
        // Board.revealNumber(this, cords, clickedCellValue);
        Cell.revealNumber(this, cords, clickedCellValue);
        Board.addCellBorders(Cell.getCellsWithNumbers());
        Cell.deleteClickHandler(this, mouseClickController);
        return;
    }

    if (clickedCellValue === 0 && !Cell.hasFlag(this)) {
        // Board.revealEmptyCell(this, cords, State.getCellsNumbers());
        Cell.revealEmptyCell(this, cords, State.getCellsNumbers());
        Board.addCellBorders(Cell.getCellsWithNumbers());

        Cell.getFlagsToDelete().forEach(el => {
            Cell.animateFlagDelete(el);
        });

        Cell.deleteClickHandler(this, mouseClickController, true);
        return;
    }

    if (clickedCellValue > 50 && !Cell.hasFlag(this)) {
        //TODO: show all bombs and end game.
        document.querySelector(".h1").classList.toggle("hidden");
        return;
    }
}

function middleKeyClickController(e) {
    if (e.which === 2) Board.highlightCellsAround(this);
}

function rightKeyClickController() {
    if (Cell.hasFlag(this)) {
        Cell.animateFlagDelete(this);
        return;
    }
    Cell.addFlag(this);
    return;
}
