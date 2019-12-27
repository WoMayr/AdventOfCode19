import { MemoizedPath } from "./memoized-path";

export type KeyState = [number, number, string, number];

export interface DungeonState {
    takenSteps: number;

    positions: [number, number][];

    collectedKeys: Set<string>;

    keysInOrder: string[];

    parentState?: DungeonState;
    nextStates?: DungeonState[];
}

export function copyState(state: DungeonState): DungeonState {
    return {
        takenSteps: state.takenSteps,
        positions: state.positions.map(x => [...x] as [number, number]),

        collectedKeys: new Set(state.collectedKeys),

        keysInOrder: [...state.keysInOrder]
    }
}

export function createDerivateState(state: DungeonState, robotToMove: number, pathToTake: MemoizedPath): DungeonState {
    const newState = copyState(state);

    const to = pathToTake.to;

    newState.positions[robotToMove] = [...to] as [number, number];
    newState.collectedKeys.add(pathToTake.key);
    newState.takenSteps = state.takenSteps + pathToTake.steps;
    newState.parentState = state;
    newState.keysInOrder.push(pathToTake.key);

    return newState;
}