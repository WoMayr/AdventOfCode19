import rawInput from "./input";
import { output, run, program, inputs, visualization } from "./pageObjects";
import { IntCodeInterpreter, IntCodeInterpreterError } from "./int-code-interpreter";
import { PaintRoboter } from "./paint-roboter";

program.value = rawInput;
// inputs.value = "5";

const posRegex = /^(-?\d+)\|(-?\d+)$/;

function drawShipHull(tiles: [string, number][]) {
    let minX = Infinity, maxX = -Infinity,
        minY = Infinity, maxY = -Infinity;
    const coordinateTiles = tiles.map(([pos, color]) => {
        const match = pos.match(posRegex);
        const x = +match[1];
        const y = -(+match[2]);

        if (x > maxX) {
            maxX = x;
        }
        if (y > maxY) {
            maxY = y;
        }
        if (x < minX) {
            minX = x;
        }
        if (y < minY) {
            minY = y;
        }

        return [x, y, color];
    });

    const width = maxX - minX;
    const height = maxY - minY;

    while (visualization.firstChild) {
        visualization.firstChild.remove();
    }

    visualization.setAttribute("width", ((width + 3) * 10).toString());
    visualization.setAttribute("height", ((height + 3) * 10).toString());
    visualization.style.backgroundColor = "black";

    for (const [x, y, color] of coordinateTiles) {
        if (color === 0) {
            continue;
        }

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", "10");
        rect.setAttribute("height", "10");
        rect.setAttribute("x", ((x - minX + 1) * 10).toString());
        rect.setAttribute("y", ((y - minY + 1) * 10).toString());
        rect.setAttribute("fill", "white");
        visualization.appendChild(rect);
    }
}

function timeout(delay = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
}

async function main() {
    const input = program.value
        .split(',')
        .map(x => +x)

    output.textContent = "";

    // Code here
    const roboter = new PaintRoboter(input);

    while (!roboter.step()) {
        drawShipHull(roboter.getPaintedTiles());
        await timeout(10);
    }

    output.textContent = roboter.getCountOfPaintedTiles().toString();
}

run.addEventListener("click", () => main());
