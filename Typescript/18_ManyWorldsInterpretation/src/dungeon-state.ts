export type KeyState = [number, number, string, number];

export interface DungeonState {
    takenSteps: number;
    x: number;
    y: number;

    estimatedSteps?: number;

    collectedKeys: Set<string>;
    reachableKeys: KeyState[];
    reachableDoors: KeyState[];

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
        reachableKeys: [...state.reachableKeys],
        reachableDoors: [...state.reachableDoors],

        keysInOrder: [...state.keysInOrder]
    }
}

export function createDerivateState(state: DungeonState, keyToCollect: string): DungeonState {
    const newState = copyState(state);

    const [x, y, key, steps] = newState.reachableKeys.find(([, , key]) => key === keyToCollect);
    newState.x = x;
    newState.y = y;
    newState.collectedKeys.add(key);
    newState.takenSteps = steps;
    newState.parentState = state;
    newState.reachableKeys = [];
    newState.keysInOrder.push(key);

    return newState;
}