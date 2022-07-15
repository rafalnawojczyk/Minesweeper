import confetti from "canvas-confetti";
import { CONFETTI_COLORS } from "./config.js";

export const makeConfetti = function (that) {
    // animate confetti

    const myCanvas = document.createElement("canvas");
    myCanvas.style.position = "absolute";
    myCanvas.style.zIndex = "5000";
    myCanvas.style.pointerEvents = "none";
    that.appendChild(myCanvas);

    const myConfetti = confetti.create(myCanvas, {
        resize: true,
        useWorker: true,
    });
    myConfetti({
        particleCount: 7,
        spread: 30,
        startVelocity: 12,
        colors: CONFETTI_COLORS,
        shapes: ["square"],
        scalar: 2.5,
        // any other options from the global
        // confetti function
    });
};
