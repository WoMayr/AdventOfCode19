import rawInput from "./input";
import { output, run } from "./pageObjects";

class InvalidOpcodeError extends Error {
    constructor(public opcode: number, public position: number, public memory: number[]) {
        super(`Invalid opcode at position ${position}. Memory dump: ${memory.join(", ")}`);
    }
}

function runCalculation(noun: number, verb: number, memory: number[]): number {
    // 1202 state
    memory[1] = noun;
    memory[2] = verb;

    let pos = 0;
    while (true) {
        const opcode = memory[pos];

        if (opcode === 1) {
            const posA = memory[pos + 1];
            const posB = memory[pos + 2];
            const target = memory[pos + 3];
            memory[target] = memory[posA] + memory[posB];
        } else if (opcode === 2) {
            const posA = memory[pos + 1];
            const posB = memory[pos + 2];
            const target = memory[pos + 3];
            memory[target] = memory[posA] * memory[posB];
        } else if (opcode === 99) {
            return memory[0];
        } else {
            throw new InvalidOpcodeError(opcode, pos, memory);
        }
        pos += 4;
    }
}

function main() {
    const input = rawInput
        .split(',')
        .map(x => +x)

    const backupMemory = [...input];
    const targetValue = 19690720;

    let found = false;

    let noun = 0, verb = 0;
    for (noun = 0; !found && noun <= 99; noun++) {
        for (verb = 0; !found && verb <= 99; verb++) {
            const memory = [...backupMemory];
            const result = runCalculation(noun, verb, memory);

            if (result === targetValue) {
                found = true;
                output.textContent = (100 * noun + verb).toString();
            }
        }
    }
}


run.addEventListener("click", () => main());
