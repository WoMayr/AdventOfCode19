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

    output.textContent = "";

    // Code here
    for (const permutation of phasePermutations) {
        try {
            let amplifierInput = 0;
            // Initilize IntCode machines and set phase setting
            for (let i = 0; i < 5; i++) {
                const interpreter = new IntCodeInterpreter([...input]);
                interpreter.addInput(permutation[i]);
                interpreter.addInput(amplifierInput);

                interpreter.addOutputListener(output => {
                    amplifierInput = output;
                    // interpreter.running = false;
                });

                interpreter.run();
            }

            output.textContent += `[${permutation.join(", ")}]: ${amplifierInput}\r\n`;
            if (amplifierInput > max) {
                max = amplifierInput;
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
