import rawInput from "./input";
import { output } from "./pageObjects";

function main() {
    const input = rawInput
        .split('\n')
        .map(x => +x)

    // Code here

    output.textContent = "Hello world";
}

main();
