import { puzzle as rawInput } from "./input2";
import { output, run, visualization } from "./pageObjects";
import { KeyState, DungeonState, createDerivateState } from "./dungeon-state";
import { MemoizedPath } from "./memoized-path";

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

function findStartPoints(board: string[][]): [number, number][] {
    const width = board[0].length;
    const height = board.length;

    const points: [number, number][] = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tile = board[y][x];

            if (tile === "@") {
                points.push([x, y]);
            }
        }
    }

    return points;
}

function timeout(delay = 0) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function getNextStates(board: string[][], poiPaths: MemoizedPath[], state: DungeonState) {
    state.nextStates = [];

    for (let i = 0; i < state.positions.length; i++) {
        const [x, y] = state.positions[i];

        const nextPossiblePaths = poiPaths.filter(p => {
            // Only use paths that start from our position
            const [fromX, fromY] = p.from;
            if (fromX !== x || fromY !== y) {
                return false;
            }

            // We don't care about keys we already collected
            if (state.collectedKeys.has(p.key)) {
                return false;
            }

            // Ignore paths we cannot yet visit
            if (p.requiredKeys.some(k => !state.collectedKeys.has(k))) {
                return false;
            }

            return true;
        });

        for (const path of nextPossiblePaths) {
            const newState = createDerivateState(state, i, path);
            state.nextStates.push(newState);
        }
    }
}

function caluclateAllPaths(board: string[][], startX: number, startY: number, breakOnFirstDoor = false): MemoizedPath[] {
    let currentSteps = 0;

    const openSpaces = new Set<string>();

    const result: MemoizedPath[] = [];

    let toFlood: [number, number, string[]][] = [
        [startX, startY, []]
    ];
    while (toFlood.length > 0) {
        const nextFlood = [];

        while (toFlood.length > 0) {
            const [x, y, requiredKeys] = toFlood.shift();
            const key = `${x}|${y}`;
            const tile = board[y][x];
            openSpaces.add(key);

            let keys = requiredKeys;
            if (isUpperCase(tile)) {
                keys = [...requiredKeys, tile.toLowerCase()];

                if (breakOnFirstDoor) {
                    continue;
                }
            }

            if (isLowerCase(tile)) {
                result.push({
                    from: [startX, startY],
                    to: [x, y],
                    key: tile,
                    requiredKeys: keys,
                    steps: currentSteps
                });
                keys = [...keys, tile];

                if (breakOnFirstDoor) {
                    continue;
                }
            }

            const neighbours = [
                [x - 1, y, keys],
                [x, y - 1, keys],
                [x + 1, y, keys],
                [x, y + 1, keys]
            ].filter(([nX, nY]) =>
                board[y][x] !== "#" &&
                !openSpaces.has(`${nX}|${nY}`) &&
                !nextFlood.some(([nX2, nY2]) => nX === nX2 && nY === nY2));
            nextFlood.push(...neighbours);
        }

        toFlood = nextFlood;
        currentSteps++;
    }

    return result;
}

function calculatePaths(board: string[][]): MemoizedPath[] {
    const pois: [number, number][] = [];

    const width = board[0].length;
    const height = board.length;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tile = board[y][x];

            if (isLowerCase(tile) || isUpperCase(tile)) {
                pois.push([x, y]);
            }
        }
    }

    const starts = findStartPoints(board);

    const result: MemoizedPath[] = [];

    for (const [startX, startY] of starts) {
        result.push(...caluclateAllPaths(board, startX, startY));
    }
    for (const [x, y] of pois) {
        result.push(...caluclateAllPaths(board, x, y));
    }

    return result.filter(r => r.steps > 0);
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

    const poiPaths = calculatePaths(input);

    await timeout();

    const starts = findStartPoints(input);
    const keyCount = countKeys(input);

    const rootState: DungeonState = {
        positions: starts,
        collectedKeys: new Set<string>(),
        takenSteps: 0,
        keysInOrder: []
    };

    const statesToProcess: DungeonState[] = [rootState];
    const processedState: DungeonState[] = [];

    let winState: DungeonState;

    const similarStates = new Map<string, number>();

    let i = 0;
    while (statesToProcess.length > 0) {
        const state = statesToProcess.shift();

        if (state.collectedKeys.size === keyCount) {
            if (!winState || state.takenSteps < winState.takenSteps) {
                winState = state;
                console.log("New best: " + winState.takenSteps, winState);
            }
        }

        getNextStates(input, poiPaths, state);
        for (const nextState of state.nextStates) {
            const keysString = [...nextState.keysInOrder].sort().join("");
            const mapKey = nextState.positions.map(([x, y]) => `${x}|${y}`).join("|") + keysString;
            // const similarState = processedState.find(s => setEqual(s.collectedKeys, nextState.collectedKeys));
            const similarState = similarStates.get(mapKey);
            if (similarState === undefined || nextState.takenSteps < similarState) {
                statesToProcess.push(nextState);
                similarStates.set(mapKey, nextState.takenSteps);
            }
        }

        processedState.push(state);

        i++;

        // if (i % 100 === 0) {
        //     output.textContent = `${i} / ${statesToProcess.length + processedState.length}`;
        //     await timeout();
        // }
    }

    output.textContent = "Steps: " + winState.takenSteps + " (" + winState.keysInOrder.join(", ") + ")";

    // drawBoard(input, rootState.collectedKeys, rootState.openSpaces);
    // // // await timeout();
    // output.textContent =
    //     "Collectable keys: " + rootState.reachableKeys.map(([, , x, steps]) => `${x} (${steps})`).join(", ") + "\r\n" +
    //     "Openable doors: " + rootState.reachableDoors.map(([, , x, steps]) => `${x} (${steps})`).join(", ");
}

run.addEventListener("click", () => main());
