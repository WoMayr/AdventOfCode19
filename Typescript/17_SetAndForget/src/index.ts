import rawInput from "./input";
import { output, run, program, inputs, visualization } from "./pageObjects";
import { IntCodeInterpreter, IntCodeInterpreterError } from "./int-code-interpreter";

import { OutsideSurveillance, Direction, TileType } from "./outside-surveillance";

program.value = rawInput;

const colorBoard: { [tileType: number]: string } = {
    [TileType.Empty]: "white",
    [TileType.Scaffold]: "gray"
};
const robotColor = "red";

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
            .fill(TileType.Empty));

    for (const [coord, tile] of tiles.entries()) {
        const [x, y] = coord.split("|").map(c => +c);

        board[x - minX][height - (y - minY)] = tile;
    }

    return [board, minX, maxX, minY, maxY];
}

function drawBoard(board: TileType[][], robotX: number, robotY: number, robotDirection: Direction) {
    const height = board.length;
    const width = board[0].length;

    while (visualization.firstChild) {
        visualization.firstChild.remove();
    }

    visualization.setAttribute("width", ((width + 2) * 10).toString());
    visualization.setAttribute("height", ((height + 1) * 10).toString());
    visualization.style.backgroundColor = "black";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tile = board[y][x];

            let color = colorBoard[tile];

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", "10");
            rect.setAttribute("height", "10");
            rect.setAttribute("x", ((x + 1) * 10).toString());
            rect.setAttribute("y", ((y + 1) * 10).toString());
            rect.setAttribute("fill", color);
            visualization.appendChild(rect);
        }
    }

    if (robotX !== undefined) {
        const robot = document.createElementNS("http://www.w3.org/2000/svg", "path");

        let robotPath = `M ${(robotX + 1) * 10 + 5} ${(robotY + 1) * 10 + 5}`;

        if (robotDirection == Direction.North) {
            robotPath += "m 0 -5 l 5 10 l -10 0 l 5 -10";
        } else if (robotDirection == Direction.East) {
            robotPath += "m 5 0 l -10 5 l 0 -10 l 10 5";
        } else if (robotDirection == Direction.South) {
            robotPath += "m 0 5 l 5 -10 l -10 0 l 5 10";
        } else if (robotDirection == Direction.West) {
            robotPath += "m -5 0 l 10 5 l 0 -10 l -10 5";
        } else {
            robotPath += "m 0 -5 l 5 5 l -5 -5 l -5 5 l 5 5";
        }

        robot.setAttribute("d", robotPath);
        robot.setAttribute("fill", robotColor);
        visualization.appendChild(robot);
    }
}

function timeout(delay = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function calculateIntersectionAlignmentParameters(board: TileType[][]) {
    const height = board.length;
    const width = board[0].length;

    let sum = 0;

    for (let x = 1; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {
            if (board[y][x] === TileType.Scaffold &&
                board[y - 1][x] === TileType.Scaffold &&
                board[y][x - 1] === TileType.Scaffold &&
                board[y + 1][x] === TileType.Scaffold &&
                board[y][x + 1] === TileType.Scaffold
            ) {
                sum += x * y;
            }
        }
    }

    return sum;
}

async function main() {
    const input = program.value
        .split(',')
        .map(x => +x)

    output.textContent = "";

    console.log(
        calculateIntersectionAlignmentParameters([
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
        ])
    );


    while (inputs.firstChild) {
        inputs.firstChild.remove();
    }

    // Code here


    // Part 1
    // const outside = new OutsideSurveillance(input);
    // let result = outside.step();
    // drawBoard(outside.board, outside.x, outside.y, outside.direction);

    // output.textContent = "Intersection alignment parameter: " + calculateIntersectionAlignmentParameters(outside.board);

    // Part 2
    // Patch for advanced movement
    input[0] = 2;
    const outside = new OutsideSurveillance(input);
    try {
        outside.init(
            //2345678901234567890
            /* Main */"A,B,A,B,C,C,B,C,B,A",
            /*    A */"R,12,L,8,R,12",
            /*    B */"R,8,R,6,R,6,R,8",
            /*    C */"R,8,L,8,R,8,R,4,R,4",
            true);
    } catch (e) {
        output.textContent += "Error: " + e.message;
        return;
    }

    for (let i = 0;; i++) {
        let result = outside.step();

        if (outside.board.length > 0 && outside.board[0].length > 0 && (i % 10 == 0 || !result)) {
            drawBoard(outside.board, outside.x, outside.y, outside.direction);
        }

        if (outside.textMessage) {
            output.textContent += outside.textMessage;
        }

        if (!result) {
            break;
        }

        await timeout();
    }

    if (outside.dustCollected) {
        output.textContent += "Dust collected: " + outside.dustCollected;
    }

}

run.addEventListener("click", () => main());
