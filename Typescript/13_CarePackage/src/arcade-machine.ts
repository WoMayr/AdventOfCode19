import { IntCodeInterpreter } from "./int-code-interpreter";

/**
 * 0 is an empty tile. No game object appears in this tile.
 * 1 is a wall tile. Walls are indestructible barriers.
 * 2 is a block tile. Blocks can be broken by the ball.
 * 3 is a horizontal paddle tile. The paddle is indestructible.
 * 4 is a ball tile. The ball moves diagonally and bounces off objects.
 */
export enum TileType {
    Empty = 0,
    Wall = 1,
    Block = 2,
    Paddle = 3,
    Ball = 4
}

export class ArcadeMachine {

    private logic: IntCodeInterpreter;

    public board: TileType[][] = [];

    public score = 0;

    private hasInput = false;

    public paddleLeft: number = -1;
    public ballLeft: number = -1;

    constructor(private program: number[]) {
        this.logic = new IntCodeInterpreter(program);
    }

    step(): boolean {
        while ((!this.logic.waitingForInput || this.hasInput) && !this.logic.hasHalted) {
            this.logic.step();
            this.hasInput = false;
            
            if (this.logic.outputs.length >= 3) {
                const left = this.logic.outputs.shift();
                const top = this.logic.outputs.shift();
                
                if (left >= 0) {
                    const tileId = this.logic.outputs.shift();
                    
                    if (!this.board[left]) {
                        this.board[left] = [];
                    }
                    this.board[left][top] = tileId as TileType;

                    if (tileId === TileType.Paddle) {
                        this.paddleLeft = left;
                    } else if (tileId === TileType.Ball) {
                        this.ballLeft = left;
                    }
                } else {
                    this.score = this.logic.outputs.shift();
                }
            }
        }
        
        return this.logic.hasHalted;
    }

    setJoystick(position: -1 | 0 | 1) {
        this.hasInput = true;
        this.logic.addInput(position);
    }
}