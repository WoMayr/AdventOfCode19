import rawInput from "./input";
import { output, run, program, inputs, visualization } from "./pageObjects";
import { IntCodeInterpreter, IntCodeInterpreterError } from "./int-code-interpreter";
import { TileType, RepairRobot, WalkDirection } from "./repair-robot";

program.value = rawInput;

const colorBoard: { [tileType: number]: string } = {
    [TileType.Empty]: "white",
    [TileType.Wall]: "black",
    [TileType.OxygenTank]: "cyan",
    [TileType.Unknown]: "gray",
};

function toBoard(tiles: Map<string, TileType>): [TileType[][], number, number, number, number] {
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

    return [board, minX, maxX, minY, maxY];
}

function drawBoard(tiles: Map<string, TileType>, robotX: number, robotY: number, hasOxygen?: Set<string>) {
    const [board, minX, maxX, minY, maxY] = toBoard(tiles);
    let width = maxX - minX;
    let height = maxY - minY;

    while (visualization.firstChild) {
        visualization.firstChild.remove();
    }

    visualization.setAttribute("width", ((width) * 10).toString());
    visualization.setAttribute("height", ((height) * 10).toString());
    visualization.style.backgroundColor = "black";

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const tile = board[x][y];

            let color = colorBoard[tile];
            if (hasOxygen && hasOxygen.has(`${x}|${y}`)) {
                color = "blue";
            }

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", "10");
            rect.setAttribute("height", "10");
            rect.setAttribute("x", (x * 10).toString());
            rect.setAttribute("y", (y * 10).toString());
            rect.setAttribute("fill", color);
            visualization.appendChild(rect);
        }
    }

    if (robotX !== undefined) {
        const robot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        robot.setAttribute("r", "5");
        robot.setAttribute("cx", ((robotX - minX + .5) * 10).toString());
        robot.setAttribute("cy", ((height - (robotY - minY) + .5) * 10).toString());
        robot.setAttribute("fill", "red");
        visualization.appendChild(robot);
    }
}

function timeout(delay = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function findOxygen(board: TileType[][]): [number, number] {
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
            if (board[x][y] === TileType.OxygenTank) {
                return [x, y];
            }
        }
    }
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

    // Part 0: Controll the robot urself
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
        output.textContent = "Unvisited spots: " + repairRobot.unvisitedSpots.size;
    });
    inputs.appendChild(inputField);

    // Part 1: Map the area
    let currentDirection = WalkDirection.North;
    let steps = 0;
    while (repairRobot.unvisitedSpots.size > 0) {
        // Look on right wall
        const rightWall = turnRight(currentDirection);
        let result = repairRobot.step(rightWall);

        if (result !== TileType.Wall) {
            currentDirection = rightWall;
        } else {
            result = repairRobot.step(currentDirection);

            if (result === TileType.Wall) {
                currentDirection = turnLeft(currentDirection);
                repairRobot.step(currentDirection);
            }
        }

        if (steps % 100 === 0) {
            drawBoard(repairRobot.board, repairRobot.x, repairRobot.y);
            await timeout(0);
        }
        steps++;
    }
    drawBoard(repairRobot.board, repairRobot.x, repairRobot.y);

    // Part 2: Flood the area
    const [board] = toBoard(repairRobot.board);
    const [oxyX, oxyY] = findOxygen(board);

    let time = -1;

    let nextFlood = [[oxyX, oxyY]];

    const hasOxygen = new Set<string>();

    while (nextFlood.length > 0) {
        const toFlood = nextFlood;
        nextFlood = [];

        while (toFlood.length > 0) {
            const [x, y] = toFlood.shift();
            hasOxygen.add(`${x}|${y}`);

            const neighbours = [
                [x - 1, y],
                [x, y - 1],
                [x + 1, y],
                [x, y + 1]
            ]
                .filter(([nX, nY]) => board[nX][nY] !== TileType.Wall)
                .filter(([nX, nY]) => !hasOxygen.has(`${nX}|${nY}`));
            for (const n of neighbours) {
                nextFlood.push(n);
            }
        }
        time++;

        if (time % 20 === 0) {
            drawBoard(repairRobot.board, undefined, undefined, hasOxygen);
            await timeout(0);
        }
    }
    drawBoard(repairRobot.board, undefined, undefined, hasOxygen);

    output.textContent = "Time to full flood: " + time;
}

function turnRight(direction: WalkDirection): WalkDirection {
    if (direction === WalkDirection.North) {
        return WalkDirection.East;
    } else if (direction === WalkDirection.East) {
        return WalkDirection.South;
    } else if (direction === WalkDirection.South) {
        return WalkDirection.West;
    } else if (direction === WalkDirection.West) {
        return WalkDirection.North;
    }
}
function turnLeft(direction: WalkDirection): WalkDirection {
    if (direction === WalkDirection.North) {
        return WalkDirection.West;
    } else if (direction === WalkDirection.West) {
        return WalkDirection.South;
    } else if (direction === WalkDirection.South) {
        return WalkDirection.East;
    } else if (direction === WalkDirection.East) {
        return WalkDirection.North;
    }
}

run.addEventListener("click", () => main());
