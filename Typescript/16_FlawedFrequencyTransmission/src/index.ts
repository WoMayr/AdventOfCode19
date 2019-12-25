import _isEqual from "lodash-es/isEqual";

import rawInput from "./input";
import { output, run } from "./pageObjects";

const basePattern = [0, 1, 0, -1];

function getBasePatternDigit(targetIndex: number, index: number): number {
    return basePattern[Math.floor((index + 1) / (targetIndex + 1)) % basePattern.length];
}

function getNextPhase1(current: number[]): number[] {
    const next = new Array(current.length);
    next[current.length - 1] = current[current.length - 1];

    for (let i = 0; i < next.length - 1; i++) {
        let sum = 0;

        for (let j = i; j < next.length; j++) {
            const val = current[j];
            const multiplier = getBasePatternDigit(i, j);
            sum += val * multiplier;
        }

        next[i] = Math.abs(sum) % 10;
    }

    return next;
}

/**
 * For Part 2 I abuse the fact, that the message is in the second half of the digits. Therefore it is only affected by the digits at the end.
 * So we can skip most of the sum and use only the part before without worrying about the pattern or the stuff before
 * @param current digits
 */
function getNextPhase2(current: number[]): number[] {
    for (let i = current.length - 2; i > current.length / 2; i--) {

        current[i] = (current[i] + current[i + 1]) % 10;
    }

    return current;
}

function timeout(delay = 0) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function testCase<T>(
    expected: T, actual: T,
    errorText: string,
    compareFunc: (a: T, b: T) => boolean = (a, b) => a === b,
    toStringFunc: (a: T) => string = a => a.toString()) {
    if (!compareFunc(expected, actual)) {
        output.textContent += errorText
            .replace("{a}", toStringFunc(actual))
            .replace("{e}", toStringFunc(expected)) + "\r\n";
        return false;
    }
    return true;
}

async function test() {
    const cases = [
        [1, () => getBasePatternDigit(0, 0)],
        [0, () => getBasePatternDigit(0, 3)],
        [0, () => getBasePatternDigit(2, 1)],
        [0, () => getBasePatternDigit(2, 7)],
        [-1, () => getBasePatternDigit(1, 6)],
        [0, () => getBasePatternDigit(1, 0)],
        [[4, 8, 2, 2, 6, 1, 5, 8], () => getNextPhase1([1, 2, 3, 4, 5, 6, 7, 8]), _isEqual, x => x.join("")],
        [[0, 1, 0, 2, 9, 4, 9, 8], () => getNextPhase1([0, 3, 4, 1, 5, 5, 1, 8]), _isEqual, x => x.join("")],
    ] as [any, () => any, ((a: any, b: any) => boolean)?, ((a: any) => string)?][];

    return cases.reduce(
        (acc, [expected, actual, compare, toString], i) => acc && testCase(expected, actual(), `Test case ${i + 1} failed! Expected {e} got {a}`, compare, toString),
        true);
}

async function main() {
    const input = rawInput;

    output.textContent = "";

    if (!await test()) {
        return;
    }

    // Code here
    let offset =
        input[0] * 1e6 +
        input[1] * 1e5 +
        input[2] * 1e4 +
        input[3] * 1e3 +
        input[4] * 1e2 +
        input[5] * 1e1 +
        input[6] * 1e0;
    let current = input;

    for (let i = 0; i < 100; i++) {
        let next = getNextPhase2(current);
        current = next;

        if (i % 20 === 0) {
            await timeout();
        }
        // output.textContent += "Phase " + (i + 1).toString().padStart(3, "   ") + ": " + current.join("") + "\r\n";
    }


    output.textContent += "\r\n\r\nMessage: ";
    for (let i = 0; i < 8; i++) {
        output.textContent += current[offset + i];
    }
}

run.addEventListener("click", () => main());
