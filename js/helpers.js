import confetti from "canvas-confetti";
import { CONFETTI_COLORS, TEXT_COLORS } from "./config.js";
import model from "./model.js";

export const makeConfetti = function (that, amount, color = CONFETTI_COLORS[0], grav = 1) {
    // animate confetti

    if (model.deviceIsPhone()) return;

    const amountOfParticles = amount === "small" ? 2 : 7;
    const scale = amount === "small" ? 1.6 : 2;
    const tick = amount === "small" ? 150 : 200;

    const myCanvas = document.createElement("canvas");
    // ********************* PERFORMANCE TEST *********************
    myCanvas.style.cssText += "position: absolute; z-index: 5000; pointer-events: none;";

    // myCanvas.style.position = "absolute";
    // myCanvas.style.zIndex = "5000";
    // myCanvas.style.pointerEvents = "none";
    that.appendChild(myCanvas);

    const myConfetti = confetti.create(myCanvas, {
        resize: true,
        useWorker: true,
    });
    myConfetti({
        particleCount: amountOfParticles,
        spread: 30,
        startVelocity: 10,
        colors: color,
        shapes: ["square"],
        scalar: scale,
        zIndex: 100000,
        ticks: tick,
        gravity: grav,
    });
};

export const generateTextColor = function (value) {
    return TEXT_COLORS[value];
};

export const generateAdjacentCordsArray = function (x, y, onlySides = false) {
    x = +x;
    y = +y;

    if (onlySides) {
        return [
            x - 1 + "x" + y, // 2
            x + "x" + (y - 1), // 4
            x + "x" + (y + 1), // 6
            x + 1 + "x" + y, // 8
        ];
    }

    return [
        x - 1 + "x" + (y - 1), // 1
        x - 1 + "x" + y, // 2
        x - 1 + "x" + (y + 1), // 3
        x + "x" + (y - 1), // 4
        x + "x" + y, // 5
        x + "x" + (y + 1), // 6
        x + 1 + "x" + (y - 1), // 7
        x + 1 + "x" + y, // 8
        x + 1 + "x" + (y + 1), // 9
    ];
};

export const getCellCords = function (element) {
    const coords = element.classList[1].slice(12);
    return coords;
};

export const setDelayMs = async function (ms) {
    try {
        await new Promise(resolve => setTimeout(resolve, ms));
    } catch (err) {
        throw err;
    }
};
