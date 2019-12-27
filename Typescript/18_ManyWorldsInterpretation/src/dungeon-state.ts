import { MemoizedPath } from "./memoized-path";

export type KeyState = [number, number, string, number];

export interface DungeonState {
    takenSteps: number;
    x: number;
    y: number;

    estimatedSteps?: number;

    collectedKeys: Set<string>;

    keysInOrder: string[];

    parentState?: DungeonState;
    nextStates?: DungeonState[];
}

export function copyState(state: DungeonState): DungeonState {
    return {
        takenSteps: state.takenSteps,
        x: state.x,
        y: state.y,

        collectedKeys: new Set(state.collectedKeys),

        keysInOrder: [...state.keysInOrder]
    }
}

export function createDerivateState(state: DungeonState, pathToTake: MemoizedPath): DungeonState {
    const newState = copyState(state);

    const [x, y] = pathToTake.to;

    newState.x = x;
    newState.y = y;
    newState.collectedKeys.add(pathToTake.key);
    newState.takenSteps = state.takenSteps + pathToTake.steps;
    newState.parentState = state;
    newState.keysInOrder.push(pathToTake.key);

    return newState;
}