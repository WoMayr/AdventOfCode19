import { IntCodeInterpreter } from "./int-code-interpreter";

export enum Direction {
    Up,
    Right,
    Down,
    Left
}

export class PaintRoboter {

    private logic: IntCodeInterpreter;

    direction = Direction.Up;

    x = 0; // Right = +; Left = -
    y = 0; // Up = +; Down = -

    private paintedTiles = new Map<string, number>();

    constructor(paintProgram: number[]) {
        this.logic = new IntCodeInterpreter(paintProgram);
        this.paintedTiles.set("0|0", 1);
    }


    step(): boolean {
        // Provide logic with panel color
        let currentColor = this.paintedTiles.get(`${this.x}|${this.y}`) || 0;
        this.logic.addInput(currentColor);

        // Wait for logic to output 2 values (1st: paint color, 2nd: turn direction)
        while (this.logic.outputs.length < 2 && !this.logic.hasHalted) {
            this.logic.step();
        }

        if (this.logic.hasHalted) {
            return true;
        }

        const color = this.logic.outputs.shift();
        const turnDirection = this.logic.outputs.shift();

        // Paint
        this.paintedTiles.set(`${this.x}|${this.y}`, color);

        // Apply rotation
        this.direction = (this.direction + (turnDirection === 0 ? Direction.Left : Direction.Right)) % 4;

        // Move forward
        switch (this.direction) {
            case Direction.Up:
                this.y++;
                break;
            case Direction.Right:
                this.x++;
                break;
            case Direction.Down:
                this.y--;
                break;
            case Direction.Left:
                this.x--;
                break;
        }

        return false;
    }


    getCountOfPaintedTiles() {
        return this.paintedTiles.size;
    }

    getPaintedTiles() {
        return [...this.paintedTiles.entries()];
    }
}