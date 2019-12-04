import rawInput from "./input";
import { output, run } from "./pageObjects";

function validPassword(password: number): boolean {
    let hasSeperatedDouble = false;
    let doesNotDecrease = true;

    let doubleDigitLength = 0;

    let curVal = password;
    let lastDigit = curVal % 10;
    
    for (let j = 0; j < 6; j++) {
        curVal = Math.floor(curVal / 10);
        const curDigit = curVal % 10;

        if (curDigit > lastDigit) {
            doesNotDecrease = false;
            break;
        }
        if (curDigit === lastDigit) {
            doubleDigitLength++;
        } else {
            if (doubleDigitLength === 1) {
                hasSeperatedDouble = true;
            }
            doubleDigitLength = 0;
        }
        lastDigit = curDigit;
    }

    return hasSeperatedDouble && doesNotDecrease;
}

function checkCases(...testCases: (() => [boolean, string] | boolean)[]): boolean {
    for (let i = 0; i < testCases.length; i++) {
        let result: boolean;
        let extraMessage: string;
        try {
            const testCaseResult = testCases[i]();
            if (typeof testCaseResult === "boolean") {
                result = testCaseResult;
                extraMessage = "";
            } else {
                [result, extraMessage] = testCaseResult;
            }
        } catch (e) {
            result = false;
            extraMessage = e.toString();
        }

        if (!result) {
            output.textContent = `Test case ${i+1} failed! ${extraMessage}`;
            return;
        }
    }

    return true;
}

function main() {
    // Precheck
    if (!checkCases(
        () => validPassword(112233) === true,
        () => validPassword(123444) === false,
        () => validPassword(111122) === true,
        () => validPassword(166111) === false,
        () => validPassword(166777) === true,
    )) {
        return;
    }

    const [min, max] = rawInput
        .split('-')
        .map(x => +x)

    // Code here
    // const permutations = [];
    let count = 0;

    for (let i = min; i <= max; i++) {
        if (validPassword(i)) {
            // permutations.push(i);
            count++;
        }
    }

    output.textContent = count.toString();
}

run.addEventListener("click", () => main());
