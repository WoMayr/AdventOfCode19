import rawInput from "./input";
import { output, run } from "./pageObjects";
import { IntCodeInterpreter, IntCodeInterpreterError } from "./int-code-interpreter";

function main() {
    const input = rawInput
        .split(',')
        .map(x => +x)

    // Code here
    try {
        const interpreter = new IntCodeInterpreter([...input]);
        interpreter.addInput(1);
        interpreter.addOutputListener(out => console.log(out));
        interpreter.run();
        output.textContent = interpreter.outputs[interpreter.outputs.length - 1].toString();
    } catch (e) {
        if (e instanceof IntCodeInterpreterError) {
            console.error(e.message);
            output.textContent = "IP: " + e.instructionPointer + "\r\n" + e.interpreterMemory.join(', ')
        }
    }
}

run.addEventListener("click", () => main());
