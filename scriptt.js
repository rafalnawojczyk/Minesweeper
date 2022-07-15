"use strict";

//flag entity 	&#128681;
//bomb entity   &#128163;
setTimeout(() => console.log(cellsNumbers), 2000);

// Game state variables
const difficulty = {
    easy: [10, 8, 10],
    med: [18, 14, 40],
    hard: [24, 20, 99],
};

const bombsPlacements = {};
const cellsNumbers = {};
const cellsQueue = [];
const cellsRevealed = [];
let movesCounter = 0;

const gameStyle = document.querySelector(".game").style;

let difficultyLevel = "med";

const generateGrid = function () {
    gameStyle.gridTemplateColumns = `repeat( ${difficulty[difficultyLevel][0]} , 1fr)`;
    gameStyle.gridTemplateRows = `repeat( ${difficulty[difficultyLevel][1]} , 1fr)`;
    gameStyle.width = `${3 * difficulty[difficultyLevel][0]}vh`;
    gameStyle.height = `${3 * difficulty[difficultyLevel][1]}vh`;

    gameStyle.marginTop = `${(100 - parseInt(gameStyle.height)) / 2}vh`;
    let newDiv = "";

    for (let i = 0; i < difficulty[difficultyLevel][1]; i++) {
        for (let y = 0; y < difficulty[difficultyLevel][0]; y++) {
            newDiv += `<div class="game__cell game__cell--${i}x${y}"> </div>`;
            cellsNumbers[i + "x" + y] = 0;
        }
    }
    document.querySelector(".game").innerHTML = newDiv;

    //generate cross pattern
    let counter = 0;
    let rowNumber = difficulty[difficultyLevel][0] - 1;

    document.querySelectorAll(".game__cell").forEach(el => {
        counter % 2 ? el.classList.add("game__cell--even") : el.classList.add("game__cell--odd");
        if (counter === rowNumber) {
            if (rowNumber === difficulty[difficultyLevel][0] - 1) {
                rowNumber = difficulty[difficultyLevel][0];
                counter = 1;
            } else if (rowNumber === difficulty[difficultyLevel][0]) {
                rowNumber = difficulty[difficultyLevel][0] - 1;
                counter = 0;
            }
        } else {
            counter++;
        }
    });
};

const placeBombs = function () {
    let bombCounter = difficulty[difficultyLevel][2];

    while (bombCounter > 0) {
        let xCord = Math.floor(Math.random() * difficulty[difficultyLevel][1]);
        let yCord = Math.floor(Math.random() * difficulty[difficultyLevel][0]);
        let cords = xCord + "x" + yCord;
        let cellClass = ".game__cell--" + cords;

        if (!bombsPlacements.hasOwnProperty(cords)) {
            bombsPlacements[cords] = true;
            bombCounter--;
            cellsNumbers[cords] = 99;
            calcCellsAround(xCord, yCord);
        }
    }
};

const calcCellsAround = function (x, y) {
    const checkBombs = function (cord) {
        if (cellsNumbers.hasOwnProperty(cord)) cellsNumbers[cord] += 1;
    };

    checkBombs(x - 1 + "x" + (y - 1));
    checkBombs(x - 1 + "x" + y);
    checkBombs(x - 1 + "x" + (y + 1));
    checkBombs(x + "x" + (y - 1));
    checkBombs(x + "x" + (y + 1));
    checkBombs(x + 1 + "x" + (y - 1));
    checkBombs(x + 1 + "x" + y);
    checkBombs(x + 1 + "x" + (y + 1));
};

generateGrid();

const emptyCellReveal = function () {
    while (cellsQueue.length > 0) {
        revealAdjacentCells();
    }
};

const revealAdjacentCells = function () {
    const enqueueCords = function (cords) {
        if (!cellsRevealed.includes(cords) && !cellsQueue.includes(cords)) {
            cellsQueue.push(cords);
        }
    };

    const markClicked = function (xyCord) {
        document.querySelector(`.game__cell--${xyCord}`).classList.add("clicked");
        document.querySelector(`.game__cell--${xyCord}`).textContent = cellsNumbers[xyCord];
        document
            .querySelector(`.game__cell--${xyCord}`)
            .removeEventListener("mousedown", mouseClick);
    };

    const [x, y] = cellsQueue[0].split("x").map(z => +z);
    //1
    let xyCords = +x - 1 + "x" + (+y - 1);

    if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
        markClicked(xyCords);
    }

    //2
    xyCords = +x - 1 + "x" + y;
    if (cellsNumbers[xyCords] === 0) {
        document.querySelector(`.game__cell--${xyCords}`).classList.add("clicked");
        enqueueCords(xyCords);
        document
            .querySelector(`.game__cell--${xyCords}`)
            .removeEventListener("mousedown", mouseClick);
    } else if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
        markClicked(xyCords);
    }
    //3
    xyCords = +x - 1 + "x" + (y + 1);
    if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
        markClicked(xyCords);
    }

    //4
    xyCords = +x + "x" + (y - 1);
    if (cellsNumbers[xyCords] === 0) {
        document.querySelector(`.game__cell--${xyCords}`).classList.add("clicked");
        enqueueCords(xyCords);
        document
            .querySelector(`.game__cell--${xyCords}`)
            .removeEventListener("mousedown", mouseClick);
    } else if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
        markClicked(xyCords);
    }
    //6
    xyCords = +x + "x" + (y + 1);
    if (cellsNumbers[xyCords] === 0) {
        document.querySelector(`.game__cell--${xyCords}`).classList.add("clicked");
        enqueueCords(xyCords);
        document
            .querySelector(`.game__cell--${xyCords}`)
            .removeEventListener("mousedown", mouseClick);
    } else if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
        markClicked(xyCords);
    }
    //7
    xyCords = +x + 1 + "x" + (y - 1);

    if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
        markClicked(xyCords);
    }
    //8
    xyCords = +x + 1 + "x" + y;
    if (cellsNumbers[xyCords] === 0) {
        document.querySelector(`.game__cell--${xyCords}`).classList.add("clicked");
        enqueueCords(xyCords);
        document
            .querySelector(`.game__cell--${xyCords}`)
            .removeEventListener("mousedown", mouseClick);
    } else if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
        markClicked(xyCords);
    }

    xyCords = +x + 1 + "x" + (y + 1);

    if (cellsNumbers[xyCords] > 0 && cellsNumbers[xyCords] < 11) {
        markClicked(xyCords);
    }

    cellsRevealed.push(cellsQueue[0]);
    cellsQueue.splice(0, 1);
};

const mouseClick = function (e) {
    e.preventDefault();
    if (e.which === 1) leftKeyClicked(this);
    if (e.which === 2) middleKeyClicked(this);
    if (e.which === 3) rightKeyClicked(this);
};

const leftKeyClicked = function (that) {
    if (movesCounter === 0) {
        const [x, y] = that.classList[1]
            .slice(12)
            .split("x")
            .map(z => +z);

        bombsPlacements[x + "x" + y] = true;
        bombsPlacements[x - 1 + "x" + (y - 1)] = true;
        bombsPlacements[x - 1 + "x" + y] = true;
        bombsPlacements[x - 1 + "x" + (y + 1)] = true;
        bombsPlacements[x + "x" + (y - 1)] = true;
        bombsPlacements[x + "x" + (y + 1)] = true;
        bombsPlacements[x + 1 + "x" + (y - 1)] = true;
        bombsPlacements[x + 1 + "x" + y] = true;
        bombsPlacements[x + 1 + "x" + (y + 1)] = true;

        placeBombs();
    }

    let clickedCell = cellsNumbers[that.classList[1].slice(12)];
    if (clickedCell < 50 && clickedCell > 0 && that.textContent.length < 2) {
        document.querySelector(`.game__cell--${that.classList[1].slice(12)}`).textContent =
            clickedCell;
        that.removeEventListener("mousedown", mouseClick);
        that.classList.add("clicked");
        that.classList.add("game__cell--animation");
    } else if (clickedCell === 0 && that.textContent.length < 2) {
        that.classList.add("clicked");
        const [x, y] = that.classList[1].slice(12).split("x");
        cellsQueue.push(that.classList[1].slice(12));
        emptyCellReveal(x, y);
        that.removeEventListener("mousedown", mouseClick);
    } else if (clickedCell > 50 && that.textContent.length < 2) {
        //TODO: show all bombs and end game.
        document.querySelector(".h1").classList.toggle("hidden");
    }
    movesCounter++;
};

// Right click - places a flag on this cell, you cant left click it, just can right click to remove flag
const rightKeyClicked = function (that) {
    if (that.textContent.length > 1) {
        animateFlagDelete(that);
    } else {
        const element = document.createElement("div");

        element.innerHTML = "&#128681;";
        element.classList.add("game__cell--flag");
        that.appendChild(element);
        setTimeout(() => {
            element.style.top = "0%";
            element.style.opacity = "1";
        }, 10);
    }
};

const animateFlagDelete = async function (that) {
    const element = that.querySelector(".game__cell--flag");

    element.style.animation = "";
    element.style.top = "0";
    element.style.opacity = "1";

    const halfValues = {
        scale: 1,
        rotate: 90,
        top: -300,
        left: -200,
    };

    const endValue = {
        scale: 0,
        rotate: 120,
        top: 500,
        left: -280,
    };

    // dodaj środkowe wartości, poczekaj w promise, potem zmień transition na dłuższy czas, np 500ms, i zmień wartości na finalne, potem znów promise z timeout i na koniec wyzeruj that.
    element.style.transform = "scale(1) rotate(90deg)";
    element.style.top = "-300%";
    element.style.left = "-200%";

    //
    await new Promise(resolve => setTimeout(resolve, 300));
    element.style.transition = "all .5s";
    element.style.transform = "scale(0) rotate(120deg)";
    element.style.top = "500%";
    element.style.left = "-280%";

    await new Promise(resolve => setTimeout(resolve, 600));

    // scale from 1 to 0 in whole animation
    // rotate from 0 to +/= 90deg in whole animation
    // top from -200% to -500% max in 1/2 of animation
    // top from 600 to 900% in second half of an animation
    // left random from 100 to 300% +/- to allow it to go in two directions. 80% in first half of animation

    that.innerHTML = "";
};

// Middle click - highliht all closes cells, that are around clicked one

const middleKeyClicked = function (that) {
    console.log(that);
    console.log("middle key");
};

document
    .querySelectorAll(".game__cell")
    .forEach(el => el.addEventListener("mousedown", mouseClick));

// for (let key in cellsNumbers) {
//     document.querySelector(`.game__cell--${key}`).textContent = cellsNumbers[key];
//     if (cellsNumbers[key] > 10) {
//         document.querySelector(`.game__cell--${key}`).innerHTML = "&#128163;";
//         document.querySelector(`.game__cell--${key}`).style.fontSize = "1.5rem";
//     }
// }
