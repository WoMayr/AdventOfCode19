import rawInput from "./input";
import { output } from "./pageObjects";

function main() {
    const input = rawInput
        .split('\n')
        .map(x => +x)

    const fuelTotal = input
        .reduce((acc, val) => acc + calculateFuel(val), 0);

    output.textContent = fuelTotal.toString();
}

function calculateFuelBase(mass: number): number {
    return Math.floor(mass / 3.0) - 2;
}

function calculateFuel(mass: number): number {
    let total = 0;
    let currentMass = mass;

    let lastFuel;
    do
    {
        lastFuel = calculateFuelBase(currentMass);
        if (lastFuel < 0) {
            lastFuel = 0;
        }
        currentMass = lastFuel;
        total += lastFuel;
    } while (lastFuel !== 0);

    return total;
}

main();
