import rawInput from "./input";
import { output, run, program, inputs, visualization } from "./pageObjects";
import { IntCodeInterpreter, IntCodeInterpreterError } from "./int-code-interpreter";
import { TileType, RepairRobot, WalkDirection } from "./repair-robot";

program.value = rawInput;

const posRegex = /^(-?\d+)\|(-?\d+)$/;

const colorBoard: { [tileType: number]: string } = {
    [TileType.Empty]: "white",
    [TileType.Wall]: "black",
    [TileType.OxygenTank]: "cyan",
    [TileType.Unknown]: "gray",
};

function drawBoard(tiles:  Map<string, TileType>, robotX: number, robotY: number) {
    let minX = -10;
    let maxX = 10;
    let minY = -10;
    let maxY = 10;

    for (const [coord, tile] of tiles.entries()) {
        const [x, y] = coord.split("|").map(c => +c);

        if (x < minX) {
            minX = x;
        }
        if (x > maxX) {
            maxX = x;
        }
        if (y < minY) {
            minY = y;
        }
        if (y > maxY) {
            maxY = y;
        }
    }
    minX--;
    maxX++;
    minY--;
    maxY++;

    let width = maxX - minX;
    let height = maxY - minY;
    const board: TileType[][] = new Array(width)
        .fill(undefined)
        .map(() => new Array(height)
            .fill(TileType.Unknown));

    for (const [coord, tile] of tiles.entries()) {
        const [x, y] = coord.split("|").map(c => +c);

        board[x - minX][height - (y - minY)] = tile;
    }

    while (visualization.firstChild) {
        visualization.firstChild.remove();
    }

    visualization.setAttribute("width", ((width) * 10).toString());
    visualization.setAttribute("height", ((height) * 10).toString());
    visualization.style.backgroundColor = "black";

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const tile = board[x][y];

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", "10");
            rect.setAttribute("height", "10");
            rect.setAttribute("x", (x * 10).toString());
            rect.setAttribute("y", (y * 10).toString());
            rect.setAttribute("fill", colorBoard[tile]);
            visualization.appendChild(rect);
        }
    }
    
    const robot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    robot.setAttribute("r", "5");
    robot.setAttribute("cx", ((robotX - minX + .5) * 10).toString());
    robot.setAttribute("cy", ((height - (robotY - minY) + .5) * 10).toString());
    robot.setAttribute("fill", "red");
    visualization.appendChild(robot);
}

function timeout(delay = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
}

async function main() {
    const input = program.value
        .split(',')
        .map(x => +x)

    output.textContent = "";

    while (inputs.firstChild) {
        inputs.firstChild.remove();
    }

    // Code here
    const repairRobot = new RepairRobot(input);
    drawBoard(repairRobot.board, repairRobot.x, repairRobot.y);

    const inputField = document.createElement("input");
    inputField.addEventListener("keyup", key => {
        let walkDirection = -1;

        if (key.keyCode === 37) {
            walkDirection = WalkDirection.West;
        } else if (key.keyCode === 38) {
            walkDirection = WalkDirection.North;
        } else if (key.keyCode === 39) {
            walkDirection = WalkDirection.East;
        } else if (key.keyCode === 40) {
            walkDirection = WalkDirection.South;
        }

        if (walkDirection !== -1) {
            repairRobot.step(walkDirection);
            drawBoard(repairRobot.board, repairRobot.x, repairRobot.y);
        }
    });
    inputs.appendChild(inputField);

    // output.textContent = arcadeMachine.board.reduce((acc, val) => acc + val.reduce((acc2, val2) => acc2 + (val2 === TileType.Block ? 1 : 0), 0), 0).toString();
}

run.addEventListener("click", () => main());
