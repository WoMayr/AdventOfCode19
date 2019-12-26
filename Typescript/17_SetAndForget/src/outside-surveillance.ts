import { IntCodeInterpreter } from "./int-code-interpreter";

const scaffold = "#".charCodeAt(0);
const empty = ".".charCodeAt(0);
const nextLine = "\n".charCodeAt(0);
const robot = "^>v<X".split("").map(x => x.charCodeAt(0));

const mapCharacters = [scaffold, empty, nextLine, ...robot];

export enum Direction {
    North,
    East,
    South,
    West,

    Error
}

export enum TileType {
    Empty,
    Scaffold
}

export class OutsideSurveillance {
    
    private logic: IntCodeInterpreter;

    public x: number;
    public y: number;
    public direction: Direction;

    public board: TileType[][];
    public width: number;
    public height: number;

    private currentX;
    private currentY;
    private currentLine: TileType[];

    public dustCollected: number;

    public textMessage: string;

    private iterationDone = false;

    private lastOutput: number;

    constructor(private program: number[]) {
        this.logic = new IntCodeInterpreter(program);
        this.logic.addOutputListener(this.handleOutput.bind(this));
        this.logic.addOutputListener(o => this.lastOutput = o);
    }

    private handleOutput(output: number) {
        // console.log(String.fromCharCode(output));
        if (output > 128) {
            this.dustCollected = output;
            return;
        }

        if (output === nextLine && this.lastOutput === nextLine) {
            this.iterationDone = true;
            return;
        }

        if (mapCharacters.indexOf(output) === -1 || this.textMessage) {
            if (!this.textMessage) {
                this.textMessage = "";
            }
            this.textMessage += String.fromCharCode(output);
            return;
        }

        if (output === nextLine) {
            this.board.push(this.currentLine);
            this.currentLine = [];
            this.currentX = 0;
            this.currentY++;
        } else {
            let isScaffold = output === scaffold;
            let robotDirection = robot.indexOf(output);
            if (robotDirection >= 0) {
                this.x = this.currentX;
                this.y = this.currentY;
                this.direction = robotDirection as Direction;
                isScaffold = this.direction !== Direction.Error;
            }

            if (isScaffold) {
                this.currentLine.push(TileType.Scaffold);
            } else {
                this.currentLine.push(TileType.Empty);
            }
            
            this.currentX++;
        }

        // Clear outputs
        this.logic.outputs.length = 0;
    }

    step(): boolean {
        this.board = [];
        this.currentLine = [];
        this.currentX = 0;
        this.currentY = 0;
        this.iterationDone = false;
        this.textMessage = undefined;

        do {
            this.logic.step();
        } while (!this.logic.waitingForInput && !this.logic.hasHalted && !this.iterationDone);

        return !this.logic.hasHalted;
    }

    init(mainRoutine: string, functionA: string, functionB: string, functionC: string, videoFeed: boolean) {
        if (mainRoutine.length > 20) {
            throw new Error("Main movement routine is to long!");
        }
        if (functionA.length > 20) {
            throw new Error("Movement Function A is to long!");
        }
        if (functionB.length > 20) {
            throw new Error("Movement Function B is to long!");
        }
        if (functionC.length > 20) {
            throw new Error("Movement Function C is to long!");
        }

        // initial board config
        this.step();

        this.width = this.board[0].length;
        this.height = this.board.length;

        // Set input function
        let input = [];
        input.push(...mainRoutine.split("").map(x => x.charCodeAt(0)), 10);
        input.push(...functionA.split("").map(x => x.charCodeAt(0)), 10);
        input.push(...functionB.split("").map(x => x.charCodeAt(0)), 10);
        input.push(...functionC.split("").map(x => x.charCodeAt(0)), 10);
        input.push((videoFeed ? "y" : "n").charCodeAt(0), 10);

        this.logic.addInput(...input);
    }
}