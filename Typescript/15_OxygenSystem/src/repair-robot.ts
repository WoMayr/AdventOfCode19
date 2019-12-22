import { IntCodeInterpreter } from "./int-code-interpreter";

/**
 *  0: The repair droid hit a wall. Its position has not changed.
 *  1: The repair droid has moved one step in the requested direction.
 *  2: The repair droid has moved one step in the requested direction; its new position is the location of the oxygen system.
 */
export enum TileType {
    Wall = 0,
    Empty = 1,
    OxygenTank = 2,

    Unknown = -1
}

export enum WalkDirection {
    North = 1,
    South = 2,
    West = 3,
    East = 4
}

export class RepairRobot {

    private logic: IntCodeInterpreter;

    public board = new Map<string, TileType>();

    public x = 0;
    public y = 0;

    constructor(private program: number[]) {
        this.logic = new IntCodeInterpreter(program);

        this.setBoard(0, 0, TileType.Empty);
    }

    setBoard(x: number, y: number, tile: TileType) {
        const key = `${x}|${y}`;
        this.board.set(key, tile);
    }

    getBoard(x: number, y: number): TileType {
        const key = `${x}|${y}`;
        const tile = this.board.get(key);

        if (tile === undefined) {
            return TileType.Unknown;
        }

        return tile;
    }

    step(direction: WalkDirection): TileType {
        if (direction < 1 || direction > 4) {
            throw new Error("Invalid move direction: " + direction);
        }

        this.logic.addInput(direction);

        do {
            this.logic.step();
        } while (!this.logic.waitingForInput && !this.logic.hasHalted);

        // TODO: Handle output
        let newX = this.x;
        let newY = this.y;

        switch (direction) {
            case WalkDirection.North:
                newY++;
                break;
            case WalkDirection.East:
                newX++;
                break;
            case WalkDirection.South:
                newY--;
                break;
            case WalkDirection.West:
                newX--;
                break;
        }

        const result = this.logic.outputs.shift() as TileType;
        this.setBoard(newX, newY, result);
        if (result !== TileType.Wall) {
            this.x = newX;
            this.y = newY;
        }

        return result;
    }
}