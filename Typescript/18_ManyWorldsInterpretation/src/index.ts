import { puzzle as rawInput } from "./input";
import { output, run, visualization } from "./pageObjects";
import { KeyState, DungeonState, createDerivateState } from "./dungeon-state";

const colorBoard = {
    ".": "white",
    ",": "cornflowerblue",
    "#": "black",
    "@": "lime"
};
for (let i = "a".charCodeAt(0); i < "z".charCodeAt(0); i++) {
    const c = String.fromCharCode(i);
    colorBoard[c] = "yellow";
    colorBoard[c.toUpperCase()] = "brown";
    colorBoard[c + "_"] = "white";
    colorBoard[c.toUpperCase() + "_"] = "gold";
}

function isLowerCase(char: string) {
    const code = char.charCodeAt(0);
    return code >= 97 && code <= 122;
}
function isUpperCase(char: string) {
    const code = char.charCodeAt(0);
    return code >= 65 && code <= 90;
}

function drawBoard(board: string[][], collectedKeys = new Set<string>(), openSpaces = new Set<string>()) {
    const width = board[0].length;
    const height = board.length;

    while (visualization.firstChild) {
        visualization.firstChild.remove();
    }

    visualization.setAttribute("width", ((width + 2) * 10).toString());
    visualization.setAttribute("height", ((height + 2) * 10).toString());
    visualization.style.backgroundColor = "lightgray";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tile = board[y][x];

            let color = colorBoard[tile];
            const isCollected = collectedKeys.has(tile.toLowerCase());
            if (isCollected) {
                color = colorBoard[tile + "_"];
            } else if (tile !== "@" && openSpaces.has(`${x}|${y}`)) {
                color = colorBoard[","];
            }

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", "10");
            rect.setAttribute("height", "10");
            rect.setAttribute("x", ((x + 1) * 10).toString());
            rect.setAttribute("y", ((y + 1) * 10).toString());
            rect.setAttribute("fill", color);
            visualization.appendChild(rect);

            if (tile.match("[a-zA-Z]")) {
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", ((x + 1) * 10).toString());
                text.setAttribute("y", ((y + 2) * 10).toString());
                text.textContent = tile;
                text.classList.add(isUpperCase(tile) ? "door" : "key");
                if (isCollected) {
                    text.classList.add("collected");
                }
                visualization.appendChild(text);
            }
        }
    }
}

function findStartPoint(board: string[][]): [number, number] {
    const width = board[0].length;
    const height = board.length;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tile = board[y][x];

            if (tile === "@") {
                return [x, y];
            }
        }
    }
}

function isWalkable(board: string[][], x: number, y: number, collectedKeys: Set<string>): boolean {
    const width = board[0].length;
    const height = board.length;

    // Check bounds
    if (x < 0 || y < 0 || x >= width || y >= height) {
        return false;
    }

    const c = board[y][x];

    // Check empty
    if (c === "." || c === "@") {
        return true;
    }

    // Check wall
    if (c === '#') {
        return false;
    }

    // Check keys (lower case chars)
    if (isLowerCase(c)) {
        return true;
    }

    // Check doors (upper case chars)
    if (isUpperCase(c) && collectedKeys.has(c.toLowerCase())) {
        return true;
    }
    return false;
}

function timeout(delay = 0) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function fillState(board: string[][], state: DungeonState) {
    let currentSteps = state.takenSteps;

    const openSpaces = new Set<string>();

    let toFlood = [
        [state.x, state.y]
    ];
    while (toFlood.length > 0) {
        const nextFlood = [];

        while (toFlood.length > 0) {
            const [x, y] = toFlood.shift();
            const key = `${x}|${y}`;
            const tile = board[y][x];
            // stepsAway.set(key, currentSteps);
            openSpaces.add(key);

            if (isLowerCase(tile)) {
                if (!state.collectedKeys.has(tile)) {
                    state.reachableKeys.push([x, y, tile, currentSteps]);
                }
            } else if (isUpperCase(tile)) {
                state.reachableDoors.push([x, y, tile, currentSteps]);
            }

            const neighbours = [
                [x - 1, y],
                [x, y - 1],
                [x + 1, y],
                [x, y + 1]
            ].filter(([nX, nY]) =>
                isWalkable(board, nX, nY, state.collectedKeys) &&
                !openSpaces.has(`${nX}|${nY}`) &&
                !nextFlood.some(([nX2, nY2]) => nX === nX2 && nY === nY2));
            nextFlood.push(...neighbours);
        }

        toFlood = nextFlood;
        currentSteps++;
    }

    state.nextStates = [];
    for (const [, , key] of state.reachableKeys) {
        const newState = createDerivateState(state, key);
        calculateEstimatedCost(board, newState);
        state.nextStates.push(newState);
    }
}

function calculateEstimatedCost(board: string[][], state: DungeonState) {
    const width = board[0].length;
    const height = board.length;
    let estimation = state.takenSteps;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tile = board[y][x];

            if (isLowerCase(tile) && !state.collectedKeys.has(tile)) {
                estimation += Math.abs(state.x - x) + Math.abs(state.y - y);
            }
        }
    }

    state.estimatedSteps = estimation;
}

function countKeys(board: string[][]): number {
    const width = board[0].length;
    const height = board.length;
    let keys = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (isLowerCase(board[y][x])) {
                keys++;
            }
        }
    }
    return keys;
}

function setEqual<T>(as: Set<T>, bs: Set<T>): boolean {
    if (as.size !== bs.size) {
        return false;
    }
    for (var a of as) {
        if (!bs.has(a)) {
            return false;
        }
    }
    return true;
}

async function main() {
    const input = rawInput
        .split('\n')
        .map(x => x.split(""));

    // Code here
    drawBoard(input); // , ["a"], new Set(["4|1"])

    await timeout();

    const [startX, startY] = findStartPoint(input);
    const keyCount = countKeys(input);

    const rootState: DungeonState = {
        x: startX,
        y: startY,
        collectedKeys: new Set<string>(),
        takenSteps: 0,
        reachableDoors: [],
        reachableKeys: [],
        keysInOrder: []
    };
    calculateEstimatedCost(input, rootState);

    const statesToProcess: DungeonState[] = [rootState];
    const processedState: DungeonState[] = [];

    let winState: DungeonState;

    while (statesToProcess.length > 0) {
        let minIdx = 0;
        let min = statesToProcess[0];
        for (let i = 1; i < statesToProcess.length; i++) {
            const s = statesToProcess[i];
            if (s.estimatedSteps < min.estimatedSteps) {
                minIdx = i;
                min = s;
            }
        }
        const [state] = statesToProcess.splice(minIdx, 1);

        if (state.collectedKeys.size === keyCount) {
            winState = state;
            break;
        }

        fillState(input, state);
        for (const nextState of state.nextStates) {
            const similarState = processedState.find(s => setEqual(s.collectedKeys, nextState.collectedKeys));
            if (!similarState || nextState.estimatedSteps < similarState.estimatedSteps) {
                statesToProcess.push(nextState);
            }
        }

        processedState.push(state);
    }

    output.textContent = "Steps: " + winState.takenSteps + " (" + winState.keysInOrder.join(", ") + ")";

    // drawBoard(input, rootState.collectedKeys, rootState.openSpaces);
    // // // await timeout();
    // output.textContent =
    //     "Collectable keys: " + rootState.reachableKeys.map(([, , x, steps]) => `${x} (${steps})`).join(", ") + "\r\n" +
    //     "Openable doors: " + rootState.reachableDoors.map(([, , x, steps]) => `${x} (${steps})`).join(", ");
}

run.addEventListener("click", () => main());
