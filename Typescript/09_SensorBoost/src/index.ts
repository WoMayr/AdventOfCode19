import rawInput from "./input";
import { output, run, program, inputs } from "./pageObjects";
import { IntCodeInterpreter, IntCodeInterpreterError } from "./int-code-interpreter";

program.value = rawInput;
// inputs.value = "5";

function main() {
    const input = program.value
        .split(',')
        .map(x => +x)

    output.textContent = "";

    // Code here
    try {
        const interpreter = new IntCodeInterpreter([...input]);
        interpreter.addInput(2);
        interpreter.addOutputListener(nr => {
            console.log("Output: ", nr);
            output.textContent += nr + ", ";
        });

        interpreter.run();
    } catch (e) {
        if (e instanceof IntCodeInterpreterError) {
            console.error(e.message);
            output.textContent += "\r\n\r\nIP: " + e.instructionPointer + "\r\n" + e.interpreterMemory.join(', ')
        }
    }
}

run.addEventListener("click", () => main());
