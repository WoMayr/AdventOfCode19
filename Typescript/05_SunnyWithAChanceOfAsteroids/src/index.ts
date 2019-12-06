import rawInput from "./input";
import { output, run, program, inputs } from "./pageObjects";
import { IntCodeInterpreter, IntCodeInterpreterError } from "./int-code-interpreter";

program.value = rawInput;
inputs.value = "5";

function main() {
    const input = program.value
        .split(',')
        .map(x => +x)

    // Code here
    try {
        const interpreter = new IntCodeInterpreter([...input]);
        interpreter.addInput(...inputs.value.split(";").map(x => +x));
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
