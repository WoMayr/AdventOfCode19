export enum Opcodes {
    Add = 1,
    Multiply = 2,
    Input = 3,
    Output = 4,
    JumpIfTrue = 5,
    JumpIfFalse = 6,
    LessThan = 7,
    Equals = 8,
    ModifyRelativeBase = 9,

    Halt = 99,
}

export enum ParameterMode {
    PositionMode = 0,
    ImmediateMode = 1,
    RelativeMode = 2
}

interface InstructionDescription {
    parameters: number;
    skipJump?: boolean;
    run: (parameterModes: ParameterMode[]) => void;
}
interface InstructionMap {
    [opcode: number]: InstructionDescription
}

export class IntCodeInterpreterError implements Error {
    private error: Error;

    public name: string;
    public message: string;
    public stack: any;

    constructor(public instructionPointer: number, public interpreterMemory: number[], public errorMessage?: string) {
        this.error = new Error(errorMessage || "Unspecified error in IntCode interpreter!");
        this.name = IntCodeInterpreter.name;
        this.message = this.error.message;
        this.stack = this.error.stack;
    }
}

export class IntCodeInterpreter {

    private readonly instructions: InstructionMap = {
        [Opcodes.Add]: { parameters: 3, run: this.opcodeAdd.bind(this) },
        [Opcodes.Multiply]: { parameters: 3, run: this.opcodeMultiply.bind(this) },
        [Opcodes.Input]: { parameters: 1, run: this.opcodeInput.bind(this) },
        [Opcodes.Output]: { parameters: 1, run: this.opcodeOutput.bind(this) },
        [Opcodes.JumpIfTrue]: { parameters: 2, run: this.opcodeJumpIfTrue.bind(this) },
        [Opcodes.JumpIfFalse]: { parameters: 2, run: this.opcodeJumpIfFalse.bind(this) },
        [Opcodes.LessThan]: { parameters: 3, run: this.opcodeLessThan.bind(this) },
        [Opcodes.Equals]: { parameters: 3, run: this.opcodeEquals.bind(this) },
        [Opcodes.ModifyRelativeBase]: { parameters: 1, run: this.opcodeModifyRelativeBase.bind(this) },

        [Opcodes.Halt]: { parameters: 0, run: this.opcodeHalt.bind(this) },
    }

    private instructionPointer = 0;
    private relativeBase = 0;
    private input: number[] = [];
    private outputListeners: ((output: number) => void)[] = [];
    public outputs: number[] = [];

    public running = false;
    public hasHalted = false;
    public errorMessage: string;

    public waitingForInput: boolean = false;

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

    step() {
        if (this.instructionPointer < 0) {
            this.onError("Instruction pointer outside legal range!");
        }
        const [opcode, parameterModes] = this.readOpCode();
        const instruction = this.instructions[opcode];

        let backIP = this.instructionPointer;
        instruction.run(parameterModes);

        if (!this.waitingForInput && !instruction.skipJump && backIP === this.instructionPointer) {
            this.instructionPointer += instruction.parameters + 1;
        }
    }

    run() {
        this.running = true;

        while (this.running) {
            this.step();
        }
    }

    private readOpCode(position: number = this.instructionPointer): [Opcodes, ParameterMode[]] {
        const code = this.readMemory(position);

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
            if (memoryIdx < 0) {
                this.onError(`Parameter ${paramIdx} is outside memory range! Opcode seems to be corrupted!`);
            }
            const target = this.readMemory(memoryIdx);
            if (target < 0) {
                this.onError(`Parameter ${paramIdx} points to a space outside the memory range (${target})!`);
            }
            return this.readMemory(target);
        } else if (paramMode === ParameterMode.ImmediateMode) {
            const memoryIdx = this.instructionPointer + 1 + paramIdx;
            if (memoryIdx < 0) {
                this.onError(`Parameter ${paramIdx} is outside memory range! Opcode seems to be corrupted!`);
            }
            return this.readMemory(memoryIdx);
        } else if (paramMode === ParameterMode.RelativeMode) {
            const memoryIdx = this.instructionPointer + 1 + paramIdx;
            if (memoryIdx < 0) {
                this.onError(`Parameter ${paramIdx} is outside memory range! Opcode seems to be corrupted!`);
            }
            const relativeJump = this.readMemory(memoryIdx);
            const target = this.relativeBase + relativeJump;
            if (target < 0) {
                this.onError(`Parameter ${paramIdx} points to a space outside the memory range (${target})!`);
            }
            return this.readMemory(target);
        } else {
            this.onError("Invalid parameter mode: " + paramMode);
        }
    }

    private readMemory(position: number): number {
        if (position < 0) {
            this.onError(`Tried to get value outside of memory range! (pos = ${position})`);
        }

        let val = this.memory[position];
        if (val === undefined) {
            this.memory[position] = 0;
            val = 0;
        }
        return val;
    }

    private writeMemory(position: number, value: number) {
        if (position < 0) {
            this.onError(`Tried to set value outside of memory range! (pos = ${position})`);
        }

        this.memory[position] = value;
    }

    private writeToParameter(parameterIdx: number, parameterMode: ParameterMode = ParameterMode.PositionMode, value: number) {
        if (parameterMode === ParameterMode.ImmediateMode) {
            this.onError("Cannot write to parameter in immediate mode!");
        }

        const paramValue = this.getParameter(parameterIdx, ParameterMode.ImmediateMode);
        let targetIdx = paramValue;
        if (parameterMode === ParameterMode.RelativeMode) {
            targetIdx += this.relativeBase;
        }
        this.writeMemory(targetIdx, value);
    }

    private opcodeAdd(parameterModes: ParameterMode[]) {
        const a = this.getParameter(0, parameterModes[0]);
        const b = this.getParameter(1, parameterModes[1]);

        this.writeToParameter(2, parameterModes[2], a + b);
    }

    private opcodeMultiply(parameterModes: ParameterMode[]) {
        const a = this.getParameter(0, parameterModes[0]);
        const b = this.getParameter(1, parameterModes[1]);

        this.writeToParameter(2, parameterModes[2], a * b);
    }

    private opcodeHalt() {
        this.running = false;
        this.hasHalted = true;
    }

    private opcodeInput(parameterModes: ParameterMode[]) {
        if (this.input.length === 0) {
            this.waitingForInput = true;
            return;
        }
        this.waitingForInput = false;
        const value = this.input.shift();

        this.writeToParameter(0, parameterModes[0], value);
    }

    private opcodeOutput(parameterModes: ParameterMode[]) {
        const value = this.getParameter(0, parameterModes[0]);

        this.outputListeners.forEach(listener => {
            listener(value);
        });
        this.outputs.push(value);
    }

    private opcodeJumpIfTrue(parameterModes: ParameterMode[]) {
        const a = this.getParameter(0, parameterModes[0]);
        const target = this.getParameter(1, parameterModes[1]);

        if (a !== 0) {
            this.instructionPointer = target;
        }
    }
    private opcodeJumpIfFalse(parameterModes: ParameterMode[]) {
        const a = this.getParameter(0, parameterModes[0]);
        const target = this.getParameter(1, parameterModes[1]);

        if (a === 0) {
            this.instructionPointer = target;
        }
    }
    private opcodeLessThan(parameterModes: ParameterMode[]) {
        const a = this.getParameter(0, parameterModes[0]);
        const b = this.getParameter(1, parameterModes[1]);

        this.writeToParameter(2, parameterModes[2], (a < b) ? 1 : 0);
    }
    private opcodeEquals(parameterModes: ParameterMode[]) {
        const a = this.getParameter(0, parameterModes[0]);
        const b = this.getParameter(1, parameterModes[1]);

        this.writeToParameter(2, parameterModes[2], (a === b) ? 1 : 0);
    }
    private opcodeModifyRelativeBase(parameterModes: ParameterMode[]) {
        const a = this.getParameter(0, parameterModes[0]);

        this.relativeBase += a;
    }

    private onError(message?: string) {
        this.running = false;
        this.hasHalted = true;
        this.errorMessage = message;
        throw new IntCodeInterpreterError(this.instructionPointer, this.memory, this.errorMessage);
    }
}