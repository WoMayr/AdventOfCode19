import rawInput from "./input";
import { output, run, program, inputs } from "./pageObjects";
import { IntCodeInterpreter, IntCodeInterpreterError } from "./int-code-interpreter";
import { permutator } from "./permutator";

program.value = rawInput;
// inputs.value = "5";

function main() {
    const input = program.value
        .split(',')
        .map(x => +x)

    const phasePermutations = permutator([0,1,2,3,4]);

    let max = -1;
    let bestPermutation: number[] = undefined;

    // Code here
    for (const permutation of phasePermutations) {
        let result = -1;
        try {
            const interpreters: IntCodeInterpreter[] = new Array(5);
            // Initilize IntCode machines and set phase setting
            for (let i = 0; i < 5; i++) {
                const interpreter = new IntCodeInterpreter([...input]);
                interpreter.addInput(permutation[i]);

                if (i < 4) {
                    interpreter.addOutputListener(output => interpreters[i + 1].addInput(output));
                } else {
                    interpreter.addOutputListener(output => result = output);
                }
                interpreters[i] = interpreter;
            }

            // initialize first amplifier
            interpreters[0].addInput(0);

            while (interpreters.some(i => !i.hasHalted)) {
                for (const interpreter of interpreters) {
                    if (!interpreter.hasHalted) {
                        interpreter.step();
                    }
                }

                if (interpreters.every(x => x.suspended)) {
                    throw new Error("All interpreters are suspended!");
                }
            }

            output.textContent += `[${permutation.join(", ")}]: ${result}\r\n`;
            if (result > max) {
                max = result;
                bestPermutation = permutation;
            }
        } catch (e) {
            if (e instanceof IntCodeInterpreterError) {
                console.error(e.message);
                output.textContent += "\r\n\r\nIP: " + e.instructionPointer + "\r\n" + e.interpreterMemory.join(', ')
            }
        }
    }

    output.textContent += `Best result: [${bestPermutation.join(", ")}] ->  ${max}`;
}

run.addEventListener("click", () => main());
