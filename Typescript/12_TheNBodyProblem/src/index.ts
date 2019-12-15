import rawInput from "./input";
import { output, run } from "./pageObjects";

import _zip from "lodash-es/zip";
import { leastCommonMultiple } from "./lcm";

const inputRegex = /^<x=(-?\d+), y=(-?\d+), z=(-?\d+)>$/;

interface Point {
    x: number;
    y: number;
    z: number;
}

const pointZero = () => ({ x: 0, y: 0, z: 0 });

class Moon {
    constructor(
        public position: Point,
        public velocity: Point = pointZero()
    ) { }

    getPotentialEnergy() {
        return Math.abs(this.position.x) + Math.abs(this.position.y) + Math.abs(this.position.z);
    }
    getKineticEnergy() {
        return Math.abs(this.velocity.x) + Math.abs(this.velocity.y) + Math.abs(this.velocity.z);
    }
}

function performStep(moons: Moon[]) {
    performDimStep(moons, "x");
    performDimStep(moons, "y");
    performDimStep(moons, "z");
}

function performDimStep(moons: Moon[], dim: keyof Point) {
    // Apply gravity
    for (let i = 0; i < moons.length; i++) {
        for (let j = i + 1; j < moons.length; j++) {
            const moonA = moons[i];
            const moonB = moons[j];
            // console.log("Updating: ", [i, j]);

            if (moonA.position[dim] > moonB.position[dim]) {
                moonA.velocity[dim] -= 1;
                moonB.velocity[dim] += 1;
            } else if (moonA.position[dim] < moonB.position[dim]) {
                moonA.velocity[dim] += 1;
                moonB.velocity[dim] -= 1;
            }
        }
    }

    // Apply velocity
    for (const moon of moons) {
        moon.position[dim] += moon.velocity[dim];
    }
}

function printPoint(point: Point, pad = 3) {
    const x = point.x.toString().padStart(pad, "    ");
    const y = point.y.toString().padStart(pad, "    ");
    const z = point.z.toString().padStart(pad, "    ");

    return `x=${x}, y=${y}, z=${z}`;
}

function printMoons(moons: Moon[]) {
    return moons.map(moon => {
        return `pos=<${printPoint(moon.position)}>, vel=<${printPoint(moon.velocity)}>`
    }).join("\r\n");
}

function main() {
    const input = rawInput
        .split('\n')
        .map(x => {
            const match = x.match(inputRegex);
            return new Moon({
                x: +match[1],
                y: +match[2],
                z: +match[3]
            });
        });

    // clone initial state
    const initialState = input.map(x => new Moon({ x: x.position.x, y: x.position.y, z: x.position.z }));

    // Code here
    output.textContent = "";
    let minPeriod = [-1n, -1n, -1n];
    for (let dim = 0; dim < 3; dim++) {
        const dimChar = String.fromCharCode("x".charCodeAt(0) + dim) as keyof Point;

        let i;
        for (i = 0; ; i++) {
            performDimStep(input, dimChar);

            if (input.every(moon => moon.velocity[dimChar] === 0)) {
                if (_zip(input, initialState).every(([a, b]) => a.position[dimChar] === b.position[dimChar])) {
                    break;
                }
            }
        }

        minPeriod[dim] = i + 1;
    }
    // for (let i = 0; i < 1000; i++) {
    //     performStep(input);
    //     // output.textContent += printMoons(input);
    //     // output.textContent += "\r\n\r\n";
    // }
    // const totalEnergy = input.reduce((acc, val) => acc + (val.getKineticEnergy() * val.getPotentialEnergy()), 0);
    // output.textContent += "Total energy: " + totalEnergy;
    output.textContent += "It matches after: " + leastCommonMultiple(minPeriod) + " ticks!";
}

run.addEventListener("click", () => main());
