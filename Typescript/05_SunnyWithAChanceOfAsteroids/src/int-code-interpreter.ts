export enum Opcodes {
    Add = 1,
    Multiply = 2,

    Halt = 99,
}

export enum ParameterMode {
    PositionMode = 0,
    ImmediateMode = 1,
}

interface InstructionDescription {
    parameters: number;
    run: (parameterModes: ParameterMode[]) => void;
}
interface InstructionMap {
    [opcode: number]: InstructionDescription
}

export class IntCodeInterpreterError implements Error {
    private error: Error;

    public name: string;
    public get message(): string { return this.error.message; }
    public get stack(): any { return this.error.stack; }

    constructor(public instructionPointer: number, public interpreterMemory: number[], public errorMessage?: string) {
        this.error = new Error(errorMessage || "Unspecified error in IntCode interpreter!");
        this.name = IntCodeInterpreter.name;
    }
}

export class IntCodeInterpreter {

    private readonly instructions: InstructionMap = {
        [Opcodes.Add]: { parameters: 3, run: this.opcodeAdd.bind(this) },
        [Opcodes.Multiply]: { parameters: 3, run: this.opcodeMultiply.bind(this) },

        [Opcodes.Halt]: { parameters: 0, run: this.opcodeHalt.bind(this) },
    }

    private instructionPointer = 0;
    private input = [];
    private outputListeners: ((output: number) => void)[] = [];

    private running = false;
    private errorMessage: string;

    constructor(public memory: number[]) {}

    addInput(...input: number[]) {
        this.input.push(...input);
    }

    addOutputListener(listener: ((output: number) => void)) {
        this.outputListeners.push(listener);
    }
    removeOutputListener(listener: ((output: number) => void)) {
        const idx = this.outputListeners.indexOf(listener);
        this.outputListeners.splice(idx, 1);
    }

    run() {
        this.running = true;

        while (this.running) {
            const [opcode, parameterModes] = this.readOpCode();
            const instruction = this.instructions[opcode];

            instruction.run(parameterModes);

            this.instructionPointer += instruction.parameters + 1;
        }
    }

    private readOpCode(position: number = this.instructionPointer): [Opcodes, ParameterMode[]] {
        const code = this.memory[position];

        const opcode = code % 100 as Opcodes;
        if (!Opcodes[opcode]) {
            this.onError("Invalid opcode! " + code);
        }

        const parameterModes = [];
        let temp = Math.floor(code / 100);
        while (temp > 0) {
            parameterModes.push(temp % 10);
            temp = Math.floor(temp / 10);
        }

        return [opcode, parameterModes];
    }

    private getParameter(paramIdx: number, paramMode: ParameterMode = ParameterMode.PositionMode): number {
        if (paramMode === ParameterMode.PositionMode) {
            const memoryIdx = this.instructionPointer + 1 + paramIdx;
            if (memoryIdx < 0 || memoryIdx >= this.memory.length) {
                this.onError(`Parameter ${paramIdx} is outside memory range! Opcode seems to be corrupted!`);
            }
            const target = this.memory[memoryIdx];
            if (memoryIdx < 0 || memoryIdx >= this.memory.length) {
                this.onError(`Parameter ${paramIdx} points to a space outside the memory range (${target})!`);
            }
            return this.memory[target];
        } else if (paramMode === ParameterMode.ImmediateMode) {
            const memoryIdx = this.instructionPointer + 1 + paramIdx;
            if (memoryIdx < 0 || memoryIdx >= this.memory.length) {
                this.onError(`Parameter ${paramIdx} is outside memory range! Opcode seems to be corrupted!`);
            }
            return this.memory[memoryIdx];
        } else {
            this.onError("Invalid parameter mode: " + paramMode);
        }
    }

    private setMemory(position: number, value: number) {
        if (position < 0 || position >= this.memory.length) {
            this.onError("Tried to set value outside of memory range!");
        }

        this.memory[position] = value;
    }

    private writeToParameter(parameterIdx: number, value: number) {
        const targetIdx = this.getParameter(parameterIdx, ParameterMode.ImmediateMode);
        this.setMemory(targetIdx, value);
    }

    private opcodeAdd(paramterModes: ParameterMode[]) {
        const a = this.getParameter(0, paramterModes[0]);
        const b = this.getParameter(1, paramterModes[1]);

        this.writeToParameter(2, a + b);
    }

    private opcodeMultiply(paramterModes: ParameterMode[]) {
        const a = this.getParameter(0, paramterModes[0]);
        const b = this.getParameter(1, paramterModes[1]);

        this.writeToParameter(2, a * b);
    }

    private opcodeHalt() {
        this.running = false;
    }

    private onError(message?: string) {
        this.running = false;
        this.errorMessage = message;
        throw new IntCodeInterpreterError(this.instructionPointer, this.memory, this.errorMessage);
    }
}