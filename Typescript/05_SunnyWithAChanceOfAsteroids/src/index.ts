import rawInput from "./input";
import { output, run } from "./pageObjects";
import { IntCodeInterpreter, IntCodeInterpreterError } from "./int-code-interpreter";

function main() {
    const input = rawInput
        .split(',')
        .map(x => +x)

    const backupMemory = [...input];
    const targetValue = 19690720;

    // Code here
    // let noun = 12, verb = 2;
    // const interpreter = new IntCodeInterpreter([...backupMemory]);
    // interpreter.memory[1] = noun;
    // interpreter.memory[2] = verb;
    try {
        const interpreter = new IntCodeInterpreter([1,9,10,3,2,3,11,0,99,30,40,50]);
        interpreter.run();
        output.textContent = interpreter.memory[0].toString();
    } catch (e) {
        if (e instanceof IntCodeInterpreterError) {
            console.error(e.message);
            output.textContent = "IP: " + e.instructionPointer + "\r\n" + e.interpreterMemory.join(', ')
        }
    }
}

run.addEventListener("click", () => main());
