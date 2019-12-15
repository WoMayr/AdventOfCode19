import rawInput from "./input";
import { output, run, program, inputs, visualization } from "./pageObjects";
import { IntCodeInterpreter, IntCodeInterpreterError } from "./int-code-interpreter";
import { ArcadeMachine, TileType } from "./arcade-machine";

program.value = rawInput;

const posRegex = /^(-?\d+)\|(-?\d+)$/;

const colorBoard: { [tileType: number]: string } = {
    [TileType.Empty]: "white",
    [TileType.Wall]: "black",
    [TileType.Block]: "orange",
    [TileType.Paddle]: "red",
    [TileType.Ball]: "blue",
};

function drawBoard(board: TileType[][]) {
    const width = board.length;
    const height = board.reduce((acc, val) => val.length > acc ? val.length : acc, 0);

    while (visualization.firstChild) {
        visualization.firstChild.remove();
    }

    visualization.setAttribute("width", ((width + 3) * 10).toString());
    visualization.setAttribute("height", ((height + 3) * 10).toString());
    visualization.style.backgroundColor = "black";

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const tile = board[x][y] || TileType.Empty;

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", "10");
            rect.setAttribute("height", "10");
            rect.setAttribute("x", ((x + 1) * 10).toString());
            rect.setAttribute("y", ((y + 1) * 10).toString());
            rect.setAttribute("fill", colorBoard[tile]);
            visualization.appendChild(rect);
        }
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

    // set free play
    input[0] = 2;
    const arcadeMachine = new ArcadeMachine(input);

    let shouldStop = false;
    while (!shouldStop) {
        shouldStop = arcadeMachine.step();
        drawBoard(arcadeMachine.board);
        
        if (arcadeMachine.ballLeft < arcadeMachine.paddleLeft) {
            arcadeMachine.setJoystick(-1);
        } else if (arcadeMachine.ballLeft > arcadeMachine.paddleLeft) {
            arcadeMachine.setJoystick(1);
        } else {
            arcadeMachine.setJoystick(0);
        }

        output.textContent = "Score: " + arcadeMachine.score;
        await timeout(0);
    }
    drawBoard(arcadeMachine.board);

    // output.textContent = arcadeMachine.board.reduce((acc, val) => acc + val.reduce((acc2, val2) => acc2 + (val2 === TileType.Block ? 1 : 0), 0), 0).toString();
}

run.addEventListener("click", () => main());
